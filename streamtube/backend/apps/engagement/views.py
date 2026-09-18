from django.db import transaction
from django.db.models import F
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.videos.models import Video
from apps.videos.serializers import VideoCardSerializer
from .models import Reaction


class LikedVideosView(generics.ListAPIView):
    """GET /api/videos/liked/ — videos the current user has liked."""
    serializer_class = VideoCardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        video_ids = Reaction.objects.filter(
            user=self.request.user, reaction_type=Reaction.Type.LIKE
        ).values_list('video_id', flat=True)
        return Video.objects.select_related('channel', 'channel__owner').filter(id__in=video_ids)


class VideoReactionView(APIView):
    """POST /api/videos/<slug>/react/ {type: 'like'|'dislike'}
    - Same type as existing reaction -> removes it (toggle off).
    - Different type -> switches it.
    - No existing reaction -> creates it.
    Always keeps Video.like_count/dislike_count in sync via F() updates so
    counts stay correct under concurrent requests."""
    permission_classes = [permissions.IsAuthenticated]
    throttle_scope = 'reactions'

    @transaction.atomic
    def post(self, request, slug):
        reaction_type = request.data.get('type')
        if reaction_type not in (Reaction.Type.LIKE, Reaction.Type.DISLIKE):
            return Response({'detail': 'type must be "like" or "dislike".'}, status=400)

        video = get_object_or_404(Video.objects.select_for_update(), slug=slug)
        existing = Reaction.objects.filter(video=video, user=request.user).first()

        if existing and existing.reaction_type == reaction_type:
            existing.delete()
            field = 'like_count' if reaction_type == Reaction.Type.LIKE else 'dislike_count'
            Video.objects.filter(pk=video.pk).update(**{field: F(field) - 1})
            my_reaction = None
        elif existing:
            old_field = 'like_count' if existing.reaction_type == Reaction.Type.LIKE else 'dislike_count'
            new_field = 'like_count' if reaction_type == Reaction.Type.LIKE else 'dislike_count'
            existing.reaction_type = reaction_type
            existing.save(update_fields=['reaction_type'])
            Video.objects.filter(pk=video.pk).update(**{old_field: F(old_field) - 1, new_field: F(new_field) + 1})
            my_reaction = reaction_type
        else:
            Reaction.objects.create(video=video, user=request.user, reaction_type=reaction_type)
            field = 'like_count' if reaction_type == Reaction.Type.LIKE else 'dislike_count'
            Video.objects.filter(pk=video.pk).update(**{field: F(field) + 1})
            my_reaction = reaction_type

        video.refresh_from_db(fields=['like_count', 'dislike_count'])
        return Response({'my_reaction': my_reaction, 'like_count': video.like_count, 'dislike_count': video.dislike_count})
