from django.conf import settings
from django.db import models


class Reaction(models.Model):
    """A user's like/dislike on a video. The unique_together constraint is
    the actual guarantee against duplicate reactions — the API layer also
    enforces "remove on repeat click" as a UX nicety, but the DB constraint
    is what makes duplicates impossible even under race conditions."""

    class Type(models.TextChoices):
        LIKE = 'like', 'Like'
        DISLIKE = 'dislike', 'Dislike'

    video = models.ForeignKey('videos.Video', on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reactions')
    reaction_type = models.CharField(max_length=7, choices=Type.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('video', 'user')
        indexes = [models.Index(fields=['video', 'reaction_type'])]
