from rest_framework import serializers

from apps.channels.serializers import ChannelSerializer
from .models import Subscription


class SubscriptionSerializer(serializers.ModelSerializer):
    channel = ChannelSerializer(read_only=True)

    class Meta:
        model = Subscription
        fields = ['id', 'channel', 'notifications_enabled', 'created_at']
