from django.conf import settings
from django.db import models


class Notification(models.Model):
    class Type(models.TextChoices):
        NEW_SUBSCRIBER = 'new_subscriber', 'New subscriber'
        NEW_COMMENT = 'new_comment', 'New comment'
        COMMENT_REPLY = 'comment_reply', 'Comment reply'
        VIDEO_LIKE = 'video_like', 'Video like'
        NEW_UPLOAD = 'new_upload', 'New upload'

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='+', null=True, blank=True)
    notification_type = models.CharField(max_length=20, choices=Type.choices)
    video = models.ForeignKey('videos.Video', on_delete=models.CASCADE, null=True, blank=True, related_name='+')
    comment = models.ForeignKey('comments.Comment', on_delete=models.CASCADE, null=True, blank=True, related_name='+')
    channel = models.ForeignKey('channels.Channel', on_delete=models.CASCADE, null=True, blank=True, related_name='+')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['recipient', 'is_read', '-created_at'])]
