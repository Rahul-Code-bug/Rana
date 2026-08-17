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

    path(
        "dashboard/pages/create/",
        views.create_page,
        name="create_page"
    ),
    path(
        "dashboard/pages/",
        views.pages,
        name="pages"
    ),
    path(
        "dashboard/pages/edit/<int:page_id>/",
        views.edit_page,
        name="edit_page"
    ),
    path(
        "dashboard/pages/delete/<int:page_id>/",
        views.delete_page,
        name="delete_page"
    ),
    path(
        "<slug:slug>/",
        views.dynamic_page,
        name="dynamic_page"
    ),
]
