from django.contrib import admin
from .models import Category, Car, ContactMessage


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ("brand", "model_name", "year", "price", "fuel_type", "transmission", "is_featured", "is_available")
    list_filter = ("brand", "fuel_type", "transmission", "is_featured", "is_available", "category")
    search_fields = ("brand", "model_name", "description")
    list_editable = ("is_featured", "is_available")


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "car", "created_at")
    readonly_fields = ("created_at",)
    list_filter = ("created_at",)
