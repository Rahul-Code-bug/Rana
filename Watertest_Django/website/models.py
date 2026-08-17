from django.db import models


class Page(models.Model):

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("published", "Published"),
    ]

    title = models.CharField(max_length=200)

    slug = models.SlugField(
        max_length=200,
        unique=True
    )

    content = models.TextField(
        blank=True
    )

    featured_image = models.ImageField(
        upload_to="pages/",
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="draft"
    )

    show_in_menu = models.BooleanField(
        default=False
    )

    menu_order = models.PositiveIntegerField(
        default=0
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.title