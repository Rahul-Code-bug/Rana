from django.urls import path
from . import views


urlpatterns = [
    path(
        "",
        views.home,
        name="home"
    ),
    path(
        "laboratory-methods/",
        views.laboratory_methods,
        name="laboratory_methods",
    ),
    path(
        "dashboard/",
        views.dashboard,
        name="dashboard"
    ),
]