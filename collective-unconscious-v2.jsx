import { useState, useEffect, useRef } from "react";

// ─── Color system ──────────────────────────────────────────────────────────────
const COLORS = {
  amber:   "#E8A838",
  rose:    "#D4607A",
  sky:     "#5BA8C4",
  violet:  "#8B6FC4",
  emerald: "#4AA889",
};

const SAMPLE_LOGS = [
  {
    id: 1,
    title: "the last cartographer",
    prompt: "Begin with a map that shows only what has been forgotten.",
    participants: ["amber", "rose", "sky"],
    turns: [
      { author: "Mira", color: "amber", text: "She spread the map across the table and we saw immediately that it showed only ocean — vast, unmarked, the kind of blue that means the cartographer had given up on land entirely." },
      { author: "Theo", color: "rose",  text: "\"He didn't give up,\" said the old keeper of records, pressing one finger to a faint smudge near the western edge. \"He remembered. The land was there once. He was accurate.\"" },
      { author: "K.",   color: "sky",   text: "Outside, the tide came in farther than it should have. We didn't say anything. We rolled the map carefully and tied it with a cord that had no knot we recognized." },
    ],
    complete: true,
    reactions: { "✦": 12, "◎": 8, "∿": 5 },
  },
  {
    id: 2,
    title: "a brief history of waiting rooms",
    prompt: "Every waiting room is the same room.",
    participants: ["violet", "emerald"],
    turns: [
      { author: "Olu",   color: "violet",  text: "The magazines are always from a season ago. The chairs are upholstered in a color chosen specifically to have no effect on anyone." },
      { author: "Sasha", color: "emerald", text: "Someone before you has left a crease in the exact chair you choose. You fit into it. This is not comfort — it is continuity." },
    ],
    complete: false,
    yourTurn: true,
    reactions: {},
  },
  {
    id: 3,
    title: "instructions for dismantling a lighthouse",
    prompt: "Write about something built to last that didn't.",
    participants: ["rose", "amber", "violet", "sky"],
    turns: [
      { author: "Penny", color: "rose",    text: "First, remove the light. This is harder than it sounds. Light doesn't come out in pieces." },
      { author: "Mira",  color: "amber",   text: "The lens, they told us, weighs as much as a small car. We didn't have a crane. We had time, which is heavier." },
      { author: "Olu",   color: "violet",  text: "By the third week the gulls had stopped landing on the rail. They had already revised their maps." },
      { author: "K.",    color: "sky",     text: "We left the stairs. You can still climb them. You come out at the top and there is nothing to see by — only what you brought with you." },
    ],
    complete: true,
    reactions: { "✦": 31, "◎": 14 },
  },
  {
    id: 4,
    title: "sleep paralysis, or: the body as archive",
    prompt: "You wake but cannot move. Something is in the room.",
    participants: ["sky", "rose"],
    turns: [
      { author: "K.",    color: "sky",  text: "It stands at the edge of where the light should be, which is to say: it stands where all my fears keep their furniture." },
    ],
    complete: false,
    yourTurn: false,
    reactions: {},
  },
];

const WEEKLY_PROMPT = {
  text: "Write about something that only exists in the moment before sleep.",
  number: "VII",
};

// ─── Noise / grain overlay via SVG ────────────────────────────────────────────
const GrainOverlay = () => (
  <svg style={{
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    pointerEvents: "none", zIndex: 100, opacity: 0.035,
  }}>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#grain)" />
  </svg>
);

// ─── Floating particle field ───────────────────────────────────────────────────
function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 38 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.2 + 0.2,
      dx: (Math.random() - 0.5) * 0.18,
      dy: -(Math.random() * 0.25 + 0.05),
      alpha: Math.random() * 0.4 + 0.05,
      color: Object.values(COLORS)[Math.floor(Math.random() * 5)],
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.round(p.alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width; }
        if (p.x < -5) p.x = canvas.width + 5;
        if (p.x > canvas.width + 5) p.x = -5;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />;
}

