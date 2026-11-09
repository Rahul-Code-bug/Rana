"""AI integration (Anthropic Messages API) with offline fallbacks. Key comes from env only."""
import json, random, re, urllib.request
from django.conf import settings


def enabled():
    return bool(settings.AI_API_KEY)


def _call(system, user, max_tokens=400):
    body = json.dumps({"model": settings.AI_MODEL, "max_tokens": max_tokens, "system": system,
                       "messages": [{"role": "user", "content": user}]}).encode()
    req = urllib.request.Request(settings.AI_API_URL, body, {
        "content-type": "application/json", "x-api-key": settings.AI_API_KEY,
        "anthropic-version": "2023-06-01"})
    with urllib.request.urlopen(req, timeout=20) as r:
        text = json.load(r)["content"][0]["text"]
    return json.loads(re.search(r"\{.*\}", text, re.S).group(0))


def generate_question(category, label, difficulty, recent):
    system = ("You write questions for 'Logic or Illogic', a funny, surprising brain-challenge game. "
              "Reply with ONLY a JSON object: {\"text\": str (max 220 chars), \"accepted\": str, \"explanation\": str}. "
              "For categories with a factual/logical answer, 'accepted' is 1-4 short lowercase answer keywords separated by ';'. "
              "For illogical, funny, philosophy, weird, imagination and impossible, 'accepted' MUST be empty (many answers are valid) "
              "and explanation may be a witty one-liner or empty.")
    user = (f"Category: {label}. Difficulty: {difficulty}. Make it original, unexpected and different from these recent ones: "
            + " | ".join(recent[-8:]))
    d = _call(system, user)
    text = str(d["text"]).strip()[:400]
    if len(text) < 8:
        raise ValueError("bad question")
    open_cat = category in {"illogical", "funny", "philosophy", "weird", "imagination", "impossible"}
    return {"text": text, "accepted": "" if open_cat else str(d.get("accepted", ""))[:300],
            "explanation": str(d.get("explanation", ""))[:500]}


WRONG = ["Close, but reality disagrees.", "Bold answer. Wrong, but bold.", "Your brain tripped over a logic cable.", "Not quite. Try thinking sideways."]
RIGHT = ["Big brain energy!", "Correct! Your neurons are showing off.", "Nailed it.", "Logic approves."]
CREATIVE = ["Delightfully unhinged. We accept this.", "No rulebook can judge that. Full marks for imagination.",
            "That answer deserves its own museum.", "Illogical? Maybe. Brilliant? Definitely.", "The universe just raised an eyebrow, in a good way."]


def _norm(s):
    return re.sub(r"\s+", " ", re.sub(r"[^\w\s']", " ", s.lower().replace(",", ""))).strip()


def offline_judge(q, answer):
    if not q.is_strict:
        return {"verdict": "creative", "feedback": random.choice(CREATIVE), "explanation": q.explanation}
    a = _norm(answer)
    ok = any(re.search(rf"(?<!\w){re.escape(_norm(k))}(?!\w)", a) for k in q.accepted.split(";") if k.strip())
    return {"verdict": "correct" if ok else "wrong", "feedback": random.choice(RIGHT if ok else WRONG),
            "explanation": q.explanation}


def judge(q, answer, allow_ai=True):
    if allow_ai and enabled():
        system = ("You judge answers in 'Logic or Illogic', a witty brain game. Reply with ONLY JSON: "
                  "{\"verdict\": \"correct\"|\"wrong\"|\"creative\", \"feedback\": str (1-2 funny, kind sentences reacting to THEIR answer), "
                  "\"explanation\": str (short, the real reasoning or a fun thought)}. "
                  "If the question has an objectively right answer, judge correctness strictly by meaning (any valid phrasing or alternative valid answer counts). "
                  "If it is open-ended, silly or philosophical, verdict MUST be 'creative' and the feedback should engage with what they wrote.")
        user = (f"Category: {q.category}. Question: {q.text}\nReference answer(s), others may also be valid: "
                f"{q.accepted or 'none (open-ended)'}\nPlayer's answer: {answer}")
        try:
            d = _call(system, user)
            if d.get("verdict") in ("correct", "wrong", "creative"):
                if not q.is_strict:
                    d["verdict"] = "creative"
                return {"verdict": d["verdict"], "feedback": str(d.get("feedback", ""))[:400],
                        "explanation": str(d.get("explanation", ""))[:500] or q.explanation}
        except Exception:
            pass
    return offline_judge(q, answer)
