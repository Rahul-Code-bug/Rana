import uuid

from django.conf import settings
from django.db import models
from django.utils.text import slugify


def banner_upload_path(instance, filename):
    ext = filename.split('.')[-1]
    return f'channels/{instance.id}/banner_{uuid.uuid4().hex}.{ext}'


class Channel(models.Model):
    """Every user gets exactly one channel (created automatically on signup).
    This mirrors real platforms where "channel" and "account" are almost the
    same thing but keeps channel-specific fields (banner, social links,
    subscriber count) out of the User model."""

    owner = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='channel')
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(max_length=5000, blank=True, default='')
    banner = models.ImageField(upload_to=banner_upload_path, blank=True, null=True)
    social_links = models.JSONField(default=dict, blank=True)  # {"twitter": "...", "website": "..."}
    is_verified = models.BooleanField(default=False)
    subscriber_count = models.PositiveIntegerField(default=0)  # denormalized for fast reads
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=['slug'])]

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name) or f'channel-{uuid.uuid4().hex[:8]}'
            slug = base
            n = 1
            while Channel.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                n += 1
                slug = f'{base}-{n}'
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
