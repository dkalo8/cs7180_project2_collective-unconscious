import { Outlet, NavLink } from "react-router-dom";

export default function Layout() {
  return (
    <div>
      <header>
        <nav style={{
          padding: "12px 24px",
          display: "flex", gap: 16, alignItems: "center",
        }}>
          <NavLink to="/" style={{ color: 'black', fontWeight: 'bold', fontSize: '1.1rem', textDecoration: 'none' }}>
            Collective Unconscious
          </NavLink>
          <NavLink to="/">Feed</NavLink>
          <NavLink to="/create">Write</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
