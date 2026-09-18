# StreamTube

A full-stack, functional YouTube-style video platform: Django REST Framework backend (JWT auth, async FFmpeg video processing, real database-backed everything) + a React frontend (upload, watch, search, subscriptions, playlists, creator studio, admin dashboard).

This is a working application, not a mockup — every button calls a real API endpoint backed by real database models. It's built for local development, using SQLite by default so you can get it running in a few minutes, with a clear path to swap in PostgreSQL and S3-compatible storage for production.

## Stack

- **Frontend:** React 19 + Vite, React Router, Axios, Recharts, lucide-react icons
- **Backend:** Django 6 + Django REST Framework, SimpleJWT
- **Database:** SQLite by default (zero setup) — one env var away from PostgreSQL
- **Video processing:** FFmpeg (thumbnail generation, multi-resolution transcoding, duration probing), run on a background thread so uploads return instantly
- **Media storage:** local disk during development, structured so it can be swapped for S3 / Cloudflare R2 later

## Prerequisites

- Python 3.10+
- Node.js 18+
- **FFmpeg** installed and available on your `PATH` (`ffmpeg -version` should work). This is required for video processing — without it, uploaded videos will get stuck in "processing".
  - macOS: `brew install ffmpeg`
  - Ubuntu/Debian: `sudo apt install ffmpeg`
  - Windows: download from [ffmpeg.org](https://ffmpeg.org/download.html) and add it to your PATH

## 1. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env            # defaults work out of the box (SQLite, console email)

python manage.py migrate
python manage.py createsuperuser   # create your admin account

python manage.py runserver         # http://localhost:8000
```

That's it — no database server to install or configure. The `.env` defaults to SQLite.

### Seed some categories (optional but recommended)

```bash
python manage.py shell -c "
from apps.videos.models import Category
for i, name in enumerate(['Entertainment','Music','Gaming','Education','Technology','Sports','News','Movies','Anime','Travel','Comedy','Science']):
    Category.objects.get_or_create(name=name, defaults={'order': i})
"
```

### Switching to PostgreSQL

Edit `backend/.env`:

```env
DB_ENGINE=postgres
DB_NAME=streamtube
DB_USER=streamtube
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
```

Install `psycopg2-binary` (`pip install psycopg2-binary`), create the database and role in Postgres, then run `python manage.py migrate` again.

## 2. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env    # points at http://localhost:8000 by default

npm run dev              # http://localhost:5173
```

Open `http://localhost:5173`, register an account, and start uploading.

## 3. Using the app

1. **Register** an account at `/register` — a channel is created automatically for every user.
2. **Upload a video** from the navbar or `/upload`. Files under ~25MB upload in one request; larger files automatically use the resumable chunked-upload endpoints. After upload, FFmpeg processes the video in the background (thumbnail + multiple resolutions) — refresh the watch page after a few seconds to see it finish.
3. **Watch, like, comment, subscribe** as normal.
4. **Creator Studio** (`/studio`) shows real analytics computed from your videos: views, watch time, subscriber growth, traffic sources, top videos.
5. **Admin Dashboard** (`/admin`) is visible only to staff accounts. Make a user staff either via `python manage.py createsuperuser`, the Django admin at `/admin/` (Django's built-in admin, separate from the app's `/admin` route), or by toggling "Staff" in the app's own Admin → Users tab once you have one staff account.

## Project structure

```
streamtube/
├── backend/
│   ├── config/              # Django project settings & root URLs
│   ├── apps/
│   │   ├── accounts/        # custom User model, auth, profile
│   │   ├── channels/        # Channel model (auto-created per user)
│   │   ├── videos/          # Video, Category, Tag, upload, FFmpeg processing, search
│   │   ├── comments/        # Comments, replies, reports
│   │   ├── engagement/      # Like/dislike reactions
│   │   ├── subscriptions/   # Subscribe/unsubscribe, feed
│   │   ├── playlists/       # Playlists
│   │   ├── history/         # Watch history, Watch Later
│   │   ├── notifications/   # In-app notifications (signal-driven)
│   │   ├── analytics/       # Creator dashboard analytics endpoints
│   │   └── adminapi/        # Staff-only moderation REST API
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/              # axios client + one module per resource
    │   ├── components/       # Navbar, Sidebar, VideoCard, CommentSection, etc.
    │   ├── context/          # Auth, Theme, Toast
    │   ├── pages/            # one file/folder per route
    │   └── styles/           # design tokens + global stylesheet
    └── .env.example
```

## API overview

All endpoints are under `/api/`. A few highlights:

| Area | Endpoint |
|---|---|
| Auth | `POST /api/auth/register/`, `/login/`, `/logout/`, `/me/`, `/password-reset/` |
| Videos | `GET /api/videos/?section=trending\|latest\|recommended`, `GET /api/videos/search/?q=...` |
| Upload | `POST /api/videos/upload/` (direct), or `/api/videos/uploads/init/` → `/chunk/` → `/complete/` (resumable) |
| Watch | `GET /api/videos/<slug>/`, `POST /api/videos/<slug>/view/`, `POST /api/videos/<slug>/react/` |
| Comments | `GET/POST /api/comments/?video=<slug>` |
| Subscriptions | `POST /api/subscriptions/<channel-slug>/toggle/`, `GET /api/subscriptions/feed/` |
| Creator analytics | `GET /api/analytics/summary/`, `GET /api/analytics/timeseries/` |
| Admin | `GET /api/admin-panel/users/`, `/videos/`, `/comments/`, `/reports/` (staff only) |

Full request/response shapes are visible directly in each app's `serializers.py` and `views.py` — there's no separate API doc generator wired up, but DRF's browsable API works if you open any endpoint in a browser while logged into Django admin.

## Notes on what's "development-ready" vs "production-ready"

This app is fully functional locally, but a few things are intentionally simplified for local development and are called out in code comments where relevant:

- **Video processing** runs on a background Python thread per upload. This works fine for local use and demos; for production, move `apps/videos/processing.py`'s `process_video_sync` into a Celery task run by real workers (the function body doesn't need to change).
- **Media storage** is local disk (`backend/media/`). Swap `DEFAULT_FILE_STORAGE` for `django-storages` pointed at S3/R2 for production — the model fields (`FileField`/`ImageField`) don't need to change.
- **Email** uses Django's console backend by default (verification/reset links print to your terminal). Set the `EMAIL_*` variables in `.env` to send real email via SMTP.
- **HLS/DASH adaptive streaming** isn't wired up — the player currently switches between fixed MP4 renditions (360p/480p/720p/1080p) via a quality selector. The multi-resolution files FFmpeg already generates are exactly what you'd feed into an HLS packager if you want adaptive streaming later.

## Troubleshooting

- **Uploaded videos stuck on "processing"** — check that `ffmpeg` and `ffprobe` are on your PATH, and check the Django server's terminal output for errors (they're saved to the video's `processing_error` field too — visible via `/admin/` or the admin API).
- **CORS errors in the browser console** — make sure `CORS_ALLOWED_ORIGINS` in `backend/.env` includes your frontend's actual origin (default `http://localhost:5173`).
- **"relation does not exist" after switching to Postgres** — run `python manage.py migrate` again after changing `DB_ENGINE`; migrations are per-database.
