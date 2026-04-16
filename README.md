<div align="center">

```
███╗   ███╗███████╗██████╗ ██████╗ ██████╗ ██╗ ██████╗███████╗
████╗ ████║██╔════╝██╔══██╗██╔══██╗██╔══██╗██║██╔════╝██╔════╝
██╔████╔██║█████╗  ██║  ██║██████╔╝██████╔╝██║██║     █████╗  
██║╚██╔╝██║██╔══╝  ██║  ██║██╔═══╝ ██╔══██╗██║██║     ██╔══╝  
██║ ╚═╝ ██║███████╗██████╔╝██║     ██║  ██║██║╚██████╗███████╗
╚═╝     ╚═╝╚══════╝╚═════╝ ╚═╝     ╚═╝  ╚═╝╚═╝ ╚═════╝╚══════╝
```

**Know the price before you pay.**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis)](https://redis.io)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

</div>

---

## The Problem

Patients across India discover the same prescription medicine — same brand, same dosage, same strip count — priced **30–50% differently** across pharmacy chains within walking distance of each other. There is no transparent, real-time price comparison tool that lets a patient find the most affordable nearby source *before* they walk to the counter and pay.

MedPrice solves this. It is a **role-based desktop web platform** where patients compare live medicine prices across nearby pharmacies, and pharmacies manage their own inventory and pricing in real time.

---

## How I Executed This

### The Core Insight
The problem is a **data availability + visibility gap**, not a logistics problem. Patients don't need delivery — they need to know which of the three pharmacies on their street has Metformin 500mg for ₹38 instead of ₹61. The solution is therefore a comparison engine with a lightweight reservation system, not another quick-commerce clone.

### Architecture Decision
I split the system into two clearly separated roles at the auth layer — **Patient** and **Pharmacy (Vendor)** — each with a distinct UI surface and permission scope. A patient can only read prices and create reservations. A vendor can only manage their own inventory and fulfill reservations for their registered pharmacy. No cross-role data leakage.

### Why This Stack
- **React + Vite** on the frontend for fast iteration, component reuse across roles, and a snappy desktop experience
- **FastAPI** on the backend because Python made sense for the future addition of ML-based price anomaly detection and generic substitution recommendations
- **PostgreSQL** as the primary store — relational data (pharmacies → medicines → prices → reservations) fits naturally into a relational model
- **Redis** for caching price queries — the most common read pattern (search medicine X near location Y) gets cached with a short TTL so the DB isn't hit on every keystroke
- **PostGIS** extension on Postgres for geospatial queries ("pharmacies within 3km of user")
- **Supabase** for auth (JWT), storage, and as the managed Postgres host in production

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend Framework | React 18 + Vite | Fast HMR, component-based role UIs |
| Styling | Tailwind CSS + shadcn/ui | Utility-first, consistent design tokens |
| State Management | Zustand | Lightweight, no boilerplate |
| Data Fetching | TanStack Query (React Query) | Cache + background refetch for prices |
| Maps | React Leaflet + OpenStreetMap | Free, no Google Maps billing |
| Charts | Recharts | Price history sparklines, analytics |
| Backend Framework | FastAPI (Python 3.11) | Async, auto docs, fast to build |
| Auth | Supabase Auth (JWT) | Role claims in JWT payload |
| Primary DB | PostgreSQL 16 + PostGIS | Relational + geo queries |
| Cache | Redis 7 | Price query caching (60s TTL) |
| ORM | SQLAlchemy 2.0 + Alembic | Async ORM + migrations |
| Background Jobs | Celery + Redis | Price change notifications |
| API Docs | Swagger UI (auto via FastAPI) | `/docs` endpoint |
| Deployment | Docker + Docker Compose | Single command local setup |

---

## File Structure

```
medprice/
│
├── README.md
├── docker-compose.yml
├── .env.example
│
├── frontend/                          # React + Vite app
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── package.json
│   │
│   └── src/
│       ├── main.tsx
│       ├── App.tsx                    # Root router + role-based redirects
│       │
│       ├── lib/
│       │   ├── api.ts                 # Axios instance + interceptors
│       │   ├── auth.ts                # Supabase client + helpers
│       │   └── utils.ts               # cn(), formatPrice(), distanceLabel()
│       │
│       ├── store/
│       │   ├── authStore.ts           # User + role state (Zustand)
│       │   ├── locationStore.ts       # User's current lat/lng
│       │   └── searchStore.ts         # Active search query + filters
│       │
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useMedicineSearch.ts   # TanStack Query: search + cache
│       │   ├── useNearbyPharmacies.ts
│       │   └── usePriceHistory.ts
│       │
│       ├── types/
│       │   ├── medicine.ts
│       │   ├── pharmacy.ts
│       │   ├── reservation.ts
│       │   └── user.ts
│       │
│       ├── components/                # Shared, role-agnostic
│       │   ├── ui/                    # shadcn base components
│       │   │   ├── Button.tsx
│       │   │   ├── Card.tsx
│       │   │   ├── Badge.tsx
│       │   │   ├── Input.tsx
│       │   │   ├── Table.tsx
│       │   │   ├── Modal.tsx
│       │   │   └── ...
│       │   ├── PriceBadge.tsx         # Savings badge (amber pill)
│       │   ├── StockDot.tsx           # Green/amber/red stock indicator
│       │   ├── PharmacyCard.tsx
│       │   ├── MedicineCard.tsx
│       │   └── LocationPill.tsx
│       │
│       ├── layouts/
│       │   ├── PatientLayout.tsx      # Sidebar + header for patients
│       │   └── VendorLayout.tsx       # Sidebar + header for vendors
│       │
│       ├── pages/
│       │   │
│       │   ├── auth/
│       │   │   ├── RoleSelector.tsx   # "Patient" vs "Pharmacy" split screen
│       │   │   ├── Login.tsx
│       │   │   └── Register.tsx
│       │   │
│       │   ├── patient/
│       │   │   ├── Home.tsx           # Dashboard, price drops, nearby pharmacies
│       │   │   ├── SearchResults.tsx  # List + map toggle view
│       │   │   ├── MedicineDetail.tsx # Price comparison table (hero screen)
│       │   │   ├── Reservation.tsx    # Confirm + QR confirmation
│       │   │   ├── Watchlist.tsx      # Saved medicines + price alerts
│       │   │   └── Profile.tsx
│       │   │
│       │   └── vendor/
│       │       ├── Dashboard.tsx      # Reservations + low stock alerts
│       │       ├── Inventory.tsx      # Full medicine table + inline edit
│       │       ├── AddMedicine.tsx    # Modal form
│       │       ├── Reservations.tsx   # Tabs: pending / ready / done
│       │       ├── Analytics.tsx      # Charts + price position
│       │       └── Settings.tsx
│       │
│       └── router/
│           ├── index.tsx              # React Router v6 routes
│           ├── ProtectedRoute.tsx     # JWT check + role check
│           └── routes.ts              # Route constants
│
│
└── backend/                           # FastAPI app
    ├── main.py                        # App entry, CORS, router mounts
    ├── requirements.txt
    ├── alembic.ini
    │
    ├── alembic/
    │   └── versions/                  # DB migration files
    │
    ├── app/
    │   │
    │   ├── core/
    │   │   ├── config.py              # Settings from .env (pydantic-settings)
    │   │   ├── database.py            # Async SQLAlchemy engine + session
    │   │   ├── redis.py               # Redis connection pool
    │   │   ├── security.py            # JWT decode, role extraction
    │   │   └── deps.py                # FastAPI dependencies (get_db, get_current_user)
    │   │
    │   ├── models/                    # SQLAlchemy ORM models
    │   │   ├── user.py                # User (role: patient | vendor)
    │   │   ├── pharmacy.py            # Pharmacy (geo point, hours)
    │   │   ├── medicine.py            # Medicine master (name, salt, manufacturer)
    │   │   ├── inventory.py           # PharmacyMedicine (price, stock, listed)
    │   │   └── reservation.py         # Reservation (patient → pharmacy → medicine)
    │   │
    │   ├── schemas/                   # Pydantic request/response schemas
    │   │   ├── medicine.py
    │   │   ├── pharmacy.py
    │   │   ├── inventory.py
    │   │   ├── reservation.py
    │   │   └── user.py
    │   │
    │   ├── routers/
    │   │   ├── auth.py                # POST /auth/register, /auth/login
    │   │   ├── medicines.py           # GET /medicines/search, /medicines/{id}/prices
    │   │   ├── pharmacies.py          # GET /pharmacies/nearby
    │   │   ├── inventory.py           # CRUD /vendor/inventory (vendor only)
    │   │   ├── reservations.py        # POST/GET /reservations (both roles)
    │   │   └── analytics.py           # GET /vendor/analytics (vendor only)
    │   │
    │   ├── services/
    │   │   ├── price_service.py       # Core: fetch + rank prices, cache logic
    │   │   ├── geo_service.py         # PostGIS nearby query wrapper
    │   │   ├── notification_service.py# Celery tasks: price drop alerts
    │   │   └── generic_service.py     # Salt-based generic substitute lookup
    │   │
    │   └── tasks/
    │       ├── celery_app.py          # Celery instance
    │       └── price_alerts.py        # Periodic: check watchlist + notify
    │
    └── tests/
        ├── test_medicines.py
        ├── test_reservations.py
        └── test_geo.py
```

---

## Database Schema (Key Tables)

```sql
-- Core entities
users          (id, phone, role: 'patient'|'vendor', created_at)
pharmacies     (id, vendor_id, name, license_no, location: GEOGRAPHY, hours, verified)
medicines      (id, name, generic_name, salt, manufacturer, dosage, pack_size)

-- The price layer
inventory      (id, pharmacy_id, medicine_id, mrp, selling_price, stock_qty, is_listed, updated_at)

-- Patient actions
reservations   (id, patient_id, pharmacy_id, medicine_id, qty, status, reservation_code, created_at)
watchlist      (id, patient_id, medicine_id, alert_price, created_at)
```

---

## Key API Endpoints

```
POST   /auth/register                  Register patient or vendor
POST   /auth/login                     OTP login → JWT with role claim

GET    /medicines/search?q=&lat=&lng=  Search + rank by price near location
GET    /medicines/{id}/prices?lat=&lng= All pharmacy prices for one medicine

GET    /pharmacies/nearby?lat=&lng=&r= Pharmacies within radius

# Vendor-only (role guard on all)
GET    /vendor/inventory               List all medicines for this pharmacy
POST   /vendor/inventory               Add new medicine+price
PATCH  /vendor/inventory/{id}          Update price / stock
DELETE /vendor/inventory/{id}          Remove listing

GET    /vendor/analytics               Reservations, views, price position
GET    /vendor/reservations            Pending/ready/done tabs

# Both roles
POST   /reservations                   Patient creates reservation
PATCH  /reservations/{id}/status       Vendor marks ready/done
```

---

## Local Setup

```bash
# 1. Clone
git clone https://github.com/yourname/medprice.git
cd medprice

# 2. Environment
cp .env.example .env
# Fill in: SUPABASE_URL, SUPABASE_KEY, DATABASE_URL, REDIS_URL

# 3. Start everything
docker-compose up --build

# 4. Run migrations
docker-compose exec backend alembic upgrade head

# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

---

## Roadmap

- [ ] SMS notifications for reservation status (Twilio/MSG91)
- [ ] Generic substitute engine (salt-based matching)
- [ ] Price history charts per medicine per pharmacy
- [ ] Pharmacy verification workflow (license upload + admin review)
- [ ] Mobile PWA (existing desktop codebase, responsive breakpoints)
- [ ] ML price anomaly detection (flag outlier pricing)

---

<div align="center">
Built to fix a real problem — one prescription at a time.
</div>
