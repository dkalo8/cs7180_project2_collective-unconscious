# Issue #48: User Identity Bugs

**Issue:** https://github.com/dkalo8/cs7180_project2_collective-unconscious/issues/48
**Labels:** bug, priority-high
**Branch:** `feature/48-user-identity-bugs`

---

## Bug 1: Close/skip buttons not visible on mobile
**Platform:** Mobile only
**Severity:** High

The header in LogDetailPage uses a flex row without wrapping. On narrow screens (<480px), the button group (Hide colors, Close, Report) overflows off the right edge of the screen. The creator cannot see or use the Close and Skip buttons.

**Expected:** Buttons wrap to a new line on mobile so they remain accessible.

---

## Bug 2: Nickname and color not locked for returning writers
**Platform:** Mobile only (visual), Both platforms (server)
**Severity:** High

After a writer submits their first turn (which sets their nickname and color), subsequent turns should NOT allow changing them within the same log. Currently:
- **Server:** `turns.js` lines 162-170 accept nickname/color updates for returning writers
- **Client:** The disabled state on mobile inputs lacks visual distinction, so users don't realize fields are locked

Note: Nickname and color are per-log. Different logs can have different identities.

---

## Bug 3: "Waiting for [nickname]" message incorrect
**Platform:** Mobile only
**Severity:** Medium

The waiting message should behave as follows (only shown when it's NOT the current user's turn):
- **Structured mode, 1 writer:** "waiting for next person..."
- **Structured mode, 2+ writers:** "waiting for [specific nickname]" — updates if keeper skips the next person
- **Freestyle mode (any count):** "waiting for next person..."

Currently the logic in LogDetailPage.jsx doesn't match this spec — it uses `log.nextWriter` and `log.writers.length` in a way that produces wrong messages.

---

## Bug 4: Returning writer can submit again with changed identity on mobile
**Platform:** Mobile only
**Severity:** Medium

On mobile, a returning writer can change their nickname and color and submit another turn. This violates the rule that identity is locked after first turn. Root cause overlaps with Bug 2 (server accepts updates + weak mobile disabled styling). Additionally, there's no `isSubmitting` state to prevent rapid double-taps.

---

## Bug 5: Solo writer can submit unlimited consecutive turns
**Platform:** Both mobile and desktop
**Severity:** High

In STRUCTURED mode, `computeNextExpectedJoinOrder` with 1 writer always returns that writer's joinOrder, so they can keep submitting. There's no consecutive-turn check in the STRUCTURED branch (only FREESTYLE has one). The `isMyTurn` calculation also returns `true` for the solo writer.

**Rule:** The same player cannot appear in consecutive turns. A solo writer must wait for someone else to join.

Additionally, the skip button should be hidden when there's only 1 writer (can't skip yourself).
