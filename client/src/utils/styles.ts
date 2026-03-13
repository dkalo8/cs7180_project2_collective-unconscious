export const COLORS = ["#FF0000","#FF8C00","#0000FF","#008000","#800080","#000000"];

export const S: any = {
  page: { fontFamily: "serif", fontSize: '1rem', color: "#000", background: "#fff", minHeight: "100vh", lineHeight: 1.6 },
  header: { padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 },
  link: { color: "#00e", cursor: "pointer", background: "none", border: "none", fontFamily: "inherit", fontSize: "inherit", textDecoration: "underline", padding: 0 },
  hr: { margin: "16px 0" },
  input: { fontFamily: "inherit", fontSize: '0.9375rem', border: "1px solid #000", padding: "3px 4px", width: "100%", boxSizing: "border-box", background: "#fff", borderRadius: 0 },
  select: { fontFamily: "inherit", fontSize: '0.9375rem', border: "1px solid #000", padding: "3px 4px" },
  btn: { fontFamily: "inherit", fontSize: '0.875rem', cursor: "pointer", background: "#d4d0c8", border: "1px solid #000", padding: "3px 12px" },
  body: { padding: "12px", maxWidth: 640 },
  muted: { color: "#888", fontSize: '0.8125rem' },
  label: { display: "block", marginBottom: 4, fontSize: '0.875rem', fontWeight: "bold" },
  fieldGroup: { marginBottom: 16 },
  langBtn: (active: any) => ({
    background: "none", border: "none", fontFamily: "inherit", fontSize: '0.8125rem',
    padding: "0 2px", cursor: "pointer",
    color: active ? "#000" : "#888",
    textDecoration: active ? "none" : "underline",
    fontWeight: active ? "bold" : "normal",
  }),
};
