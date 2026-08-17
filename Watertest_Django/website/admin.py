from django.contrib import admin
from .models import Page


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):

    list_display = (
        "title",
        "slug",
        "status",
        "show_in_menu",
        "menu_order",
        "updated_at",
    )

    list_filter = (
        "status",
        "show_in_menu",
    )

    search_fields = (
        "title",
        "slug",
        "content",
    )

    prepopulated_fields = {
        "slug": ("title",)
    }

    ordering = (
        "menu_order",
        "-updated_at",
    )