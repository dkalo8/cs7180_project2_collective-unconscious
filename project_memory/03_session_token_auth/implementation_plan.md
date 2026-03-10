# Session-Token Auth Implementation Plan

Implement account-free, session-based authentication using session tokens stored in HTTP-only cookies. This satisfies Issue #3 requirements while optimizing the "click link → write → leave" flow.

## Proposed Changes

### Dependencies
#### [MODIFY] `server/package.json`
- Install `cookie-parser` for reading cookies.
- Install `uuid` for generating UUIDv4 session tokens.

### Middleware
#### [NEW] `server/src/middleware/auth.js`
Create authentication middleware with two main functions:
1. `sessionMiddleware`: Parses cookies. If `req.cookies.sessionToken` doesn't exist, generates a new UUIDv4 and sets it as a cookie (`sessionToken`). 
   - Cookie config: `httpOnly: true`, `sameSite: 'lax'` (or 'strict'), `secure: process.env.NODE_ENV === 'production'`, `maxAge: 30 * 24 * 60 * 60 * 1000` (30 days).
   - Attaches `req.sessionToken` to the request object.
2. `requireAuth`: Route guard that ensures `req.sessionToken` exists AND is a structurally valid UUIDv4. If invalid or missing, returns `401 Unauthorized`. (Useful for endpoints that expect a session but don't strictly require a `Writer` record yet).
3. `requireWriter`: Route guard for log-specific routes (e.g., submitting a turn). Extracts `logId` from the route params/body.
   - Purpose: Strictly responsible for "resolving or creating" the DB `Writer` record associated with this token and `logId`.
   - Queries `Prisma` for a `Writer` record matching `req.sessionToken` and `logId`. 
   - If a `Writer` doesn't exist, it creates one (`Prisma.writer.create`) with default properties, assuming they are allowed to join.
   - **WARNING on Execution Order:** To prevent prematurely creating unauthorized Writers for private/full logs, `requireWriter` MUST be placed *after* any log access control checks (e.g., a `canJoinLog` middleware that verifies the `accessMode` and `participantLimit`).
   - Attaches the resulting `writer` object to `req.writer`.

### Express App Setup
#### [MODIFY] `server/src/index.js`
- Import and use `cookie-parser`.
- Apply `sessionMiddleware` globally or to specific API routes so every incoming API request is guaranteed to have a `sessionToken`.

### TDD & Unit Tests
#### [NEW] `server/__tests__/authMiddleware.test.js`
Following the Scrum DoD (TDD gate):
- Create a test file for the authentication middleware using `supertest` and a test database (Prisma).
- Write tests that assert:
  - **Token Generation & Config:** Sending a request without a cookie returns a `Set-Cookie` header with the `sessionToken` including `HttpOnly`, `Max-Age` (30 days), and `SameSite` flags.
  - **Token Persistence:** Sending a request with an existing `sessionToken` cookie does not generate a new one.
  - **Token Expiry Rejection/Renewal:** Simulating an expired cookie scenario (no cookie received by server) results in a newly generated token.
  - **UUID Format Validation:** Using `requireAuth` with a malformed non-UUID string returns `401 Unauthorized`.
  - **Writer DB Creation:** Using the `requireWriter` middleware correctly creates a new `Writer` record in the database if they interact with a Log for the first time.
  - **Existing Writer Resolution:** Using `requireWriter` successfully resolves and attaches an *existing* `Writer` if the DB already has a record for that `sessionToken` and `logId`.

## Verification Plan

### Automated Tests
1. Run `npm test` inside the `server/` directory.
2. The newly created `server/__tests__/authMiddleware.test.js` should pass successfully, verifying that a session token is issued, persisted through cookies, and properly verified by the guard.

### Manual Verification
1. Start the server locally: `cd server && npm run dev`
2. Run a `curl` command without cookies to an endpoint with `sessionMiddleware` and verify the output headers contain `Set-Cookie: sessionToken=...; Max-Age=2592000; Path=/; HttpOnly; SameSite=Lax`
3. Hit a protected endpoint with the `sessionToken` cookie and a valid `logId` and verify access is granted (HTTP 200).
4. Remove the cookie and verify the protected endpoint returns HTTP 401.
5. Hit the database (for instance, via `npx prisma studio`) and verify that hitting the `requireWriter` endpoint indeed created a `Writer` record with the corresponding `sessionToken`.
