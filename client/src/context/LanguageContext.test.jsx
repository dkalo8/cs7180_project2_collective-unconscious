import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { LanguageProvider, useLanguage } from './LanguageContext';

const wrapper = ({ children }) => <LanguageProvider>{children}</LanguageProvider>;

describe('LanguageContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns lang = "en" by default', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    expect(result.current.lang).toBe('en');
  });

  it('setLang updates lang', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    act(() => {
      result.current.setLang('es');
    });
    expect(result.current.lang).toBe('es');
  });

  it('t.nav.feed returns correct string for active lang', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    expect(result.current.t.nav.feed).toBe('feed');
    act(() => {
      result.current.setLang('zh');
    });
    expect(result.current.t.nav.feed).toBe('广场');
  });

  it('writes and reads lang from localStorage', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    act(() => {
      result.current.setLang('es');
    });
    expect(localStorage.getItem('lang')).toBe('es');

    // New render picks up persisted lang from localStorage
    const { result: result2 } = renderHook(() => useLanguage(), { wrapper });
    expect(result2.current.lang).toBe('es');
  });
});
