import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LANG_OPTIONS } from '../utils/i18n';
import { S } from '../utils/styles';
import { getMe, logout } from '../services/auth.service';
import { API_BASE_URL } from '../config';

export default function Header({ t, lang, setLang }) {
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate('/');
  };

  return (
    <header className="site-header">
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
        <Link to="/" style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#000',
          textDecoration: 'none'
        }}>
          {t.siteName}
        </Link>
        <span style={{ fontSize: '14px', color: '#999' }}>
          {t.tagline}
        </span>
      </div>

      <nav className="site-nav">
        <Link to="/" style={{ color: '#0033cc' }}>{t.nav.feed}</Link>
        <Link to="/create" style={{ color: '#0033cc' }}>{t.nav.create}</Link>
        <Link to="/about" style={{ color: '#0033cc' }}>{t.nav?.about || 'about'}</Link>

        <div style={{ fontSize: '14px' }}>
          {LANG_OPTIONS.map((l, i) => (
            <span key={l.code}>
              {i > 0 && <span style={{ color: '#ccc' }}> / </span>}
              <button style={S.langBtn(lang === l.code)} onClick={() => setLang(l.code)}>
                {l.label}
              </button>
            </span>
          ))}
        </div>

        {/* Auth section */}
        {user === undefined ? null : user ? (
          <>
            <Link to={`/users/${user.id}`} style={{ color: '#0033cc' }}>{user.displayName}</Link>
            <button style={{ ...S.link, color: '#0033cc' }} onClick={handleLogout}>sign out</button>
          </>
        ) : (
          <a 
            href={`${API_BASE_URL}/api/auth/google`} 
            style={{ ...S.link, color: '#0033cc', textDecoration: 'none' }}
          >
            sign in
          </a>
        )}
      </nav>
    </header>
  );
}
