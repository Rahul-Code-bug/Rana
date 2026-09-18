from django.contrib import admin

from .models import Comment, Report


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'video', 'short_text', 'like_count', 'is_deleted', 'created_at')
    list_filter = ('is_deleted',)
    search_fields = ('text', 'user__username')
    actions = ['delete_comments']

    def short_text(self, obj):
        return obj.text[:60]

    @admin.action(description='Soft-delete selected comments')
    def delete_comments(self, request, queryset):
        queryset.update(is_deleted=True, text='')


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('target_type', 'reason', 'status', 'reporter', 'created_at')
    list_filter = ('status', 'target_type', 'reason')
    actions = ['resolve', 'reject']

    @admin.action(description='Mark resolved')
    def resolve(self, request, queryset):
        from django.utils import timezone
        queryset.update(status='resolved', resolved_by=request.user, resolved_at=timezone.now())

    @admin.action(description='Reject report')
    def reject(self, request, queryset):
        from django.utils import timezone
        queryset.update(status='rejected', resolved_by=request.user, resolved_at=timezone.now())
