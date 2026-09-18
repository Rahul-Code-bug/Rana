from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied

from .models import Channel
from .serializers import ChannelSerializer, ChannelUpdateSerializer


class ChannelDetailView(generics.RetrieveAPIView):
    """GET /api/channels/<slug>/ — public channel page data."""
    queryset = Channel.objects.select_related('owner')
    serializer_class = ChannelSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]


class ChannelUpdateView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/channels/me/ — the logged-in user's own channel."""
    serializer_class = ChannelSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.channel

    def get_serializer_class(self):
        return ChannelUpdateSerializer if self.request.method in ('PUT', 'PATCH') else ChannelSerializer
