import { createContext, useContext, useState } from 'react';
import { T, CAT } from '../utils/i18n';

// Maps API category values → CAT keys
export const CAT_KEY_MAP = {
  'FREEWRITING': 'freewriting',
  'HAIKU': 'haiku',
  'POEM': 'poem',
  'SHORT_NOVEL': 'novel',
};

const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: T['en'],
  cat: CAT['en'],
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(
    () => localStorage.getItem('lang') || 'en'
  );

  const setLang = (code) => {
    localStorage.setItem('lang', code);
    setLangState(code);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: T[lang], cat: CAT[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
