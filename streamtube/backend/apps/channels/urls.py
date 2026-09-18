from django.urls import path

from . import views

urlpatterns = [
    path('me/', views.ChannelUpdateView.as_view(), name='channel-me'),
    path('<slug:slug>/', views.ChannelDetailView.as_view(), name='channel-detail'),
]
