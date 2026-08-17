from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required

from .models import Page


# ==========================================
# HOME
# ==========================================

def home(request):
    return render(
        request,
        "website/home.html"
    )


# ==========================================
# LABORATORY METHODS
# ==========================================

def laboratory_methods(request):
    return render(
        request,
        "website/laboratory_methods.html"
    )


# ==========================================
# DASHBOARD
# ==========================================

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


# ==========================================
# CREATE PAGE
# ==========================================

@login_required
def create_page(request):

    parent_pages = Page.objects.filter(
        parent=None
    ).order_by(
        "menu_order",
        "title"
    )

    if request.method == "POST":

        title = request.POST.get("title")
        slug = request.POST.get("slug")
        content = request.POST.get("content")

        status = request.POST.get(
            "status",
            "draft"
        )

        show_in_menu = (
            request.POST.get("show_in_menu") == "on"
        )

        menu_order = (
            request.POST.get("menu_order") or 0
        )

        parent_id = request.POST.get("parent")

        parent = None

        if parent_id:
            parent = get_object_or_404(
                Page,
                id=parent_id
            )

        Page.objects.create(
            title=title,
            slug=slug,
            content=content,
            status=status,
            show_in_menu=show_in_menu,
            menu_order=menu_order,
            parent=parent,
        )

        return redirect("dashboard")

    return render(
        request,
        "website/page_create.html",
        {
            "parent_pages": parent_pages,
        }
    )


# ==========================================
# ALL PAGES
# ==========================================

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


# ==========================================
# EDIT PAGE
# ==========================================

@login_required
def edit_page(request, page_id):

    page = get_object_or_404(
        Page,
        id=page_id
    )

    parent_pages = Page.objects.exclude(
        id=page.id
    ).order_by(
        "menu_order",
        "title"
    )

    if request.method == "POST":

        page.title = request.POST.get("title")

        page.slug = request.POST.get("slug")

        page.content = request.POST.get("content")

        page.status = request.POST.get(
            "status",
            "draft"
        )

        page.show_in_menu = (
            request.POST.get("show_in_menu") == "on"
        )

        page.menu_order = (
            request.POST.get("menu_order") or 0
        )

        parent_id = request.POST.get("parent")

        if parent_id:
            parent = get_object_or_404(
                Page,
                id=parent_id
            )

            # Prevent page from becoming its own parent
            if parent.id == page.id:
                parent = None

            page.parent = parent

        else:
            page.parent = None

        page.save()

        return redirect("pages")

    return render(
        request,
        "website/page_edit.html",
        {
            "page": page,
            "parent_pages": parent_pages,
        }
    )


# ==========================================
# DELETE PAGE
# ==========================================

@login_required
def delete_page(request, page_id):

    page = get_object_or_404(
        Page,
        id=page_id
    )

    if request.method == "POST":

        page.delete()

        return redirect("pages")

    return render(
        request,
        "website/page_delete.html",
        {
            "page": page
        }
    )


# ==========================================
# DYNAMIC CMS PAGE
# ==========================================

def dynamic_page(request, page_path):

    parts = page_path.strip("/").split("/")

    parent = None
    page = None

    for slug in parts:

        page = get_object_or_404(
            Page,
            slug=slug,
            status="published",
            parent=parent
        )

        parent = page

    return render(
        request,
        "website/dynamic_page.html",
        {
            "page": page
        }
    )