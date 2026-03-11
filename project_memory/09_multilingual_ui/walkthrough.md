# Walkthrough: How the Multilingual System Works

## 1. The Language Context

`LanguageContext.jsx` is the single source of truth. On mount, it reads `localStorage.getItem('lang')` — if nothing is stored, it defaults to `'en'`. When the user clicks a language button, `setLang(code)` writes to both localStorage and React state, triggering a re-render of all consumers.

```
localStorage['lang'] ──► LanguageProvider (lang state)
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
                Layout      HomePage    WriteZone ...
               (switcher)   (t.feed.*)  (t.log.*)
```

## 2. The `t` Object

`t` is `T[lang]` from `i18n.ts` — a nested object of strings and functions:
- Strings: `t.siteName`, `t.nav.feed`, `t.create.logTitle`, etc.
- Functions: `t.feed.count(n)` → `"4 logs"` / `"共 4 篇"`, `t.log.turnOf(name)` → `"waiting for Alice"`

## 3. Category Display

API category values are English strings (`'Freewriting'`, `'Haiku'`, etc.) used as DB/API identifiers. To display them in the active language:

```js
cat[CAT_KEY_MAP['Freewriting']]  // → CAT[lang]['freewriting'] → "自由写作" / "Freewriting" / "Escritura libre"
```

The `<option value={c}>` still sends the English API value on submit — only the display text localizes.

## 4. Design Decision: Fixed Site Name

"Collective Unconscious" is always shown in the header regardless of language. The tagline and nav links translate. This was a deliberate choice — the name is a proper noun and works as a brand identifier across languages.

## 5. Test Strategy

The context default value (`createContext({ lang: 'en', t: T['en'], cat: CAT['en'], setLang: () => {} })`) ensures components render correctly in tests that don't wrap with `LanguageProvider`. All tests use English strings by default, matching the app's default lang.
