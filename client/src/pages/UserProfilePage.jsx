import { useParams } from 'react-router-dom';

export default function UserProfilePage() {
  const { username } = useParams();

  return (
    <div style={{ padding: 48 }}>
      <h2>User Profile Placeholder</h2>
      <p>Profile for user: {username}</p>
    </div>
  );
}
