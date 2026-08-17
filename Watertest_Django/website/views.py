from django.shortcuts import render, redirect
from .models import Page


def home(request):
    return render(request, "website/home.html")


def laboratory_methods(request):
    return render(request, "website/laboratory_methods.html")

from django.contrib.auth.decorators import login_required
from django.shortcuts import render


@login_required
def dashboard(request):

    total_pages = Page.objects.count()

    published_pages = Page.objects.filter(
        status="published"
    ).count()

    draft_pages = Page.objects.filter(
        status="draft"
    ).count()

    return render(
        request,
        "website/dashboard.html",
        {
            "total_pages": total_pages,
            "published_pages": published_pages,
            "draft_pages": draft_pages,
        }
    )

@login_required
def create_page(request):

    if request.method == "POST":

        title = request.POST.get("title")
        slug = request.POST.get("slug")
        content = request.POST.get("content")
        status = request.POST.get("status", "draft")
        show_in_menu = request.POST.get("show_in_menu") == "on"
        menu_order = request.POST.get("menu_order") or 0

        Page.objects.create(
            title=title,
            slug=slug,
            content=content,
            status=status,
            show_in_menu=show_in_menu,
            menu_order=menu_order,
        )

        return redirect("dashboard")

    return render(
        request,
        "website/page_create.html"
    )

@login_required
def pages(request):

    all_pages = Page.objects.all().order_by(
        "menu_order",
        "-updated_at"
    )

    return render(
        request,
        "website/pages.html",
        {
            "pages": all_pages
        }
    )