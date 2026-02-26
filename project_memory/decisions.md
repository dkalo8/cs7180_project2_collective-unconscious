# Architecture Decisions Log

## 2026-02-26
- Chose Participant model (not User.color) for color assignment — allows same user to have different colors per log
- Chose uuid() over cuid() for IDs — agent's choice, acceptable
- Visibility and turnOrder stored as String not enum — may want to revisit with Prisma enums in Sprint 2
- Agent scaffolded skills in .agents/skills/ — keep this pattern