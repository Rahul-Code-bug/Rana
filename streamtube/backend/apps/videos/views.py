import os
import uuid

from django.core.files import File
from django.core.files.base import ContentFile
from django.db import models as dj_models
from django.db.models import Q, F, Count
from django.http import Http404
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django_filters import rest_framework as df_filters
from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Tag, Video, UploadSession
from .processing import queue_processing
from .serializers import (
    CategorySerializer, TagSerializer, VideoCardSerializer, VideoDetailSerializer,
    VideoUploadSerializer, VideoUpdateSerializer, VideoManageSerializer,
    ChunkedUploadCompleteSerializer,
)


def _visible_queryset(request):
    """Videos any anonymous/authenticated non-owner is allowed to see."""
    qs = Video.objects.select_related('channel', 'channel__owner', 'category').filter(
        status='published', visibility__in=['public', 'unlisted']
    )
    return qs


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.channel.owner_id == request.user.id


class VideoFilter(df_filters.FilterSet):
    category = df_filters.CharFilter(field_name='category__slug')
    channel = df_filters.CharFilter(field_name='channel__slug')
    min_duration = df_filters.NumberFilter(field_name='duration_seconds', lookup_expr='gte')
    max_duration = df_filters.NumberFilter(field_name='duration_seconds', lookup_expr='lte')
    uploaded_after = df_filters.DateFilter(field_name='published_at', lookup_expr='gte')

    class Meta:
        model = Video
        fields = ['category', 'channel', 'language']


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class VideoFeedView(generics.ListAPIView):
    """GET /api/videos/?section=latest|trending|category&category=gaming
    Powers the homepage sections (latest/trending/by-category) and the
    plain browse view. 'recommended' currently falls back to a simple
    popularity+recency blend — swap in a real recommender later without
    changing the API shape."""
    serializer_class = VideoCardSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [df_filters.DjangoFilterBackend]
    filterset_class = VideoFilter

    def get_queryset(self):
        qs = _visible_queryset(self.request)
        section = self.request.query_params.get('section', 'latest')
        if section == 'trending':
            qs = qs.filter(published_at__isnull=False).order_by('-view_count', '-like_count', '-published_at')
        elif section == 'recommended':
            qs = qs.order_by('-view_count', '-published_at')
        else:
            qs = qs.order_by('-published_at')
        return qs


class SearchView(generics.ListAPIView):
    """GET /api/videos/search/?q=...&sort=relevance|newest|views&category=...&duration=short|medium|long"""
    serializer_class = VideoCardSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        q = self.request.query_params.get('q', '').strip()
        qs = _visible_queryset(self.request)
        if q:
            qs = qs.filter(
                Q(title__icontains=q) |
                Q(description__icontains=q) |
                Q(tags__name__icontains=q) |
                Q(channel__name__icontains=q) |
                Q(channel__owner__username__icontains=q)
            ).distinct()

        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category__slug=category)

        duration = self.request.query_params.get('duration')
        if duration == 'short':
            qs = qs.filter(duration_seconds__lt=240)
        elif duration == 'medium':
            qs = qs.filter(duration_seconds__gte=240, duration_seconds__lte=1200)
        elif duration == 'long':
            qs = qs.filter(duration_seconds__gt=1200)

        upload_date = self.request.query_params.get('upload_date')
        if upload_date:
            from datetime import timedelta
            days = {'today': 1, 'week': 7, 'month': 30, 'year': 365}.get(upload_date)
            if days:
                qs = qs.filter(published_at__gte=timezone.now() - timedelta(days=days))

        sort = self.request.query_params.get('sort', 'relevance')
        if sort == 'newest':
            qs = qs.order_by('-published_at')
        elif sort == 'views':
            qs = qs.order_by('-view_count')
        # 'relevance' keeps DB default ordering when a q was supplied (icontains
        # matches are already narrowed above); otherwise fall back to recency.
        elif not q:
            qs = qs.order_by('-published_at')
        return qs


class VideoDetailView(generics.RetrieveAPIView):
    """GET /api/videos/<slug>/ — the watch page payload."""
    serializer_class = VideoDetailSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Video.objects.select_related('channel', 'channel__owner', 'category').prefetch_related('tags', 'renditions')

    def get_object(self):
        video = get_object_or_404(self.get_queryset(), slug=self.kwargs['slug'])
        user = self.request.user
        is_owner = user.is_authenticated and video.channel.owner_id == user.id
        if video.visibility == 'private' and not is_owner and not user.is_staff:
            raise Http404
        if video.status != 'published' and not is_owner and not user.is_staff:
            raise Http404
        return video


class RelatedVideosView(generics.ListAPIView):
    serializer_class = VideoCardSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        video = get_object_or_404(Video, slug=self.kwargs['slug'])
        qs = _visible_queryset(self.request).exclude(pk=video.pk)
        if video.category_id:
            qs = qs.filter(Q(category=video.category) | Q(tags__in=video.tags.all()))
        else:
            qs = qs.filter(tags__in=video.tags.all())
        return qs.distinct().order_by('-view_count')[:20]


