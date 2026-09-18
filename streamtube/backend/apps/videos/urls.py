from django.urls import path

from apps.engagement.views import LikedVideosView
from . import views

urlpatterns = [
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('search/', views.SearchView.as_view(), name='video-search'),
    path('liked/', LikedVideosView.as_view(), name='liked-videos'),

    path('upload/', views.VideoUploadView.as_view(), name='video-upload'),
    path('uploads/init/', views.ChunkedUploadInitView.as_view(), name='upload-init'),
    path('uploads/<uuid:upload_id>/chunk/', views.ChunkedUploadChunkView.as_view(), name='upload-chunk'),
    path('uploads/<uuid:upload_id>/complete/', views.ChunkedUploadCompleteView.as_view(), name='upload-complete'),

    path('manage/', views.MyVideosView.as_view(), name='video-manage-list'),
    path('manage/<slug:slug>/', views.VideoUpdateView.as_view(), name='video-manage-detail'),

    path('<slug:slug>/', views.VideoDetailView.as_view(), name='video-detail'),
    path('<slug:slug>/related/', views.RelatedVideosView.as_view(), name='video-related'),
    path('<slug:slug>/view/', views.RecordViewAPIView.as_view(), name='video-record-view'),

    path('', views.VideoFeedView.as_view(), name='video-feed'),
]
