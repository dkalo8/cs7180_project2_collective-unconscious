# Collective Unconscious — Product Requirements Document

Version 1.0 | February 2026

| | |
|---|---|
| **Product Name** | Collective Unconscious |
| **Type** | Async collaborative chain-writing platform |
| **Status** | Pre-development |
| **Owner** | TBD |
| **Target Launch** | TBD |

---

## 1. Product Overview

Collective Unconscious is an asynchronous collaborative chain-writing platform where users pool their ideas and build creative works together — one turn at a time. Participants create or join writing "logs," contribute a segment when it's their turn, and watch a piece grow in unexpected directions. Each writer's voice is preserved visually through color coding, and completed works can be shared with the world.

The product sits at the intersection of social creativity and reflective writing — giving people a low-pressure way to collaborate with friends or strangers, break out of creative ruts, and feel the surprise and delight of co-authorship.

---

## 2. Problem Statement

Collaborative writing is genuinely hard to coordinate. Writers who want to create together face:

- No dedicated async platform — group chats get derailed by off-topic conversations, and real-time tools (Google Docs, shared notes) require synchronous presence.
- Isolation in creative practice — many writers work alone and lack low-friction ways to invite creative collaboration with friends or new people.
- Creative stagnation — writing in your own patterns is limiting; unexpected contributions from others can break through blocks and produce surprising results.
- High social stakes — committing to a long-form collaborative project feels daunting; micro-contributions reduce the pressure.

---

## 3. Goals & Success Metrics

### 3.1 Product Goals

- Provide a focused, distraction-free space for async chain-writing
- Lower the barrier to creative collaboration between strangers and friends
- Build a community around completed works and creative prompts
- Enable self-expression through structured, turn-based co-creation

### 3.2 Success Metrics

| Metric | Target (6 mo) | Notes |
|---|---|---|
| Logs completed | 500+ | Primary engagement signal |
| Avg turns per user per week | 3+ | Habit formation |
| Retention (30-day) | 40% | Community stickiness |
| Works shared publicly | 25% of completions | Growth + virality signal |

---

## 4. User Personas

### Persona A — The Social Writer
Loves collaborative chain-writing but finds it hard to coordinate with friends. Group chats get derailed; real-time tools require scheduling. Wants an async platform where everyone can contribute on their own time and still produce something finished together.

### Persona B — The Pattern-Breaker
An active writer looking to escape their own stylistic habits. Welcomes unexpected creative directions. Drawn to writing with strangers precisely because strangers take things somewhere unfamiliar.

### Persona C — The Low-Pressure Connector
Seeks genuine connection but not through small talk. Creating something together — even something small — feels more meaningful than a chat. Values the artifact of a finished piece as a social touchstone.

---

## 5. Feature Specifications

### 5.1 Logs — Core Writing Unit

A "log" is a sequential chain-writing session. It is the central product object.

#### Creator Controls
- Set log to public (anyone can join) or invite-only (link/code required)
- Define participant limit (2–10 writers)
- Set turn order: sequential, random, or freeform
- Optional round limit (e.g., 3 rounds, 5 rounds, unlimited)
- Optional creative constraints (e.g., "no adjectives," "must end each turn with a question," custom text)
- Start from a prompted seed or a blank slate

#### Writing Experience
- Writers see the full log so far when it's their turn
- Simple text editor — minimal UI, focus on the writing
- Character/word limit per turn (configurable by creator, default TBD)
- Each participant's text is rendered in a distinct, assigned color
- Writers cannot edit previous turns (immutable history)

#### Turn Notifications
- Email and/or push notification when it's a user's turn
- Configurable nudge timer — if a participant doesn't respond within X hours, they may be skipped or the log stalls

### 5.2 Discovery — Public Logs & Prompts

#### Platform Prompts
- Editorial team releases themed weekly/monthly prompts to seed new logs
- Prompts are displayed on the home/discovery feed
- Users can start a new log directly from a platform prompt

#### User-Published Prompts
- Any user can submit a prompt for the community to use
- Prompts can be upvoted; top prompts surface in discovery
- Prompt author is credited when a log is started from their prompt

#### Discovery Feed
- Browse completed works filtered by: trending, recent, genre tag, prompt source
- Works display participant color bands as a visual signature of authorship

### 5.3 Social & Reactions
- Symbol reactions on completed works (read-only, lightweight): ✦ ◎ ∿ ⌖
- Text feedback / comments on completed works (moderated)
- Works are shareable via link — viewable without an account
- Authors can optionally display or hide their username on shared works

### 5.4 Profiles
- User profile shows: logs participated in, works completed, prompts published
- Optional bio and display name
- Color preference setting (default color assigned by system; user can request a different one)

---

## 6. User Stories

| # | User Story | Acceptance Criteria |
|---|---|---|
| **US-01** | As a participant, I want to write with friends or create with strangers. | Invite-only logs accept a share link/code. Public logs are discoverable and joinable from the feed. |
| **US-02** | As a participant, I want themed prompts as creative starting points. | Platform prompts appear in discovery feed. Tapping a prompt pre-fills the log seed. New prompts published on a defined cadence. |
| **US-03** | As a participant, I want to publish my own prompts. | Prompt submission form accessible from profile. Submitted prompts enter a review/upvote queue. Approved prompts appear in discovery. |
| **US-04** | As a participant, I want to react to and give feedback on completed works. | Symbol reactions available on any public completed log. Comment field available post-completion. Both are optional and non-blocking. |
| **US-05** | As a participant, I want my writing distinguished from others through color. | System assigns each participant a unique color. Color is consistent throughout the log. User can update color preference in settings. |

---

## 7. Out of Scope (v1)

- Real-time simultaneous editing
- Audio or multimedia contributions
- AI-generated turns or co-writing assistance
- Monetization / paid tiers
- Mobile native apps (web-first)
- Content translation or multilingual support

---

## 8. Open Questions

- What is the default turn timeout before a participant is skipped?
- How are user colors assigned — fully random, from a curated palette, or user-chosen?
- Is there a minimum/maximum word count per turn, or is that creator-defined?
- How is content moderation handled on public logs and comments?
- What happens to an abandoned log — archive, delete, or allow takeover?
- Should there be any game-like elements (streaks, badges) or keep it purely creative?

---

## 9. Technical Considerations

- Async turn-queue logic with conflict prevention (only one active writer at a time)
- Color coding stored per-user per-log (on the Participant model, not User)
- Notification system: email required, push optional at v1
- Content stored immutably per turn — no editing after submission
- Public sharing via read-only permalink; no login required to view
- Prompt moderation queue for user-submitted content
