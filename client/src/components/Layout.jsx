import { Outlet, Link } from "react-router-dom";

export default function Layout() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'baseline',
        paddingBottom: '20px',
        borderBottom: '1px solid #eeeeee',
        marginBottom: '40px'
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <Link to="/" style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#000', 
            textDecoration: 'none' 
          }}>
            集体潜意识
          </Link>
          <span style={{ fontSize: '14px', color: '#999' }}>
            协作接龙写作
          </span>
        </div>

        <nav style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '16px' }}>
          <Link to="/" style={{ color: '#0033cc' }}>广场</Link>
          <Link to="/create" style={{ color: '#0033cc' }}>新建</Link>
          <Link to="/about" style={{ color: '#0033cc' }}>关于</Link>
          
          <div style={{ marginLeft: '20px', color: '#ccc', fontSize: '14px' }}>
            <span style={{ color: '#333' }}>中文</span> / <span>EN</span> / <span>ES</span>
          </div>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
