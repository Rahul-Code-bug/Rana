from django.core.management.base import BaseCommand
from game.models import Question
from game.seed_data import all_questions

class Command(BaseCommand):
    help = "Load the built-in question bank (safe to re-run)."
    def handle(self, *args, **opts):
        added = 0
        for cat, diff, text, acc, exp in all_questions():
            _, created = Question.objects.get_or_create(
                text=text, defaults=dict(category=cat, difficulty=diff, accepted=acc, explanation=exp))
            added += created
        self.stdout.write(self.style.SUCCESS(f"Added {added}. Total questions: {Question.objects.count()}"))
