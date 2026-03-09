export const COLORS = ["#E8927C","#7CA7E8","#A7E87C","#E8D77C","#C47CE8","#7CE8D7","#E87CA7","#B8B8B8"];

export const S: any = {
  page: { fontFamily: "serif", fontSize: 16, color: "#000", background: "#fff", minHeight: "100vh", lineHeight: 1.6 },
  header: { padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 },
  link: { color: "#00e", cursor: "pointer", background: "none", border: "none", fontFamily: "inherit", fontSize: "inherit", textDecoration: "underline", padding: 0 },
  hr: { margin: "16px 0" },
  input: { fontFamily: "inherit", fontSize: 15, border: "1px solid #000", padding: "3px 4px", width: "100%", boxSizing: "border-box", background: "#fff", borderRadius: 0 },
  select: { fontFamily: "inherit", fontSize: 15, border: "1px solid #000", padding: "3px 4px" },
  btn: { fontFamily: "inherit", fontSize: 14, cursor: "pointer", background: "#d4d0c8", border: "1px solid #000", padding: "3px 12px" },
  body: { padding: "12px", maxWidth: 640 },
  muted: { color: "#888", fontSize: 13 },
  label: { display: "block", marginBottom: 4, fontSize: 14, fontWeight: "bold" },
  fieldGroup: { marginBottom: 16 },
  langBtn: (active: any) => ({
    background: "none", border: "none", fontFamily: "inherit", fontSize: 13,
    padding: "0 2px", cursor: "pointer",
    color: active ? "#000" : "#888",
    textDecoration: active ? "none" : "underline",
    fontWeight: active ? "bold" : "normal",
  }),
};
