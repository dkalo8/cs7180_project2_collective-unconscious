import { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { useLanguage } from '../context/LanguageContext';

const THEMES = {
  plain: {
    id: 'plain',
    label: 'Plain',
    desc: 'White + serif',
  },
  notepad: {
    id: 'notepad',
    label: 'Notepad',
    desc: 'Windows 98',
  },
  stardew: {
    id: 'stardew',
    label: 'Stardew',
    desc: 'Valley style',
  },
};

const WIDTHS = {
  mobile: { id: 'mobile', label: 'Mobile', desc: '750px width', width: 750 },
  wide: { id: 'wide', label: 'Wide', desc: '1200px width', width: 1200 },
};

const PREVIEW_SCALE_MOBILE = 0.4;
const PREVIEW_SCALE_DESKTOP = 0.5;

function ThemePlain({ log, turns, colorMode }) {
  return (
    <div
      style={{
        background: '#fff',
        color: '#000',
        fontFamily: 'serif',
        border: '2px solid #000',
        padding: 60,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minHeight: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          fontSize: 48,
          fontWeight: 'bold',
          marginBottom: 24,
          lineHeight: 1.2,
        }}
      >
        {log.title}
      </div>
      <div style={{ fontSize: 28, lineHeight: 1.7, flex: 1 }}>
        {turns.map((turn, i) => {
          const writer = log.writers?.find((w) => w.id === turn.writerId);
          const color =
            colorMode === 'color' ? writer?.colorHex || '#000' : '#000';
          return (
            <p key={turn.id || i} style={{ color, margin: '0 0 18px 0' }}>
              {turn.isHidden ? '[content removed]' : turn.content}
            </p>
          );
        })}
      </div>

    </div>
  );
}

function ThemeNotepad({ log, turns, colorMode }) {
  return (
    <div
      style={{
        background: '#c0c0c0',
        fontFamily: "'MS Sans Serif', Tahoma, sans-serif",
        borderTop: '3px solid #fff',
        borderLeft: '3px solid #fff',
        borderRight: '3px solid #404040',
        borderBottom: '3px solid #404040',
        boxShadow: 'inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #808080',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minHeight: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Title bar */}
      <div
        style={{
          background: 'linear-gradient(90deg, #000080, #1084d0)',
          color: '#fff',
          fontSize: 20,
          fontWeight: 'bold',
          padding: '4px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          collective-unconscious.txt - Notepad
        </span>
        <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
          {['_', '□', '×'].map((btn) => (
            <span
              key={btn}
              style={{
                width: 28,
                height: 24,
                background: '#c0c0c0',
                borderTop: '2px solid #fff',
                borderLeft: '2px solid #fff',
                borderRight: '2px solid #404040',
                borderBottom: '2px solid #404040',
                fontSize: 16,
                lineHeight: '20px',
                textAlign: 'center',
                color: '#000',
              }}
            >
              {btn}
            </span>
          ))}
        </div>
      </div>
      {/* Menu bar */}
      <div
        style={{
          fontSize: 16,
          padding: '2px 6px',
          display: 'flex',
          gap: 16,
          color: '#000',
        }}
      >
        <span><u>F</u>ile</span>
        <span><u>E</u>dit</span>
        <span><u>S</u>earch</span>
        <span><u>H</u>elp</span>
      </div>
      {/* Content area */}
      <div
        style={{
          background: '#fff',
          margin: '0 3px',
          padding: 20,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'serif',
        }}
      >
        <div
          style={{
            fontWeight: 'bold',
            fontFamily: 'sans-serif',
            fontSize: 22,
            marginBottom: 16,
          }}
        >
          {log.title}
        </div>
        <div style={{ fontSize: 24, lineHeight: 1.6, flex: 1 }}>
          {turns.map((turn, i) => {
            const writer = log.writers?.find((w) => w.id === turn.writerId);
            const color =
              colorMode === 'color' ? writer?.colorHex || '#000' : '#000';
            return (
              <p key={turn.id || i} style={{ color, margin: '0 0 14px 0' }}>
                {turn.isHidden ? '[content removed]' : turn.content}
              </p>
            );
          })}
        </div>

      </div>
      {/* Status bar */}
      <div
        style={{
          background: '#c0c0c0',
          borderTop: '2px solid #808080',
          fontSize: 14,
          color: '#000',
          padding: '2px 8px',
          display: 'flex',
          gap: 8,
        }}
      >
        <span
          style={{
            border: '1px inset #c0c0c0',
            padding: '0 8px',
            flex: 1,
          }}
        >
          Writers: {log.writers?.length || 0}
        </span>
        <span
          style={{
            border: '1px inset #c0c0c0',
            padding: '0 8px',
            width: 120,
          }}
        >
          Turns: {turns.length}
        </span>
      </div>
    </div>
  );
}

function ThemeStardew({ log, turns, colorMode }) {
  return (
    <div
      style={{
        fontFamily: "'VT323', 'Courier New', monospace",
        imageRendering: 'pixelated',
        position: 'relative',
        background: '#f5ce7b',
        border: '6px solid #5c3a1e',
        boxShadow: 'inset 0 0 0 3px #e8b84b, inset 0 0 0 6px #8b5e34, 0 6px 0 #3a2210',
        width: '100%',
        minHeight: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Corner decorations */}
      {[
        { top: 6, left: 6, borderRight: 'none', borderBottom: 'none' },
        { top: 6, right: 6, borderLeft: 'none', borderBottom: 'none' },
        { bottom: 6, left: 6, borderRight: 'none', borderTop: 'none' },
        { bottom: 6, right: 6, borderLeft: 'none', borderTop: 'none' },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 14,
            height: 14,
            border: '3px solid #8b5e34',
            ...pos,
          }}
        />
      ))}
      {/* Inner padding */}
      <div
        style={{
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        {/* Title bar */}
        <div
          style={{
            background: '#b5722a',
            border: '3px solid #5c3a1e',
            boxShadow: 'inset 0 2px 0 #dda059, inset 0 -2px 0 #8b4513',
            color: '#fff',
            textAlign: 'center',
            padding: '8px 16px',
            fontSize: 26,
            letterSpacing: 2,
            margin: '-24px -24px 20px -24px',
            textShadow: '2px 2px 0 #3a2210',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              background: '#ffd921',
              transform: 'rotate(45deg)',
              flexShrink: 0,
              boxShadow: '0 0 0 1px #b5722a',
            }}
          />
          Collective Unconscious
          <span
            style={{
              width: 12,
              height: 12,
              background: '#ffd921',
              transform: 'rotate(45deg)',
              flexShrink: 0,
              boxShadow: '0 0 0 1px #b5722a',
            }}
          />
        </div>
        {/* Content box */}
        <div
          style={{
            background: '#fef4d6',
            border: '4px solid #8b5e34',
            boxShadow: 'inset 0 0 0 2px #e8d5a3, inset 3px 3px 0 #fff8e7',
            padding: 20,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              fontSize: 30,
              color: '#5c3a1e',
              marginBottom: 14,
              textShadow: '1px 1px 0 #e8d5a3',
              letterSpacing: 1,
            }}
          >
            {log.title}
          </div>
          <hr
            style={{
              border: 'none',
              borderTop: '3px solid #c99a4a',
              margin: '0 0 14px 0',
              opacity: 0.6,
            }}
          />
          <div style={{ flex: 1 }}>
            {turns.map((turn, i) => {
              const writer = log.writers?.find((w) => w.id === turn.writerId);
              const defaultColor = '#3a2210';
              const color =
                colorMode === 'color'
                  ? writer?.colorHex || defaultColor
                  : defaultColor;
              return (
                <p
                  key={turn.id || i}
                  style={{
                    fontSize: 22,
                    lineHeight: 1.5,
                    margin: '0 0 12px 0',
                    color,
                  }}
                >
                  {turn.isHidden ? '[content removed]' : turn.content}
                </p>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}

const THEME_COMPONENTS = {
  plain: ThemePlain,
  notepad: ThemeNotepad,
  stardew: ThemeStardew,
};

export default function ShareModal({ log, onClose }) {
  const { t } = useLanguage();
  const [theme, setTheme] = useState('plain');
  const [widthMode, setWidthMode] = useState('mobile');
  const [colorMode, setColorMode] = useState('color');
  const [exporting, setExporting] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const captureRef = useRef(null);

  const visibleTurns = (log.turns || []).filter((t) => !t.isSkip);
  const selectedWidth = WIDTHS[widthMode].width;
  const ThemeComponent = THEME_COMPONENTS[theme];

  // Measure content height whenever it might change
  useState(() => {
    const observer = new ResizeObserver(() => {
      if (captureRef.current) {
        setContentHeight(captureRef.current.scrollHeight);
      }
    });
    // We'll attach this in the render or via ref
    return () => observer.disconnect();
  }, []);

  // Simple effect to catch initial and updates
  const updateHeight = () => {
    if (captureRef.current) {
      setContentHeight(captureRef.current.scrollHeight);
    }
  };

  const handleDownload = async () => {
    if (!captureRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(captureRef.current, {
        cacheBust: true,
        quality: 1,
        pixelRatio: 2,
        width: selectedWidth,
        height: captureRef.current.scrollHeight,
      });
      const link = document.createElement('a');
      link.download = `collective-unconscious-${log.id || 'log'}-${theme}-${widthMode}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed', err);
      alert('Failed to generate image. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Correct way to re-measure height when theme/width changes
  useEffect(() => {
    // Initial and theme/width change update
    const timer = setTimeout(updateHeight, 50); 
    return () => clearTimeout(timer);
  }, [theme, widthMode, log]);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobileLayout = windowWidth < 768;
  const currentScale = isMobileLayout ? PREVIEW_SCALE_MOBILE : PREVIEW_SCALE_DESKTOP;

  const previewWidth = selectedWidth * currentScale;
  const previewHeight = (contentHeight || selectedWidth) * currentScale;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: isMobileLayout ? 'flex-start' : 'center', // Start from top on mobile to allow scrolling
        zIndex: 1000,
        padding: isMobileLayout ? '40px 10px' : 20, // More top padding on mobile
        overflowY: 'auto', // Enable scroll on overlay
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: 8,
          maxWidth: isMobileLayout ? '100%' : (theme === 'stardew' ? 1100 : 900),
          width: '100%',
          maxHeight: isMobileLayout ? 'none' : '92vh', // No height limit on mobile
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18 }}>{t.shareModal.title}</h2>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'none',
              fontSize: 24,
              cursor: 'pointer',
            }}
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: isMobileLayout ? 16 : 24,
            overflowY: isMobileLayout ? 'visible' : 'auto', // Entire modal scrolls on mobile
            display: 'flex',
            flexDirection: isMobileLayout ? 'column' : 'row',
            gap: 24,
          }}
        >
          {/* Controls */}
          <div style={{ width: isMobileLayout ? '100%' : 220, flexShrink: 0 }}>
            {/* Theme picker */}
            <h3 style={{ fontSize: 13, marginBottom: 8, color: '#666' }}>
              {t.shareModal.theme}
            </h3>
            <div
              style={{
                display: 'flex',
                flexDirection: isMobileLayout ? 'row' : 'column',
                flexWrap: 'wrap',
                gap: 6,
                marginBottom: 20,
              }}
            >
              {Object.values(THEMES).map((themeObj) => (
                <button
                  key={themeObj.id}
                  onClick={() => setTheme(themeObj.id)}
                  style={{
                    flex: isMobileLayout ? '1 1 auto' : 'none',
                    padding: '8px 10px',
                    textAlign: 'left',
                    borderRadius: 4,
                    border:
                      theme === themeObj.id ? '1px solid #000' : '1px solid #ddd',
                    background: theme === themeObj.id ? '#f0f0f0' : '#fff',
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  <strong>{t.shareModal[themeObj.id]}</strong>
                  {!isMobileLayout && (
                    <span style={{ color: '#999', marginLeft: 6 }}>
                      {themeObj.desc}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Width picker */}
            <h3 style={{ fontSize: 13, marginBottom: 8, color: '#666' }}>
              {t.shareModal.width}
            </h3>
            <div
              style={{
                display: 'flex',
                gap: 6,
                marginBottom: 20,
              }}
            >
              {Object.values(WIDTHS).map((w) => (
                <button
                  key={w.id}
                  onClick={() => setWidthMode(w.id)}
                  style={{
                    flex: 1,
                    padding: '6px 4px',
                    textAlign: 'center',
                    borderRadius: 4,
                    border:
                      widthMode === w.id ? '1px solid #000' : '1px solid #ddd',
                    background: widthMode === w.id ? '#f0f0f0' : '#fff',
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{t.shareModal[w.id]}</div>
                  <div style={{ fontSize: 10, color: '#999' }}>{t.shareModal[`${w.id}Desc`]}</div>
                </button>
              ))}
            </div>

            {/* Color toggle */}
            <h3 style={{ fontSize: 13, marginBottom: 8, color: '#666' }}>
              {t.shareModal.color}
            </h3>
            <div
              style={{
                display: 'flex',
                gap: 6,
                marginBottom: 24,
              }}
            >
              {[
                { key: 'color', label: t.shareModal.authors },
                { key: 'mono', label: t.shareModal.single },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setColorMode(opt.key)}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    textAlign: 'center',
                    borderRadius: 4,
                    border:
                      colorMode === opt.key
                        ? '1px solid #000'
                        : '1px solid #ddd',
                    background: colorMode === opt.key ? '#f0f0f0' : '#fff',
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Download button */}
            <button
              onClick={handleDownload}
              disabled={exporting}
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: exporting ? 'wait' : 'pointer',
                fontWeight: 'bold',
                fontSize: 13,
                marginBottom: isMobileLayout ? 20 : 0,
              }}
            >
              {exporting ? t.shareModal.exporting : t.shareModal.download}
            </button>
          </div>

          {/* Preview */}
          <div
            style={{
              flexGrow: 1,
              padding: isMobileLayout ? '0' : '20px', 
              borderRadius: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              minHeight: isMobileLayout ? 320 : 'none',
            }}
          >
            {/* Horizontal scroll wrapper for mobile wide images */}
            <div
              style={{
                width: '100%',
                overflowX: 'auto',
                display: 'flex',
                justifyContent: isMobileLayout && previewWidth > windowWidth ? 'flex-start' : 'center',
                padding: '0 20px 20px 20px', // Bottom padding for scrollbar visibility
                boxSizing: 'border-box',
                WebkitOverflowScrolling: 'touch', // Smooth momentum scroll
              }}
            >
              <div
                style={{
                  width: previewWidth,
                  height: previewHeight,
                  position: 'relative',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  flexShrink: 0, // Prevent shrinking in flex container
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: selectedWidth,
                    transform: `scale(${currentScale})`,
                    transformOrigin: 'top left',
                  }}
                >
                  <div
                    ref={(node) => {
                      captureRef.current = node;
                      if (node) updateHeight();
                    }}
                    style={{
                      width: selectedWidth,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <ThemeComponent
                      log={log}
                      turns={visibleTurns}
                      colorMode={colorMode}
                    />
                  </div>
                </div>
              </div>
            </div>
            {isMobileLayout && previewWidth > windowWidth - 40 && (
              <div style={{ fontSize: 11, color: '#999', marginTop: -10, marginBottom: 10 }}>
                ← Swipe to see full width →
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}