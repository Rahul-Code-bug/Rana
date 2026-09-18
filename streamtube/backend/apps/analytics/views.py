from datetime import timedelta

from django.db.models import Sum, Count, F
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.videos.models import Video, VideoView
from apps.subscriptions.models import Subscription


class CreatorDashboardSummaryView(APIView):
    """GET /api/analytics/summary/ — the top-line cards on the creator studio
    home screen. Every number here is computed from real rows, not fixtures."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        channel = request.user.channel
        videos = Video.objects.filter(channel=channel)
        totals = videos.aggregate(
            total_views=Sum('view_count'), total_likes=Sum('like_count'), total_comments=Sum('comment_count'),
        )
        total_watch_seconds = VideoView.objects.filter(video__channel=channel).aggregate(
            s=Sum('watch_seconds'))['s'] or 0

        top_videos = videos.order_by('-view_count')[:5].values('title', 'slug', 'view_count', 'like_count')
        recent_videos = videos.order_by('-created_at')[:5].values('title', 'slug', 'status', 'created_at')

        return Response({
            'total_views': totals['total_views'] or 0,
            'total_likes': totals['total_likes'] or 0,
            'total_comments': totals['total_comments'] or 0,
            'total_watch_time_hours': round(total_watch_seconds / 3600, 2),
            'subscriber_count': channel.subscriber_count,
            'video_count': videos.count(),
            'estimated_revenue': round((totals['total_views'] or 0) * 0.001, 2),  # placeholder CPM model
            'top_videos': list(top_videos),
            'recent_videos': list(recent_videos),
        })


class CreatorAnalyticsTimeseriesView(APIView):
    """GET /api/analytics/timeseries/?days=30 — views/watch-time per day and
    cumulative subscriber growth, for the dashboard charts."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        channel = request.user.channel
        days = int(request.query_params.get('days', 30))
        since = timezone.now() - timedelta(days=days)

        views_by_day = (
            VideoView.objects.filter(video__channel=channel, created_at__gte=since)
            .annotate(day=TruncDate('created_at'))
            .values('day')
            .annotate(views=Count('id'), watch_seconds=Sum('watch_seconds'))
            .order_by('day')
        )
        subs_by_day = (
            Subscription.objects.filter(channel=channel, created_at__gte=since)
            .annotate(day=TruncDate('created_at'))
            .values('day')
            .annotate(new_subs=Count('id'))
            .order_by('day')
        )
        traffic_sources = (
            VideoView.objects.filter(video__channel=channel, created_at__gte=since)
            .values('source').annotate(count=Count('id')).order_by('-count')
        )

        return Response({
            'views_by_day': list(views_by_day),
            'subscribers_by_day': list(subs_by_day),
            'traffic_sources': list(traffic_sources),
        })
