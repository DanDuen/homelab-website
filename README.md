# Homelab Dashboard

A self-hosted personal website and dashboard, built and run on a Raspberry Pi homelab. This started as a family calendar project and has grown into a broader homelab site: documentation, a service directory, and a Kanban board for tracking projects, all served from a Raspberry Pi and reverse-proxied through NGINX. The calendar has since been retired, and the dashboard side (weather, quotes, and API-driven pages) is being rebuilt. This is an ongoing project with no set end. I expect to keep adding to it and editing it.

This is a personal learning project. The goal wasn't to build a polished commercial product. It was to actually use something I built every day, while learning Linux system administration, Docker, networking, and enough Python/JavaScript to wire real services together. The frontend is currently being rebuilt from scratch, one piece at a time, so that I understand every line of it.

## What it does today

- **Projects Kanban Board** — a 4-column x 2-row board (Backlog / To Do / In Progress / Completed, split by Professional / Personal), backed by a small Flask REST API that persists data to disk. Includes drag-and-drop and an archive for old completed projects.
- **Service Directory** — a links page for the services running in the homelab, plus direct-IP fallbacks in case local DNS is unavailable.
- **Command Reference** — a cheat sheet of the SSH, Docker, NGINX, Pi-hole, and Git commands I use most.
- **Light/Dark Mode** — a manual toggle that persists across visits.

## Planned

- **Weather page** — current conditions and forecast from the Open-Meteo API (no key required), cached client-side to avoid unnecessary requests.
- **Rotating quotes** — a JSON-backed quote rotation, with quotes checked against primary sources rather than quote-aggregator sites.
- **"In Progress" summary** — a live view of in-progress projects from the Kanban board.
- **More API-driven pages** — details to come as I add them.
- **Documentation pages** — network documentation, a server inventory, and homelab diagrams.

## Architecture

```
Raspberry Pi 5 ("Athena")
│
├── Docker
│   ├── nginx (serves the static site)
│   ├── nginx-proxy-manager (reverse proxy, local domain routing)
│   └── projects-api (Flask REST API, persists to JSON on disk)
│
└── Static site (served via Docker nginx)
    ├── index.html, projects.html, commands.html, links.html
    ├── script.js, projects.js, theme.js
    ├── style.css
    └── quotes.json
```

Data flow, projects: Browser (drag/add/delete) → Flask API (projects-api) → projects.json on disk → back to any browser reading the board

The site files are edited on my laptop and synced to Athena with Syncthing (receive-only on the Pi), so the folder nginx serves always matches my working copy.

No frontend framework — plain HTML/CSS/JavaScript throughout, intentionally. The goal is to understand every layer of the stack directly rather than lean on abstractions that hide what's actually happening.

## Tech stack

- **Frontend:** HTML, CSS, vanilla JavaScript (no framework)
- **Backend:** Python (Flask) for the projects API
- **Infrastructure:** Docker, Docker Compose, NGINX, NGINX Proxy Manager, Syncthing
- **External APIs:** Open-Meteo (weather, no key required); more to be added

## Hardware

- **Athena** — Raspberry Pi 5, running Pi-hole (host), Docker, and all services above
- **Hermes** — Raspberry Pi Zero 2 W, a headless secondary Pi-hole instance on a separate VLAN

## Secrets and configuration

This repo does not include any credentials, API keys, or private URLs. `.env` files are excluded via `.gitignore`. Any future API that needs a key will be called through the backend, never from browser JavaScript, with the key stored in an environment variable.

## Status

In active use as my daily homelab site, and under ongoing development. The current work is a frontend rebuild: repo cleanup, then a shared page layout, then CSS foundations, then a weather page.