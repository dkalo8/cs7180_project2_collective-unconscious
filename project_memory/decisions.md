# Architecture Decisions Log

## 2026-02-26
- Chose Participant model (not User.color) for color assignment — allows same user to have different colors per log
- Chose uuid() over cuid() for IDs — agent's choice, acceptable
- Visibility and turnOrder stored as String not enum — may want to revisit with Prisma enums in Sprint 2
- Agent scaffolded skills in .agents/skills/ — keep this pattern
## 2026-03-09: V1 Scope and Vibe Pivot
- **Account-free Access (V1)**: Removed user registration for V1 to prioritize an ultra-low-friction "click link -> write -> leave" flow. Sessions will handle auth. Accounts deferred to Sprint 2.
- **Removed Built-in Community Tools (V1)**: Removed comments and user-submitted prompt discovery. The goal is a distraction-free space for writing, not another social media feed to maintain.
- **Removed Random Turn Order**: In async environments, random turn order creates unpredictability and stalled logs. V1 will strictly use Structured (Round-robin) or Freestyle.
- **Chronological Discovery Feed**: Removed "trending" or algorithms from the public feed. Works will be sorted chronologically and filterable by specific format categories (e.g., Haiku, Poem, Freewriting) to reduce performance pressure.
- **Vibe Pivot - Casual Inspiration**: Shifted the platform's tone away from serious "literary co-authorship" or pure "shitposting." The new focus is capturing "sparks of inspiration," unpretentious humor, and everyday observations (e.g., a Haiku about a cat's butt or complaining about work).
- **Sprint 2 Additions**: Added "Generate themed screenshots of logs" to Sprint 2 to encourage sharing on external platforms without building internal social features.
