import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ padding: 48, textAlign: 'center' }}>
      <h2>404 - Not Found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" style={{ color: "#5BA8C4" }}>Return Home</Link>
    </div>
  );
}
