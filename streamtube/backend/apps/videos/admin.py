from django.contrib import admin

from .models import Category, Tag, Video, VideoRendition


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active', 'order')
    list_editable = ('is_active', 'order')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    search_fields = ('name',)


class RenditionInline(admin.TabularInline):
    model = VideoRendition
    extra = 0
    readonly_fields = ('resolution', 'file', 'file_size_bytes', 'created_at')


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'channel', 'status', 'visibility', 'view_count', 'created_at')
    list_filter = ('status', 'visibility', 'category', 'made_for_kids')
    search_fields = ('title', 'description', 'channel__name')
    inlines = [RenditionInline]
    actions = ['make_private', 'remove_video']

    @admin.action(description='Set visibility to private (remove from public listing)')
    def make_private(self, request, queryset):
        queryset.update(visibility='private')

    @admin.action(description='Delete selected videos')
    def remove_video(self, request, queryset):
        queryset.delete()
