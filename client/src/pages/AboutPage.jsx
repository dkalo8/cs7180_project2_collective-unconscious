import { S } from '../utils/styles';

export default function AboutPage({ t }) {
  return (
    <div style={S.body}>
      <h2 style={{ fontSize: 20, margin: "0 0 8px 0" }}>{t.nav.about}</h2>
      <p style={{ fontSize: 14, color: "#555" }}>{t.about}</p>
    </div>
  );
}
