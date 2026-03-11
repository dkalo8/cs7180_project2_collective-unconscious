# Task: Multilingual UI — Chinese / English / Spanish

## Status
- [x] Write failing LanguageContext tests first (TDD)
- [x] Create `LanguageContext.jsx` with `lang` state, localStorage persistence, `useLanguage()` hook
- [x] Export `CAT_KEY_MAP` (API category values → CAT keys) from LanguageContext
- [x] Wrap `RouterProvider` with `<LanguageProvider>` in `main.jsx`
- [x] Wire real language switcher in `Layout.jsx` (中文 / EN / ES) using `S.langBtn(active)`
- [x] Keep "Collective Unconscious" as fixed header across all languages (tagline + nav translate only)
- [x] Localize `HomePage` — count, category dropdown, canWrite button, empty/loading/error states
- [x] Localize `CreateLogPage` — all form labels, placeholders, buttons, access code modal
- [x] Localize `LogDetailPage` — close button, waiting messages, completed banner, access prompt
- [x] Localize `WriteZone` — textarea placeholder, submit button, nickname placeholder
- [x] Pass `lang` to `randomNick(lang)` for localized placeholder nicknames
- [x] Add missing i18n keys to `i18n.ts` (feed.* and log.* groups, all 3 locales)
- [x] Update all affected tests to match new English i18n strings
- [x] 28/28 tests pass
