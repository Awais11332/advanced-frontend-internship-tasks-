# Nexus - Investor & Entrepreneur Collaboration Platform

Nexus is a premium web platform designed to facilitate collaboration, networking, and scheduling between entrepreneurs and investors. This repository contains the enhanced version of the platform with advanced collaboration features, a custom scheduling calendar, and dashboard views.

🔗 **Live Link:** [https://advanced-frontend-internship-tasks-95s86qd5j.vercel.app](https://advanced-frontend-internship-tasks-95s86qd5j.vercel.app)

---

## 🚀 Key Features (Week 1 Milestone - Scheduling & Setup)

1. **Custom Interactive Calendar UI**
   - A fully responsive, custom-built calendar interface styled using Tailwind CSS and Lucide icons.
   - Month-level navigation grids with availability and meeting visualization.
   - Separate visual dashboards showing **Availability Slots**, **Incoming Requests** (with Accept/Decline action buttons), and **Sent Requests** with color-coded status badges.

2. **Persistent State Management (`MeetingContext`)**
   - Uses a custom React Context provider (`MeetingContext`) to maintain slots and scheduled events.
   - Automatically synchronizes scheduling state with the user's browser `localStorage`.
   - Employs `react-hot-toast` for real-time notifications on creation, modification, and response updates.

3. **Profile Booking Flow Integration**
   - Deep integration with Investor and Entrepreneur profile pages.
   - "Book Meeting" action triggers a URL search parameter redirect (`/calendar?hostId=...`) which automatically opens the booking request modal with the host pre-populated.

4. **Dashboard Collaboration Overviews**
   - Count metrics displaying current "Upcoming Meetings".
   - Direct interactive links on Dashboard pages to let users join their confirmed video meetings.

---

## 🛠️ Tech Stack & Architecture

- **Core:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS (consistent HSL palette, dark theme accents, glassmorphic card overlays, hover transitions)
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **Routing:** React Router DOM v6

```
src/
├── components/           # Reusable UI cards, inputs, buttons, and layout shells
│   ├── chat/
│   ├── layout/           # Sidebar, Navbar, and DashboardLayout components
│   └── ui/
├── context/              # Global state (AuthContext and MeetingContext)
├── data/                 # Static mock user, message, and deals datasets
├── pages/                # Views (Calendar, Profile, Dashboard, Auth)
├── types/                # TypeScript interface type definitions
├── App.tsx               # Main routing tree and providers wrapper
└── main.tsx              # Application entry point
```

---

## 💻 Local Setup & Development

Follow these steps to run the project locally on your machine:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Awais11332/advanced-frontend-internship-tasks-.git
   cd advanced-frontend-internship-tasks-
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The local server will start up on `http://localhost:5173/`.

4. **Build for Production**
   ```bash
   npm run build
   ```

5. **Linting and Diagnostics**
   ```bash
   npm run lint
   ```

---

## 🔑 Demo Login Accounts

Authentication is simulated locally based on email/role mapping. You can log in using any password:

- **Entrepreneur Profile:**
  - **Email:** `sarah@techwave.io`
  - **Role:** Entrepreneur (Sarah Johnson - TechWave AI)
- **Investor Profile:**
  - **Email:** `michael@vcinnovate.com`
  - **Role:** Investor (Michael Rodriguez - VC Innovate)