class RecordViewAPIView(APIView):
    """POST /api/videos/<slug>/view/ — called once by the player shortly after
    playback starts. Debounced per session so refreshing the page doesn't
    inflate the view count; also logs a VideoView row that analytics reads."""
    permission_classes = [permissions.AllowAny]

    def post(self, request, slug):
        video = get_object_or_404(Video, slug=slug)
        if not request.session.session_key:
            request.session.save()
        session_key = request.session.session_key or ''
        user = request.user if request.user.is_authenticated else None

        from .models import VideoView
        recent_cutoff = timezone.now() - timezone.timedelta(hours=12)
        already_counted = VideoView.objects.filter(
            video=video, session_key=session_key, created_at__gte=recent_cutoff, counted=True
        ).exists()

        VideoView.objects.create(
            video=video, user=user, session_key=session_key,
            watch_seconds=int(request.data.get('watch_seconds', 0)),
            source=request.data.get('source', 'direct'),
            counted=not already_counted,
        )
        if not already_counted:
            Video.objects.filter(pk=video.pk).update(view_count=F('view_count') + 1)
            video.refresh_from_db(fields=['view_count'])

        return Response({'view_count': video.view_count})


# ---------------------------------------------------------------------------
# Upload & video management (creator side)
# ---------------------------------------------------------------------------

class VideoUploadView(generics.CreateAPIView):
    """POST /api/videos/upload/ — single-request multipart upload (fine for
    small/medium files; large files should use the chunked endpoints below).
    Kicks off async FFmpeg processing and returns immediately."""
    serializer_class = VideoUploadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        video = serializer.save()
        if video.status != Video.Status.DRAFT:
            video.status = Video.Status.PROCESSING
            video.save(update_fields=['status'])
            queue_processing(video.id)
        return Response(VideoDetailSerializer(video, context={'request': request}).data,
                         status=status.HTTP_201_CREATED)


class ChunkedUploadInitView(APIView):
    """POST /api/videos/uploads/init/ {filename, total_size} -> {upload_id}"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        filename = request.data.get('filename', 'upload.mp4')
        total_size = int(request.data.get('total_size', 0))
        from django.conf import settings
        max_bytes = settings.MAX_VIDEO_UPLOAD_SIZE_MB * 1024 * 1024
        if total_size <= 0 or total_size > max_bytes:
            return Response({'detail': f'Invalid size. Max is {settings.MAX_VIDEO_UPLOAD_SIZE_MB}MB.'}, status=400)
        session = UploadSession.objects.create(user=request.user, original_filename=filename, total_size=total_size)
        return Response({'upload_id': session.id, 'chunk_size_recommended': 5 * 1024 * 1024}, status=201)


class ChunkedUploadChunkView(APIView):
    """PUT /api/videos/uploads/<upload_id>/chunk/ — body is raw bytes for the
    next chunk, sent in order. Appends to the session's temp file on disk so
    memory usage stays constant regardless of overall file size."""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = []  # raw body; parsed manually

    def put(self, request, upload_id):
        from rest_framework.parsers import FileUploadParser
        session = get_object_or_404(UploadSession, pk=upload_id, user=request.user, is_complete=False)
        parser = FileUploadParser()
        media_type = request.content_type
        result = parser.parse(request.stream, media_type, request.parser_context or {'request': request})
        chunk_file = result.files.get('file') if hasattr(result, 'files') else None
        if chunk_file is None:
            return Response({'detail': 'No chunk data received.'}, status=400)

        with open(session.temp_path, 'ab') as f:
            for piece in chunk_file.chunks():
                f.write(piece)
        session.bytes_received = os.path.getsize(session.temp_path)
        session.save(update_fields=['bytes_received'])
        return Response({'bytes_received': session.bytes_received, 'total_size': session.total_size})


class ChunkedUploadCompleteView(generics.CreateAPIView):
    """POST /api/videos/uploads/<upload_id>/complete/ — once all chunks have
    arrived, this finalizes the UploadSession into an actual Video (with the
    usual title/description/etc metadata) and queues processing."""
    serializer_class = ChunkedUploadCompleteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        session = get_object_or_404(UploadSession, pk=kwargs['upload_id'], user=request.user)
        if not os.path.exists(session.temp_path):
            return Response({'detail': 'No uploaded data found for this session.'}, status=400)
        if session.bytes_received != session.total_size:
            return Response({'detail': 'Upload incomplete: byte count mismatch.'}, status=400)

        data = request.data.copy()
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        with open(session.temp_path, 'rb') as f:
            django_file = File(f, name=session.original_filename)
            video = serializer.save(original_file=django_file)

        session.is_complete = True
        session.save(update_fields=['is_complete'])
        os.remove(session.temp_path)

        if video.status != Video.Status.DRAFT:
            video.status = Video.Status.PROCESSING
            video.save(update_fields=['status'])
            queue_processing(video.id)

        return Response(VideoDetailSerializer(video, context={'request': request}).data, status=201)


class MyVideosView(generics.ListAPIView):
    """GET /api/videos/manage/ — creator's video-management table."""
    serializer_class = VideoManageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Video.objects.filter(channel=self.request.user.channel)
        q = self.request.query_params.get('q')
        if q:
            qs = qs.filter(title__icontains=q)
        return qs.order_by('-created_at')


class VideoUpdateView(generics.RetrieveUpdateDestroyAPIView):
    """PATCH/DELETE /api/videos/manage/<slug>/ — edit metadata, change
    visibility/status, or delete. Owner-only."""
    lookup_field = 'slug'
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        return Video.objects.all()

    def get_serializer_class(self):
        return VideoUpdateSerializer if self.request.method in ('PUT', 'PATCH') else VideoDetailSerializer

    def perform_update(self, serializer):
        video = serializer.instance
        if video.channel.owner_id != self.request.user.id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You can only edit your own videos.')
        serializer.save()
