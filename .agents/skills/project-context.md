# Project Instructions — Collective Unconscious

## What This Project Is

**Collective Unconscious** is an async collaborative chain-writing platform. Users create or join "logs" — turn-based writing sessions where each participant adds to a shared piece one segment at a time. Each participant's text is displayed in a distinct color. Completed works can be shared publicly. Logs can be public or invite-only, with optional rules around turn order, round limits, and creative constraints.

---

## Core Concepts (Always Keep In Mind)

- **Log** — the central product object; a single chain-writing session with a defined set of participants, a turn queue, and an immutable transcript of contributions
- **Turn** — one participant's contribution to a log; submitted and locked (no editing after the fact)
- **Prompt** — a creative seed for a new log; either platform-issued (curated/editorial) or user-submitted
- **Color coding** — each participant in a log is assigned a unique color that persists throughout the log and is visible in the final work

---

## Target Personas

1. **The Social Writer** — wants to write with friends asynchronously without group-chat noise
2. **The Pattern-Breaker** — wants to write with strangers to escape their own creative habits
3. **The Low-Pressure Connector** — seeks meaningful social connection through shared creation

---

## Product Scope

### In Scope (v1)
- Log creation with configurable settings (public/invite-only, turn order, round limits, constraints)
- Async turn-taking with notifications (email minimum)
- Per-participant color coding
- Platform-curated and user-submitted prompts
- Discovery feed for completed public works
- Reactions and comments on completed works
- Public shareable links (viewable without login)
- User profiles

### Out of Scope (v1)
- Real-time simultaneous editing
- Audio/multimedia contributions
- AI-assisted writing or AI turns
- Mobile native apps (web-first)
- Paid tiers or monetization
- Content translation

---

## Key Product Decisions & Defaults

| Setting | Default |
|---|---|
| Log visibility | Creator's choice (public or invite-only) |
| Turn order | Sequential (configurable) |
| Round limit | Unlimited (configurable) |
| Turn timeout | TBD — open question |
| Word/character limit per turn | TBD — open question |
| Color assignment | TBD — open question (random from palette, or user-chosen) |

---

## User Stories Reference

| ID | Story |
|---|---|
| US-01 | Play with friends (invite-only) or discover strangers (public logs) |
| US-02 | Access platform-issued themed prompts as creative starting points |
| US-03 | Publish personal prompts for the community |
| US-04 | React to and comment on completed works |
| US-05 | Be visually distinguished by color within a log |

---

## Tone & Voice

This product is for creative people who value expression over productivity. When helping with copy, naming, UX flows, or design:

- Lean **poetic and minimal** — avoid corporate, gamified, or social-media-growth language
- Embrace **strangeness and surprise** — the platform is about unexpected creative collisions
- Keep UI copy **short and human** — think literary journal, not SaaS dashboard
- The name "Collective Unconscious" signals depth, collaboration, and the subconscious creative process — let that spirit inform everything

---

## Open Questions (Don't Resolve Without Flagging)

These are unresolved and should be surfaced when relevant rather than assumed:

- Default turn timeout duration before a participant is skipped
- Color assignment UX (random, palette-pick, or fully user-controlled)
- Min/max word count per turn (platform default vs. creator-set)
- Content moderation approach for public logs and comments
- What happens to abandoned logs
- Whether any game mechanics (streaks, badges) belong in v1

---

## How to Help

When working on this project, Claude may be asked to assist with:

- **Product** — feature specs, user flows, edge case analysis, prioritization
- **Design** — wireframe descriptions, UX copy, naming, color palette suggestions
- **Engineering** — data models, API design, tech stack recommendations, architecture
- **Content** — prompt writing, onboarding copy, marketing language, FAQ drafts
- **Research** — competitive landscape, analogous products, user interview questions

Always ground responses in the personas, the core concept of async chain-writing, and the literary/creative ethos of the product.
