# Issue 4: Log creation — API endpoint + creation form UI

## Acceptance Criteria
- `POST /api/logs` creates a new log; returns log object with ID and access code (if private)
- Required fields: title, access mode, turn mode
- Optional fields: category (default: Freewriting, applied server-side via Zod)
- Advanced settings: seed/creative constraint, participant limit, round limit, turn timeout, length limit
- Validation: title non-empty; participant limit is unlimited by default, but if capped must be >= 2
- Private logs auto-generate 6-char alphanumeric access code server-side (returned in response body)
- Immutable settings after creation
- Creator is recorded as Keeper (Writer #1, colorHex=#FF0000)
- Endpoint depends on session auth (S1-3) to identify the Keeper

## Tasks
- [x] Preparation
  - [x] Create branch `feature/4-log-creation` from latest main (post S1-4a)
- [x] Backend `POST /api/logs`
  - [x] Verify S1-3 session-token middleware is available
  - [x] Write failing tests for log creation endpoint (TDD)
  - [x] Implement endpoint controller and route (`server/src/controllers/logs.js`, `server/src/routes/logs.js`)
  - [x] Integrate session auth middleware (`requireAuth`) to identify the Keeper
  - [x] Refine Zod validation (category enum, participantLimit >= 2)
  - [x] Implement access code generation for private logs
  - [x] Implement Keeper (Writer #1) creation logic with colorHex #FF0000
  - [x] Pass all backend tests (7/7)
- [x] Frontend Log Creation Form
  - [x] Write failing tests for `CreateLogPage` (TDD)
  - [x] Implement required fields UI (title, category, access mode, turn mode)
  - [x] Implement advanced settings UI (collapsed by default: seed, participant limit, round limit, turn timeout, length limit)
  - [x] Add client-side validation (empty title, participant limit < 2)
  - [x] Connect UI to `POST /api/logs` endpoint with `useNavigate` redirect on success
  - [x] Update routing test to reflect real component (not placeholder)
  - [x] Pass all frontend tests (9/9)
- [x] Debugging & Cleanup
  - [x] Resolve 404 issue caused by zombie nodemon processes
  - [x] Remove debug logs and hardened error handling
  - [x] Final verification of `POST /api/logs` (201 Created)
- [x] UX Improvements
  - [x] Replace access code alert with a Modal component
  - [x] Add copy-to-clipboard functionality for access code
  - [x] Update frontend tests for modal behavior and redirection to /logs/:id
