# Issue #35 — Log Detail API Integration & Dev QoL

## Branch
`feature/35-log-detail-api-integration`

## What Was Built

### Core Feature: Log Detail Page
- `GET /api/logs/:id` returns full log with computed fields: `isCreator`, `isMyTurn`, `myWriter`, `nextWriter`
- `creatorToken` and `accessCode` stripped from response before sending to client
- `LogDetailPage.jsx` renders turns, WriteZone, skip controls, and Close Log button based on those fields

### Dev Token Switcher
- `GET /api/dev/set-token/:token` sets arbitrary `sessionToken` cookie (non-production only)
- `sessionMiddleware`, `requireAuth`, `requireWriter` all relaxed to allow non-UUID tokens outside production
- Enables manual role-switching without touching DevTools

### WriteZone Identity Lock
- `myWriter` prop added to WriteZone — pre-fills and **disables** nickname/color for returning writers
- API exposes `myWriter: { id, nickname, colorHex, joinOrder }` so client knows current user's identity

### Private Log Access Code Gate
- First-turn newcomers on PRIVATE logs see an access code input above WriteZone
- Code sent in turn submission body; server validates before creating writer record
- Returns `403 "Invalid access code"` on mismatch

### Discovery Feed Filters
- Category dropdown: Freewriting / Haiku / Poem / Short Novel
- "可参与" toggle: server-side `?canWrite=true` filter — `status ≠ COMPLETED` AND (`accessMode = OPEN` OR user already in writers list)

### Test Seed (`server/comprehensive-seed.js`)
12 labelled scenarios with known tokens:
| Token | Role |
|---|---|
| `my-creator-token` | Keeper of logs [10][11][12] |
| `my-writer-token` | Writer in logs [2][3] |
| `my-solo-token` | Solo writer in log [4] |
| `newcomer-xyz` | No history anywhere |

Private log [6] access code: `ABC123`

**Usage:**
```bash
node server/comprehensive-seed.js
# Then in browser:
http://localhost:3000/api/dev/set-token/my-creator-token
# Navigate via discovery feed at localhost:5173
```

## CI Fixes Made Along the Way
- Added missing `creatorToken` migration (`20260311000000_add_creator_token_to_log`)
- `jest --runInBand` moved to CLI flag in `package.json` (not a valid jest.config key)
- `authMiddleware.test.js` afterAll uses `deleteMany` instead of `delete` (safe teardown)
- Client tests updated: `round limit` → `turn limit`, mock log needs `isMyTurn: true`
- `eslint.config.js`: `vite.config.js` gets `globals.node` so `process` is recognised
- `.gitignore`: added `.agents/`

## Key Files Modified
- `server/src/controllers/logs.js` — getLogById response, canWrite filter
- `server/src/controllers/turns.js` — access code validation
- `server/src/middleware/auth.js` — non-UUID tokens allowed outside production
- `server/src/routes/dev.js` — new dev token switcher route
- `server/src/index.js` — mounts dev router conditionally
- `client/src/pages/LogDetailPage.jsx` — full detail UI + access code gate
- `client/src/pages/HomePage.jsx` — category dropdown + canWrite toggle
- `client/src/components/WriteZone.jsx` — myWriter prop, identity lock
- `client/src/services/log.service.js` — canWrite param
- `prisma/migrations/20260311000000_add_creator_token_to_log/migration.sql` — new migration
