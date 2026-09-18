from django.urls import path

from . import views

urlpatterns = [
    path('summary/', views.CreatorDashboardSummaryView.as_view(), name='analytics-summary'),
    path('timeseries/', views.CreatorAnalyticsTimeseriesView.as_view(), name='analytics-timeseries'),
]
