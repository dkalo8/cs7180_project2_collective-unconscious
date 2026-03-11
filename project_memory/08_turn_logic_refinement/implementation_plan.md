# Implementation Plan: Turn Logic Refinement & Terminology Update

This plan documents the refactoring of the collaborative writing mechanics to fix bugs in the turn-robin queue and simplify the completion and participation model.

## 1. Participation & Join Logic
- **Goal:** Redefine "joining" a log to mean "successfully submitting the first turn."
- **Implementation:** 
    - Only writers with at least one non-skip turn are considered active participants.
    - The creator joins the rotation only upon their first submission.
    - Remove system-generated "Join" messages from the log display.

## 2. Structured Rotation (Round-Robin)
- **Goal:** Fix the rotation pointer to handle new joiners without breaking the flow.
- **Implementation:**
    - Introduce `isOutOfRotation` (DB `isEntrance`) flag for new joiners.
    - A turn is OOR only if a rotation already exists (preventing disruption).
    - OOR turns provide content but do NOT advance the rotation pointer.
    - Skip turns DO advance the rotation pointer but are hidden from the log display.

## 3. Terminology & Completion
- **Goal:** Simplify "Round Limit" to "Turn Limit" for clarity.
- **Implementation:** 
    - Rename `roundLimit` to `turnLimit` in PRD and code.
    - Use `@map("roundLimit")` in Prisma to maintain DB schema compatibility.
    - Completion logic: `Total Turns >= Turn Limit`.

## 4. Frontend & Skip UI
- **Goal:** Empower the Keeper and improve the Writing Zone UX.
- **Implementation:**
    - Move Skip button below the writing area.
    - Add a dynamic dropdown for the Keeper to select the skip target.
    - Update `LogDetailPage` to use server-provided `isMyTurn` and `nextWriter` fields.
