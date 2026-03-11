# Discovery Feed Implementation Plan

Based on the [PRD](file:///Users/mineral/Desktop/VibeCoding/P2/cs7180_project2_collective-unconscious/project_memory/PRD.md) and [Prototype Notes](file:///Users/mineral/Desktop/VibeCoding/P2/cs7180_project2_collective-unconscious/project_memory/prototype-notes.md), we will build the Discovery Feed which displays all logs (both public and private) in reverse-chronological order and allows filtering by category.

## Proposed Changes

### Backend (Server)

#### [MODIFY] [logs.js](file:///Users/mineral/Desktop/VibeCoding/P2/cs7180_project2_collective-unconscious/server/src/routes/logs.js)
- Add `router.get('/', getLogs)` to handle the discovery feed. This endpoint will be fully public (no `requireAuth` middleware).

#### [MODIFY] [logs.js](file:///Users/mineral/Desktop/VibeCoding/P2/cs7180_project2_collective-unconscious/server/src/controllers/logs.js)
- Implement `getLogs(req, res)`:
  - Extract query params: `page` (default 1), `limit` (default 20), `category` (optional).
  - Query Prisma for ALL `Log` records. If `category` is provided, add it to the `where` clause.
  - Order by `createdAt: 'desc'`.
  - Include relations needed for the UI preview:
    - Include `_count: { select: { writers: true } }` for participant counts.
    - Include the chronologically first turn (`turns: { orderBy: { turnOrder: 'asc' }, take: 1 }`) to generate a plain-text excerpt. If the log has no turns but has a `seed`, use the seed as the excerpt. If neither, handle gracefully with an empty or placeholder excerpt.
  - Return formatted output matching the UI requirements.

#### [NEW] [logs.feed.test.js](file:///Users/mineral/Desktop/VibeCoding/P2/cs7180_project2_collective-unconscious/server/__tests__/logs.feed.test.js)
- Write integration tests (Jest + Supertest) for the `GET /api/logs` endpoint.
- Verify reverse chronological sorting.
- Verify category filtering.
- Verify private logs are excluded.
- Verify pagination logic.

---

### Frontend (Client)

#### [NEW] [log.service.js](file:///Users/mineral/Desktop/VibeCoding/P2/cs7180_project2_collective-unconscious/client/src/services/log.service.js)
- Create the HTTP wrapper for frontend fetching, adhering to `.antigravityrules` which mandates no raw fetch in components.
- Export `fetchLogs({ category, page })` function.

#### [NEW] [LogCard.jsx](file:///Users/mineral/Desktop/VibeCoding/P2/cs7180_project2_collective-unconscious/client/src/components/LogCard.jsx) & [LogCard.css](file:///Users/mineral/Desktop/VibeCoding/P2/cs7180_project2_collective-unconscious/client/src/components/LogCard.css)
- Implement the UI block for a single Log in the feed.
- Properties: Title, Category Badge, 2-line plain text excerpt, Participant Count, and Creation Date.
- Extract design directly from `App_Prototype.jsx`.

#### [NEW] [LogCard.test.jsx](file:///Users/mineral/Desktop/VibeCoding/P2/cs7180_project2_collective-unconscious/client/src/components/LogCard.test.jsx)
- Write a Vitest standard render test ensuring all log properties display correctly.

#### [MODIFY] [HomePage.jsx](file:///Users/mineral/Desktop/VibeCoding/P2/cs7180_project2_collective-unconscious/client/src/pages/HomePage.jsx)
- Refactor the blank placeholder to display the discovery feed.
- Use `useEffect` to call `log.service.fetchLogs`, loading page 1 initially.
- Implement a dropdown `<select>` for category filtering. Changing this resets the feed to page 1.
- Render dynamic list of `LogCard` components. Pass down excerpts robustly (handling cases where there are no turns or seed).
- Implement Pagination UI: Add a "Load More" button at the bottom of the feed that increments the `page` state and appends to the list of logs. Hide the button if the fetched page returned fewer logs than the limit.
- Hook up navigation to Log Details page when a Log Card is clicked.

#### [NEW] [HomePage.test.jsx](file:///Users/mineral/Desktop/VibeCoding/P2/cs7180_project2_collective-unconscious/client/src/pages/HomePage.test.jsx)
- Vitest simulation of log fetching and category filter interactions.

## Verification Plan

### Automated Tests
1. **Backend**: `npm run test -- logs.feed` to verify the logic in `logs.js` endpoint.
2. **Frontend**: `npm run test -- LogCard HomePage` to verify correct rendering in `vitest`.

### Manual Verification
1. Start the backend (`npm run dev` in `/server`) and frontend (`npm run dev` in `/client`).
2. Navigate to `http://localhost:5173/`. Verify the layout renders the logs.
3. Use the category dropdown to ensure filtering adjusts the list instantly.
4. Verify the preview text is plain text only (no color accents) and limited to 2 lines.
5. Create a Private log via `http://localhost:5173/create` and ensure it DOES appear on the Home Discovery Feed.
