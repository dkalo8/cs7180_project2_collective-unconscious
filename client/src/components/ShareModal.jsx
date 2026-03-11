import { useState, useRef } from 'react';
import { toPng } from 'html-to-image';

const THEMES = {
  minimal: {
    container: { background: '#fff', color: '#000', fontFamily: 'sans-serif', padding: '40px' },
    title: { fontSize: '32px', fontWeight: 'bold', marginBottom: '24px', borderBottom: '2px solid #000', paddingBottom: '8px' },
    content: { fontSize: '18px', lineHeight: '1.6' },
    watermark: { marginTop: '40px', fontSize: '12px', color: '#999', textAlign: 'center' }
  },
  nocturne: {
    container: { background: '#0a0a0c', color: '#fff', fontFamily: 'monospace', padding: '40px' },
    title: { fontSize: '32px', fontWeight: 'bold', marginBottom: '24px', color: '#0ff', textShadow: '0 0 10px #0ff' },
    content: { fontSize: '18px', lineHeight: '1.6' },
    watermark: { marginTop: '40px', fontSize: '12px', color: '#444', textAlign: 'center' }
  },
  parchment: {
    container: { background: '#f4ecd8', color: '#5d4037', fontFamily: 'serif', padding: '40px', border: '12px double #8d6e63' },
    title: { fontSize: '36px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center', fontStyle: 'italic' },
    content: { fontSize: '20px', lineHeight: '1.8' },
    watermark: { marginTop: '40px', fontSize: '14px', color: '#8d6e63', textAlign: 'center', opacity: 0.7 }
  }
};

export default function ShareModal({ log, onClose }) {
  const [theme, setTheme] = useState('minimal');
  const [exporting, setExporting] = useState(false);
  const captureRef = useRef(null);

  const handleDownload = async () => {
    if (!captureRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(captureRef.current, { cacheBust: true, quality: 1 });
      const link = document.createElement('a');
      link.download = `collective-unconscious-${log.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed', err);
      alert('Failed to generate image. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const currentTheme = THEMES[theme];
  const visibleTurns = (log.turns || []).filter(t => !t.isSkip);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center',
      alignItems: 'center', zIndex: 1000, padding: 20
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: 8, maxWidth: 900, width: '100%',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Share Log as Image</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 24, cursor: 'pointer' }}>&times;</button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: 24, overflowY: 'auto', display: 'flex', gap: 24 }}>
          {/* Controls */}
          <div style={{ width: 200, flexShrink: 0 }}>
            <h3 style={{ fontSize: 14, marginBottom: 12 }}>Pick a Theme</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.keys(THEMES).map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  style={{
                    padding: '8px 12px',
                    textAlign: 'left',
                    borderRadius: 4,
                    border: '1px solid #ddd',
                    background: theme === t ? '#eee' : '#fff',
                    cursor: 'pointer',
                    fontWeight: theme === t ? 'bold' : 'normal'
                  }}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            <div style={{ marginTop: 24 }}>
              <button
                onClick={handleDownload}
                disabled={exporting}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: exporting ? 'wait' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {exporting ? 'Generating...' : 'Download PNG'}
              </button>
            </div>
          </div>

          {/* Preview Canvas */}
          <div style={{ flexGrow: 1, backgroundColor: '#f0f0f0', padding: 20, borderRadius: 4, display: 'flex', justifyContent: 'center' }}>
            <div ref={captureRef} style={currentTheme.container}>
              <div style={currentTheme.title}>{log.title}</div>
              <div style={currentTheme.content}>
                {visibleTurns.map((turn, i) => {
                   const writer = log.writers?.find(w => w.id === turn.writerId);
                   return (
                     <p key={turn.id || i} style={{ color: writer?.colorHex || '#000', margin: '0 0 12px 0' }}>
                       {turn.isHidden ? '[content removed]' : turn.content}
                     </p>
                   );
                })}
              </div>
              <div style={currentTheme.watermark}>
                Written collaboratively on <strong>Collective Unconscious</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
