import { S } from '../utils/styles';
import { useLanguage } from '../context/LanguageContext';

export default function AboutPage() {
  const { t } = useLanguage();
  
  return (
    <div style={S.body}>
      <h2 style={{ fontSize: 24, margin: "0 0 16px 0" }}>{t.nav.about}</h2>
      <p style={{ fontSize: 16, color: "#333", lineHeight: "1.6", marginBottom: "32px", whiteSpace: "pre-wrap" }}>
        {t.about}
      </p>

      <h3 style={{ fontSize: 20, margin: "0 0 12px 0" }}>{t.aboutTitle}</h3>
      <ul style={{ 
        paddingLeft: "20px", 
        fontSize: "15px", 
        color: "#444", 
        lineHeight: "1.8" 
      }}>
        {t.howItWorks.map((step, i) => (
          <li key={i} style={{ marginBottom: "8px" }}>{step}</li>
        ))}
      </ul>
    </div>
  );
}
