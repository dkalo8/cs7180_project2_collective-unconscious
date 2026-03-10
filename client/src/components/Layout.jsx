import { Outlet, NavLink } from "react-router-dom";
import { S } from "../utils/styles";

export default function Layout() {
  return (
    <div style={S.page}>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        padding: "24px 48px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "linear-gradient(180deg, #08080888 0%, transparent 100%)",
        backdropFilter: "blur(2px)",
      }}>
        <NavLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span style={{
            fontFamily: "monospace", fontSize: 9,
            letterSpacing: "0.4em", textTransform: "uppercase",
            color: "#ffffff30",
          }}>
            C · U
          </span>
        </NavLink>

        <div style={{ display: "flex", gap: 32 }}>
          <NavLink
            to="/"
            style={({ isActive }) => ({
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "monospace", fontSize: 9, letterSpacing: "0.25em",
              textTransform: "uppercase", padding: 0, textDecoration: 'none',
              color: isActive ? "#ffffff60" : "#ffffff25",
              transition: "color 0.2s",
            })}
          >
            Feed
          </NavLink>
          <NavLink
            to="/create"
            style={({ isActive }) => ({
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "monospace", fontSize: 9, letterSpacing: "0.25em",
              textTransform: "uppercase", padding: 0, textDecoration: 'none',
              color: isActive ? "#ffffff60" : "#ffffff25",
              transition: "color 0.2s",
            })}
          >
            Write
          </NavLink>
          <NavLink
            to="/about"
            style={({ isActive }) => ({
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "monospace", fontSize: 9, letterSpacing: "0.25em",
              textTransform: "uppercase", padding: 0, textDecoration: 'none',
              color: isActive ? "#ffffff60" : "#ffffff25",
              transition: "color 0.2s",
            })}
          >
            About
          </NavLink>
        </div>
      </nav>

      <div style={{ position: "relative", zIndex: 2, paddingTop: 72 }}>
        <Outlet />
      </div>
    </div>
  );
}
