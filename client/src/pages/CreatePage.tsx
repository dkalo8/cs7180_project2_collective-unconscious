import { useState } from 'react';
import { CAT, CAT_KEYS } from '../utils/i18n';
import { S } from '../utils/styles';

export default function CreatePage({ t, lang, onCreated }: any) {
  const [isPrivate, setIsPrivate] = useState(false);
  const [mode, setMode] = useState("structured");
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div style={S.body}>
      <h2 style={{ fontSize: 20, margin: "0 0 16px 0" }}>{t.create.title}</h2>

      <div style={S.fieldGroup}>
        <label style={S.label}>{t.create.logTitle} *</label>
        <input style={S.input} placeholder={t.create.logTitlePh} />
      </div>

      <div style={S.fieldGroup}>
        <label style={S.label}>{t.create.category}</label>
        <select style={S.select}>
          {CAT_KEYS.map((k: any) => <option key={k} value={k}>{CAT[lang][k]}</option>)}
        </select>
      </div>

      <div style={S.fieldGroup}>
        <label style={S.label}>{t.create.access}</label>
        <div style={{ display: "flex", gap: 12, fontSize: 14 }}>
          <label><input type="radio" checked={!isPrivate} onChange={() => setIsPrivate(false)} /> {t.create.open}</label>
          <label><input type="radio" checked={isPrivate} onChange={() => setIsPrivate(true)} /> {t.create.private}</label>
        </div>
        {isPrivate && <input style={{ ...S.input, marginTop: 8, maxWidth: 240 }} placeholder={t.create.codePh} />}
      </div>

      <div style={S.fieldGroup}>
        <label style={S.label}>{t.create.turnMode}</label>
        <div style={{ display: "flex", gap: 12, fontSize: 14 }}>
          <label><input type="radio" checked={mode === "structured"} onChange={() => setMode("structured")} /> {t.create.structured}</label>
          <label><input type="radio" checked={mode === "freestyle"} onChange={() => setMode("freestyle")} /> {t.create.freestyle}</label>
        </div>
      </div>

      <div style={S.fieldGroup}>
        <label style={S.label}>{t.create.seed}</label>
        <textarea style={{ ...S.input, minHeight: 48, resize: "vertical" }} placeholder={t.create.seedPh} />
      </div>

      <hr style={S.hr} />

      <button style={{ ...S.link, fontSize: 14, marginBottom: 12 }} onClick={() => setShowAdvanced(!showAdvanced)}>
        {showAdvanced ? "▾" : "▸"} {t.create.advanced}
      </button>

      {showAdvanced && (
        <div>
          {mode === "structured" && (
            <div style={S.fieldGroup}>
              <label style={S.label}>{t.create.perTurn}</label>
              <select style={S.select}>{t.create.perTurnOpts.map((o: any, i: any) => <option key={i}>{o}</option>)}</select>
            </div>
          )}
          <div style={S.fieldGroup}>
            <label style={S.label}>{t.create.participantLimit}</label>
            <input style={{ ...S.input, maxWidth: 120 }} placeholder={t.create.unlimited} type="number" min="2" max="20" />
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>{t.create.roundLimit}</label>
            <input style={{ ...S.input, maxWidth: 120 }} placeholder={t.create.unlimited} type="number" min="1" max="50" />
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>{t.create.timeout}</label>
            <select style={S.select}>{t.create.timeoutOpts.map((o: any, i: any) => <option key={i}>{o}</option>)}</select>
          </div>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <button style={S.btn} onClick={() => onCreated()}>{t.create.submit}</button>
      </div>
    </div>
  );
}
