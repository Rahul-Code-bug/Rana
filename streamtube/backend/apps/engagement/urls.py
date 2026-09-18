from django.urls import path

from . import views

urlpatterns = [
    path('<slug:slug>/react/', views.VideoReactionView.as_view(), name='video-react'),
]
