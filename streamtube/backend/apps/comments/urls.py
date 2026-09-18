from django.urls import path

from . import views

urlpatterns = [
    path('', views.CommentListCreateView.as_view(), name='comment-list-create'),
    path('<int:pk>/', views.CommentDetailView.as_view(), name='comment-detail'),
    path('<int:pk>/like/', views.CommentLikeToggleView.as_view(), name='comment-like'),
    path('reports/', views.ReportCreateView.as_view(), name='report-create'),
]
