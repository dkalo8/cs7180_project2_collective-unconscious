# Prototype Design Decisions

## Aesthetic
- White background, black text
- Low-tech, plain CSS style — functional and unadorned
- Typography: system serif (renders as Song/SimSun for Chinese). 
- Default color palette for author identification: red #FF0000, orange #FF8C00, blue #0000FF, green #008000, purple #800080, black #000000
- Users can also pick a custom color via color picker
- the whole ui style should feel like old website and plain html(although we use tailwind to implement it)

## UX Patterns
- Text color identifies each author in log view — no nicknames shown in the body, no colored left borders or color spines
- Turn mode (structured/freestyle) is a fixed property of the log, not a viewer toggle
- Writing textarea and nickname input shown simultaneously
- Nickname is optional; system auto-generates one if left blank (random adjective + noun combo, localized per language)
- Reactions use symbols not emoji: ✦ ◎ ∿ ⌖ — shown at the bottom of completed works
- Buttons: grey background (#d4d0c8) with black border
- Input fields: black border with small border-radius (rounded corners)
- Nav: plain text links with default blue underline, no divider between nav and content
- Discovery feed previews: title + plain text excerpt, no color bars

## Multilingual
- Three languages: Chinese, English, Spanish — displayed as side-by-side selectable options, not a toggle
- Language switch affects UI labels and category names only; user-written content (titles, text, nicknames) stays unchanged

## Screens in Prototype
- Home/Feed: flat chronological log list with title, category, and 2-line plain text preview
- Log detail: transcript with each author's text rendered in their assigned color + inline write zone (textarea + nickname input + color picker + submit)
- Log creation: required fields on top (title, category, access, turn mode, seed), advanced settings collapsed (per-turn limit, participant limit, round limit, timeout)
- Access code entry: for private logs
- About page

## 2026-03-11 Updates
- **Skip UI:** Grey button labeled "skip the next turn of:" followed by a dropdown selecting from current participants. No emojis.
- **Log Status:** Header displays "Mode: [TYPE] · Status: [STATUS] · Turn Limit: [LIMIT]".
- **Participation Gallery:** Writers' nicknames and colors displayed at the bottom of the log (Joint order for Freestyle; Numerical list for Structured).
- **Manual Close:** The Keeper has a "Close Log" button that marks the log as COMPLETED instantly.
- **Clean Log:** No nicknames or "Join/Skip" system messages in the log transcript.