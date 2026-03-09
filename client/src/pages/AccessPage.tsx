import { useState } from 'react';
import { S } from '../utils/styles';

export default function AccessPage({ t, logTitle, onEnter }: any) {
  const [code, setCode] = useState("");
  const [wrong, setWrong] = useState(false);
  return (
    <div style={S.body}>
      <h2 style={{ fontSize: 20, margin: "0 0 8px 0" }}>{t.access.title}</h2>
      <p style={{ ...S.muted, marginBottom: 16 }}>{t.access.desc}</p>
      <p style={{ marginBottom: 12 }}>Log: <b>{logTitle}</b></p>
      <div style={{ display: "flex", gap: 8, maxWidth: 300 }}>
        <input style={S.input} placeholder={t.access.placeholder} value={code}
          onChange={(e) => { setCode(e.target.value); setWrong(false); }} />
        <button style={S.btn} onClick={() => { if (code === "1234") onEnter(); else setWrong(true); }}>{t.access.submit}</button>
      </div>
      {wrong && <div style={{ color: "#c00", fontSize: 14, marginTop: 8 }}>{t.access.wrong}</div>}
    </div>
  );
}
