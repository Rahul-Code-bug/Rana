from rest_framework import serializers

from apps.accounts.serializers import UserPublicSerializer
from .models import Comment, Report


class CommentSerializer(serializers.ModelSerializer):
    user = UserPublicSerializer(read_only=True)
    reply_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    text = serializers.CharField(max_length=5000)

    class Meta:
        model = Comment
        fields = ['id', 'video', 'user', 'parent', 'text', 'like_count', 'reply_count',
                  'is_liked', 'is_deleted', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'like_count', 'is_deleted', 'created_at', 'updated_at']

    def get_reply_count(self, obj):
        return obj.replies.filter(is_deleted=False).count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        return obj.likes.filter(user=user).exists()

    def validate(self, attrs):
        video = attrs.get('video') or getattr(self.instance, 'video', None)
        if video and not video.allow_comments:
            raise serializers.ValidationError('Comments are disabled on this video.')
        parent = attrs.get('parent')
        if parent and parent.parent_id is not None:
            raise serializers.ValidationError('Replies can only be one level deep.')
        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.is_deleted:
            data['text'] = '[deleted]'
        return data


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['id', 'target_type', 'video', 'comment', 'channel', 'reason', 'details', 'status', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']

    def validate(self, attrs):
        target_type = attrs.get('target_type')
        mapping = {'video': 'video', 'comment': 'comment', 'channel': 'channel'}
        field = mapping.get(target_type)
        if not attrs.get(field):
            raise serializers.ValidationError({field: f'This field is required when target_type is "{target_type}".'})
        return attrs
