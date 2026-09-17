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

Optionally load the same demo data the frontend ships with (`frontend/src/data/seed.js`):

```bash
python manage.py seed_demo
```

The API is served under `/api/`. `/api/health/` returns `{"status": "ok"}`.
All models are exposed as DRF `ModelViewSet`s registered on a `DefaultRouter`,
so each one also gets `/api/<resource>/<id>/` detail routes and the browsable
API UI.

CORS is configured via `DJANGO_CORS_ALLOWED_ORIGINS` in `.env` and defaults to
the Vite dev server at `http://localhost:5173`.

## Apps

- `core` — shared/base endpoints (health check) and the `seed_demo` management command.
- `employees` — `Employee`, `Conge` (leave requests). Endpoints: `/api/employees/`, `/api/conges/`.
- `clients` — `Client`. Endpoint: `/api/clients/`.
- `resources` — `Resource` (covers both `materiel` and `vehicule`, distinguished by `type`), `MaintenanceLogEntry`. Endpoints: `/api/resources/`, `/api/maintenance-log/`.
- `projets` — `Projet`, `Prestation`, `Tache`, `HistoryEntry`. Endpoints: `/api/projets/`, `/api/prestations/`, `/api/taches/`, `/api/history/`.

IDs are kept as human-readable string primary keys (`EMP-001`, `CLI-0231`, `PRJ-2026-001`, ...)
to match the identifiers already used across the frontend.

Not yet modeled: attachments (photos/livrables) — the frontend's `attachments` arrays
are currently always empty in the seed data, so this is left for when file upload
storage is decided.
