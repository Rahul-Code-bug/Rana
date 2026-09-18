from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/auth/', include('apps.accounts.urls')),
    path('api/channels/', include('apps.channels.urls')),
    path('api/videos/', include('apps.videos.urls')),
    path('api/comments/', include('apps.comments.urls')),
    path('api/videos/', include('apps.engagement.urls')),
    path('api/subscriptions/', include('apps.subscriptions.urls')),
    path('api/playlists/', include('apps.playlists.urls')),
    path('api/history/', include('apps.history.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/admin-panel/', include('apps.adminapi.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
