# Discovery Feed (S1-8)

## Backend
- [x] Create `GET /api/logs` endpoint in backend routes
- [x] Implement `logs.controller.js` logic for fetching logs:
  - [x] Fetch all logs (public and private)
  - [x] Filter by `category` (optional)
  - [x] Sort by `createdAt` descending
  - [x] Pagination parameters (page, limit)
  - [x] Include relational data (turns, participants) to compute excerpts and counts
- [x] Write Jest integration tests for `GET /api/logs`

## Frontend
- [x] Update `client/src/services/log.service.js` with `fetchLogs({ category, page })` function
- [x] Create `LogCard` component for feed items (handle empty excerpts gracefully via seed optionally)
- [x] Update `HomePage.jsx` to fetch and render logs
- [x] Implement category filter in `HomePage.jsx`
- [x] Implement "Load More" pagination UI in `HomePage.jsx`
- [x] Write Vitest render tests for `LogCard` and `HomePage`

## Verification
- [x] Run backend tests
- [x] Run frontend tests
- [x] Manual test in browser
