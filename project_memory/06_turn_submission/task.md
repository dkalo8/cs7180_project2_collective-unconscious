# Issue 5: Turn submission — API endpoint + write zone UI

## Description
Build the API endpoint and write zone UI for submitting a turn to an existing log.

## Checklist
- [x] Write failing test for turn submission API
  - [x] Test Structured Mode dynamic queue logic
  - [x] Test Freestyle Mode constraints
  - [x] Test Keeper-based round limits
  - [x] Test character count length limits
- [x] Implement `POST /api/logs/:id/turns` endpoint
- [x] Write failing test for WriteZone UI component
- [x] Implement WriteZone UI component (textarea, optional nickname, submit button)
- [x] Connect client to `src/utils/nickname.ts` for localized generation
- [x] Implement colored left borders in transcript 
- [x] Integrate WriteZone into LogDetail page
- [x] Verify turn order rules, length limits, and immutability
- [x] Verify log transitions to "completed" when round limit is reached

## Edge Cases (Follow Up)
- [x] Move `client/src/utils/nickname.ts` to `server/utils/nickname.js`
- [x] Add `@@unique([logId, turnOrder])` to prevent race conditions
- [x] Add `@@unique([logId, colorHex])` to prevent duplicate colors
- [x] Enforce Freestyle Round Limits (`total turns >= roundLimit`)
- [x] Ensure `COMPLETED` is the absolute first validation check in `submitTurn`
- [x] Implement implicit join logic in `submitTurn` (create Writer with color)
- [x] Implement `POST /api/logs/:id/skip` for Keeper skip logic
