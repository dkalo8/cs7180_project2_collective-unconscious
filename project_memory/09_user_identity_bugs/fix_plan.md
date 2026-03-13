# Fix Plan: Issue #48 — User Identity Bugs

## Key Rules (from project decisions)
- There is NO "join" action — a writer enters the participant list only after their first successful turn submission
- `getLogById` filters writers to only those with a real (non-skip) turn
- Nickname and color are set on first turn per-log and locked for that log (different logs can have different identities)
- The same player cannot appear in consecutive turns
- Skip turns advance the rotation pointer but are hidden from display

---

## Bug 1: Close/skip buttons overflow off-screen on mobile

**Fix:**
- `client/src/pages/LogDetailPage.jsx` (line 158): Add `flexWrap: 'wrap'` to header container, add CSS classNames
- `client/src/responsive.css`: Add mobile rules for `.log-detail-header` and `.log-detail-actions`

---

## Bug 2: Nickname/color not locked for returning writers

**Fix:**
- `server/src/controllers/turns.js`: Remove lines 162-170 (nickname/color update block for returning writers)
- `client/src/components/WriteZone.css`: Add `:disabled` styles for nickname input and color pickers

---

## Bug 3: "Waiting for [nickname]" message incorrect

**Desired behavior (only shown when NOT current user's turn):**
- Structured, 1 writer: "waiting for next person..."
- Structured, 2+ writers: "waiting for [specific nickname]" (updates on skip)
- Freestyle (any count): "waiting for next person..."

**Fix:**
- `client/src/pages/LogDetailPage.jsx` (lines 306-312): Replace waiting message logic with explicit mode/count checks

---

## Bug 4: Returning writer can submit with changed identity on mobile

**Fix:** Covered by Bug 2 (server + CSS). Additionally:
- `client/src/components/WriteZone.jsx`: Add `isSubmitting` state to prevent double-taps

---

## Bug 5: Solo writer can submit unlimited consecutive turns (both platforms)

**Fix:**
- `server/src/controllers/turns.js` (line 137): Add universal consecutive-turn check before mode branches
- `server/src/controllers/logs.js` (lines 243-245): Add consecutive check to `isMyTurn` for STRUCTURED
- `client/src/pages/LogDetailPage.jsx` (line 316): Skip button requires `skipableWriters.length > 1` (can't skip yourself)

---

## Files to modify

| File | Changes |
|------|---------|
| `client/src/pages/LogDetailPage.jsx` | Bug 1: flexWrap header. Bug 3: waiting message. Bug 5: skip button 2+ writers |
| `client/src/responsive.css` | Bug 1: mobile rules |
| `client/src/components/WriteZone.jsx` | Bug 4: isSubmitting state |
| `client/src/components/WriteZone.css` | Bug 2: disabled styles |
| `server/src/controllers/turns.js` | Bug 2: remove update block. Bug 5: consecutive check |
| `server/src/controllers/logs.js` | Bug 5: isMyTurn consecutive check |

---

## Verification
1. `cd server && npm test` — existing tests pass
2. Local dev with Chrome mobile mode (375px)
3. Test each bug per MANUAL_TEST_PLAN.md scenarios
4. New tests for: solo writer block, nickname lock, isSubmitting
