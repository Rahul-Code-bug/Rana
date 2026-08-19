from django.shortcuts import render


def home(request):
    return render(request, "website/home.html")


def laboratory_methods(request):
    return render(request, "website/laboratory_methods.html")