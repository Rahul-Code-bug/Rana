from .models import Page


def menu_pages(request):
    menu_pages = Page.objects.filter(
        status="published",
        show_in_menu=True
    ).order_by(
        "menu_order",
        "title"
    )

    return {
        "menu_pages": menu_pages
    }