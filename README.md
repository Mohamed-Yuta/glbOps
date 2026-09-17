# glbOps

Monorepo for the glbOps app.

- [frontend/](frontend/) — React + Vite frontend (see [frontend/README.md](frontend/README.md))
- [backend/](backend/) — Django + DRF API backend (see [backend/README.md](backend/README.md))

## Frontend

```bash
cd frontend
npm install
npm run dev
```

## Backend

```bash
cd backend
python -m venv venv
./venv/Scripts/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```