// ─── Home Screen ──────────────────────────────────────────────────────────────
function HomeScreen({ onNavigate }) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(null);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Hero */}
      <div style={{
        padding: "80px 48px 64px",
        maxWidth: 720,
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(16px)",
        transition: "opacity 0.9s ease, transform 0.9s ease",
      }}>
        {/* Eyebrow */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14, marginBottom: 40,
        }}>
          <div style={{ width: 32, height: 1, background: "#ffffff18" }} />
          <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.3em", color: "#ffffff28", textTransform: "uppercase" }}>
            collective unconscious
          </span>
        </div>

        {/* Weekly prompt */}
        <div style={{ marginBottom: 56 }}>
          <div style={{
            fontFamily: "monospace", fontSize: 9, letterSpacing: "0.25em",
            color: "#ffffff30", textTransform: "uppercase", marginBottom: 20,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span>Prompt {WEEKLY_PROMPT.number}</span>
            <span style={{ color: "#ffffff15" }}>————</span>
            <span style={{ color: "#ffffff18" }}>this week</span>
          </div>

          <div style={{
            fontFamily: "'IM Fell English', 'Palatino Linotype', Georgia, serif",
            fontSize: 38, lineHeight: 1.35,
            color: "#e8e0d4",
            fontStyle: "italic",
            marginBottom: 32,
            textShadow: "0 0 80px rgba(232,168,56,0.08)",
            letterSpacing: "-0.01em",
          }}>
            "{WEEKLY_PROMPT.text}"
          </div>

          <button
            onClick={() => onNavigate("write")}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: COLORS.amber,
              fontFamily: "monospace",
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              opacity: 0.8,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0.8}
          >
            <span>Begin a log</span>
            <svg width="28" height="1" viewBox="0 0 28 1"><line x1="0" y1="0.5" x2="28" y2="0.5" stroke={COLORS.amber} strokeWidth="1" /></svg>
            <svg width="5" height="8" viewBox="0 0 5 8"><polyline points="0,0 5,4 0,8" fill="none" stroke={COLORS.amber} strokeWidth="1" /></svg>
          </button>
        </div>

        {/* Divider */}
        <div style={{ width: "100%", height: 1, background: "linear-gradient(90deg, #ffffff08, transparent)", marginBottom: 48 }} />
      </div>

      {/* Log list */}
      <div style={{
        flex: 1,
        padding: "0 48px 80px",
        opacity: visible ? 1 : 0,
        transition: "opacity 1s ease 0.2s",
      }}>
        <div style={{
          fontFamily: "monospace", fontSize: 9, letterSpacing: "0.25em",
          color: "#ffffff20", textTransform: "uppercase", marginBottom: 28,
        }}>
          Recent works
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {SAMPLE_LOGS.map((log, i) => {
            const isHovered = hovered === log.id;
            return (
              <div
                key={log.id}
                onClick={() => onNavigate("write", log)}
                onMouseEnter={() => setHovered(log.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  padding: "28px 0",
                  borderBottom: "1px solid #ffffff07",
                  cursor: "pointer",
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 24,
                  alignItems: "center",
                  transition: "all 0.3s ease",
                  opacity: isHovered ? 1 : 0.7,
                }}
              >
                <div>
                  {/* Status + your turn */}
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                      {log.participants.map((c, ci) => (
                        <div key={ci} style={{
                          width: 5, height: 5, borderRadius: "50%",
                          background: COLORS[c],
                          boxShadow: isHovered ? `0 0 6px ${COLORS[c]}99` : "none",
                          transition: "box-shadow 0.3s",
                        }} />
                      ))}
                    </div>
                    {log.yourTurn && (
                      <span style={{
                        fontFamily: "monospace", fontSize: 8,
                        letterSpacing: "0.2em", textTransform: "uppercase",
                        color: COLORS.amber, opacity: 0.9,
                      }}>
                        your turn
                      </span>
                    )}
                    {log.complete && (
                      <span style={{
                        fontFamily: "monospace", fontSize: 8,
                        letterSpacing: "0.2em", textTransform: "uppercase",
                        color: "#ffffff25",
                      }}>
                        complete
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div style={{
                    fontFamily: "'IM Fell English', 'Palatino Linotype', Georgia, serif",
                    fontSize: 20,
                    color: isHovered ? "#f0ebe3" : "#c8c0b4",
                    fontStyle: "italic",
                    marginBottom: 6,
                    letterSpacing: "-0.01em",
                    transition: "color 0.3s",
                  }}>
                    {log.title}
                  </div>

                  {/* Prompt */}
                  <div style={{
                    fontFamily: "monospace", fontSize: 10,
                    color: "#ffffff22",
                    lineHeight: 1.5,
                    letterSpacing: "0.03em",
                  }}>
                    {log.prompt}
                  </div>
                </div>

                {/* Arrow */}
                <div style={{
                  opacity: isHovered ? 0.6 : 0,
                  transform: isHovered ? "translateX(0)" : "translateX(-6px)",
                  transition: "all 0.25s ease",
                  color: COLORS.amber,
                  fontFamily: "monospace",
                  fontSize: 14,
                }}>
                  →
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Write Screen ─────────────────────────────────────────────────────────────
function WriteScreen({ log: passedLog, onNavigate }) {
  const log = passedLog ?? SAMPLE_LOGS[1];
  const userColor = "emerald";
  const userName = "you";
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const textareaRef = useRef(null);
  const MAX = 600;

  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

  const handleChange = e => { if (e.target.value.length <= MAX) setText(e.target.value); };
  const handleSubmit = () => { if (text.trim()) setSubmitted(true); };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Back */}
      <div style={{
        padding: "36px 48px 0",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.6s",
      }}>
        <button
          onClick={() => onNavigate("home")}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "monospace", fontSize: 9, letterSpacing: "0.25em",
            color: "#ffffff25", textTransform: "uppercase", padding: 0,
            display: "flex", alignItems: "center", gap: 8,
            transition: "color 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "#ffffff50"}
          onMouseLeave={e => e.currentTarget.style.color = "#ffffff25"}
        >
          <svg width="14" height="1" viewBox="0 0 14 1"><line x1="14" y1="0.5" x2="0" y2="0.5" stroke="currentColor" strokeWidth="1" /></svg>
          back
        </button>
      </div>

      <div style={{
        flex: 1, padding: "40px 48px 80px",
        maxWidth: 700,
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(12px)",
        transition: "opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s",
      }}>
        {/* Log header */}
        <div style={{ marginBottom: 52 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
            {log.participants.concat([userColor]).filter((c,i,a)=>a.indexOf(c)===i).map((c, i) => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: "50%",
                background: COLORS[c], opacity: 0.7,
              }} />
            ))}
          </div>
          <div style={{
            fontFamily: "'IM Fell English', 'Palatino Linotype', Georgia, serif",
            fontSize: 28, color: "#d8d0c8",
            fontStyle: "italic", letterSpacing: "-0.01em",
            marginBottom: 10,
          }}>
            {log.title}
          </div>
          {log.prompt && (
            <div style={{
              fontFamily: "monospace", fontSize: 10, color: "#ffffff22",
              letterSpacing: "0.05em", lineHeight: 1.6,
            }}>
              {log.prompt}
            </div>
          )}
        </div>

        {/* Transcript */}
        <div style={{ marginBottom: 52 }}>
          {log.turns.map((turn, i) => (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: "2px 1fr",
              gap: "0 24px",
              marginBottom: 36,
              opacity: 1,
            }}>
              {/* Color spine */}
              <div style={{
                background: `linear-gradient(180deg, ${COLORS[turn.color]}55, ${COLORS[turn.color]}00)`,
                borderRadius: 1,
                minHeight: 60,
              }} />

              <div>
                {/* Author */}
                <div style={{
                  fontFamily: "monospace", fontSize: 9,
                  color: COLORS[turn.color] + "99",
                  letterSpacing: "0.2em", textTransform: "uppercase",
                  marginBottom: 10,
                }}>
                  {turn.author}
                </div>

                {/* Text */}
                <p style={{
                  fontFamily: "'IM Fell English', 'Palatino Linotype', Georgia, serif",
                  fontSize: 17, lineHeight: 1.85,
                  color: "#b8b0a8",
                  margin: 0,
                  fontStyle: "italic",
                }}>
                  {turn.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Write zone */}
        {!submitted ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "2px 1fr",
            gap: "0 24px",
          }}>
            {/* Your color spine — glows when focused */}
            <div style={{
              background: focused
                ? `linear-gradient(180deg, ${COLORS[userColor]}, ${COLORS[userColor]}00)`
                : `linear-gradient(180deg, ${COLORS[userColor]}44, ${COLORS[userColor]}00)`,
              borderRadius: 1,
              minHeight: 120,
              transition: "background 0.4s ease",
              boxShadow: focused ? `0 0 16px ${COLORS[userColor]}44` : "none",
            }} />

            <div>
              <div style={{
                fontFamily: "monospace", fontSize: 9,
                color: focused ? COLORS[userColor] + "cc" : COLORS[userColor] + "55",
                letterSpacing: "0.2em", textTransform: "uppercase",
                marginBottom: 10,
                transition: "color 0.3s",
              }}>
                {userName}
              </div>

              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="continue the piece…"
                rows={6}
                style={{
                  width: "100%",
                  background: "none", border: "none", outline: "none",
                  resize: "none", padding: 0,
                  fontFamily: "'IM Fell English', 'Palatino Linotype', Georgia, serif",
                  fontSize: 17, lineHeight: 1.85,
                  fontStyle: "italic",
                  color: "#d8d0c8",
                  caretColor: COLORS[userColor],
                  boxSizing: "border-box",
                }}
              />

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 20,
                paddingTop: 16,
                borderTop: "1px solid #ffffff07",
              }}>
                <span style={{
                  fontFamily: "monospace", fontSize: 9,
                  color: text.length > MAX * 0.88 ? "#c4606088" : "#ffffff18",
                  letterSpacing: "0.1em",
                  transition: "color 0.3s",
                }}>
                  {text.length} / {MAX}
                </span>

                <button
                  disabled={!text.trim()}
                  onClick={handleSubmit}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: text.trim() ? "pointer" : "default",
                    padding: 0,
                    display: "flex", alignItems: "center", gap: 10,
                    fontFamily: "monospace", fontSize: 9,
                    letterSpacing: "0.2em", textTransform: "uppercase",
                    color: text.trim() ? COLORS[userColor] : "#ffffff15",
                    opacity: text.trim() ? 1 : 0.4,
                    transition: "all 0.2s",
                  }}
                >
                  <span>Submit turn</span>
                  <svg width="20" height="1" viewBox="0 0 20 1"><line x1="0" y1="0.5" x2="20" y2="0.5" stroke="currentColor" strokeWidth="1" /></svg>
                  <svg width="4" height="7" viewBox="0 0 4 7"><polyline points="0,0 4,3.5 0,7" fill="none" stroke="currentColor" strokeWidth="1" /></svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "flex-start", gap: 20,
            paddingLeft: 26,
            borderLeft: `2px solid ${COLORS[userColor]}33`,
          }}>
            <div style={{
              fontFamily: "'IM Fell English', 'Palatino Linotype', Georgia, serif",
              fontSize: 20, fontStyle: "italic", color: "#888",
            }}>
              Turn submitted.
            </div>
            <div style={{
              fontFamily: "monospace", fontSize: 9,
              color: "#ffffff20", letterSpacing: "0.15em",
            }}>
              We'll reach you when the piece moves again.
            </div>
            <button
              onClick={() => onNavigate("home")}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "monospace", fontSize: 9, letterSpacing: "0.2em",
                color: "#ffffff25", textTransform: "uppercase", padding: 0,
                marginTop: 8, transition: "color 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = "#ffffff50"}
              onMouseLeave={e => e.currentTarget.style.color = "#ffffff25"}
            >
              Return to the feed →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("home");
  const [activeLog, setActiveLog] = useState(null);

  const navigate = (s, log = null) => { setScreen(s); if (log) setActiveLog(log); };

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#e0d8d0", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; }
        textarea::placeholder { color: #ffffff14; font-style: italic; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ffffff10; }
        ::selection { background: rgba(74,168,137,0.2); }
      `}</style>

      {/* Radial vignette */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1,
        background: "radial-gradient(ellipse at 50% 40%, transparent 30%, #000000cc 100%)",
      }} />

      {/* Subtle top glow */}
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: 600, height: 300, pointerEvents: "none", zIndex: 1,
        background: "radial-gradient(ellipse at 50% 0%, rgba(232,168,56,0.04), transparent 70%)",
      }} />

      <GrainOverlay />
      <Particles />

      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        padding: "24px 48px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "linear-gradient(180deg, #08080888 0%, transparent 100%)",
        backdropFilter: "blur(2px)",
      }}>
        <button
          onClick={() => navigate("home")}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <span style={{
            fontFamily: "monospace", fontSize: 9,
            letterSpacing: "0.4em", textTransform: "uppercase",
            color: "#ffffff30",
          }}>
            C · U
          </span>
        </button>

        <div style={{ display: "flex", gap: 32 }}>
          {[["Feed", "home"], ["Write", "write"]].map(([label, s]) => (
            <button
              key={s}
              onClick={() => navigate(s)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "monospace", fontSize: 9, letterSpacing: "0.25em",
                textTransform: "uppercase", padding: 0,
                color: screen === s ? "#ffffff60" : "#ffffff25",
                transition: "color 0.2s",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Screen content — padded for nav */}
      <div style={{ position: "relative", zIndex: 2, paddingTop: 72 }}>
        {screen === "home" && <HomeScreen onNavigate={navigate} />}
        {screen === "write" && <WriteScreen log={activeLog} onNavigate={navigate} />}
      </div>
    </div>
  );
}
