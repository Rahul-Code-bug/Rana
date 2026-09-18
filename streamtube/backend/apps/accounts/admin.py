from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'is_email_verified', 'is_disabled', 'is_staff', 'date_joined')
    list_filter = ('is_staff', 'is_disabled', 'is_email_verified')
    search_fields = ('username', 'email')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Profile', {'fields': ('bio', 'avatar', 'is_email_verified', 'is_disabled')}),
    )
