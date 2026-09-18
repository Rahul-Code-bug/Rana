from django.urls import path

from . import views

urlpatterns = [
    path('', views.MySubscriptionsView.as_view(), name='my-subscriptions'),
    path('feed/', views.SubscriptionFeedView.as_view(), name='subscription-feed'),
    path('<slug:slug>/toggle/', views.SubscriptionToggleView.as_view(), name='subscription-toggle'),
]
