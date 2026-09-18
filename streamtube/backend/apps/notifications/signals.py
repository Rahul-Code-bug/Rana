from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.comments.models import Comment
from apps.engagement.models import Reaction
from apps.subscriptions.models import Subscription
from apps.videos.models import Video
from .models import Notification


@receiver(post_save, sender=Subscription)
def notify_new_subscriber(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            recipient=instance.channel.owner, actor=instance.subscriber,
            notification_type=Notification.Type.NEW_SUBSCRIBER, channel=instance.channel,
        )


@receiver(post_save, sender=Comment)
def notify_comment_or_reply(sender, instance, created, **kwargs):
    if not created or instance.is_deleted:
        return
    if instance.parent_id:
        parent_author = instance.parent.user
        if parent_author_id_differs(parent_author.id, instance.user_id):
            Notification.objects.create(
                recipient=parent_author, actor=instance.user,
                notification_type=Notification.Type.COMMENT_REPLY,
                video=instance.video, comment=instance,
            )
    else:
        video_owner = instance.video.channel.owner
        if video_owner.id != instance.user_id:
            Notification.objects.create(
                recipient=video_owner, actor=instance.user,
                notification_type=Notification.Type.NEW_COMMENT,
                video=instance.video, comment=instance,
            )


def parent_author_id_differs(a, b):
    return a != b


@receiver(post_save, sender=Reaction)
def notify_video_like(sender, instance, created, **kwargs):
    if created and instance.reaction_type == Reaction.Type.LIKE:
        owner = instance.video.channel.owner
        if owner.id != instance.user_id:
            Notification.objects.create(
                recipient=owner, actor=instance.user,
                notification_type=Notification.Type.VIDEO_LIKE, video=instance.video,
            )


@receiver(post_save, sender=Video)
def notify_new_upload(sender, instance, created, **kwargs):
    """Fires once, the moment a video first transitions to 'published'."""
    if instance.status != Video.Status.PUBLISHED:
        return
    already_notified = Notification.objects.filter(
        notification_type=Notification.Type.NEW_UPLOAD, video=instance
    ).exists()
    if already_notified:
        return
    subs = Subscription.objects.filter(channel=instance.channel, notifications_enabled=True).select_related('subscriber')
    Notification.objects.bulk_create([
        Notification(
            recipient=sub.subscriber, actor=instance.channel.owner,
            notification_type=Notification.Type.NEW_UPLOAD, video=instance, channel=instance.channel,
        ) for sub in subs
    ])
