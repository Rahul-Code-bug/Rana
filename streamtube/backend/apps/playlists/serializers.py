from rest_framework import serializers

from apps.videos.serializers import VideoCardSerializer
from .models import Playlist, PlaylistVideo


class PlaylistVideoSerializer(serializers.ModelSerializer):
    video = VideoCardSerializer(read_only=True)

    class Meta:
        model = PlaylistVideo
        fields = ['id', 'video', 'position', 'added_at']


class PlaylistSerializer(serializers.ModelSerializer):
    video_count = serializers.SerializerMethodField()

    class Meta:
        model = Playlist
        fields = ['id', 'title', 'description', 'is_public', 'video_count', 'created_at', 'updated_at']

    def get_video_count(self, obj):
        return obj.items.count()


class PlaylistDetailSerializer(PlaylistSerializer):
    items = PlaylistVideoSerializer(many=True, read_only=True)

    class Meta(PlaylistSerializer.Meta):
        fields = PlaylistSerializer.Meta.fields + ['items']
