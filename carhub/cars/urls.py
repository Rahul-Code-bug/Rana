from django.urls import path
from . import views

app_name = "cars"

urlpatterns = [
    path("", views.home, name="home"),
    path("cars/", views.car_list, name="car_list"),
    path("cars/<int:pk>/", views.car_detail, name="car_detail"),
    path("about/", views.about, name="about"),
    path("contact/", views.contact, name="contact"),
]
