#  Crime Management System

##  Overview

The **Crime Management System** is a production-ready web application designed for law enforcement agencies, police stations, and the public. It enables citizens to file FIRs (First Information Reports) online, allows police officers to manage cases and criminals, and gives administrators full oversight of stations, users, and analytics — all through a secure, role-based platform.

>  **Live:** [https://crime-management-system-new.vercel.app/](https://crime-management-system-new.vercel.app/)

---

##  Features

###  For Citizens (Users)
-  **File FIRs online** with auto-generated FIR numbers (e.g. `FIR-2025-MH-MUM-00001`)
-  **AI-powered crime classification** — describe the incident, the system detects the crime type automatically
-  **Geo-tagged reports** with latitude/longitude support
-  **Real-time notifications** — get notified when your FIR is approved or rejected
-  **AI Chatbot** — 24/7 assistant for FIR guidance, safety tips, and legal FAQs
-  **Personal dashboard** — track all your filed FIRs and their statuses

###  For Police Officers
-  **Manage assigned FIRs** — view, approve, or reject cases
-  **Criminal database** — add, search, and update criminal records
-  **Station-based access** — officers only see data from their assigned station
-  **Case tracking** — full case history with workflow stages

###  For Administrators
-  **User management** — create, update, delete users with role assignment
-  **Bulk user import** — import up to 10,000 users via CSV
-  **Station management** — add and manage police stations
-  **Analytics dashboard** — crime heatmaps, monthly trends, FIR status charts
-  **Activity logs** — full audit trail of all system actions

---

##  System Architecture

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


## Pictures
<br>
<br>
   1] login Page
   <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/9462463a-bace-47c0-abe0-5f6711b56b53" />
   <br>
   <br>
   2] User Dashboard
   <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/507e2e26-7ced-444f-9457-e4a8ae54e154" />
   <br>
   <br>
   3] Admin Dashboard
    <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/7daa82cd-fa11-4a42-a973-b0bff62b465f" />
    <br>
    <br>
   4] Police Dashboard
   <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/1dd592b7-cfb0-4861-aeb2-ea0367e2acf6" />

  


---
