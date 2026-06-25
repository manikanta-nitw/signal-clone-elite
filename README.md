# 💬 Signal Clone - Real-Time Messenger 

A high-performance, real-time messaging web application inspired by Signal. This project demonstrates full-stack engineering capabilities, featuring a Next.js frontend, a Python/FastAPI backend, and bi-directional WebSocket communication with SQLite persistence.

## 🚀 Live Demos
* **Frontend (Vercel):** [YOUR_VERCEL_LINK_HERE]
* **Backend API (Render):** [YOUR_RENDER_LINK_HERE]

## ✨ Key Features

### Core Functionality
* **Real-Time WebSockets:** Instant, zero-latency message delivery and broadcasting using FastAPI WebSockets.
* **Optimistic UI:** Messages render instantly on the client side before server confirmation for a native-app feel.
* **Database Persistence:** Messages are automatically logged and retrieved using a local SQLite database and SQLAlchemy.
* **Broadcast Optimization:** Custom WebSocket connection manager prevents message "echoing" to the original sender.

### Elite UI / UX 
* **Native Desktop Feel:** Custom CSS scrollbar injections and fluid `cubic-bezier` message entrance micro-animations.
* **Signal Dark Mode:** Deep, glassy dark mode mimicking the official Signal desktop application.
* **Message Status Indicators:** Signal-style simulated checkmarks for 'sending', 'sent', and 'read' statuses.
* **Mocked Onboarding:** Simulated OTP verification and profile creation flow.

*(Note: Voice calls, Video calls, Stories, and Settings are included as UI placeholders per the assignment requirements to demonstrate layout competency).*

## 🛠 Tech Stack

**Frontend:**
* React 18 / Next.js 14
* Tailwind CSS (v3 - Pinned for stable PostCSS pipeline)
* TypeScript

**Backend:**
* Python 3
* FastAPI
* WebSockets
* SQLite / SQLAlchemy (ORM)

---



