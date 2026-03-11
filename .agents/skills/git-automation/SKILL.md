---
name: Git Automation
description: Automates git branch creation, committing, and PR generation for standard agile workflows.
---

# Git Automation Skill

This skill provides Antigravity with the procedural knowledge to handle Git operations seamlessly when starting or finishing work on an issue.

## Context
The Collective Unconscious project uses a specific Git workflow:
- Branches must be named `feature/ISSUE_NUMBER-short-description`
- Commits must be formatted as `type(scope): description #ISSUE_NUMBER`
- Pull Requests must be formatted as `[#ISSUE_NUMBER] Brief description`

## Instructions for Antigravity

When you are instructed to start or finish an issue, follow these steps:

### Starting an Issue
1. **Trigger**: The user says "start issue #X" or "begin work on issue X".
2. **Action**: Run the `/start-issue` workflow.
3. **Guidance**: Use the `gh` CLI to fetch the issue details to generate a meaningful branch name.

### Make Commits
1. **Trigger**: The user asks you to commit or save changes.
2. **Action**: 
   - Check `git status`
   - Stage appropriate files `git add <files>`
   - Commit using the project convention: `git commit -m "type(scope): description #ISSUE"` (e.g., `feat(client): add login button #12`).

### Finishing an Issue
1. **Trigger**: The user says "finish issue" or "create a PR for this".
2. **Action**: Run the `/finish-issue` workflow.
3. **Guidance**: Make sure all necessary files are committed before creating the PR. Use `gh pr create` with the correct title pattern.
