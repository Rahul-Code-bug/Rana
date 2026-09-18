from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.comments.models import Comment, Report
from apps.videos.models import Video, Category

User = get_user_model()


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff', 'is_disabled', 'is_email_verified', 'date_joined']


class AdminVideoSerializer(serializers.ModelSerializer):
    channel_name = serializers.CharField(source='channel.name', read_only=True)

    class Meta:
        model = Video
        fields = ['id', 'title', 'slug', 'channel_name', 'status', 'visibility', 'view_count', 'created_at']


class AdminCommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    video_title = serializers.CharField(source='video.title', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'username', 'video_title', 'text', 'is_deleted', 'created_at']


class AdminReportSerializer(serializers.ModelSerializer):
    reporter_username = serializers.CharField(source='reporter.username', read_only=True)

    class Meta:
        model = Report
        fields = ['id', 'reporter_username', 'target_type', 'video', 'comment', 'channel',
                  'reason', 'details', 'status', 'admin_notes', 'created_at']


class AdminCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'is_active', 'order']
