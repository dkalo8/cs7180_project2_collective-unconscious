# Log Creation (S1-4) Implementation Plan

Building the API endpoint and React form for creating a new writing log.

## User Review Required

- **Zod Validation**: I plan to introduce `zod` for request validation if it's not already in the project, as it provides a robust way to handle the optional/conditional advanced settings. (If you prefer manual validation to avoid new dependencies, let me know, but Zod is industry standard).
- **Frontend Framework**: Assuming we are using standardized React components (like standard HTML inputs or a UI library if one is installed; I will use standard Tailwind/CSS for styling).

## Proposed Changes

---

### Backend Components

#### [NEW] `server/src/routes/logs.js`
- Create an Express router mounted at `/api/logs`.
- Define `POST /` route protected by the global `sessionMiddleware` and explicitly guarded by `requireAuth` to ensure a session token exists.

#### [NEW] `server/src/controllers/logs.js`
- Implement `createLog` function:
  - **Validation**: Validate using Zod (title required, accessMode, turnMode, category as `z.enum(['Freewriting', 'Haiku', 'Poem', 'Short Novel'])`, optional participantLimit >= 2).
  - **Logic**:
    - If `accessMode` === 'PRIVATE', generate a unique 6-character alphanumeric `accessCode`.
    - Create the `Log` record in the database.
    - Create a `Writer` record linking the `req.sessionToken` to the new `Log` with `joinOrder: 1` (identifying them as the Keeper) and assign the default color (e.g., `#FF0000` for index 0).
    - Return the created `Log` object including its `accessCode` (if private) and the `Writer` record.

#### [MODIFY] `server/src/index.js`
- Import and mount the new logs router: `app.use('/api/logs', logsRouter);`

---

### Frontend Components

#### [NEW] `client/src/pages/CreateLog.jsx`
- Create a React component with a form containing:
  - **Required**: Title (text), Category (select: Freewriting, Haiku, Poem, Short Novel), Access Mode (radio), Turn Mode (radio).
  - **Advanced (Collapsed)**: Seed (textarea), Participant Limit (number), Round Limit (number), Turn Timeout (number), Length Limit (number).
- Implement client-side validation reflecting the backend rules (e.g., Participant limit must be empty or between 2-10).
- Wire up the form submission to `POST /api/logs`.
- **Access Code Modal (NEW)**:
  - If the response includes an `accessCode`, show a modal instead of redirecting.
  - Modal content: Title ("Private Log Created"), the 6-character code, a "Copy" button, and a "Done" button.
  - "Copy" button uses `navigator.clipboard.writeText`.
  - "Done" button redirects to the log detail page `/logs/${logId}`.
- On success (no access code), redirect immediately to the log detail page `/logs/${logId}`.

#### [MODIFY] `client/src/App.jsx` (or Routing File)
- Add `/create` pointing to the `CreateLog` component.

## Verification Plan

### Automated Tests
1. **Backend TDD**: Write tests in `server/tests/logs.test.js` using Jest and Supertest.
   - `npm run test` in `server/`.
   - Test cases: Valid public log creation, valid private log creation (checking for access code), missing title (400), invalid participant limit (400).
- [NEW] "links correct session token to Writer": Verified by inspecting the created Keeper record and ensuring its `sessionToken` matches the request.
2. **Frontend TDD**: Write tests in `client/src/pages/CreateLog.test.jsx`.
   - `npm run test` in `client/`.
   - Test cases: Form renders, required fields validation works, advanced settings toggle works.
- [NEW] "shows access code modal for private log": Mocks a response with `accessCode` and asserts the modal is visible.
- [NEW] "copy button handles clipboard unavailability": Tests that if `navigator.clipboard` is missing, the copy button doesn't crash (and perhaps shows a fallback or simply disables).
- [NEW] "done button redirects": Asserts that clicking "Done" calls `navigate('/logs/abc-456')`.

### Manual Verification
1. Open the UI, navigate to `/create`.
2. Submit a valid form with an advanced setting (e.g., participant limit 5) and verify redirection.
3. Check the database (via Prisma Studio) to ensure the Log and the Keeper (Writer) were created correctly with the right session token.
