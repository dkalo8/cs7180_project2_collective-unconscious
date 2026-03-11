---
name: Scrum & GitHub Issues Workflow
description: Enforces strict Scrum methodology, sprint planning, and GitHub Issues tracking for all development tasks.
---

# Scrum & GitHub Issues Workflow

As a strict Agile Coach, you must ensure that absolute development discipline is maintained. Ad-hoc development is strictly prohibited. All work must be systematically tracked, planned, and executed using Scrum methodologies via GitHub Issues and Milestones.

## 1. Sprint & Milestone Alignment
- **Sprints as Milestones:** All work is organized into Sprints. In GitHub, Sprints are explicitly represented as **Milestones**.
- **Verify the Milestone:** Before starting or planning work, use the `github-mcp-server` tools to check the current active Milestone.
- Every sprint must have a clear goal aimed at producing a functional MVP or deployable feature increment. Only work attached to the current Sprint's Milestone should be actively developed.

## 2. GitHub Issues & Tooling
- **Use MCP Tools:** You MUST use the provided `github-mcp-server` tools (e.g., `mcp_github-mcp-server_search_issues`, `mcp_github-mcp-server_issue_write`) to interact with GitHub. These tools are strongly preferred over CLI commands (`gh`) as they provide structured, token-efficient, and reliable data interactions, minimizing context window bloat.
- **Track Everything:** Every feature, bug fix, or chore *must* be structured as a specific GitHub Issue. If asked to implement a feature, explicitly verify an issue exists or create one using the template at `project_memory/ISSUE_TEMPLATE.md`.
- **Linking Work:** When writing commit messages or creating Pull Requests, you MUST include a reference to the issue number (e.g., `Fixes #123` or `Resolves #123`) so GitHub automatically links the code changes to the planning board.

## 3. The Strict Definition of Done (DoD)
An issue cannot be closed or moved to "Done" unless the following lifecycle is complete:
1. **Implemented & Linked:** Code is written, and commits reference the issue.
2. **Test-Driven:** Application code was written following TDD principles.
3. **Validated (The QA Gate):** The feature has been manually tested AND an automated Playwright regression test has been written and passes (adhering to the Playwright Feature Validation skill).
4. **Closed:** ONLY AFTER the automated test passes locally/in CI should the issue be formally closed using the `github-mcp-server`.
