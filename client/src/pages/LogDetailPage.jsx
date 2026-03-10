import { useParams } from 'react-router-dom';

export default function LogDetailPage() {
  const { id } = useParams();

  return (
    <div style={{ padding: 48 }}>
      <h2>Log Detail Placeholder</h2>
      <p>Viewing log ID: {id}</p>
    </div>
  );
}
