# Workload Automation Platform — Phase 1

A from-scratch enterprise-style workload automation application inspired by the supplied AutoSys screenshots.

## Stack
- Frontend: React + Vite + TypeScript
- Backend: FastAPI + Python
- Database: SQLite for Phase 1 (PostgreSQL will be introduced later)
- API: REST

## Features in Phase 1
- Login screen
- Enterprise-style navigation
- Dashboard
- Quick View job search
- Monitoring table
- Basic Resources page
- Backend health endpoint
- Sample job data

## Run backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Run frontend

```bash
cd frontend
npm install
npm run dev
```

Open the URL shown by Vite, normally http://localhost:5173.

Demo login:
- Username: admin
- Password: admin123

This is intentionally a Phase 1 application. Authentication is demo-only; production authentication, RBAC, PostgreSQL, Docker, Kubernetes, CI/CD, Terraform, Ansible and observability are planned for later phases.
