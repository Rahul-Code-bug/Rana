from django.urls import path
from . import views
urlpatterns = [
    path("", views.index, name="index"),
    path("api/question", views.api_question),
    path("api/daily", views.api_daily),
    path("api/answer", views.api_answer),
    path("api/leaderboard", views.api_leaderboard),
    path("api/score", views.api_score),
    path("robots.txt", views.robots),
    path("sitemap.xml", views.sitemap),
]
