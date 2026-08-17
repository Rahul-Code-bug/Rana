from django.urls import path
from . import views


urlpatterns = [

    # =========================
    # HOME
    # =========================

    path(
        "",
        views.home,
        name="home"
    ),


    # =========================
    # STATIC PAGES
    # =========================

    path(
        "laboratory-methods/",
        views.laboratory_methods,
        name="laboratory_methods"
    ),


    # =========================
    # DASHBOARD
    # =========================

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


    # =========================
    # DYNAMIC CMS PAGES
    # =========================

    path(
        "<path:page_path>/",
        views.dynamic_page,
        name="dynamic_page"
    ),
]