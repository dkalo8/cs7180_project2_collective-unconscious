# Task: Turn Logic & Skip Refinement

## Status
- [x] Rename `isEntrance` to `isOutOfRotation` (DB mapping preserved)
- [x] Implement OOR logic in `submitTurn`: new joiners don't advance the queue if others are already playing
- [x] Update `getLogById` to return `isMyTurn` and `nextWriter`
- [x] Update `getLogById` to filter `writers` by those who have submitted non-skip turns
- [x] Simplify `roundLimit` to `turnLimit` across codebase (PRD, Schema, API, UI)
- [x] Implement simple turn-count completion logic (`totalTurns >= turnLimit`)
- [x] Update Skip UI: move button, remove emoji, add dynamic target dropdown
- [x] Add `PATCH /api/logs/:id/close` backend endpoint for Keepers
- [x] Fix and verify all 52/52 backend tests, including edge cases for OOR and skips
- [x] Update i18n translations for turn-based terminology (CN, EN, ES)
