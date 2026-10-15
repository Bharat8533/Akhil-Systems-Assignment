# QuickCare EHR — Hospital Patient Registration & Appointment Management System

> **Hospital Patient Registration & Appointment Management System**  
> Built with MongoDB Atlas, Express.js, React.js (Vite + Tailwind CSS), and Node.js.

---

## 📌 Executive Summary & Requirements Compliance

| Section | Assignment Requirement | Implementation Detail | Status |
| :--- | :--- | :--- | :---: |
| **A. Patient Registration** | Auto-generated Patient ID (`PAT-XXXX`) | Handled via atomic MongoDB `Counter` model & Mongoose pre-save hook | ✅ Passed |
| | Full name, DOB, gender, phone, address, registration date/time | All captured and validated on both frontend and backend | ✅ Passed |
| | Optional email, blood group, emergency contact, allergies, notes | Full medical demographics supported in schema & UI | ✅ Passed |
| | Validate required fields & formats | Client form validation + Server-side schema rules & regex | ✅ Passed |
| | Calculate age from date of birth | Reactive calculation in UI (`dateUtils.js`) & Mongoose virtual `age` field | ✅ Passed |
| | Patient search, viewing, and editing | Real-time multi-field search (`PatientList.jsx`), detail modal (`PatientDetailModal.jsx`), and edit modal (`PatientFormModal.jsx`) | ✅ Passed |
| | Handle duplicate registrations | Client warning for duplicate phone/email + Backend 409 Conflict detection | ✅ Passed |
| **B. Doctor Availability** | Doctor profiles with ID, specialization, duration, hours, breaks, leaves | Complete `Doctor` model with day-by-day working schedules, breaks, and leaves | ✅ Passed |
| | Slot viewing by doctor & date | Interactive slot grid (`DoctorAvailabilityViewer.jsx` & `SlotPicker.jsx`) | ✅ Passed |
| | Exclude past slots, breaks, leaves, off-duty hours, booked slots | Centralized calculation engine in `backend/utils/availability.js` | ✅ Passed |
| **C. Appointment Booking** | Book registered patient with ID (`APT-XXXX`), type, reason, status | Complete appointment lifecycle management with atomic ID sequence | ✅ Passed |
| | Booking confirmation slip | Printable & downloadable OPD appointment slip modal (`AppointmentConfirmationModal.jsx`) | ✅ Passed |
| | View, reschedule, cancel appointments | Dedicated modals (`RescheduleModal.jsx`, `CancelModal.jsx`) with reason logging | ✅ Passed |
| | Validate new slot before changing existing booking | Backend slot validation engine guards all reschedule requests | ✅ Passed |
| **D. Receptionist Dashboard** | Today's/upcoming, completed, and cancelled appointments | Overview KPI metrics, quick actions, and status-grouped appointment views (`DashboardOverview.jsx`) | ✅ Passed |
| | Search & multi-parameter filtering | Instant filtering by date, doctor, department, status, and patient search | ✅ Passed |
| | Validation, success/error, empty states | Context toast notifications (`ToastContext.jsx`), inline errors, and SVG empty states | ✅ Passed |
| | Responsive layout for desktop & tablet | Tailwind CSS grid/flex design optimized for 768px (tablet) through 4K displays | ✅ Passed |
| **Business Rules** | Zero double-booking guarantee | DB partial unique index on `{ doctor: 1, appointmentDate: 1 }` (`status: Scheduled`) + server pre-check | ✅ Passed |
| | Slot release upon cancellation | Cancellation immediately updates status to `Cancelled`, restoring slot to OPD pool | ✅ Passed |
| | Inactive doctor / past date rejection | Server returns 400 Bad Request / 409 Conflict on invalid bookings | ✅ Passed |
| **Code & Architecture** | Production-ready architecture | Clean modular MVC architecture, input sanitization, and atomic sequence generators | ✅ Passed |
| | Environment variables & documentation | Clean `.env` files for frontend and backend with full documentation | ✅ Passed |

---

## 🏗️ System Architecture

