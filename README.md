You are helping me build ShieldWAF — an AI-powered Web Application Firewall dashboard.
Here is the complete project context:

═══════════════════════════════════════════════════════
TECH STACK
═══════════════════════════════════════════════════════
Frontend : Next.js (App Router), TypeScript, Tailwind CSS
Fonts    : Syne (sans) + IBM Plex Mono (mono)
Backend  : Node.js, Express.js, MongoDB (Mongoose), JWT auth
Sockets  : Socket.IO (live attack feed)
Port     : Frontend :3001 | Backend :5000
AI       : Gemini (primary) → OpenAI (fallback) → rule-based

═══════════════════════════════════════════════════════
COLOR PALETTE (globals.css)
═══════════════════════════════════════════════════════
--bg:        #080c10
--bg2:       #0c1118
--bg3:       #101620
--border:    #1a2535
--border2:   #243044
--text:      #dde6f0
--text2:     #8899b0
--text3:     #3d5570
--blue:      #3b82f6  (updated from #1a6cff)
--red:       #ef4444
--green:     #10b981  (updated from #22c55e)
--amber:     #f59e0b

═══════════════════════════════════════════════════════
FOLDER STRUCTURE
═══════════════════════════════════════════════════════
client/src/
  app/
    layout.tsx
    globals.css
    landing/page.tsx
    (auth)/login/page.tsx
    (dashboard)/
      layout.tsx             — sidebar + navbar
      dashboard/page.tsx     ✅ DONE — metrics, chart, feed, threats, geo, AI insight
      logs/page.tsx          ✅ DONE — real API, filters, search, pagination, delete, CSV
      rules/page.tsx         ❌ NEEDS BUILD — hardcoded, needs real CRUD API
      simulate/page.tsx      ✅ DONE — Gemini AI, CVSS, MITRE, steps animation
      settings/page.tsx      ✅ DONE
      profile/page.tsx       ✅ DONE

  components/
    Sidebar.tsx              ✅
    Navbar.tsx               ✅
    MetricCard.tsx           ✅ — accent bar, sparkbar, DEMO badge
    Chart.tsx                ✅ — accepts data prop, no self-wrapping card
    ThreatFeed.tsx           ✅ — fixed, lives inside parent panel
    Loader.tsx               ✅
    Toast.tsx                ✅

  hooks/
    useAuth.ts               ✅
    useMetrics.ts            ✅ — demo constants / real API split
    useSocket.ts             ✅

  services/
    api.ts
    socket.ts

  types/index.ts

server/src/
  controllers/
    auth.controller.js       ✅
    logs.controller.js       ✅
    metrics.controller.js    ✅
    rules.controller.js      ✅ (backend done, frontend not connected)
    simulate.controller.js   ✅
  models/User.js, Log.js, Rule.js, BlockIP.js
  services/ai.service.js     ✅ — Gemini → OpenAI → rule-based fallback
  server.js

═══════════════════════════════════════════════════════
KEY CONVENTIONS
═══════════════════════════════════════════════════════
- All pages: 'use client', wrapped in animate-fadein div
- NEVER use inline style objects for grid/flex that need breakpoints
  → always use <style> blocks with named CSS classes
- CSS utilities in globals.css: .inp .badge-* .sev-* .toggle-* .animate-fadein .pulse-dot .mono
- Auth token: localStorage key "token"
- API base: NEXT_PUBLIC_API_URL (default: http://localhost:5000/api)
- Backend response shape: { success: true, data: ... } or { success: false, message: "..." }
- Demo mode: no token = hardcoded constants, no API calls
- Auth mode: token present = real MongoDB data + Gemini AI
- Backend returns logs as: { success, data: { items: [...], total, page, pages } }
- Log fields: timestamp (pre-formatted HH:MM:SS), ip, method, path, attackType,
  severity, action, payload, country, userAgent, statusCode

═══════════════════════════════════════════════════════
RULES API (backend already done)
═══════════════════════════════════════════════════════
GET    /api/rules              → list all rules
POST   /api/rules              → create rule
PATCH  /api/rules/:id          → update rule
PATCH  /api/rules/:id/toggle   → toggle enabled/disabled
DELETE /api/rules/:id          → delete rule

Rule model fields:
  name, pattern, type (sqli|xss|path_traversal|cmd_injection|ssrf|custom),
  severity (low|medium|high|critical), action (block|flag|allow),
  enabled (boolean), hitCount, createdAt

═══════════════════════════════════════════════════════
DEMO vs REAL DATA SPLIT
═══════════════════════════════════════════════════════
- No token → show hardcoded demo data, blue "DEMO MODE" banner, "Login →" CTA
- Token present → fetch real MongoDB data
- 401 response → clear token, fall back to demo silently

═══════════════════════════════════════════════════════
RESPONSIVE LAYOUT RULES
═══════════════════════════════════════════════════════
Always use <style> blocks — NEVER inline style grids with breakpoints.
Standard breakpoints: 1280px / 1024px / 768px / 480px / 360px
Metric grids: 4 cols → 2 cols → 2 cols (never 1 col on mobile)

═══════════════════════════════════════════════════════
CURRENT STATUS
═══════════════════════════════════════════════════════
✅ Backend all routes working
✅ MongoDB Atlas connected and seeded
✅ JWT auth end-to-end
✅ Gemini AI (simulator + dashboard insight)
✅ Demo vs real data split working
✅ Dashboard page — fully responsive, premium minimal UI
✅ Attack Logs page — real API, filters, search, pagination, delete, CSV export
✅ Simulator — full AI result (CVSS, MITRE, steps animation)
✅ MetricCard, Chart, ThreatFeed — all fixed and responsive

❌ rules/page.tsx — NEXT TO BUILD
   → Full CRUD: list, create, edit, toggle, delete
   → Connect to GET/POST/PATCH/DELETE /api/rules
   → Demo mode with hardcoded sample rules
   → Match same premium minimal UI as dashboard + logs pages

❌ Deployment — after rules page is done
   → Frontend: Vercel
   → Backend: Railway or Render

═══════════════════════════════════════════════════════
SEED CREDENTIALS
═══════════════════════════════════════════════════════
Email:    admin@shieldwaf.io
Password: password123
Run:      node src/utils/seed.js

═══════════════════════════════════════════════════════
DESIGN SYSTEM
═══════════════════════════════════════════════════════
Panel pattern:
  <div className="panel">               — bg2, border, border-radius:12px
    <div className="panel-head">        — padding 14px 18px, border-bottom
      <div className="panel-title">     — 13px, fw 600
      <div className="panel-sub">       — 11px, text3
    <div className="panel-body">        — padding 16px 18px

Button pattern:
  .btn .btn-ghost  — bg3, border, text2
  .btn .btn-primary — #3b82f6
  .btn .btn-danger  — red tint
  .btn-sm           — smaller padding

Badge pattern:
  background: COLOR_BG[severity], color: COLOR[severity],
  border: 1px solid COLOR30, border-radius: 5px,
  font-size: 9.5px, font-weight: 700, uppercase

START BY BUILDING: rules/page.tsx