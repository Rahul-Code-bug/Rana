from django.contrib import admin
from .models import Question, Score
admin.site.register(Score)
@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("text", "category", "difficulty", "source")
    list_filter = ("category", "difficulty", "source")
    search_fields = ("text",)
