import { Outlet, Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { LANG_OPTIONS } from "../utils/i18n";
import { S } from "../utils/styles";

export default function Layout() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        paddingBottom: '20px',
        borderBottom: '1px solid #eeeeee',
        marginBottom: '40px'
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <Link to="/" style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#000',
            textDecoration: 'none'
          }}>
            Collective Unconscious
          </Link>
          <span style={{ fontSize: '14px', color: '#999' }}>
            {t.tagline}
          </span>
        </div>

        <nav style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '16px' }}>
          <Link to="/" style={{ color: '#0033cc' }}>{t.nav.feed}</Link>
          <Link to="/create" style={{ color: '#0033cc' }}>{t.nav.create}</Link>
          <Link to="/about" style={{ color: '#0033cc' }}>{t.nav.about}</Link>

          <div style={{ marginLeft: '20px', fontSize: '14px' }}>
            {LANG_OPTIONS.map((l, i) => (
              <span key={l.code}>
                {i > 0 && <span style={{ color: '#ccc' }}> / </span>}
                <button
                  style={S.langBtn(lang === l.code)}
                  onClick={() => setLang(l.code)}
                >
                  {l.label}
                </button>
              </span>
            ))}
          </div>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
