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

Collective Unconscious is an asynchronous collaborative chain-writing platform where users pool their ideas and build creative works together — one turn at a time. Participants create or join writing "logs," contribute a segment when it's their turn, and watch a piece grow in unexpected directions.

The product sits at the intersection of social creativity and casual shitposting. It's not a platform for serious, high-brow literary co-authorship. Instead, it gives people a low-pressure, fun way to collaborate with friends or strangers. Whether it's complaining about work, making up silly poems (e.g., "Look at that majestic mountain... wait, that's a cat's butt"),the vibe is easy, playful, and completely devoid of "writer's block" pressure.

---

## 2. Problem Statement

Collaborative writing and online socializing are often too high-pressure:
- **Group chats are chaotic** — Threads get derailed instantly, and it's impossible to sustain a funny thought or a casual story over time.
- **Social media feels performative** — Posting online often revolves around metrics, personal branding, or serious "takes," which kills the fun of casual, flashes-of-wit expression.
- **Lost sparks of inspiration** — People have funny, weird, or insightful thoughts all the time, but lack a low-effort, engaging place to simply drop a single sentence and see what happens to it.


---

## 3. Goals 


- Provide a focused, distraction-free space for casual, turn-based serendipity
- Support dual modes of engagement: hyper-casual "drop in when bored" writing, and intentional co-creation with friends
- Capture "sparks of inspiration" without the baggage of "prestigious art" or the pressure to build a "social media community"


---

## 4. User Personas

### Persona A — The Observant Commuter
Doesn't consider themselves a "writer." Uses their phone on the train and often has funny, insightful thoughts about daily life. Wants a dedicated place to drop one sharp or weird sentence into a growing pool of text and see what it turns into by the time they clock out of work.

### Persona B — The Playful Twister
Loves playing with language and internet culture in a clever way. Enjoys the anonymity of jumping into a log, taking a seemingly serious poem about a mountain, and twisting it into something lighthearted without anyone knowing it was them. 

### Persona C — The Low-Pressure Connector
Seeks genuine connection with friends but hates the obligation of maintaining small-talk in group chats. Playing an async, turn-based writing game with friends feels more meaningful?"

---

## 5. Feature Specifications

### 5.1 Logs — Core Writing Unit

A "log" is a sequential chain-writing session. It is the central product object.

User can create a log with a title.

#### Access Mode (Pick one)
- **Open:** Anyone can read and write
- **Private:** Anyone can read; writing requires an access code

#### Turn Mode (Pick one)
- **Structured:** Round-robin by join order, with a per-turn length limit
- **Freestyle:** No fixed order; the only rule is you cannot submit two consecutive turns

#### Round-Robin Queue Logic (Structured Mode)
- The Keeper (log creator) is #1; subsequent participants are appended to the queue in join order
- New participants enter the rotation immediately — no waiting for the next round
- Example: A creates log → A writes → B joins → B writes → A writes → C joins → C writes → A → B → C → repeat
- One "round" = every current participant writes once; round limit is calculated on this basis

#### Configurable Settings
- **Mandatory Log Title:** Acts as the thematic anchor for the log
- **Category (Optional Dropdown):** Options include Freewriting, Haiku, Poem, Short Novel, Flash Fiction (default: "Freewriting")
- **Participant limit:** Capped or unlimited (default unlimited)
- **Round limit:** Capped or unlimited (default unlimited)
- **Turn timeout:** None (manual skip only), Auto-skip (1h / 6h / 12h / 24h / 48h / 7d), or No timeout (default no timeout)
- **Per-turn length limit:** 1 sentence / 2 sentences / 1 paragraph / custom word count / no limit (default no limit)
- **Optional Seed / Creative Constraint:** A starting sentence, prompt, or custom rule (e.g., "must end each turn with a question") to kick things off (default no seed)

#### Keeper Permissions
- Manually skip the current turn holder (Structured mode, available at any time)
- Close the log (unlimited logs can be closed at any time; logs with a round limit close automatically when reached)
- Cannot modify any log settings after creation

#### Invariants
- Turns are immutable once submitted
- Log settings are immutable once created
- Writers see the full log so far when it's their turn
- Simple text editor — minimal UI, focus on the writing
- Each participant's text is rendered in a distinct **text color** (default palette: red #FF0000, orange #FF8C00, blue #0000FF, green #008000, purple #800080, black #000000; users can also pick a custom color via color picker)

### 5.2 Discovery — Logs


#### Discovery Feed
- Editorial team releases themed weekly/monthly log titles (with or without optional seeds), and they are shown in the discovery feed.
- Sort: Strictly reverse-chronological order (newest first). No "trending" or algorithms to keep the platform low-pressure.
- View: Shows both completed works and currently active/uncompleted logs(even those with only a title).
- Filtering: Only filterable by specific categories assigned at creation (e.g., Freewriting, Haiku, Poem, Short Novel).
- Feed previews show title + plain text excerpt only — no color bars or color bands

### 5.3 Social & Reactions
- Symbol reactions on completed works (read-only, lightweight): ✦ ◎ ∿ ⌖
- Works are shareable via link — viewable without an account


### 5.4 Identity & Accounts (V1 Scope)
- **Account-Free Access:** V1 requires no registration—authentication uses session tokens. The core optimized path is "click link → write a bit → leave."
- Full user accounts (profiles, bios, display names) are moved to Sprint 2.
- Color preference stored in local session (default color assigned by system from the 6-color palette; user can pick a custom color via color picker).

---

## 6. User Stories

| # | User Story | Acceptance Criteria |
|---|---|---|
| **US-01** | As a participant, I want to write with friends or create with strangers. | Invite-only logs accept a share link/code. Public logs are discoverable and joinable from the feed. |
| **US-02** | As a participant, I want themed prompts as creative starting points. | Platform titles/seeds appear in discovery feed. Tapping a prompt pre-fills the log creation form. |
| **US-04** | As a participant, I want to react to completed works. | Symbol reactions available on any public completed log. Reactions are optional and non-blocking. |
| **US-05** | As a participant, I want my writing distinguished from others through text color. | System assigns each participant a unique text color from the default palette. Color is consistent throughout the log. User can pick a custom color via color picker. |

---

## 7. Out of Scope (v1)

- Real-time simultaneous editing
- Content translation (Note: UI language switcher for Chinese/English/Spanish IS in scope, but log content itself is not translated)
- Comments on works
- User registration / profiles / accounts (moved to Sprint 2)
- Content moderation / Prompt review queues (moved to Sprint 2)
- Generating/sharing styled themed screenshots of logs (moved to Sprint 2)

---

## 8. Open Questions

- How is content moderation handled on public logs?

---

## 9. Technical Considerations

- Async turn-queue logic in freestyle (the first to submit a turn gets it)
- Color coding stored per-user per-log (on the Participant model, not User)
- Notification system: email required, push optional at v1
- Content stored immutably per turn — no editing after submission
- Public sharing via read-only permalink; no login required to view
