from rest_framework import serializers

from apps.accounts.serializers import UserPublicSerializer
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    actor = UserPublicSerializer(read_only=True)
    video_slug = serializers.CharField(source='video.slug', read_only=True, default=None)
    video_title = serializers.CharField(source='video.title', read_only=True, default=None)
    channel_slug = serializers.CharField(source='channel.slug', read_only=True, default=None)

    class Meta:
        model = Notification
        fields = ['id', 'actor', 'notification_type', 'video_slug', 'video_title',
                  'channel_slug', 'is_read', 'created_at']
