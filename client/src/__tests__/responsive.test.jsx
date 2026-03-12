import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

// ── Mocks ────────────────────────────────────────────────────────────────────
vi.mock('react-router-dom', () => ({
  Link: ({ children, to, style }) => <a href={to} style={style}>{children}</a>,
  useParams: () => ({ id: 'mock-id' }),
  useNavigate: () => vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(() => ({ isLoading: false, isError: false, data: null })),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({
    t: {
      siteName: 'Collective Unconscious', tagline: '', nav: { feed: 'feed', create: 'create', about: 'about' },
      log: { placeholder: 'continue the piece', submit: 'submit', nickLabel: 'nickname', completed: 'completed',
             mode: () => '', round: () => '', turnOf: () => '', waitingNext: '', waitingFirst: '', empty: '',
             copy: 'copy', copied: 'copied', close: 'close' },
      create: { title: 'Create', logTitle: 'Title', logTitlePh: '', category: 'Category', access: 'Access',
                open: 'Open', private: 'Private', turnMode: 'Turn mode', freestyle: 'Freestyle',
                structured: 'Structured', advanced: 'Advanced', seed: 'Seed', seedPh: '', participantLimit: 'Limit',
                unlimited: 'Unlimited', turnLimit: 'Turn limit', timeout: 'Timeout', timeoutOpts: ['None'],
                perTurn: 'Per turn', perTurnOpts: ['None'], submit: 'Create log' },
      access: { title: 'Access code', desc: '', placeholder: '' },
      feed: { count: () => '' },
    },
    lang: 'en',
    cat: {},
    setLang: vi.fn(),
  }),
  CAT_KEY_MAP: {},
}));

vi.mock('../utils/i18n', () => ({
  LANG_OPTIONS: [{ code: 'en', label: 'EN' }],
  CAT: { en: {} },
}));

vi.mock('../services/auth.service', () => ({
  getMe: vi.fn(() => Promise.resolve(null)),
  loginWithGoogle: vi.fn(),
  logout: vi.fn(),
}));

// ── Tests ────────────────────────────────────────────────────────────────────
import Header from '../components/Header';
import CreateLogPage from '../pages/CreateLogPage';

describe('Responsive Design (S1-12)', () => {
  it('Header renders with responsive class', () => {
    render(<Header t={{ siteName: 'CU', tagline: '', nav: { feed: 'feed', create: 'create', about: 'about' } }} lang="en" setLang={vi.fn()} />);
    const header = document.querySelector('header');
    expect(header).toBeInTheDocument();
    expect(header.classList.contains('site-header')).toBe(true);
  });

  it('Header nav has responsive class', () => {
    render(<Header t={{ siteName: 'CU', tagline: '', nav: { feed: 'feed', create: 'create', about: 'about' } }} lang="en" setLang={vi.fn()} />);
    const nav = document.querySelector('nav');
    expect(nav.classList.contains('site-nav')).toBe(true);
  });

  it('CreateLogPage form is wrapped in responsive container', () => {
    render(<CreateLogPage />);
    const form = document.querySelector('.create-form');
    expect(form).toBeInTheDocument();
  });

  it('submit button in CreateLogPage meets 44px min touch target via class', () => {
    render(<CreateLogPage />);
    const btn = screen.getByRole('button', { name: /create log/i });
    expect(btn.classList.contains('touch-target')).toBe(true);
  });
});
