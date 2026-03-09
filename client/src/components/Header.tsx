import { LANG_OPTIONS } from '../utils/i18n';
import { S } from '../utils/styles';

export default function Header({ t, lang, setLang, onNav }: any) {
  return (
    <div style={S.header}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <b style={{ cursor: "pointer" }} onClick={() => onNav("feed")}>{t.siteName}</b>
        <span style={S.muted}>{t.tagline}</span>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "baseline", fontSize: 14 }}>
        <button style={S.link} onClick={() => onNav("feed")}>{t.nav.feed}</button>
        <button style={S.link} onClick={() => onNav("create")}>{t.nav.create}</button>
        <button style={S.link} onClick={() => onNav("about")}>{t.nav.about}</button>
        <span style={{ color: "#ccc" }}>|</span>
        <div style={{ display: "flex", gap: 6 }}>
          {LANG_OPTIONS.map((l: any, i: any) => (
            <span key={l.code} style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <button style={S.langBtn(lang === l.code)} onClick={() => setLang(l.code)}>{l.label}</button>
              {i < LANG_OPTIONS.length - 1 && <span style={{ color: "#ccc", fontSize: 12 }}>/</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
