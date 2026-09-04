# BuildLogic

A PC build compatibility validator. Pick a CPU, motherboard, RAM, GPU, PSU, and case from a component database, and get back a rule-by-rule compatibility report, a power-supply sufficiency check, and a CPU/GPU bottleneck analysis, with a PDF export for documentation.

Built as my bachelor's thesis project (Licenta).

## What it checks

- **Socket compatibility** : CPU socket vs. motherboard socket
- **RAM compatibility** : RAM type (DDR4/DDR5) vs. motherboard support
- **Form factor fit** : motherboard form factor vs. case support
- **GPU clearance** : GPU length vs. case maximum GPU length
- **Power supply sufficiency** : estimated system draw vs. PSU wattage, with a safety margin
- **CPU/GPU bottleneck** : which component limits the system at a given resolution (1080p/1440p/4K), based on single-core and render scores

## Stack

- **Backend:** Django + Django REST Framework, MySQL
- **Frontend:** React (Vite), axios, lucide-react, html2pdf.js

## Running locally

### Backend

```bash
cd pc-validator/backend
python -m venv venv
venv\Scripts\activate        # source venv/bin/activate on macOS/Linux
pip install -r requirements.txt

cp .env.example .env         # fill in DB_PASSWORD and generate a DJANGO_SECRET_KEY

python manage.py migrate
python manage.py seed_db     # populates CPUs, motherboards, RAM, GPUs, PSUs, cases
python manage.py runserver
```

Requires a local MySQL server with a database matching `DB_NAME` in `.env`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the API at `http://127.0.0.1:8000/api`.

## API

| Endpoint | Method | Description |
|---|---|---|
| `/api/cpus/`, `/api/motherboards/`, `/api/rams/`, `/api/gpus/`, `/api/psus/`, `/api/cases/` | GET | List available components |
| `/api/validate/` | POST | Validate a full build (compatibility + power + bottleneck) |
| `/api/bottleneck/` | GET | Standalone CPU/GPU bottleneck check (`?cpu_id=&gpu_id=&resolution=`) |
