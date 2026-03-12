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
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'nowrap' }}>
        <Link to="/" style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#000',
          textDecoration: 'none',
          whiteSpace: 'nowrap'
        }}>
          {t.siteName}
        </Link>
        <span style={{ fontSize: '14px', color: '#999', whiteSpace: 'nowrap' }}>
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginLeft: '12px' }}>
            <Link to={`/users/${user.id}`} style={{ color: '#0033cc', fontWeight: '500' }}>{user.displayName}</Link>
            <button 
              onClick={handleLogout} 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#666', 
                textDecoration: 'underline', 
                cursor: 'pointer',
                padding: '0',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            >
              sign out
            </button>
          </div>
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
