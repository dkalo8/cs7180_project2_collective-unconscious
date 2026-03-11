# Collective Unconscious

An async, turn-based collaborative chain-writing platform — one segment at a time, no pressure.


## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Tailwind CSS |
| **Backend** | Node.js, Express |
| **Database** | PostgreSQL via Prisma ORM |
| **Auth (Sprint 1)** | Session tokens — no registration required |
| **Auth (Sprint 2)** | JWT (access + refresh) + Google OAuth via Passport.js |
| **Testing** | Vitest (client), Jest + Supertest (server) |
| **CI/CD** | GitHub Actions (lint → test → build → deploy) |
| **Dev environment** | Docker Compose |

---

## Sprint 1 — Core Writing Loop (Account-Free)

**Goal:** Deliver the end-to-end writing experience with zero friction — click a link, write, leave. No sign-up required.

Issues are ordered by build dependency:

| # | Issue | Depends on |
|---|---|---|
| S1-1 | Project scaffolding, Tailwind setup, ESLint/Prettier, CI/CD pipeline | — |
| S1-2 | Database schema & Prisma setup (`Log`, `Turn`, `Writer` models) | S1-1 |
| S1-3 | Session-token auth & server middleware | S1-1 |
| S1-4 | Log creation — API endpoint + creation form UI | S1-2, S1-3 |
| S1-5 | Turn submission — API endpoint + write zone UI (textarea + optional nickname + submit) | S1-4 |
| S1-6 | Author color assignment & colored text display in log transcript | S1-5 |
| S1-7 | **Color toggle** — button to hide author colors and read the log as a unified work | S1-6 |
| S1-8 | Discovery feed — API + UI (chronological, category filter, plain text preview) | S1-4 |
| S1-9 | Multilingual UI — Chinese / English / Spanish (labels only, not content) | S1-4+ |
| S1-10 | Symbol reactions on completed logs (✦ ◎ ∿ ⌖) | S1-5 |
| S1-11 | Public read-only sharing — permalink viewable without an account | S1-5 |
| S1-12 | **Responsive design** — mobile-first layout across all screens | S1-4+ |
| S1-13 | Testing — 80%+ coverage milestone (unit + integration) | all above |

### Sprint 1 User Stories (key subset)

| # | Story | Acceptance Criteria |
|---|---|---|
| US-01 | As a Writer, I want to join a public log and contribute a turn without creating an account. | Session token issued on first visit. Writer zone appears when it's my turn. Turn locks on submit. |
| US-02 | As a Keeper, I want to create a log with a title, category, access mode, and turn mode. | Required fields validate. Advanced settings (limits, timeout, seed) collapse by default. |
| US-03 | As a Writer, I want my text distinguished from others by color. | System assigns one of 6 default colors (red, orange, blue, green, purple, black). Custom color picker available. |
| US-04 | As a Reader, I want to toggle off author colors to read the log as one unified piece. | Toggle button on log detail view switches all text to a single color. State is local (no persistence). |
| US-05 | As a Reader, I want to discover logs and filter by category. | Feed shows newest first. Filterable by: Freewriting, Haiku, Poem, Short Novel. |
| US-06 | As a Reader, I want to react to a completed work without an account. | Symbol reactions (✦ ◎ ∿ ⌖) visible at bottom of completed logs. Tappable without login. |

---

## Sprint 2 — Accounts, Moderation & Polish

**Goal:** Add user identity, moderation, and final deliverables. Satisfy all remaining rubric requirements.

| # | Issue | Depends on |
|---|---|---|
| S2-1 | User registration, profiles, JWT + Google OAuth | Sprint 1 complete |
| S2-2 | User profile page (bio, display name, participation history) | S2-1 |
| S2-3 | Content moderation flow / review queues for public logs | S2-1 |
| S2-4 | Generate & share themed styled screenshots of completed logs | Sprint 1 |
| S2-5 | Prisma enum migration (`visibility`, `turnOrder` from String → enum) | Sprint 1 |
| S2-6 | Public API documentation | Sprint 1 |
| S2-7 | Production deployment & deploy preview CI integration | S2-1+ |
| S2-8 | Evaluation suite (code quality metrics, security scanning) | S2-7 |
| S2-9 | Demo video (10 min) & technical blog post (1500 words) | all above |

---

## Design Principles

- **White background, black text** — plain, functional, unadorned
- **System serif** typography (renders as Song/SimSun for Chinese — no custom web fonts)
- **Author identity via text color only** — no names shown in the log body; the piece reads as a unified work
- **6-color default palette**: red `#FF0000`, orange `#FF8C00`, blue `#0000FF`, green `#008000`, purple `#800080`, black `#000000` — plus custom color picker
- **Symbol reactions, not emoji**: ✦ ◎ ∿ ⌖
- Tailwind CSS implements the plain style — no component libraries (no MUI, Chakra, etc.)

See [`project_memory/prototype-notes.md`](./project_memory/prototype-notes.md) for full UI spec.

---

## Project Structure

```
/client          → Vite + React frontend (components, hooks, services)
/server          → Express API (routes, controllers, services)
/prisma          → Prisma schema and migrations
/project_memory  → PRD, prototype notes, architecture decisions log
/.agents/skills  → Antigravity agent skill files
/.antigravityrules → Project rules for AI agents
```

---

## Getting Started

```bash
# Clone
git clone https://github.com/dkalo8/cs7180_project2_collective-unconscious.git
cd cs7180_project2_collective-unconscious

# Start all services (DB, server, client)
docker compose up

# Or run individually:
cd server && npm install && npm run dev
cd client && npm install && npm run dev
```

---

## Testing

```bash
# Server (Jest + Supertest)
cd server && npm test

# Client (Vitest)
cd client && npm test

# Coverage report
cd server && npm run test:coverage
cd client && npm run test:coverage
```

Target: **80%+ coverage** on all server routes and React components.

---

## AI Modality Usage

This project uses AI tooling at two layers:

| Modality | Usage |
|---|---|
| **Claude (Web)** | Product definition, PRD drafting, sprint planning, architectural decisions |
| **IDE-Centric AI (Antigravity)** | Code generation, TDD, refactoring, CI/CD setup, enforcing `.antigravityrules` |

All architectural decisions are logged in [`project_memory/decisions.md`](./project_memory/decisions.md).

---

## Agile Process

- 2 documented sprints (see above)
- Sprint planning: this README + [`project_memory/PRD.md`](./project_memory/PRD.md)
- Branch naming: `feature/S1-4-log-creation`
- Commit format: `feat(server): add log creation endpoint closes S1-4`
- PRs require passing CI before merge

---

## Deliverables

| Deliverable | Status |
|---|---|
| GitHub repository | ✅ This repo |
| Deployed app (production URL) | 🔜 Sprint 2 |
| Evaluation dashboard (live or screenshots) | 🔜 Sprint 2 |
| Complete documentation package | 🔜 Sprint 2 |
| 10-minute demo video | 🔜 Sprint 2 |
| 1500-word technical blog post | 🔜 Sprint 2 |