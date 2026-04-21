<div align="center">

<img src="https://img.shields.io/badge/ShieldWAF-Security%20Dashboard-3b82f6?style=for-the-badge&logo=shield&logoColor=white" alt="ShieldWAF" />

# 🛡️ ShieldWAF

**AI-powered Web Application Firewall & Security Dashboard**

Real-time threat detection · Attack simulation · Rule management · Live analytics

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://mongodb.com/atlas)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Live%20Feed-010101?style=flat-square&logo=socket.io)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-f59e0b?style=flat-square)](LICENSE)

<br/>

![ShieldWAF Dashboard Preview](docs/preview.png)

</div>

---

## Overview

 **ShieldWAF** is a full-stack security dashboard that monitors web traffic, detects threats, and helps manage firewall rules in real-time.

It integrates AI-based attack analysis (Gemini + OpenAI fallback) to identify patterns, generate insights, and simulate attacks.

> 💡 No token? No problem. ShieldWAF runs fully in **Demo Mode** with hardcoded realistic data — no account required.

---

## Features

| Category | Capability |
|---|---|
| 🛡️ **Dashboard** | Live metrics, traffic chart, real-time threat feed, geo-map |
| 📋 **Logs** | Filterable log explorer, full-text search, CSV export, pagination |
| ⚙️ **Rules** | Full CRUD firewall rules, toggle active/inactive, demo mode |
| 🤖 **AI Simulation** | Gemini-powered attack simulation, CVSS scoring, MITRE ATT&CK mapping |
| 🔐 **Auth** | JWT authentication, role-based access (user / admin) |
| ⚡ **Real-time** | Socket.IO live attack feed with instant browser updates |
| 📊 **Analytics** | Attack type breakdown, severity distribution, geo-origin heatmap |

---

## Tech Stack

### Frontend
Next.js 15, TypeScript
Tailwind CSS
Socket.IO Client

### Backend
Node.js, Express.js
MongoDB (Mongoose)
JWT, bcrypt
Gemini API (AI) + OpenAI fallback

---

## 📁 Project Structure

```
shieldWAF/
│
├── client/                # Frontend (Next.js)
│   ├── src/
│   │   ├── app/           # Pages (dashboard, logs, rules, etc.)
│   │   ├── components/    # UI components
│   │   └── hooks/         # Custom hooks
│   └── .env.local
│
├── server/                # Backend (Express)
│   ├── src/
│   │   ├── controllers/   # Business logic
│   │   ├── models/        # Database schemas
│   │   ├── routes/        # API routes
│   │   └── middleware/    # Auth & security
│   └── .env
│
└── docs/                  # Assets / preview

```

---

## ⚙️ Setup Instructions

```bash
# 1. Clone the repository
git clone https://github.com/Rahull-06/shieldWAF.git
cd shieldWAF

# 2. Install frontend dependencies
cd client && npm install

# 3. Install backend dependencies
cd ../server && npm install
```

### Environment Variables

#### `client/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

#### `server/.env`
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/shieldwaf
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d

GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key       # optional fallback
```

> ⚠️ **Never commit `.env` files.** They are already included in `.gitignore`.

### Running Locally

```bash
# Terminal 1 — Start backend (port 5000)
cd server
npm run dev

# Terminal 2 — Start frontend (port 3001)
cd client
npm run dev
```

Open → http://localhost:3001

---

## Deployment
Frontend: Vercel
Backend: Railway


---

<div align="center">

Built with ❤️ by [Rahul Rathod](https://github.com/Rahull-06)

⭐ Star this repo if you found it useful!

</div>