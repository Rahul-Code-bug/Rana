from django.shortcuts import render


def home(request):
    return render(request, "website/home.html")


def laboratory_methods(request):
    return render(request, "website/laboratory_methods.html")

from django.contrib.auth.decorators import login_required
from django.shortcuts import render


@login_required
def dashboard(request):
    return render(request, "website/dashboard.html")