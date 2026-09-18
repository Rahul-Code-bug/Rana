import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.text import slugify


def video_upload_path(instance, filename):
    ext = filename.split('.')[-1]
    return f'videos/{instance.channel_id}/originals/{uuid.uuid4().hex}.{ext}'


def thumbnail_upload_path(instance, filename):
    ext = filename.split('.')[-1]
    return f'videos/{instance.channel_id}/thumbnails/{uuid.uuid4().hex}.{ext}'


def rendition_upload_path(instance, filename):
    ext = filename.split('.')[-1]
    return f'videos/{instance.video.channel_id}/renditions/{instance.video_id}/{instance.resolution}.{ext}'


class Category(models.Model):
    name = models.CharField(max_length=60, unique=True)
    slug = models.SlugField(max_length=70, unique=True, blank=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'name']
        verbose_name_plural = 'categories'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Video(models.Model):
    class Visibility(models.TextChoices):
        PUBLIC = 'public', 'Public'
        UNLISTED = 'unlisted', 'Unlisted'
        PRIVATE = 'private', 'Private'

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PROCESSING = 'processing', 'Processing'
        PUBLISHED = 'published', 'Published'
        FAILED = 'failed', 'Failed'

    channel = models.ForeignKey('channels.Channel', on_delete=models.CASCADE, related_name='videos')
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField(max_length=10000, blank=True, default='')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='videos')
    tags = models.ManyToManyField(Tag, blank=True, related_name='videos')
    language = models.CharField(max_length=10, default='en')

    original_file = models.FileField(upload_to=video_upload_path, max_length=500)
    thumbnail = models.ImageField(upload_to=thumbnail_upload_path, blank=True, null=True)
    duration_seconds = models.PositiveIntegerField(default=0)

    visibility = models.CharField(max_length=10, choices=Visibility.choices, default=Visibility.PUBLIC)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PROCESSING)
    processing_error = models.TextField(blank=True, default='')

    allow_comments = models.BooleanField(default=True)
    allow_download = models.BooleanField(default=False)
    made_for_kids = models.BooleanField(default=False)

    # Denormalized counters, updated atomically by signal handlers / F() expressions
    # elsewhere in the codebase so hot-path reads (video cards, watch page) never
    # need to COUNT() related tables.
    view_count = models.PositiveIntegerField(default=0)
    like_count = models.PositiveIntegerField(default=0)
    dislike_count = models.PositiveIntegerField(default=0)
    comment_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-published_at', '-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['status', 'visibility']),
            models.Index(fields=['-published_at']),
            models.Index(fields=['-view_count']),
            models.Index(fields=['category']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title)[:200] or 'video'
            slug = f'{base}-{uuid.uuid4().hex[:8]}'
            self.slug = slug
        if self.status == self.Status.PUBLISHED and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class VideoRendition(models.Model):
    """A single transcoded resolution of a video, produced asynchronously by
    FFmpeg after upload. HLS/DASH manifests can later point at these files."""

    RESOLUTIONS = [360, 480, 720, 1080]

    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='renditions')
    resolution = models.PositiveSmallIntegerField()
    file = models.FileField(upload_to=rendition_upload_path, max_length=500)
    file_size_bytes = models.BigIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('video', 'resolution')
        ordering = ['resolution']


class UploadSession(models.Model):
    """Tracks a chunked/resumable upload in progress. The client requests a
    session (knowing the total file size), then PUTs sequential byte chunks
    referencing it, and finally calls /complete/ once all bytes have arrived.
    This keeps any single HTTP request small regardless of the overall video
    size, and lets an interrupted upload resume from `bytes_received`."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='upload_sessions')
    original_filename = models.CharField(max_length=255)
    total_size = models.BigIntegerField()
    bytes_received = models.BigIntegerField(default=0)
    is_complete = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def temp_path(self):
        from django.conf import settings as dj_settings
        import os
        d = os.path.join(dj_settings.MEDIA_ROOT, 'tmp_uploads')
        os.makedirs(d, exist_ok=True)
        return os.path.join(d, f'{self.id}.part')


class VideoView(models.Model):
    """One row per (roughly) unique viewing session. Used both to compute a
    trustworthy view_count (not incremented on every refresh) and to feed
    watch-time / traffic-source analytics on the creator dashboard."""

    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='views_log')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    session_key = models.CharField(max_length=64, blank=True, default='')
    watch_seconds = models.PositiveIntegerField(default=0)
    source = models.CharField(max_length=30, default='direct')  # search, related, channel, direct, external
    counted = models.BooleanField(default=False)  # whether this session counted toward view_count
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['video', 'created_at']),
            models.Index(fields=['session_key']),
        ]
