from .views import login_view, logout_view
from django.urls import path
from django.contrib.auth import views as auth_views

from . import views
from .views import login_view

urlpatterns = [

    path(
        "",
        views.dashboard,
        name="dashboard"
    ),

    # ================= CUSTOMERS =================

    path(
        "customers/",
        views.customer_list,
        name="customer_list"
    ),

    path(
        "customers/add/",
        views.customer_create,
        name="customer_create"
    ),

    path(
        "customers/<int:id>/",
        views.customer_detail,
        name="customer_detail"
    ),

    path(
        "customers/<int:id>/edit/",
        views.customer_edit,
        name="customer_edit"
    ),

    path(
        "customers/<int:id>/delete/",
        views.customer_delete,
        name="customer_delete"
    ),

    # ================= LEADS =================

    path(
        "leads/",
        views.lead_list,
        name="lead_list"
    ),

    path(
        "leads/add/",
        views.lead_create,
        name="lead_create"
    ),
    path(
        "leads/<int:id>/",
        views.lead_detail,
        name="lead_detail"
    ),
    path(
        "leads/<int:id>/edit/",
        views.lead_edit,
        name="lead_edit"
    ),
    path(
        "leads/<int:id>/delete/",
        views.lead_delete,
        name="lead_delete"
    ),
    path(
        "tasks/",
        views.task_list,
        name="task_list"
    ),
    path(
        "tasks/add/",
        views.task_create,
        name="task_create"
    ),
    path(
        "tasks/<int:id>/edit/",
        views.task_edit,
        name="task_edit"
    ),
    path(
        "tasks/<int:id>/delete/",
        views.task_delete,
        name="task_delete"
    ),
    path(
        "reports/",
        views.reports,
        name="reports"
    ),
    path(
        "login/",
        login_view,
        name="login"
    ),
    
    path(
        "logout/",
        logout_view,
        name="logout"
    ),
    # ================= PASSWORD RESET =================

    path(
    "password-reset/",
        auth_views.PasswordResetView.as_view(
            template_name="crm/password_reset.html",
            email_template_name="crm/password_reset_email.txt",
            html_email_template_name="crm/password_reset_email.html",
            success_url="/password-reset/done/"
        ),
    name="password_reset"
),

    path(
        "password-reset/done/",
        auth_views.PasswordResetDoneView.as_view(
            template_name="crm/password_reset_done.html"
        ),
        name="password_reset_done"
    ),

    path(
        "password-reset-confirm/<uidb64>/<token>/",
        auth_views.PasswordResetConfirmView.as_view(
            template_name="crm/password_reset_confirm.html",
            success_url="/password-reset/complete/"
        ),
        name="password_reset_confirm"
    ),

    path(
        "password-reset/complete/",
        auth_views.PasswordResetCompleteView.as_view(
            template_name="crm/password_reset_complete.html"
        ),
        name="password_reset_complete"
    ),
]