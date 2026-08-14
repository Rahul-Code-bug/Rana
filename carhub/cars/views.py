from django.contrib import messages
from django.core.paginator import Paginator
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render

from .forms import ContactForm
from .models import Car, Category


def home(request):
    featured_cars = Car.objects.filter(is_featured=True, is_available=True)[:6]
    latest_cars = Car.objects.filter(is_available=True)[:8]
    categories = Category.objects.all()
    context = {
        "featured_cars": featured_cars,
        "latest_cars": latest_cars,
        "categories": categories,
        "total_cars": Car.objects.filter(is_available=True).count(),
    }
    return render(request, "cars/home.html", context)


def car_list(request):
    cars = Car.objects.filter(is_available=True)

    query = request.GET.get("q", "").strip()
    brand = request.GET.get("brand", "")
    category = request.GET.get("category", "")
    fuel_type = request.GET.get("fuel_type", "")
    min_price = request.GET.get("min_price", "")
    max_price = request.GET.get("max_price", "")
    sort = request.GET.get("sort", "")

    if query:
        cars = cars.filter(
            Q(brand__icontains=query) | Q(model_name__icontains=query) | Q(description__icontains=query)
        )
    if brand:
        cars = cars.filter(brand__iexact=brand)
    if category:
        cars = cars.filter(category__id=category)
    if fuel_type:
        cars = cars.filter(fuel_type=fuel_type)
    if min_price:
        cars = cars.filter(price__gte=min_price)
    if max_price:
        cars = cars.filter(price__lte=max_price)

    sort_map = {
        "price_asc": "price",
        "price_desc": "-price",
        "year_desc": "-year",
        "newest": "-created_at",
    }
    if sort in sort_map:
        cars = cars.order_by(sort_map[sort])

    paginator = Paginator(cars, 9)
    page_obj = paginator.get_page(request.GET.get("page"))

    context = {
        "page_obj": page_obj,
        "categories": Category.objects.all(),
        "brands": Car.objects.values_list("brand", flat=True).distinct().order_by("brand"),
        "fuel_choices": Car.FUEL_CHOICES,
        "query": query,
        "selected_brand": brand,
        "selected_category": category,
        "selected_fuel_type": fuel_type,
        "min_price": min_price,
        "max_price": max_price,
        "sort": sort,
    }
    return render(request, "cars/car_list.html", context)


def car_detail(request, pk):
    car = get_object_or_404(Car, pk=pk)
    related_cars = Car.objects.filter(brand=car.brand, is_available=True).exclude(pk=car.pk)[:4]

    if request.method == "POST":
        form = ContactForm(request.POST)
        if form.is_valid():
            inquiry = form.save(commit=False)
            inquiry.car = car
            inquiry.save()
            messages.success(request, "Thanks! Your inquiry has been sent to our sales team.")
            return redirect("cars:car_detail", pk=car.pk)
    else:
        form = ContactForm()

    context = {"car": car, "related_cars": related_cars, "form": form}
    return render(request, "cars/car_detail.html", context)


def about(request):
    return render(request, "cars/about.html")


def contact(request):
    if request.method == "POST":
        form = ContactForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Thanks for reaching out! We'll get back to you soon.")
            return redirect("cars:contact")
    else:
        form = ContactForm()
    return render(request, "cars/contact.html", {"form": form})
