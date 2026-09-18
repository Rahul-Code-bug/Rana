from django.contrib import admin

from .models import Channel


@admin.register(Channel)
class ChannelAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'subscriber_count', 'is_verified', 'created_at')
    search_fields = ('name', 'owner__username')
    list_filter = ('is_verified',)
