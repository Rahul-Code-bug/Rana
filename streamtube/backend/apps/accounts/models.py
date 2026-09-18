import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


def avatar_upload_path(instance, filename):
    ext = filename.split('.')[-1]
    return f'avatars/{instance.id}/{uuid.uuid4().hex}.{ext}'


class User(AbstractUser):
    """Custom user model. A Channel is created automatically for every user
    (see apps.channels.signals) so any user can immediately start uploading."""

    email = models.EmailField(unique=True)
    bio = models.TextField(max_length=1000, blank=True, default='')
    avatar = models.ImageField(upload_to=avatar_upload_path, blank=True, null=True)

    is_email_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=64, blank=True, default='')

    is_disabled = models.BooleanField(default=False, help_text='Set by admins to suspend an account.')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    class Meta:
        indexes = [
            models.Index(fields=['username']),
            models.Index(fields=['email']),
        ]

    def __str__(self):
        return self.username
