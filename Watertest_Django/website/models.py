from django.db import models
from django.utils.text import slugify


class Page(models.Model):

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("published", "Published"),
    ]

    title = models.CharField(max_length=300)

    slug = models.SlugField(
        max_length=300,
        unique=True,
        blank=True
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

    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="children"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)

        super().save(*args, **kwargs)

    def get_url_path(self):
        if self.parent:
            return f"{self.parent.get_url_path()}{self.slug}/"
        
        return f"{self.slug}/"

    def __str__(self):
        return self.title