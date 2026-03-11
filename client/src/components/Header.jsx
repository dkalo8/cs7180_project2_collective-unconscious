import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LANG_OPTIONS } from '../utils/i18n';
import { S } from '../utils/styles';
import { getMe, loginWithGoogle, logout } from '../services/auth.service';

export default function Header({ t, lang, setLang }) {
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  return (
    <div style={S.header}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <Link to="/" style={{ ...S.link, textDecoration: 'none', fontWeight: 'bold' }}>
          {t.siteName}
        </Link>
        <span style={S.muted}>{t.tagline}</span>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', fontSize: 14 }}>
        <Link to="/" style={S.link}>{t.nav.feed}</Link>
        <Link to="/create" style={S.link}>{t.nav.create}</Link>
        <Link to="/about" style={S.link}>{t.nav?.about || 'about'}</Link>
        <span style={{ color: '#ccc' }}>|</span>

        {/* Language toggle */}
        <div style={{ display: 'flex', gap: 6 }}>
          {LANG_OPTIONS.map((l, i) => (
            <span key={l.code} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <button style={S.langBtn(lang === l.code)} onClick={() => setLang(l.code)}>
                {l.label}
              </button>
              {i < LANG_OPTIONS.length - 1 && (
                <span style={{ color: '#ccc', fontSize: 12 }}>/</span>
              )}
            </span>
          ))}
        </div>

        <span style={{ color: '#ccc' }}>|</span>

        {/* Auth section */}
        {user === undefined ? null : user ? (
          <>
            <Link to={`/users/${user.id}`} style={S.link}>{user.displayName}</Link>
            <button style={S.link} onClick={handleLogout}>sign out</button>
          </>
        ) : (
          <button style={S.link} onClick={loginWithGoogle}>sign in</button>
        )}
      </div>
    </div>
  );
}
