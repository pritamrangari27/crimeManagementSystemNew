# 🚔 Crime Management System

## 🧭 Overview

The **Crime Management System** is a production-ready web application designed for law enforcement agencies, police stations, and the public. It enables citizens to file FIRs (First Information Reports) online, allows police officers to manage cases and criminals, and gives administrators full oversight of stations, users, and analytics — all through a secure, role-based platform.

> 🔗 **Live:** [https://crime-management-system-new.vercel.app/](https://crime-management-system-new.vercel.app/)

---

## ✨ Features

### 👤 For Citizens (Users)
- 📝 **File FIRs online** with auto-generated FIR numbers (e.g. `FIR-2025-MH-MUM-00001`)
- 🤖 **AI-powered crime classification** — describe the incident, the system detects the crime type automatically
- 📍 **Geo-tagged reports** with latitude/longitude support
- 🔔 **Real-time notifications** — get notified when your FIR is approved or rejected
- 💬 **AI Chatbot** — 24/7 assistant for FIR guidance, safety tips, and legal FAQs
- 📊 **Personal dashboard** — track all your filed FIRs and their statuses

### 👮 For Police Officers
- 📂 **Manage assigned FIRs** — view, approve, or reject cases
- 🗂️ **Criminal database** — add, search, and update criminal records
- 🏢 **Station-based access** — officers only see data from their assigned station
- 📋 **Case tracking** — full case history with workflow stages

### 🛡️ For Administrators
- 👥 **User management** — create, update, delete users with role assignment
- 📦 **Bulk user import** — import up to 10,000 users via CSV
- 🏛️ **Station management** — add and manage police stations
- 📊 **Analytics dashboard** — crime heatmaps, monthly trends, FIR status charts
- 🕵️ **Activity logs** — full audit trail of all system actions

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js 18+ |
| **Framework** | Express.js 4.18 |
| **Database** | PostgreSQL via Supabase |
| **Authentication** | JWT (JSON Web Tokens) + bcrypt |
| **AI Service** | Python FastAPI (crime classification) |
| **Deployment** | Vercel (frontend) + Render/Railway (backend) |
| **ORM / DB Layer** | Custom `pg` pool wrapper with SQLite-compatible API |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│              https://crime-management-system-new         │
│                        .vercel.app                       │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS / REST API
┌──────────────────────────▼──────────────────────────────┐
│                  Express.js Backend                      │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │   Auth   │ │   FIRs   │ │ Criminal │ │  Dashboard│  │
│  │  Routes  │ │  Routes  │ │  Routes  │ │  Routes   │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │  Police  │ │ Stations │ │Chatbot   │ │  Notifs   │  │
│  │  Routes  │ │  Routes  │ │  Routes  │ │  Routes   │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
│                                                          │
│  JWT Auth Middleware │ ResponseHandler │ ActivityLogger  │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │                             │
┌───────▼───────┐           ┌────────▼────────┐
│   Supabase    │           │  Python AI       │
│  PostgreSQL   │           │  Service (FastAPI)│
│  (Database)   │           │  /classify-fir   │
└───────────────┘           └──────────────────┘
```

---

## 🔐 Roles & Permissions

| Feature | User | Police | Admin |
|---|:---:|:---:|:---:|
| File FIR | ✅ | ✅ | ✅ |
| View own FIRs | ✅ | ✅ | ✅ |
| Approve / Reject FIRs | ❌ | ✅ | ✅ |
| Manage Criminal Records | ❌ | ✅ | ✅ |
| View all FIRs | ❌ | ✅ (station) | ✅ (all) |
| Manage Police Officers | ❌ | ❌ | ✅ |
| Manage Stations | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |
| Dashboard Analytics | ❌ | ✅ | ✅ |
| Activity Logs | ❌ | ❌ | ✅ |

---

##  Quick Start

### Prerequisites

- Node.js `v18+`
- npm `v9+`
- A [Supabase](https://supabase.com) account (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/crime-management-system.git
cd crime-management-system/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
# Edit .env with your values (see Environment Variables section)
```

### 4. Start the Server

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

The server will start at `http://localhost:5000`.

On first run, the database tables are **automatically created and seeded** via `dbInitializer.js`.

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# ─── Server ───────────────────────────────────────────
PORT=5000
NODE_ENV=development       # or production

# ─── Database ─────────────────────────────────────────
# Get from: Supabase Dashboard → Connect → URI
SUPABASE_DB_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# ─── Authentication ────────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# ─── Frontend (production only) ────────────────────────
FRONTEND_URL=https://your-frontend.vercel.app

# ─── AI Service (optional) ─────────────────────────────
AI_SERVICE_URL=http://localhost:8000
```

---

## 📡 API Endpoints

### 🔑 Authentication — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/login` | ❌ | Login with username, password, role |
| `POST` | `/register` | ❌ | Register a new user |
| `POST` | `/logout` | ✅ | Logout (clears JWT client-side) |
| `GET` | `/current-user` | ✅ | Get logged-in user details |
| `PUT` | `/update-profile` | ✅ | Update profile info |
| `POST` | `/change-password` | ✅ | Change password (bcrypt verified) |

### 📄 FIRs — `/api/firs`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/` | User+ | File a new FIR |
| `GET` | `/all` | Admin | Get all FIRs |
| `GET` | `/user/:user_id` | User+ | Get FIRs for a user |
| `GET` | `/station/:station_id` | Police+ | Get FIRs for a station |
| `GET` | `/my-assigned` | Police | Get FIRs assigned to me |
| `GET` | `/status/:status` | Police+ | Filter FIRs by status |
| `GET` | `/:id` | User+ | Get FIR by ID |
| `PUT` | `/:id` | Police+ | Update FIR status |
| `PUT` | `/:id/approve` | Police+ | Approve a FIR |
| `PUT` | `/:id/reject` | Police+ | Reject a FIR |
| `DELETE` | `/:id` | Police+ | Delete a FIR |
| `POST` | `/classify` | ❌ | AI crime type classification |

### 🕵️ Criminals — `/api/criminals`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/add` | Police+ | Add a criminal record |
| `GET` | `/all` | Police+ | Get all criminals |
| `GET` | `/search/query?query=` | Police+ | Search criminals |
| `GET` | `/:id` | Police+ | Get criminal by ID |
| `PUT` | `/:id` | Police+ | Update criminal record |
| `DELETE` | `/:id` | Police+ | Delete criminal record |

### 👮 Police — `/api/police`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/add` | Admin | Add a police officer |
| `GET` | `/all` | Police+ | List all officers |
| `GET` | `/station/:stationId` | Police+ | Officers by station |
| `GET` | `/:id` | Police+ | Get officer by ID |
| `PUT` | `/:id` | Admin | Update officer |
| `DELETE` | `/:id` | Admin | Delete officer |

### 🏢 Stations — `/api/stations`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/add` | Admin | Add a station |
| `GET` | `/all` | User+ | List all stations |
| `GET` | `/:id` | User+ | Get station by ID |
| `GET` | `/:id/details` | User+ | Station + officer count |
| `PUT` | `/:id` | Admin | Update station |
| `DELETE` | `/:id` | Admin | Delete station |

### 📊 Dashboard — `/api/dashboard`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/stats` | System-wide counts |
| `GET` | `/crimes-by-type` | Crime type breakdown |
| `GET` | `/fir-status` | FIR status distribution |
| `GET` | `/crimes-by-location` | Top crime cities/states |
| `GET` | `/crimes-by-month` | Monthly crime trend (12 months) |
| `GET` | `/firs-by-month` | Monthly FIR trend (12 months) |
| `GET` | `/crime-locations` | Geo-tagged crime hotspots |
| `GET` | `/activity` | Recent system activity |

### 💬 Chatbot — `/api/chatbot`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/message` | Send a message, get a response |
| `GET` | `/quick-replies` | Get quick reply suggestions |

### 🔔 Notifications — `/api/notifications`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | ✅ | Get my notifications |
| `GET` | `/unread-count` | ✅ | Count unread notifications |
| `PUT` | `/:id/read` | ✅ | Mark one as read |
| `PUT` | `/read-all` | ✅ | Mark all as read |

---

## 🗄️ Database Schema

### Core Tables

```
users             — id, username, email, password, role, station_id, badge_number ...
firs              — id, fir_number, user_id, station_id, crime_type, accused, status ...
criminals         — id, Criminal_name, crime_type, station_id, Prison_name, Court_name ...
police            — id, police_id, name, station_id, crime_type, position ...
police_station    — id, station_name, station_code, city, state, in_charge ...
notifications     — id, user_id, title, message, type, is_read ...
activity_log      — id, user_id, activity_type, action, description, entity_type ...
```

> Tables are auto-created on first server startup via `dbInitializer.js`.

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   # or for fixes:
   git checkout -b fix/your-fix-description
   ```
3. **Commit** your changes with a clear message
   ```bash
   git commit -m "feat: add export to PDF for FIR reports"
   ```
4. **Push** to your fork
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open a Pull Request** — describe what you changed and why

### Commit Message Convention

| Prefix | Use for |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `refactor:` | Code restructuring (no logic change) |
| `docs:` | Documentation update |
| `chore:` | Config, dependencies, tooling |

---
