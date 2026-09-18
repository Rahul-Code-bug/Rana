from django.conf import settings
from django.db import models


class Comment(models.Model):
    """Top-level comments and replies share this model: a reply simply sets
    `parent` to the comment it's replying to (one level deep, like most
    platforms)."""

    video = models.ForeignKey('videos.Video', on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    text = models.TextField(max_length=5000)
    like_count = models.PositiveIntegerField(default=0)
    is_deleted = models.BooleanField(default=False)  # soft delete keeps thread structure intact
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['video', 'parent', '-created_at']),
            models.Index(fields=['video', 'parent', '-like_count']),
        ]

    def __str__(self):
        return f'{self.user}: {self.text[:40]}'


class CommentLike(models.Model):
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comment_likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('comment', 'user')


class Report(models.Model):
    class TargetType(models.TextChoices):
        VIDEO = 'video', 'Video'
        COMMENT = 'comment', 'Comment'
        CHANNEL = 'channel', 'Channel'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        RESOLVED = 'resolved', 'Resolved'
        REJECTED = 'rejected', 'Rejected'

    class Reason(models.TextChoices):
        SPAM = 'spam', 'Spam or misleading'
        HARASSMENT = 'harassment', 'Harassment or bullying'
        HATE = 'hate', 'Hate speech'
        SEXUAL = 'sexual', 'Sexual content'
        VIOLENCE = 'violence', 'Violent or graphic content'
        COPYRIGHT = 'copyright', 'Infringes my rights'
        OTHER = 'other', 'Other'

    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reports_filed')
    target_type = models.CharField(max_length=10, choices=TargetType.choices)
    video = models.ForeignKey('videos.Video', on_delete=models.CASCADE, null=True, blank=True, related_name='reports')
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, null=True, blank=True, related_name='reports')
    channel = models.ForeignKey('channels.Channel', on_delete=models.CASCADE, null=True, blank=True, related_name='reports')
    reason = models.CharField(max_length=20, choices=Reason.choices)
    details = models.TextField(max_length=2000, blank=True, default='')
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    resolved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
                                     related_name='reports_resolved')
    admin_notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['status', '-created_at'])]
