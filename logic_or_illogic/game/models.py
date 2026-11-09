from django.db import models

CATEGORIES = [
    ("logical", "Logical", "🧩", "Pure reasoning. Follow the chain."),
    ("illogical", "Illogical", "🌀", "Nonsense on purpose. Be creative."),
    ("funny", "Funny", "😂", "Make us laugh."),
    ("tricky", "Tricky", "🪤", "Looks easy. Isn't."),
    ("brain", "Brain Teasers", "🧠", "Riddles and puzzles."),
    ("math", "Mathematical", "➗", "Numbers don't lie."),
    ("science", "Scientific", "🔬", "How the universe works."),
    ("general", "General Knowledge", "🌍", "Things worth knowing."),
    ("philosophy", "Philosophical", "🤔", "No right answer, just deep ones."),
    ("weird", "Weird & Unexpected", "🛸", "Nobody saw this coming."),
    ("imagination", "Imagination", "🎨", "Invent a world."),
    ("impossible", "Impossible", "♾️", "Unsolvable. Try anyway."),
]
CAT_KEYS = [c[0] for c in CATEGORIES]
CAT_LABELS = {c[0]: c[1] for c in CATEGORIES}
DIFFICULTIES = [("easy", "Easy"), ("medium", "Medium"), ("hard", "Hard"), ("impossible", "Impossible")]


class Question(models.Model):
    text = models.CharField(max_length=400, unique=True)
    category = models.CharField(max_length=20, choices=[(c[0], c[1]) for c in CATEGORIES], db_index=True)
    difficulty = models.CharField(max_length=12, choices=DIFFICULTIES, db_index=True)
    # Reference answers separated by ";". Empty => open-ended (many valid answers).
    accepted = models.CharField(max_length=300, blank=True)
    explanation = models.CharField(max_length=500, blank=True)
    source = models.CharField(max_length=10, default="seed")  # seed | ai
    created = models.DateTimeField(auto_now_add=True)

    @property
    def is_strict(self):
        return bool(self.accepted)

    def __str__(self):
        return self.text[:60]


class Score(models.Model):
    name = models.CharField(max_length=20)
    points = models.PositiveIntegerField()
    answered = models.PositiveIntegerField()
    correct = models.PositiveIntegerField()
    mode = models.CharField(max_length=10, default="free")
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-points", "created"]
