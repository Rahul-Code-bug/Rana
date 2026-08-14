from django.db import models
from django.urls import reverse


class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Car(models.Model):
    FUEL_CHOICES = [
        ("petrol", "Petrol"),
        ("diesel", "Diesel"),
        ("electric", "Electric"),
        ("hybrid", "Hybrid"),
    ]
    TRANSMISSION_CHOICES = [
        ("automatic", "Automatic"),
        ("manual", "Manual"),
    ]

    brand = models.CharField(max_length=100)
    model_name = models.CharField(max_length=100)
    category = models.ForeignKey(
        Category, related_name="cars", on_delete=models.SET_NULL, null=True, blank=True
    )
    year = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    mileage = models.PositiveIntegerField(help_text="Mileage in km")
    fuel_type = models.CharField(max_length=20, choices=FUEL_CHOICES, default="petrol")
    transmission = models.CharField(max_length=20, choices=TRANSMISSION_CHOICES, default="automatic")
    color = models.CharField(max_length=40, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="cars/", blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.year} {self.brand} {self.model_name}"

    def get_absolute_url(self):
        return reverse("cars:car_detail", args=[self.pk])


class ContactMessage(models.Model):
    name = models.CharField(max_length=120)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True)
    message = models.TextField()
    car = models.ForeignKey(Car, on_delete=models.SET_NULL, null=True, blank=True, related_name="inquiries")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Message from {self.name} ({self.created_at:%Y-%m-%d})"
