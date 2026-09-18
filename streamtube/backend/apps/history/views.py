from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.videos.models import Video
from .models import WatchHistory, WatchLater
from .serializers import WatchHistorySerializer, WatchLaterSerializer


class WatchHistoryListView(generics.ListAPIView):
    serializer_class = WatchHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WatchHistory.objects.select_related('video', 'video__channel').filter(user=self.request.user)


class WatchHistoryUpsertView(APIView):
    """POST /api/history/ {video_slug, progress_seconds} — called periodically
    by the player; upserts so re-watching bumps the entry instead of
    duplicating it."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        video = get_object_or_404(Video, slug=request.data.get('video_slug'))
        entry, _ = WatchHistory.objects.update_or_create(
            user=request.user, video=video,
            defaults={'progress_seconds': int(request.data.get('progress_seconds', 0))},
        )
        return Response(WatchHistorySerializer(entry, context={'request': request}).data)


class WatchHistoryDeleteItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        get_object_or_404(WatchHistory, pk=pk, user=request.user).delete()
        return Response(status=204)


class WatchHistoryClearView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        WatchHistory.objects.filter(user=request.user).delete()
        return Response(status=204)


class WatchLaterListCreateView(generics.ListCreateAPIView):
    serializer_class = WatchLaterSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WatchLater.objects.select_related('video', 'video__channel').filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        video = get_object_or_404(Video, slug=request.data.get('video_slug'))
        entry, created = WatchLater.objects.get_or_create(user=request.user, video=video)
        return Response(WatchLaterSerializer(entry, context={'request': request}).data, status=201 if created else 200)


class WatchLaterDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        get_object_or_404(WatchLater, pk=pk, user=request.user).delete()
        return Response(status=204)
