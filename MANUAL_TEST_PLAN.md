# Manual Web Testing Plan — Turns & Submit Logic

## Setup

- Use **4 different browsers / incognito windows** to simulate 4 users
  - **Browser A** = Keeper (creates the log)
  - **Browser B** = Writer 2
  - **Browser C** = Writer 3
  - **Browser D** = Writer 4 (late joiner)
- Each browser gets a unique session cookie automatically
- Keep all 4 browsers open on the same log URL to observe real-time state

---

## 1. Log Creation

### 1.1 Create Freestyle Open Log
| Step | Action | Expected |
|------|--------|----------|
| 1 | Browser A: click "new log" | Create form appears |
| 2 | Fill title "Test Freestyle", select Freestyle + Open | Fields accepted |
| 3 | Submit | Log created, redirected to detail page, URL has log ID |

### 1.2 Create Structured Open Log with Options
| Step | Action | Expected |
|------|--------|----------|
| 1 | Browser A: create log with title "Test Structured", Structured, Open, turnLimit=10, perTurnLengthLimit=100 | Log created with settings |

### 1.3 Create Private Log
| Step | Action | Expected |
|------|--------|----------|
| 1 | Browser A: create log with Private access mode | Log created, access code shown to Keeper |

---

## 2. Happy Path — Freestyle (3 Writers)

Use a Freestyle Open log.

| # | Actor | Action | Expected |
|---|-------|--------|----------|
| 2.1 | A | Submit turn with text "Opening line" + nickname "Keeper" | Turn 1 appears. A is Writer #1. Nickname = "Keeper" |
| 2.2 | B | Open same log, submit "Second line" + nickname "Poet" | Turn 2 appears. B auto-joins as Writer #2 |
| 2.3 | C | Open same log, submit "Third line" (no nickname) | Turn 3 appears. C auto-joins as Writer #3 with generated subculture nickname |
| 2.4 | A | Submit "Fourth line" | Accepted (last writer was C, not A) |
| 2.5 | B | Submit "Fifth line" | Accepted |
| 2.6 | C | Submit "Sixth line" | Accepted |
| 2.7 | Verify | Check log detail | 6 turns displayed in order, 3 writers listed with correct colors/nicknames |

---

## 3. Happy Path — Structured (3 Writers, Full Rotation)

Create a Structured Open log, turnLimit=12.

