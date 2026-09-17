# Backend

Django + Django REST Framework API for glbOps.

## Setup

```bash
cd backend
python -m venv venv
./venv/Scripts/activate   # Windows; use `source venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

The API is served under `/api/`. `/api/health/` returns `{"status": "ok"}`.

CORS is configured via `DJANGO_CORS_ALLOWED_ORIGINS` in `.env` and defaults to
the Vite dev server at `http://localhost:5173`.

## Apps

- `core` — starter app, holds shared/base endpoints.
