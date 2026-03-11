# Implementation Plan: Multilingual UI (Issue #9)

The app already had a complete `i18n.ts` with translations and `nickname.js` with localized name generators, but no language state management. This issue wired everything together via React Context.

## 1. Language State — LanguageContext

- **Goal:** Single source of truth for active language, persisted across reloads.
- **Implementation:**
    - `client/src/context/LanguageContext.jsx` — `LanguageProvider` holds `lang` state initialized from `localStorage.getItem('lang') || 'en'`.
    - `setLang(code)` writes to both localStorage and React state.
    - Context value: `{ lang, setLang, t: T[lang], cat: CAT[lang] }`.
    - Default context value provided to `createContext(...)` so components work in tests without a provider.
    - `CAT_KEY_MAP` exported: maps API category strings (`'Freewriting'`, etc.) to CAT keys (`'freewriting'`, etc.).

## 2. Provider Placement

- Wrapped in `main.jsx` around `RouterProvider`, inside `QueryClientProvider`.

## 3. Layout — Language Switcher

- `Layout.jsx` calls `useLanguage()` for `t`, `lang`, `setLang`.
- `LANG_OPTIONS.map(...)` renders buttons using `S.langBtn(lang === l.code)` for active styling.
- Site name hardcoded as "Collective Unconscious" (not translated per design decision).
- Tagline and nav links (`t.tagline`, `t.nav.feed/create/about`) do translate.

## 4. Page / Component Localization

Each component calls `useLanguage()` and replaces hardcoded strings with `t.*` and `cat[CAT_KEY_MAP[c]]`:
- `HomePage` — count, category dropdown display, canWrite toggle, empty/loading/error states.
- `CreateLogPage` — all form labels, placeholders, radio options, advanced settings, access code modal.
- `LogDetailPage` — close button, mode/status display, turns empty state, completed banner, waiting messages, access code prompt.
- `WriteZone` — textarea placeholder (`t.log.placeholder`), submit button (`t.log.submit`), nickname placeholder label.

## 5. Missing i18n Keys Added

| Key | zh | en | es |
|---|---|---|---|
| `feed.allCategories` | 所有类型 | All | Todas |
| `feed.canWrite` | 可参与 | Can write | Puedo escribir |
| `feed.empty` | 暂无内容 | Nothing here yet | Nada aquí aún |
| `feed.loading` | 加载中... | Loading... | Cargando... |
| `feed.error` | 加载失败 | Failed to load | Error al cargar |
| `log.close` | 关闭 Log | Close Log | Cerrar Log |
| `log.waitingFirst` | 等待第一位写作者... | Waiting for the first writer... | Esperando al primer escritor... |
| `log.waitingNext` | 等待下一位写作者... | Waiting for the next one... | Esperando al siguiente... |
| `log.empty` | 还没有内容。 | No turns written yet. | Aún no hay turnos. |
| `log.completed` | 这篇 Log 已完结。 | This log has been completed. | Este log ha sido completado. |
