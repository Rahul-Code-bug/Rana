import datetime, json, random
from django.conf import settings
from django.core.cache import cache
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST

from . import ai
from .models import CAT_KEYS, CAT_LABELS, CATEGORIES, DIFFICULTIES, Question, Score

BASE_POINTS = {"easy": 10, "medium": 20, "hard": 30, "impossible": 50}
DIFFS = [d[0] for d in DIFFICULTIES]


@ensure_csrf_cookie
def index(request):
    cats = [dict(key=k, label=l, emoji=e, desc=d) for k, l, e, d in CATEGORIES]
    return render(request, "game/index.html", {"categories": cats, "ai_on": ai.enabled()})


def _throttle(request):
    key = "ai:" + request.META.get("REMOTE_ADDR", "x")
    n = cache.get(key, 0)
    if n >= settings.AI_HOURLY_LIMIT:
        return False
    cache.set(key, n + 1, 3600)
    return True


def _pack(q):
    return {"id": q.pk, "text": q.text, "category": q.category, "category_label": CAT_LABELS[q.category],
            "difficulty": q.difficulty, "source": q.source}


def _pick(exclude, category, difficulty):
    qs = Question.objects.exclude(pk__in=exclude)
    if difficulty:
        qs = qs.filter(difficulty=difficulty)
    # Category is chosen at random first so the next type is never predictable.
    for cat in ([category] if category else random.sample(CAT_KEYS, len(CAT_KEYS))):
        ids = list(qs.filter(category=cat).values_list("pk", flat=True))
        if ids:
            return Question.objects.get(pk=random.choice(ids))
    return None


@require_GET
def api_question(request):
    exclude = [int(x) for x in request.GET.get("exclude", "").split(",") if x.isdigit()][-150:]
    category = request.GET.get("category") if request.GET.get("category") in CAT_KEYS else ""
    difficulty = request.GET.get("difficulty") if request.GET.get("difficulty") in DIFFS else ""

    if ai.enabled() and random.random() < settings.AI_QUESTION_RATE and _throttle(request):
        cat = category or random.choice(CAT_KEYS)
        diff = difficulty or random.choice(DIFFS)
        recent = list(Question.objects.filter(pk__in=exclude[-8:]).values_list("text", flat=True))
        try:
            d = ai.generate_question(cat, CAT_LABELS[cat], diff, recent)
            q, _ = Question.objects.get_or_create(text=d["text"], defaults=dict(
                category=cat, difficulty=diff, accepted=d["accepted"], explanation=d["explanation"], source="ai"))
            if q.pk not in exclude:
                return JsonResponse(_pack(q))
        except Exception:
            pass  # fall back to the built-in bank

    q = _pick(exclude, category, difficulty) or _pick([], category, difficulty) or _pick([], "", "")
    if not q:
        return JsonResponse({"error": "No questions. Run: python manage.py seed_questions"}, status=503)
    return JsonResponse(_pack(q))


@require_GET
def api_daily(request):
    today = datetime.date.today()
    ids = sorted(Question.objects.values_list("pk", flat=True))
    picked = random.Random(today.isoformat()).sample(ids, min(5, len(ids)))
    by_id = Question.objects.in_bulk(picked)
    return JsonResponse({"date": today.isoformat(), "questions": [_pack(by_id[i]) for i in picked]})


@require_POST
def api_answer(request):
    try:
        data = json.loads(request.body)
        q = get_object_or_404(Question, pk=int(data["question_id"]))
        answer = str(data.get("answer", "")).strip()[:600]
        left = max(0, min(int(data.get("seconds_left", 0)), 60)) if data.get("timed") else 0
    except (ValueError, KeyError, TypeError):
        return JsonResponse({"error": "bad request"}, status=400)

    if not answer:
        res = {"verdict": "wrong", "feedback": "No answer? Silence is only an answer to philosophers.", "explanation": q.explanation}
    else:
        res = ai.judge(q, answer, allow_ai=_throttle(request) if ai.enabled() else False)
    base = BASE_POINTS[q.difficulty]
    if res["verdict"] == "correct":
        pts = base + left // 3
    elif res["verdict"] == "creative":
        pts = base + (base // 2 if len(answer) >= 30 else 0)
    else:
        pts = 0
    res.update(points=pts, reference=q.accepted.split(";")[0] if q.accepted and res["verdict"] == "wrong" else "")
    return JsonResponse(res)


@require_GET
def api_leaderboard(request):
    rows = Score.objects.all()[:20]
    return JsonResponse({"scores": [dict(name=s.name, points=s.points, answered=s.answered, correct=s.correct, mode=s.mode) for s in rows]})


@require_POST
def api_score(request):
    try:
        d = json.loads(request.body)
        name = str(d["name"]).strip()[:20] or "Anonymous"
        points, answered, correct = (max(0, int(d[k])) for k in ("points", "answered", "correct"))
    except (ValueError, KeyError, TypeError):
        return JsonResponse({"error": "bad request"}, status=400)
    if answered > 500 or points > answered * 100 or correct > answered:  # basic sanity check
        return JsonResponse({"error": "invalid score"}, status=400)
    mode = d.get("mode") if d.get("mode") in ("free", "timer", "daily") else "free"
    Score.objects.create(name=name, points=points, answered=answered, correct=correct, mode=mode)
    return JsonResponse({"ok": True})


def robots(request):
    return HttpResponse(f"User-agent: *\nAllow: /\nSitemap: {request.build_absolute_uri('/sitemap.xml')}\n", content_type="text/plain")


def sitemap(request):
    u = request.build_absolute_uri("/")
    return HttpResponse(f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>{u}</loc></url></urlset>', content_type="application/xml")