```
QuickCare/
├── backend/
│   ├── config/              # MongoDB connection with Mongoose
│   ├── controllers/         # Express controllers (patients, doctors, appointments, dashboard)
│   ├── middlewares/         # Global error handling and validation middleware
│   ├── models/              # Patient, Doctor, Appointment, Counter schemas
│   ├── routes/              # Modular Express REST API routes
│   ├── seed/                # seedDoctors.js (seeds real hospital OPD roster)
│   ├── utils/               # availability.js (slot math, break overlaps, working hour rules)
│   ├── server.js            # Node HTTP server entry point
│   ├── app.js               # Express application configuration & CORS
│   └── .env                 # Environment configuration (PORT, MONGO_URI)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── appointments/ # Booking, Table, Confirmation, Reschedule, Cancel, SlotPicker
│   │   │   ├── common/       # Modal, Button, Badge, Status components
│   │   │   ├── dashboard/    # Receptionist OPD dashboard & metric KPIs
│   │   │   ├── doctors/      # Doctor availability timeline & roster viewer
│   │   │   ├── layout/       # Header, navigation tabs, status indicators
│   │   │   └── patients/     # Registration, patient list, medical detail card
│   │   ├── context/          # Toast notification context
│   │   ├── services/         # api.js (Axios/fetch client with shape normalizers)
│   │   └── utils/            # dateUtils.js (age calculator, slot formatters)
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
```

---

## 🚀 Setup & Installation

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB Atlas URI** or local MongoDB instance

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Verify or configure .env file
# PORT=5000
# MONGO_URI=your_mongodb_connection_string

# Seed initial doctors into MongoDB
node seed/seedDoctors.js

# Start backend server
npm run dev
# Server will run on http://localhost:5000
```

### 2. Frontend Setup
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
# Application will run on http://localhost:5173
```

---

## 📡 REST API Reference

### Patients
- `POST /api/patients` — Register a new patient (auto-generates `PAT-XXXX`, checks soft duplicates).
- `GET /api/patients?search=...&page=1&limit=20` — Search patients by name, phone, or `patientId`.
- `GET /api/patients/:id` — Retrieve single patient by MongoDB `_id` or `patientId`.
- `PATCH /api/patients/:id` — Update patient demographic/contact information.

### Doctors
- `GET /api/doctors` — List all active doctors, departments, and consultation durations.
- `GET /api/doctors/:id` — Get single doctor profile.
- `GET /api/doctors/:id/availability?date=YYYY-MM-DD` — Calculate available and booked slots for a given date (respecting working hours, breaks, and leaves).

### Appointments
- `POST /api/appointments` — Book appointment (auto-generates `APT-XXXX`, server-side concurrency check).
- `GET /api/appointments` — List appointments with filtering by `date`, `doctorId`, `department`, `status`, and `search`.
- `GET /api/appointments/:id` — Retrieve appointment details with populated patient and doctor refs.
- `PATCH /api/appointments/:id/reschedule` — Reschedule appointment to a new date/time slot (validates new slot, frees previous slot).
- `PATCH /api/appointments/:id/cancel` — Cancel appointment (logs reason, immediately restores slot to OPD pool).
- `PATCH /api/appointments/:id/complete` — Mark visit as completed.

### Dashboard
- `GET /api/dashboard` — Receptionist KPI summary metrics (total registered, appointments today, scheduled, completed, cancelled).

---

## 🛡️ Business Logic & Concurrency Rules

1. **Zero Double-Booking Guarantee**:
   - Concurrency is protected at both the application and database tiers.
   - Mongoose schema defines a partial unique compound index on `{ doctor: 1, appointmentDate: 1 }` where `{ status: 'Scheduled' }`.
   - Simultaneous conflicting booking requests return an HTTP `409 Conflict` with a clear explanation.
2. **Break Periods & Leaves**:
   - Break intervals (e.g. Lunch `13:00 - 14:00`) and doctor leave dates (e.g. `2026-10-25`) are dynamically stripped before slots are returned to the client.
3. **Slot Restoration**:
   - When an appointment is cancelled, its status changes to `Cancelled`, immediately exempting it from the partial active index and returning the slot to the available list.
4. **Rescheduling Safety**:
   - The new slot is verified through `validateSlot` before any database modifications occur. If the new slot is unavailable, the existing appointment remains untouched.

# Akhil-Systems-Assignment
