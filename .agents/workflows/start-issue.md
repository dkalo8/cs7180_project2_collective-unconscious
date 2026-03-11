---
description: Starts work on a new GitHub issue by fetching main, getting issue details, and creating a new branch.
---

# Start Issue Workflow

This workflow automates the process of starting work on a new issue.

## Prerequisites
- The target issue number must be known.

## Steps

1. **Get the issue number**
   Ask the user for the issue number if they haven't provided it.

2. **Fetch and checkout main**
   ```bash
   git fetch origin
   git checkout main
   git pull origin main
   ```

3. **Get issue details**
   Use the GitHub MCP tool `mcp_github-mcp-server_issue_read` with `method: 'get'` to view the issue so you can generate a short description for the branch.
   ```javascript
   // Call via MCP tool
   mcp_github-mcp-server_issue_read({ owner: 'dkalo8', repo: 'cs7180_project2_collective-unconscious', issue_number: <ISSUE_NUMBER>, method: 'get' })
   ```

// turbo-all
4. **Create and checkout a new branch**
   Create a branch following the project convention: `feature/<ISSUE_NUMBER>-<short-description>`.
   ```bash
   git checkout -b feature/<ISSUE_NUMBER>-<short-description>
   ```

5. **Load project context**
   Before writing any code, read the following files to ground your implementation decisions:
   - [`project_memory/PRD.md`](project_memory/PRD.md) — product requirements, user personas, and feature scope. All implementation decisions must align with this.
   - [`.antigravityrules`](.antigravityrules) — project-specific coding conventions, commit message format, and quality standards. Follow these strictly throughout the branch.
   - [`project_memory/prototype-notes.md`](project_memory/prototype-notes.md) — UI/UX decisions from the prototype phase. **Any frontend or UI work must reference this file** to stay consistent with the intended look, feel, and interactions.

6. **Scrum DoD Check (TDD Gate)**
   - Remind the current agent that according to `.agents/skills/scrum-github-issues/SKILL.md`, all development must be Test-Driven.
   - The first action on this new branch MUST be to write a failing test (Vitest/Jest/Playwright) for the issue's requirements before writing any application code.

7. **Acknowledge success**
   Notify the user that you are on the new branch, state the issue goal briefly, and confirm that you are ready to begin writing tests for it.
