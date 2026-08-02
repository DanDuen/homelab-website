Homelab Dashboard

A self-hosted personal operations dashboard, built and run on a Raspberry Pi homelab. This started as a family calendar project and evolved into a broader dashboard: a weekly agenda, live weather, rotating quotes, and a full Kanban board for tracking homelab projects — all served from a Raspberry Pi and reverse-proxied through NGINX.

This is a personal learning project. The goal wasn't to build a polished commercial product — it was to actually use something I built every day, while learning Linux system administration, Docker, networking, and enough Python/JavaScript to wire real services together.

What it does
Weekly Agenda — pulls events from a Google Calendar (via a private iCal feed), converted to JSON by a Python script and refreshed automatically every 5 minutes via a systemd timer.
Live Weather — current-location weather (today + tomorrow), including temperature range and chance of precipitation, fetched client-side from the Open-Meteo API. Falls back to a fixed location if browser geolocation is unavailable.
Rotating Quotes — a simple JSON-backed quote rotation, fact-checked against primary sources rather than quote-aggregator sites.
Projects Kanban Board — a 4-column x 2-row board (Backlog / To Do / In Progress / Completed, split by Professional / Personal), backed by a small Flask REST API that persists data to disk. Includes drag-and-drop, an archive for old completed projects, and a live "In Progress" summary on the main dashboard.
Light/Dark Mode — automatically matches the system's light/dark preference, with a manual toggle that overrides it and persists across visits.
Responsive Layout — CSS Grid layout that adapts from a wide desktop dashboard down to a single-column view on phones and tablets.
Architecture
Raspberry Pi 5 ("Athena")
│
├── Docker
│   ├── nginx (serves the static site)
│   ├── nginx-proxy-manager (reverse proxy, local domain routing)
│   └── projects-api (Flask REST API, persists to JSON on disk)
│
├── systemd
│   └── calendar-sync.timer → calendar-sync.service
│         (runs sync_calendar.py every 5 minutes)
│
└── Static site (served via Docker nginx)
    ├── index.html, calendar.html, projects.html, commands.html, links.html
    ├── script.js, projects.js, theme.js
    ├── style.css
    └── quotes.json

Data flow, calendar: Google Calendar → private iCal feed → sync_calendar.py → calendar.json → dashboard JavaScript

Data flow, projects: Browser (drag/add/delete) → Flask API (projects-api) → projects.json on disk → back to any browser reading the board

No frontend framework — plain HTML/CSS/JavaScript throughout, intentionally. The goal was to understand every layer of the stack directly rather than lean on abstractions that hide what's actually happening.

Tech stack
Frontend: HTML, CSS (custom properties / CSS Grid, no framework), vanilla JavaScript
Backend: Python (Flask) for the projects API, Python for the calendar sync script
Infrastructure: Docker, Docker Compose, NGINX, NGINX Proxy Manager, systemd
External APIs: Open-Meteo (weather, no key required), BigDataCloud (reverse geocoding), Google Calendar (private iCal feed)
Hardware
Athena — Raspberry Pi 5, running Pi-hole (host), Docker, and all services above
Hermes — Raspberry Pi Zero 2 W, running a secondary Pi-hole instance on a separate VLAN
Notes on secrets and configuration

This repo does not include any credentials, API keys, or private calendar URLs. Files containing local configuration (e.g. the calendar sync's private iCal URL) are excluded via .gitignore; a config.example.json is provided as a template for anyone setting this up themselves.

Status

Actively in use as my daily dashboard. Ongoing/future additions include network documentation, a server inventory page, and homelab architecture diagrams.
