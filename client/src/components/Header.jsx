import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LANG_OPTIONS } from '../utils/i18n';
import { S } from '../utils/styles';
import { getMe, logout } from '../services/auth.service';
import { API_BASE_URL } from '../config';
import { useSettings } from '../context/SettingsContext';

export default function Header({ t, lang, setLang }) {
  const { fontSize, setFontSize } = useSettings();
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
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#000',
          textDecoration: 'none',
          whiteSpace: 'nowrap'
        }}>
          {t.siteName}
        </Link>
        <span style={{ fontSize: '0.875rem', color: '#999', whiteSpace: 'nowrap' }}>
          {t.tagline}
        </span>
      </div>

      <nav className="site-nav">
        <Link to="/" style={{ color: '#0033cc' }}>{t.nav.feed}</Link>
        <Link to="/create" style={{ color: '#0033cc' }}>{t.nav.create}</Link>
        <Link to="/about" style={{ color: '#0033cc' }}>{t.nav?.about || 'about'}</Link>

        <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div>
            {LANG_OPTIONS.map((l, i) => (
              <span key={l.code}>
                {i > 0 && <span style={{ color: '#ccc' }}> / </span>}
                <button style={S.langBtn(lang === l.code)} onClick={() => setLang(l.code)}>
                  {l.label}
                </button>
              </span>
            ))}
          </div>
          
          <div style={{ 
            marginLeft: '8px', 
            paddingLeft: '12px', 
            borderLeft: '1px solid #eee',
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            {['small', 'medium', 'large'].map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                style={{
                  ...S.langBtn(fontSize === size),
                  fontSize: size === 'small' ? '0.6875rem' : size === 'large' ? '0.9375rem' : '0.8125rem',
                }}
                title={t.settings?.[size]}
              >
                {t.settings?.[size]}
              </button>
            ))}
          </div>
        </div>

        {/* Auth section */}
        {user === undefined ? null : user ? (
          <>
            <Link to={`/users/${user.id}`} style={{ color: '#0033cc', fontWeight: 'bold' }}>{user.displayName}</Link>
            <button 
              onClick={handleLogout} 
              style={{ ...S.link, color: '#666', fontSize: '14px', marginLeft: '4px' }}
            >
              (sign out)
            </button>
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
