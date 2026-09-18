from django.urls import path

from . import views

urlpatterns = [
    path('', views.WatchHistoryListView.as_view(), name='history-list'),
    path('upsert/', views.WatchHistoryUpsertView.as_view(), name='history-upsert'),
    path('<int:pk>/', views.WatchHistoryDeleteItemView.as_view(), name='history-delete-item'),
    path('clear/', views.WatchHistoryClearView.as_view(), name='history-clear'),
    path('watch-later/', views.WatchLaterListCreateView.as_view(), name='watch-later-list-create'),
    path('watch-later/<int:pk>/', views.WatchLaterDeleteView.as_view(), name='watch-later-delete'),
]
