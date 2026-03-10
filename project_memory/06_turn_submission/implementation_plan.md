# Issue 5: Turn Submission — API Endpoint & Write Zone UI

The goal is to build the API endpoint `POST /api/logs/:id/turns` to append new turns to a log, enforce turn-order rules, and build the "write zone" UI where users submit their turns.

## Proposed Changes

### Backend (Server)
- #### [MODIFY] `server/src/routes/logs.js`
  - Add the route `router.post('/:id/turns', requireAuth, submitTurn)`.

- #### [MODIFY] `server/src/controllers/logs.js` (or new `turns.js` controller)
  - Implement `submitTurn(req, res)`:
    - **Identify Writer**: Find the `Writer` for the current `req.sessionToken` and `logId`.
    
    - **Validate Turn Order**:
      - *Structured Mode (Robust Queue)*: 
        1. Fetch all writers sorted by `joinOrder`.
        2. Find the last submitted turn. If none, the expected writer is the one with `joinOrder: 1`.
        3. Identify the `joinOrder` of the writer who submitted the last turn.
        4. The expected next writer is the one with the immediately subsequent `joinOrder`. If the last writer had the highest `joinOrder`, wrap around to `joinOrder: 1`. 
        5. This cleanly handles mid-log joins, as new users are simply appended to the end of the `joinOrder` list.
      - *Freestyle Mode*: Ensure the `Writer` is not the same author as the last submitted turn.
      
    - **Round Limits (Robust Calculation)**: 
      - A round is completed when the queue wraps back to the Keeper (`joinOrder: 1`).
      - Count how many turns the Keeper has submitted. If `keeperTurns >= roundLimit` AND the next expected turn belongs to the Keeper, the log has reached its limit.
      - Once reached, mark the log `status` as `COMPLETED` and reject further turns.

    - **Validate Length**: 
      - The `Log` schema currently defines `perTurnLengthLimit` as an `Int` (Characters per turn). 
      - Server will enforce this as a strict character count limit `content.length <= log.perTurnLengthLimit`.

    - **Insert Turn**: Create the turn (`content`, `writerId`, `turnOrder`).

    - **Status Check**: Ensure `if (log.status === 'COMPLETED')` is the absolute first action on the Log object, before parsing or checking writers.
    
    - **Implicit Joining / Creating Writer**: 
      If the session has no `Writer` record for this log:
      - Automatically create the `Writer` within the transaction, assigning them the provided `colorHex` (or throwing an error if `colorHex` is already taken via `@@unique([logId, colorHex])`).
    
    - **Freestyle Race Conditions**:
      - Caught via `@@unique([logId, turnOrder])` in the schema. If two writes hit exactly simultaneously, the second will throw a Prisma P2002 error, which we intercept and return as `409 Conflict`.
      
    - **Freestyle Round Limits**:
      - Define a Freestyle round strictly as $N$ total turns (where $N =$ participant count). If `log.turns.length >= log.roundLimit * log.writers.length`, close the log.

- #### [MODIFY] `prisma/schema.prisma`
  - Add `@@unique([logId, turnOrder])` to `Turn` model to prevent race conditions natively.
  - Add `isSkip Boolean @default(false)` and `isEntrance Boolean @default(false)` to `Turn` model.

- #### [NEW] `server/src/routes/logs.js` & `server/src/controllers/turns.js` (Skip Endpoint)
  - Implement `POST /api/logs/:id/skip` (Keeper only).
  - Finds the `currentTurn` expecting writer and inserts a dummy `Turn` with `isSkip = true` for them. This keeps the round math intact and pushes the queue forward seamlessly.

- #### [MODIFY] `server/src/controllers/turns.js`
  - **Status Check**: Ensure `if (log.status === 'COMPLETED')` is the absolute first action on the Log object.
  - **Implicit Joining / Creating Writer**: 
    If the session has no `Writer` record for this log:
    - Automatically create the `Writer` within the transaction, assigning them the provided `colorHex` (soft constraint, no DB unique constraint on color).
    - If `log.turnMode === 'STRUCTURED'`, mark this first turn as `isEntrance = true`.
  - **Structured Mode Queue Validation**:
    - When finding the "last submitted turn" to determine the next writer, **ignore turns where `isEntrance == true`**. This prevents "jump the line" entrance turns from disrupting the normal rotation.
  - **Freestyle Race Conditions**:
    - Caught via `@@unique([logId, turnOrder])` in the schema. Return `409 Conflict`.
  - **Freestyle Round Limits**:
    - The round limit is measured by total turns. If `log.turns.length >= log.roundLimit`, close the log.

- #### [MODIFY] `server/__tests__/turns.test.js`
  - Integration tests for all 6 new edge case rules (race conditions, implicit joining, entrance turns, skip, completed check).

### Frontend (Client)
- #### [NEW] `client/src/components/WriteZone.jsx`
  - Contains a textarea, an optional nickname input, and a Submit button.
  - **Nickname Generation**: The frontend will optionally send a nickname; if not sent, the server will auto-assign a localized nickname during joining. The `utils/nickname.js` file will be moved from client to the backend for standard assignment.
  - Follows plain CSS styling (grey `#d4d0c8` button with black border, black bordered inputs).

- #### [MODIFY] `client/src/pages/LogDetail.jsx`
  - Render the full transcript of turns above the Write Zone.
  - Each turn's text is formatted with a colored left border matching its `writer.colorHex`.
  - Only show the `WriteZone` if the current user is eligible to write next.

- #### [NEW] `client/src/pages/WriteZone.test.jsx`
  - Render tests using Vitest to enforce TDD requirements.

## User Review Required

Please confirm the following approaches to the edge cases:

1. **Queue Logic**: Sorting by `joinOrder` and wrapping around. Mid-log joins are appended to the end of the rotation.
2. **Round Limits**: A round is "complete" when the rotation wraps back to `joinOrder: 1`. The log ends when it's `joinOrder: 1`'s turn again AND they've already submitted `roundLimit` times.
3. **Nickname Localization**: Moved from client to `server/src/utils/nickname.js`. The server assigns it if the user submits blank.
4. **Length Limit Constraint**: The schema currently uses `Int` (Characters). We will stick with enforcing Character Counts for v1, and the UI can map generic options (e.g. "1 paragraph") to specific char counts (e.g. 500) during log creation, or we can just expose a direct character/word limit input. Does this work?

### Edge Case 5 Clarification (Structured Mode Implicit Joins)
**Resolved via Option B (Jump the line)**. New users submit their entrance turn, and the `Turn` is flagged `isEntrance = true`. The queue rotation logic explicitly ignores `isEntrance` turns when determining whose turn is next, ensuring the current rotating writer is not skipped. The new user is placed at the end of the `joinOrder` for subsequent rounds.
