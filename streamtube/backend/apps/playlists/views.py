from django.db.models import Max
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.videos.models import Video
from .models import Playlist, PlaylistVideo
from .serializers import PlaylistSerializer, PlaylistDetailSerializer


class IsPlaylistOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return obj.is_public or obj.owner_id == request.user.id
        return obj.owner_id == request.user.id


class PlaylistListCreateView(generics.ListCreateAPIView):
    serializer_class = PlaylistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Playlist.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class PlaylistDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PlaylistDetailSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsPlaylistOwner]
    queryset = Playlist.objects.all()


class PlaylistAddVideoView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        playlist = get_object_or_404(Playlist, pk=pk, owner=request.user)
        video = get_object_or_404(Video, slug=request.data.get('video_slug'))
        if PlaylistVideo.objects.filter(playlist=playlist, video=video).exists():
            return Response({'detail': 'Video already in playlist.'}, status=400)
        next_position = (playlist.items.aggregate(m=Max('position'))['m'] or 0) + 1
        PlaylistVideo.objects.create(playlist=playlist, video=video, position=next_position)
        return Response(PlaylistDetailSerializer(playlist, context={'request': request}).data, status=201)


class PlaylistRemoveVideoView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk, item_id):
        playlist = get_object_or_404(Playlist, pk=pk, owner=request.user)
        get_object_or_404(PlaylistVideo, pk=item_id, playlist=playlist).delete()
        return Response(status=204)


class PlaylistReorderView(APIView):
    """POST /api/playlists/<pk>/reorder/ {order: [item_id, item_id, ...]}"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        playlist = get_object_or_404(Playlist, pk=pk, owner=request.user)
        order = request.data.get('order', [])
        for position, item_id in enumerate(order):
            PlaylistVideo.objects.filter(pk=item_id, playlist=playlist).update(position=position)
        return Response(PlaylistDetailSerializer(playlist, context={'request': request}).data)
