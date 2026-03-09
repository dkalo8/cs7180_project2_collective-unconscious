import { CAT } from '../utils/i18n';
import { S } from '../utils/styles';

export default function FeedPage({ t, logs, lang, onOpen }: any) {
  return (
    <div style={S.body}>
      <div style={{ ...S.muted, marginBottom: 16 }}>{t.feed.count(logs.length)}</div>
      {logs.map((log: any) => (
        <div key={log.id} style={{ marginBottom: 20 }}>
          <div>
            <button style={{ ...S.link, fontWeight: "bold", fontSize: 16 }} onClick={() => onOpen(log.id)}>{log.title}</button>
            <span style={{ ...S.muted, marginLeft: 8 }}>
              ({CAT[lang][log.catKey]}{log.status === "completed" ? ", " + t.feed.status.completed : ""})
            </span>
          </div>
          <div style={{ marginTop: 6, fontSize: 14, color: "#555" }}>
            {log.turns.slice(0, 2).map((turn: any, j: any) => (
              <div key={j} style={{ marginBottom: 2 }}>{turn.text}</div>
            ))}
            {log.turns.length > 2 && <div style={S.muted}>...</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
