from django.db.models import F
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.videos.models import Video
from .models import Comment, CommentLike, Report
from .serializers import CommentSerializer, ReportSerializer


class IsCommentOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user_id == request.user.id


class CommentListCreateView(generics.ListCreateAPIView):
    """GET /api/comments/?video=<slug>&parent=<id|root>&sort=top|newest
    POST /api/comments/ {video, text, parent}"""
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    throttle_scope = 'comments'

    def get_queryset(self):
        qs = Comment.objects.select_related('user').filter(is_deleted=False)
        video_slug = self.request.query_params.get('video')
        if video_slug:
            video = get_object_or_404(Video, slug=video_slug)
            qs = qs.filter(video=video)
        parent = self.request.query_params.get('parent')
        if parent:
            qs = qs.filter(parent_id=parent)
        else:
            qs = qs.filter(parent__isnull=True)

        sort = self.request.query_params.get('sort', 'top')
        qs = qs.order_by('-like_count', '-created_at') if sort == 'top' else qs.order_by('-created_at')
        return qs

    def perform_create(self, serializer):
        comment = serializer.save(user=self.request.user)
        Video.objects.filter(pk=comment.video_id).update(comment_count=F('comment_count') + 1)


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """PATCH to edit own comment's text; DELETE soft-deletes (keeps replies intact)."""
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated, IsCommentOwnerOrReadOnly]

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.text = ''
        instance.save(update_fields=['is_deleted', 'text'])
        Video.objects.filter(pk=instance.video_id).update(comment_count=F('comment_count') - 1)


class CommentLikeToggleView(APIView):
    """POST /api/comments/<id>/like/ — toggles the current user's like."""
    permission_classes = [permissions.IsAuthenticated]
    throttle_scope = 'reactions'

    def post(self, request, pk):
        comment = get_object_or_404(Comment, pk=pk)
        like, created = CommentLike.objects.get_or_create(comment=comment, user=request.user)
        if not created:
            like.delete()
            Comment.objects.filter(pk=pk).update(like_count=F('like_count') - 1)
            liked = False
        else:
            Comment.objects.filter(pk=pk).update(like_count=F('like_count') + 1)
            liked = True
        comment.refresh_from_db(fields=['like_count'])
        return Response({'liked': liked, 'like_count': comment.like_count})


class ReportCreateView(generics.CreateAPIView):
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_scope = 'reports'

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)
