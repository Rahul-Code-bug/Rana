from django.db import transaction
from django.db.models import F
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.channels.models import Channel
from apps.videos.models import Video
from apps.videos.serializers import VideoCardSerializer
from .models import Subscription
from .serializers import SubscriptionSerializer


class SubscriptionToggleView(APIView):
    """POST /api/subscriptions/<channel_slug>/toggle/ — subscribe if not
    already subscribed, unsubscribe if already subscribed. The unique_together
    constraint on Subscription prevents duplicate subscriptions outright."""
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, slug):
        channel = get_object_or_404(Channel, slug=slug)
        if channel.owner_id == request.user.id:
            return Response({'detail': 'You cannot subscribe to your own channel.'}, status=400)

        existing = Subscription.objects.filter(subscriber=request.user, channel=channel).first()
        if existing:
            existing.delete()
            Channel.objects.filter(pk=channel.pk).update(subscriber_count=F('subscriber_count') - 1)
            subscribed = False
        else:
            Subscription.objects.create(subscriber=request.user, channel=channel)
            Channel.objects.filter(pk=channel.pk).update(subscriber_count=F('subscriber_count') + 1)
            subscribed = True

        channel.refresh_from_db(fields=['subscriber_count'])
        return Response({'subscribed': subscribed, 'subscriber_count': channel.subscriber_count})


class MySubscriptionsView(generics.ListAPIView):
    """GET /api/subscriptions/ — channels the current user follows."""
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Subscription.objects.select_related('channel', 'channel__owner').filter(subscriber=self.request.user)


class SubscriptionFeedView(generics.ListAPIView):
    """GET /api/subscriptions/feed/ — latest videos from subscribed channels."""
    serializer_class = VideoCardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        channel_ids = Subscription.objects.filter(subscriber=self.request.user).values_list('channel_id', flat=True)
        return Video.objects.select_related('channel', 'channel__owner').filter(
            channel_id__in=channel_ids, status='published', visibility='public'
        ).order_by('-published_at')
