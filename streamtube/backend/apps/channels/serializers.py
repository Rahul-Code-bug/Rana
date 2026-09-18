from rest_framework import serializers

from apps.accounts.serializers import UserPublicSerializer
from .models import Channel


class ChannelSerializer(serializers.ModelSerializer):
    owner = UserPublicSerializer(read_only=True)
    banner = serializers.SerializerMethodField()
    is_subscribed = serializers.SerializerMethodField()
    video_count = serializers.SerializerMethodField()

    class Meta:
        model = Channel
        fields = ['id', 'owner', 'name', 'slug', 'description', 'banner', 'social_links',
                  'is_verified', 'subscriber_count', 'is_subscribed', 'video_count', 'created_at']
        read_only_fields = ['id', 'slug', 'is_verified', 'subscriber_count', 'created_at']

    def get_banner(self, obj):
        request = self.context.get('request')
        if obj.banner and request:
            return request.build_absolute_uri(obj.banner.url)
        return None

    def get_is_subscribed(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        return obj.subscribers.filter(subscriber=user).exists()

    def get_video_count(self, obj):
        return obj.videos.filter(status='published', visibility='public').count()


class ChannelUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Channel
        fields = ['name', 'description', 'banner', 'social_links']
