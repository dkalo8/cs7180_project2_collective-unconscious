---
description: Automates pushing a completed feature branch and creating a pull request.
---

# Finish Issue Workflow

This workflow automates the process of wrapping up work on an issue by pushing the branch and opening a PR.

## Prerequisites
- The user has completed work and wants to finish the issue.
- The current branch is a feature branch related to an issue.

## Steps

1. **Scrum DoD Check (QA Gate)**
   - Verify that this feature/fix is linked to the active GitHub Milestone.
   - Verify that automated tests (Playwright/Jest/Vitest) exist for this change.
   - Run the tests locally. If they fail, STOP the workflow and inform the user.
   ```bash
   npm test
   ```

2. **Verify status**
   Check that all changes are committed. If there are uncommitted changes, ask the user if they should be committed first.
   ```bash
   git status
   ```

// turbo
3. **Push the branch**
   Push the current branch to the remote repository.
   ```bash
   git push -u origin HEAD
   ```

4. **Determine the PR Title**
   The title must follow the format `[#ISSUE_NUMBER] Description`. You can extract the issue number and a brief description from the branch name or recent commits.

5. **Create the Pull Request**
   Use the GitHub MCP tool `mcp_github-mcp-server_create_pull_request` to create the pull request. Ensure that the PR body includes a comprehensive summary of the changes made in this PR.
   ```javascript
   // Call via MCP tool
   mcp_github-mcp-server_create_pull_request({
     owner: 'Zhanyi Chen',
     repo: 'cs7180_project2_collective-unconscious',
     title: "[#<ISSUE_NUMBER>] <Description>",
     head: "feature/<ISSUE_NUMBER>-<description>",
     base: "main",
     body: "Closes #<ISSUE_NUMBER>\n\n## Summary of Changes\n<Briefly summarize the changes made in this PR>"
   })
   ```

6. **Acknowledge success**
   Notify the user that the PR has been created and provide the link if possible.

7. **Archive Artifacts to Project Memory**
   Create a new sequentially numbered directory in `project_memory/` (e.g., if `01_scaffold_monorepo` exists, use `02_<issue_description>`).
   Copy any relevant project artifacts (like `task.md`, `implementation_plan.md`, `walkthrough.md`) generated during this issue into the newly created folder. This ensures a persistent historical record of the work directly within the repository.