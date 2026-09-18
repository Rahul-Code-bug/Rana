from django.urls import path

from . import views

urlpatterns = [
    path('', views.PlaylistListCreateView.as_view(), name='playlist-list-create'),
    path('<int:pk>/', views.PlaylistDetailView.as_view(), name='playlist-detail'),
    path('<int:pk>/items/', views.PlaylistAddVideoView.as_view(), name='playlist-add-video'),
    path('<int:pk>/items/<int:item_id>/', views.PlaylistRemoveVideoView.as_view(), name='playlist-remove-video'),
    path('<int:pk>/reorder/', views.PlaylistReorderView.as_view(), name='playlist-reorder'),
]
