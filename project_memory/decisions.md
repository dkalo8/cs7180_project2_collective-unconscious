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

## 2026-03-09: UI Vibe Overhaul — Low-Tech / Plain Style

### Visual Direction (`prototype-notes.md`, `.antigravityrules`)
- **Dropped dark/atmospheric theme** (dark bg #080808, grain overlay, floating particles, IM Fell English italic serif) in favor of **white background + black text + system serif** (renders as Song/SimSun for Chinese).
- Style is now intentionally **low-tech and unadorned** — functional plain CSS, no visual polish for polish's sake.
- Buttons: grey background (`#d4d0c8`) with black border. Input fields: black border with small border-radius.
- Nav: plain text links with default blue underline; no divider between nav and content.

### Color Palette (`styles.ts`, `mockData.ts`, `PRD.md`)
- **Replaced the 8-color pastel palette** (`#E8927C`, `#7CA7E8`, `#A7E87C`, …, `#B8B8B8`) with a **6-color high-contrast palette**: red `#FF0000`, orange `#FF8C00`, blue `#0000FF`, green `#008000`, purple `#800080`, black `#000000`.
- Colors are used as **text color** only (no background bars, no color spines). Users can also pick a custom color via color picker.
- Mock data participant colors updated to reference the new palette indices.

### Author Identification (`prototype-notes.md`, `PRD.md`)
- **Removed vertical color spine** (2px bar per author) and **color bands in feed previews**.
- Authors are distinguished by **text color only** — no nicknames shown in the log body.
- Feed previews now show **title + plain text excerpt only** (no color bars).

### UX Pattern Changes (`prototype-notes.md`)
- Removed hover animations (opacity 0.7→1, arrow slide-in) and glowing spine effects.
- Submit is no longer a "typographic text + line + chevron" — reverted to standard button.
- Writing textarea and nickname input shown simultaneously.
- Nickname is optional; system auto-generates one if left blank (random adjective + noun, localized per language).
- Turn mode (structured/freestyle) is a fixed property of the log, not a viewer toggle.

### Multilingual (`prototype-notes.md`)
- Three languages: Chinese, English, Spanish — displayed as **side-by-side selectable options**, not a toggle.
- Language switch affects UI labels and category names only; user-written content stays unchanged.

### Screens Updated (`prototype-notes.md`)
- Home/Feed: flat chronological log list with title, category, and 2-line plain text preview.
- Log detail: transcript with colored left borders + inline write zone.
- Log creation: required fields on top, advanced settings collapsed.
- Added: access code entry screen (for private logs) and About page.

### PRD Cleanup (`PRD.md`)
- Resolved open question "How are user colors assigned?" — answered by the new 6-color default palette + custom color picker.
- Updated user story US-05 to reference text color and color picker.
## 2026-03-11: Color Toggle (S1-7)

### Feature (`LogDetailPage.jsx`, `LogDetailPage.test.jsx`)
- Added a **"Hide colors / Show colors"** toggle button in the log detail header.
- When hidden, all turn text renders in `#000000`, presenting the work as a unified piece with no author distinction.
- When shown (default), each turn uses the writer's assigned `colorHex`.
- Toggle preference persists in `sessionStorage` (key: `colorsHidden`) and restores on mount — no page reload required.
- The button uses the standard grey `#d4d0c8` / black border style per project conventions.

## 2026-03-11: Turn Logic Refinement & Terminology Update

### Completion & Rotation Logic (`PRD.md`, `turns.js`)
- **Simplified Completion:** Changed "Round Limit" to **"Turn Limit"**. Log completion is now a simple count of total non-skip turns, applying identically to both Structured and Freestyle modes.
- **Participation Gate:** A user is only considered a "Participant" (Writer) after successfully submitting their first turn.
- **`isOutOfRotation` Identity:** Renamed `isEntrance` to `isOutOfRotation`. This flag identifies turns that contribute content but do not advance the queue pointer (used for first-time joiners mid-rotation).
- **Skip Behavior:** Skip turns advance the rotation pointer but are hidden from display. This ensures "Skipped by Keeper" doesn't clutter the creative narrative.

### UI/UX Decisions (`LogDetailPage.jsx`, `LogDetailPage.css`)
- **Colored Content:** Confirmed decision to color turn text directly rather than using colored left margins.
- **Anonymous/Clean Log:** Nicknames are removed from the log body to keep the focus on the text, but are displayed at the bottom of the log in the participant gallery.
- **Dynamic Skip UI:** The skip button was moved below the `WriteZone`, removed of its emoji, and upgraded with a dynamic dropdown allowing the Keeper to select the target writer.
- **Manual Closure:** Added the ability for the Keeper to manually close any log (`PATCH /api/logs/:id/close`).
