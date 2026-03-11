# Walkthrough: The New Rotation Logic

This document explains the mathematical and logical flow of the turn-taking system in Structured mode.

## 1. Defining the Participant List
A user only enters the "Writer List" after their first successful turn submission.
- **Creator Check:** The Keeper is no longer automatically Writer #1. Whoever submits first is #1.
- **API Response:** `getLogById` filters the `writers` array to only show those who have a turn record where `isSkip = false`.

## 2. The Rotation Pointer
The server calculates `nextWriter` by looking at the **last turn that was NOT Out of Rotation**.
- **Skip Turns:** When a user is skipped, a placeholder turn is created with `isSkip: true`. This turn DOES have a `writerId` and DOES advance the rotation pointer to the next person.
- **OutOfRotation Turns:** When a new user joins, if turns already exist, their turn is marked `isOutOfRotation: true`. This turn provides log content but the "expected next" writer remains the same as it was before they joined.

## 3. The `isMyTurn` API field
To prevent frontend bugs, the server now performs all turn logic and returns a simple boolean `isMyTurn`.
- **Freestyle:** `true` if you are a writer and weren't the last to submit, OR if you can still join.
- **Structured:** `true` if your `joinOrder` matches the `nextExpectedJoinOrder`, OR if you are a new joiner and the participant limit isn't hit.

## 4. Completion (Turn-Based)
Logs now close based on a simple count of **real submitted turns**. 
- Formula: `log.turns.filter(t => !t.isSkip).length >= log.turnLimit`.
- This applies identical logic to both Freestyle and Structured modes.
