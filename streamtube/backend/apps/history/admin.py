from django.contrib import admin

from .models import WatchHistory, WatchLater

admin.site.register(WatchHistory)
admin.site.register(WatchLater)
