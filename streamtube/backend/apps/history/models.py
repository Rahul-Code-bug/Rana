from django.conf import settings
from django.db import models


class WatchHistory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='watch_history')
    video = models.ForeignKey('videos.Video', on_delete=models.CASCADE, related_name='watch_history_entries')
    progress_seconds = models.PositiveIntegerField(default=0)  # last playback position, for "resume watching"
    watched_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'video')  # re-watching updates the same row + timestamp
        ordering = ['-watched_at']


class WatchLater(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='watch_later')
    video = models.ForeignKey('videos.Video', on_delete=models.CASCADE, related_name='watch_later_entries')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'video')
        ordering = ['-added_at']
