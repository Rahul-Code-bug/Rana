from django.urls import path

from . import views

urlpatterns = [
    path('users/', views.AdminUserListView.as_view(), name='admin-user-list'),
    path('users/<int:pk>/', views.AdminUserDetailView.as_view(), name='admin-user-detail'),

    path('videos/', views.AdminVideoListView.as_view(), name='admin-video-list'),
    path('videos/<int:pk>/', views.AdminVideoDetailView.as_view(), name='admin-video-detail'),

    path('comments/', views.AdminCommentListView.as_view(), name='admin-comment-list'),
    path('comments/<int:pk>/', views.AdminCommentDeleteView.as_view(), name='admin-comment-delete'),

    path('reports/', views.AdminReportListView.as_view(), name='admin-report-list'),
    path('reports/<int:pk>/resolve/', views.AdminReportResolveView.as_view(), name='admin-report-resolve'),

    path('categories/', views.AdminCategoryListCreateView.as_view(), name='admin-category-list-create'),
    path('categories/<int:pk>/', views.AdminCategoryDetailView.as_view(), name='admin-category-detail'),
]
