from rest_framework import serializers

from apps.videos.serializers import VideoCardSerializer
from .models import WatchHistory, WatchLater


class WatchHistorySerializer(serializers.ModelSerializer):
    video = VideoCardSerializer(read_only=True)

    class Meta:
        model = WatchHistory
        fields = ['id', 'video', 'progress_seconds', 'watched_at']


class WatchLaterSerializer(serializers.ModelSerializer):
    video = VideoCardSerializer(read_only=True)

    class Meta:
        model = WatchLater
        fields = ['id', 'video', 'added_at']
