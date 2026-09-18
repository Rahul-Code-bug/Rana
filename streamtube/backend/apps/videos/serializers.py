from django.utils.text import slugify
from rest_framework import serializers

from apps.channels.serializers import ChannelSerializer
from .models import Category, Tag, Video, VideoRendition


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'order']


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']


class VideoRenditionSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = VideoRendition
        fields = ['resolution', 'url']

    def get_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.file.url) if request else obj.file.url


class VideoCardSerializer(serializers.ModelSerializer):
    """Slim representation used in grids/feeds/search results/related videos."""
    channel = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = ['id', 'slug', 'title', 'thumbnail', 'duration_seconds', 'view_count',
                  'published_at', 'created_at', 'channel']

    def get_thumbnail(self, obj):
        request = self.context.get('request')
        if obj.thumbnail and request:
            return request.build_absolute_uri(obj.thumbnail.url)
        return None

    def get_channel(self, obj):
        request = self.context.get('request')
        channel = obj.channel
        avatar = channel.owner.avatar
        return {
            'id': channel.id,
            'name': channel.name,
            'slug': channel.slug,
            'is_verified': channel.is_verified,
            'avatar': request.build_absolute_uri(avatar.url) if avatar and request else None,
        }


class VideoDetailSerializer(serializers.ModelSerializer):
    channel = ChannelSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    thumbnail = serializers.SerializerMethodField()
    renditions = VideoRenditionSerializer(many=True, read_only=True)
    my_reaction = serializers.SerializerMethodField()
    is_saved_watch_later = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = ['id', 'slug', 'title', 'description', 'thumbnail', 'duration_seconds',
                  'view_count', 'like_count', 'dislike_count', 'comment_count',
                  'visibility', 'status', 'allow_comments', 'allow_download',
                  'category', 'tags', 'language', 'channel', 'renditions',
                  'my_reaction', 'is_saved_watch_later', 'created_at', 'published_at']

    def get_thumbnail(self, obj):
        request = self.context.get('request')
        if obj.thumbnail and request:
            return request.build_absolute_uri(obj.thumbnail.url)
        return None

    def get_my_reaction(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return None
        reaction = obj.reactions.filter(user=user).first()
        return reaction.reaction_type if reaction else None

    def get_is_saved_watch_later(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        return obj.watch_later_entries.filter(user=user).exists()


class VideoUploadSerializer(serializers.ModelSerializer):
    tags = serializers.ListField(child=serializers.CharField(max_length=50), required=False, write_only=True)

    class Meta:
        model = Video
        fields = ['id', 'title', 'description', 'category', 'tags', 'language',
                  'original_file', 'thumbnail', 'visibility', 'status',
                  'allow_comments', 'allow_download', 'made_for_kids']

    def validate_original_file(self, file):
        from django.conf import settings
        ext = ('.' + file.name.rsplit('.', 1)[-1]).lower()
        if ext not in settings.ALLOWED_VIDEO_EXTENSIONS:
            raise serializers.ValidationError(f'Unsupported video format "{ext}".')
        max_bytes = settings.MAX_VIDEO_UPLOAD_SIZE_MB * 1024 * 1024
        if file.size > max_bytes:
            raise serializers.ValidationError(f'Video exceeds the {settings.MAX_VIDEO_UPLOAD_SIZE_MB}MB limit.')
        return file

    def validate_thumbnail(self, file):
        if file is None:
            return file
        from django.conf import settings
        ext = ('.' + file.name.rsplit('.', 1)[-1]).lower()
        if ext not in settings.ALLOWED_IMAGE_EXTENSIONS:
            raise serializers.ValidationError(f'Unsupported image format "{ext}".')
        return file

    def create(self, validated_data):
        tag_names = validated_data.pop('tags', [])
        channel = self.context['request'].user.channel
        video = Video.objects.create(channel=channel, **validated_data)
        self._set_tags(video, tag_names)
        return video

    def _set_tags(self, video, tag_names):
        tags = []
        for raw in tag_names:
            name = raw.strip().lower()
            if not name:
                continue
            tag, _ = Tag.objects.get_or_create(name=name)
            tags.append(tag)
        if tags:
            video.tags.set(tags)


class ChunkedUploadCompleteSerializer(VideoUploadSerializer):
    """Same as VideoUploadSerializer but original_file is supplied by the view
    (assembled from chunks) rather than present in the request body."""
    original_file = serializers.FileField(required=False)


class VideoUpdateSerializer(serializers.ModelSerializer):
    tags = serializers.ListField(child=serializers.CharField(max_length=50), required=False, write_only=True)

    class Meta:
        model = Video
        fields = ['title', 'description', 'category', 'tags', 'language', 'thumbnail',
                  'visibility', 'status', 'allow_comments', 'allow_download', 'made_for_kids']

    def update(self, instance, validated_data):
        tag_names = validated_data.pop('tags', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tag_names is not None:
            VideoUploadSerializer()._set_tags(instance, tag_names)
        return instance


class VideoManageSerializer(VideoCardSerializer):
    """Used in the creator dashboard's video-management table: includes
    visibility/status which are hidden from public card views."""

    class Meta(VideoCardSerializer.Meta):
        fields = VideoCardSerializer.Meta.fields + ['visibility', 'status', 'comment_count', 'like_count']
