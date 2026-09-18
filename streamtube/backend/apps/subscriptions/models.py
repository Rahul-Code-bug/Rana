from django.conf import settings
from django.db import models


class Subscription(models.Model):
    subscriber = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscriptions')
    channel = models.ForeignKey('channels.Channel', on_delete=models.CASCADE, related_name='subscribers')
    notifications_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('subscriber', 'channel')
        indexes = [models.Index(fields=['channel']), models.Index(fields=['subscriber'])]
