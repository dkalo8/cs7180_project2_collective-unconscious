import { useState, useMemo } from 'react';
import { randomNick } from '../utils/nickname';
import { CAT } from '../utils/i18n';
import { S } from '../utils/styles';

export default function LogPage({ t, log, lang }: any) {
  const generatedNick = useMemo(() => randomNick(lang), [lang]);
  const [nickInput, setNickInput] = useState("");
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const [localReactions, setLocalReactions] = useState<any>(log.reactions || {});
  const [reacted, setReacted] = useState<any>({});

  const isCompleted = log.status === "completed";
  const isStructured = log.mode === "structured";

  const handleReact = (sym: any) => {
    if (reacted[sym]) return;
    setLocalReactions((prev: any) => ({ ...prev, [sym]: (prev[sym] || 0) + 1 }));
    setReacted((prev: any) => ({ ...prev, [sym]: true }));
  };

  return (
    <div style={S.body}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, margin: "0 0 4px 0" }}>{log.title}</h2>
        <div style={S.muted}>
          {CAT[lang][log.catKey]}
          {" · "}
          {t.log.mode(log.mode)}
          {" · "}
          {isCompleted ? t.log.closed : t.log.round(log.round, log.roundLimit)}
          {" · "}
          {log.participants.length} writers
        </div>
      </div>

      <hr style={S.hr} />

      <div style={{ marginBottom: 20 }}>
        {log.turns.map((turn: any, i: any) => (
          <div key={i} style={{
            borderLeft: `3px solid ${log.participants[turn.pid].color}`,
            paddingLeft: 12, marginBottom: 10, lineHeight: 1.7,
          }}>
            {turn.text}
          </div>
        ))}
      </div>

      {isCompleted && (
        <div style={{ marginTop: 8, marginBottom: 20, paddingTop: 12, borderTop: "1px solid #eee" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {["✦", "◎", "∿", "⌖"].map((sym: any) => (
              <button key={sym} onClick={() => handleReact(sym)} style={{
                background: "none", border: "none", fontFamily: "inherit",
                fontSize: 18, cursor: reacted[sym] ? "default" : "pointer",
                opacity: reacted[sym] ? 1 : 0.4, padding: "2px 4px",
                display: "flex", alignItems: "center", gap: 4,
              }}>
                {sym}
                {(localReactions[sym] || 0) > 0 && <span style={{ fontSize: 12, color: "#888" }}>{localReactions[sym]}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {!isCompleted && (
        <div style={{ paddingTop: 12 }}>
          {isStructured && (
            <div style={{ ...S.muted, marginBottom: 8 }}>
              {t.log.turnOf(log.participants[log.currentTurn]?.name || "?")}
            </div>
          )}
          <textarea
            style={{ ...S.input, minHeight: 64, resize: "vertical", marginBottom: 8 }}
            placeholder={t.log.placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flex: 1 }}>
              <input
                style={{ ...S.input, maxWidth: 180, fontSize: 13 }}
                placeholder={generatedNick}
                value={nickInput}
                onChange={(e) => setNickInput(e.target.value)}
              />
              <span style={{ ...S.muted, fontSize: 12, whiteSpace: "nowrap" }}>{t.log.nickLabel}</span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button style={{ ...S.link, fontSize: 13 }} onClick={() => {
                navigator.clipboard?.writeText("collectiveunconscious.xyz/log/" + log.id);
                setCopied(true); setTimeout(() => setCopied(false), 1500);
              }}>
                {copied ? t.log.copied : t.log.copy}
              </button>
              <button style={S.btn} onClick={() => setDraft("")}>{t.log.submit}</button>
            </div>
          </div>
        </div>
      )}

      {isStructured && !isCompleted && (
        <div style={{ marginTop: 16, fontSize: 13, color: "#888" }}>
          <span>{t.log.queue}: </span>
          {log.participants.map((p: any, i: any) => (
            <span key={i}>
              <span style={{ color: p.color }}>{p.name}</span>
              {i < log.participants.length - 1 ? " → " : ""}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