| # | Actor | Action | Expected |
|---|-------|--------|----------|
| 3.1 | A | Submit turn 1 "A starts" | A = Writer #1 (in-rotation, first ever) |
| 3.2 | B | Open log, submit "B joins" | B = Writer #2 (OOR entrance — A already in rotation) |
| 3.3 | C | Open log, submit "C joins" | C = Writer #3 (OOR entrance) |
| 3.4 | — | Check UI | Rotation pointer should be at B (next after A, skipping B&C who already wrote OOR... actually pointer advances past B and C since they wrote OOR → next = A) |
| 3.5 | A | Submit turn | Accepted (A's rotation turn) |
| 3.6 | B | Submit turn | Accepted (B's rotation turn) |
| 3.7 | C | Submit turn | Accepted (C's rotation turn) |
| 3.8 | A | Submit turn | Accepted (Round 2 starts, back to A) |
| 3.9 | B | Submit turn | Accepted |
| 3.10 | C | Submit turn | Accepted |
| 3.11 | A | Submit turn | Accepted |
| 3.12 | B | Submit turn | Turn 12 — log auto-closes → COMPLETED |
| 3.13 | C | Try to submit | **Rejected** — "Log has been completed" |

---

## 4. Happy Path — Structured (4 Writers, Late Joiner Mid-Rotation)

Create a Structured Open log (no turn limit).

| # | Actor | Action | Expected |
|---|-------|--------|----------|
| 4.1 | A | Submit "A1" | A = Writer #1 (in-rotation) |
| 4.2 | B | Submit "B1" | B = Writer #2 (OOR entrance) |
| 4.3 | — | Verify | Pointer: B wrote OOR → advance past B → next = A |
| 4.4 | A | Submit "A2" | Accepted (A's rotation turn) |
| 4.5 | B | Submit "B2" | Accepted (B's rotation turn) |
| 4.6 | A | Submit "A3" | Accepted |
| 4.7 | **D** | Open log, submit "D joins late" | D = Writer #3 (OOR entrance mid-rotation) |
| 4.8 | — | Verify | D wrote OOR. Next expected is still B (rotation continues) |
| 4.9 | B | Submit "B3" | Accepted |
| 4.10 | — | Verify | Now rotation = A → B → D → A → B → D ... |
| 4.11 | D | Submit "D2" | Accepted (D's first rotation turn) |
| 4.12 | A | Submit "A4" | Accepted |
| 4.13 | B | Submit "B4" | Accepted |
| 4.14 | D | Submit "D3" | Accepted — confirms D is fully in rotation |

---

## 5. Edge Case — Consecutive Turn Block (Freestyle)

| # | Actor | Action | Expected |
|---|-------|--------|----------|
| 5.1 | A | Create freestyle log, submit turn 1 | Accepted |
| 5.2 | A | Immediately try to submit turn 2 | **Rejected** — "Consecutive turns not allowed" |
| 5.3 | B | Submit turn 2 | Accepted |
| 5.4 | A | Now submit turn 3 | Accepted (B went in between) |

---

## 6. Edge Case — Wrong Turn in Structured

| # | Actor | Action | Expected |
|---|-------|--------|----------|
| 6.1 | A | Create structured log, submit turn 1 | A = Writer #1 |
| 6.2 | B | Join & submit (OOR) | B = Writer #2 |
| 6.3 | C | Join & submit (OOR) | C = Writer #3 |
| 6.4 | — | Verify | All 3 wrote OOR since A1 → pointer advances past all → next = A |
| 6.5 | B | Try to submit | **Rejected** — "Not your turn" |
| 6.6 | C | Try to submit | **Rejected** — "Not your turn" |
| 6.7 | A | Submit | Accepted |
| 6.8 | A | Try to submit again | **Rejected** — "Not your turn" (it's B's turn) |
| 6.9 | C | Try to submit | **Rejected** — "Not your turn" (it's B's turn) |
| 6.10 | B | Submit | Accepted |

---

## 7. Edge Case — Skip Turn (Keeper Powers)

Create a structured log with 4 writers all joined.

| # | Actor | Action | Expected |
|---|-------|--------|----------|
| 7.1 | A(Keeper) | Submit turn 1 | Accepted |
| 7.2 | B, C, D | All join via OOR entrance turns | 4 writers in rotation |
| 7.3 | — | Verify | Next rotation turn → A (all others wrote OOR) |
| 7.4 | A | Submit rotation turn | Accepted. Next = B |
| 7.5 | A(Keeper) | Skip B | B gets skipped. Next = C |
| 7.6 | B | Try to submit | **Rejected** — "Not your turn" |
| 7.7 | C | Submit | Accepted. Next = D |
| 7.8 | D | Submit | Accepted. Next = A |
| 7.9 | A | Submit | Accepted. Next = B |
| 7.10 | — | Verify | B is back in rotation (skip was one-time, not permanent) |
| 7.11 | B | Submit | Accepted |

---

## 8. Edge Case — Non-Keeper Cannot Skip

| # | Actor | Action | Expected |
|---|-------|--------|----------|
| 8.1 | Setup: structured log, A=keeper, B and C joined | |
| 8.2 | B | Try to click skip / call skip API | **Rejected** — "Only the log Keeper can skip turns" |
| 8.3 | C | Try to click skip | **Rejected** — same error |

---

## 9. Edge Case — Multiple Skips in a Round

| # | Actor | Action | Expected |
|---|-------|--------|----------|
| 9.1 | Setup: structured log, A(keeper), B, C, D all in rotation | A→B→C→D order |
| 9.2 | A | Submit turn | Next = B |
| 9.3 | A(Keeper) | Skip B | Next = C |
| 9.4 | A(Keeper) | Skip C | Next = D |
| 9.5 | D | Submit | Accepted. Next = A |
| 9.6 | A | Submit | Next = B |
| 9.7 | B | Submit | Accepted (B back in rotation after skip) |
| 9.8 | C | Submit | Accepted (C back in rotation after skip) |

---

## 10. Edge Case — Turn Limit Auto-Close

| # | Actor | Action | Expected |
|---|-------|--------|----------|
| 10.1 | A | Create structured log, turnLimit=4 | |
| 10.2 | A | Submit turn 1 | Writer #1 |
| 10.3 | B | Submit turn 2 (OOR join) | Writer #2 |
| 10.4 | A | Submit turn 3 | Rotation turn |
| 10.5 | B | Submit turn 4 | **Log auto-closes** → status = COMPLETED |
| 10.6 | C | Try to submit | **Rejected** — "Log has been completed" |
| 10.7 | A | Try to submit | **Rejected** — same |
| 10.8 | — | Check feed page | Log shows as completed |

---

## 11. Edge Case — Per-Turn Length Limit

| # | Actor | Action | Expected |
|---|-------|--------|----------|
| 11.1 | A | Create log with perTurnLengthLimit=50 | |
| 11.2 | A | Submit turn with 51 characters | **Rejected** — "Content exceeds maximum length" |
| 11.3 | A | Submit turn with exactly 50 characters | Accepted |
| 11.4 | B | Submit turn with 200 characters | **Rejected** |

---

## 12. Edge Case — Private Log Access Code

| # | Actor | Action | Expected |
|---|-------|--------|----------|
| 12.1 | A | Create private log | Access code displayed |
| 12.2 | B | Open log URL | Access code modal appears |
| 12.3 | B | Enter wrong code, try to submit turn | **Rejected** — "Invalid access code" |
| 12.4 | B | Enter correct code, submit turn | Accepted, B joins the log |
| 12.5 | C | Open log, enter correct code, submit | Accepted |
| 12.6 | B | Submit another turn (no code needed now) | Accepted (already joined) |

---

## 13. Edge Case — Participant Limit

| # | Actor | Action | Expected |
|---|-------|--------|----------|
| 13.1 | A | Create log with participantLimit=2 | |
| 13.2 | A | Submit turn 1 | A = Writer #1 |
| 13.3 | B | Submit turn 2 | B = Writer #2 (limit reached) |
| 13.4 | C | Try to submit | **Rejected** — "Participant limit reached" |
| 13.5 | D | Try to submit | **Rejected** — same |

---

## 14. Edge Case — Keeper Close Log Manually

| # | Actor | Action | Expected |
|---|-------|--------|----------|
| 14.1 | Setup: active freestyle log, A=keeper, B joined | |
| 14.2 | B | Try to close log | **Rejected** — "Only the Keeper can close this log" |
| 14.3 | A | Click close button | Log status → COMPLETED |
| 14.4 | B | Try to submit | **Rejected** — "Log has been completed" |
| 14.5 | A | Try to close again | **Rejected** — "Log is already closed" |

---

## 15. Edge Case — Nickname & Language

| # | Actor | Action | Expected |
|---|-------|--------|----------|
| 15.1 | A | Submit turn with custom nickname "TestNick" | Nickname = "TestNick" |
| 15.2 | B | Submit turn with empty nickname (lang=EN) | Auto-generated English subculture name (e.g. "Ruin Bionic Angel") |
| 15.3 | C | Switch to 中文, submit with empty nickname | Chinese subculture name (e.g. "废墟仿生天使") |
| 15.4 | D | Switch to ES, submit with empty nickname | Spanish subculture name (e.g. "Ruina Biónico Ángel") |
| 15.5 | — | Verify | Each writer's nickname persists, doesn't change on page refresh |

---

## 16. Complex — Creator Joins Late (Structured)

Creator creates but doesn't write first.

| # | Actor | Action | Expected |
|---|-------|--------|----------|
| 16.1 | A(Keeper) | Create structured log | Log created, A has NOT submitted any turn yet |
| 16.2 | B | Submit "B1" | B = Writer #1 (in-rotation, first ever) |
| 16.3 | C | Submit "C1" | C = Writer #2 (OOR — B is in rotation) |
| 16.4 | — | Verify | C wrote OOR → pointer advances past C → next = B |
| 16.5 | B | Submit "B2" | Accepted (B's rotation turn) |
| 16.6 | C | Submit "C2" | Accepted (C's rotation turn) |
| 16.7 | A | Submit "A joins late" | A = Writer #3 (OOR entrance) |
| 16.8 | — | Verify | Rotation now: B → C → A → B → C → A ... |
| 16.9 | B | Submit "B3" | Accepted |
| 16.10 | C | Submit "C3" | Accepted |
| 16.11 | A | Submit "A2" | Accepted — A is fully in rotation |

---

## 17. Complex — 4-Writer Structured with OOR Joins + Skip + Turn Limit

Structured log, turnLimit=12.

| # | Actor | Action | Expected |
|---|-------|--------|----------|
| 17.1 | A | Submit "A1" | Writer #1 (in-rotation) |
| 17.2 | B | Submit "B1" | Writer #2 (OOR) |
| 17.3 | C | Submit "C1" | Writer #3 (OOR) |
| 17.4 | D | Submit "D1" | Writer #4 (OOR) — Turn count: 4 |
| 17.5 | — | Verify | All OOR since A1 → pointer skips B,C,D → next = A |
| 17.6 | A | Submit "A2" | Rotation turn — count: 5 |
| 17.7 | B | Submit "B2" | Rotation turn — count: 6 |
| 17.8 | A(Keeper) | Skip C | Skip turn created (doesn't count toward turnLimit). Next = D |
| 17.9 | D | Submit "D2" | Rotation turn — count: 7 |
| 17.10 | A | Submit "A3" | count: 8 |
| 17.11 | B | Submit "B3" | count: 9 |
| 17.12 | C | Submit "C2" | count: 10 (C is back, skip was one-time) |
| 17.13 | D | Submit "D3" | count: 11 |
| 17.14 | A | Submit "A4" | count: 12 → **Log auto-closes** |
| 17.15 | B | Try to submit | **Rejected** — completed |

---

## 18. Complex — Freestyle Rapid Alternation (4 Writers)

Freestyle log, no turn limit.

| # | Actor | Action | Expected |
|---|-------|--------|----------|
| 18.1 | A | Submit "A1" | Accepted |
| 18.2 | B | Submit "B1" | Accepted (different writer) |
| 18.3 | A | Submit "A2" | Accepted (B went last) |
| 18.4 | A | Submit "A3" | **Rejected** — consecutive |
| 18.5 | C | Submit "C1" | Accepted |
| 18.6 | D | Submit "D1" | Accepted |
| 18.7 | D | Submit "D2" | **Rejected** — consecutive |
| 18.8 | C | Submit "C2" | Accepted |
| 18.9 | B | Submit "B2" | Accepted |
| 18.10 | A | Submit "A3" | Accepted |
| 18.11 | — | Verify | 8 turns total, all 4 writers visible with colors |

---

## 19. Complex — Private Structured with Participant Limit + Skip

Private log, structured, participantLimit=3, turnLimit=9.

| # | Actor | Action | Expected |
|---|-------|--------|----------|
| 19.1 | A | Create private structured log, participantLimit=3, turnLimit=9 | Access code generated |
| 19.2 | B | Enter correct code, submit "B1" | B = Writer #1 |
| 19.3 | C | Enter correct code, submit "C1" | C = Writer #2 (OOR) |
| 19.4 | A | Enter correct code, submit "A1" | A = Writer #3 (OOR) — limit reached |
| 19.5 | D | Enter correct code, try to submit | **Rejected** — "Participant limit reached" |
| 19.6 | — | Rotation: B→C→A | Normal |
| 19.7 | B | Submit "B2" | count: 4 |
| 19.8 | A(Keeper) | Skip C | Skip (no count). Next = A |
| 19.9 | A | Submit "A2" | count: 5. Next = B |
| 19.10 | B | Submit "B3" | count: 6. Next = C (back in rotation) |
| 19.11 | C | Submit "C2" | count: 7 |
| 19.12 | A | Submit "A3" | count: 8 |
| 19.13 | B | Submit "B4" | count: 9 → **auto-close** |
| 19.14 | — | Verify | COMPLETED, 3 writers, 9 real turns |

---

## 20. Complex — Reactions on Completed Log

| # | Actor | Action | Expected |
|---|-------|--------|----------|
| 20.1 | Setup: complete a log (any method) | Status = COMPLETED |
| 20.2 | A | Click reaction symbol ✦ | Reaction count = 1 |
| 20.3 | B | Click reaction symbol ✦ | Reaction count = 2 |
| 20.4 | B | Click reaction symbol ◎ | ◎ count = 1, ✦ still = 2 |
| 20.5 | A | Click ✦ again (toggle off) | ✦ count drops to 1 |

---

## 21. Complex — Feed Page Filtering

| # | Action | Expected |
|---|--------|----------|
| 21.1 | Create multiple logs with different categories (FREEWRITING, HAIKU, POEM) | |
| 21.2 | Go to feed, select "All" | All logs visible |
| 21.3 | Filter by HAIKU | Only haiku logs shown |
| 21.4 | Click "Can write" toggle | Only ACTIVE logs where you can participate shown |
| 21.5 | Complete a log, check "Can write" again | Completed log disappears from filtered view |

---

## Quick Reference — Error Messages

| Error | HTTP | Trigger |
|-------|------|---------|
| "Consecutive turns not allowed" | 403 | Same writer submits twice in a row (freestyle) |
| "Not your turn" | 403 | Wrong writer tries to go in structured mode |
| "Log has been completed" | 403 | Submit to a closed/completed log |
| "Invalid access code" | 403 | Wrong access code on private log |
| "Participant limit reached" | 403 | Too many writers |
| "Content exceeds maximum length" | 422 | Text too long |
| "Only the log Keeper can skip turns" | 403 | Non-keeper tries to skip |
| "Only the Keeper can close this log" | 403 | Non-keeper tries to close |
| "Cannot skip turns in Freestyle mode" | 400 | Skip on freestyle log |
