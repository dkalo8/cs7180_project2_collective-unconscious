import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProfile, getMe, updateProfile, logout } from '../services/auth.service';
import { S } from '../utils/styles';

export default function UserProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ displayName: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    Promise.all([
      getProfile(id).catch(() => null),
      getMe().catch(() => null),
    ]).then(([prof, me]) => {
      if (!prof) {
        setNotFound(true);
      } else {
        setProfile(prof);
        setFormData({ displayName: prof.displayName, bio: prof.bio || '' });
      }
      setCurrentUser(me);
    });
  }, [id]);

      const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const isOwner = currentUser && profile && currentUser.id === profile.id;

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await updateProfile(formData);
      setProfile((prev) => ({ ...prev, ...updated }));
      setEditing(false);
    } catch {
      setSaveError('Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (notFound) {
    return (
      <div style={S.body}>
        <p style={{ color: '#888' }}>User not found.</p>
        <Link to="/" style={S.link}>← Back to feed</Link>
      </div>
    );
  }

  if (!profile) {
    return <div style={S.body}><p style={S.muted}>Loading…</p></div>;
  }

  return (
    <div style={S.body}>
      {/* Profile Header */}
      <div style={{ marginBottom: 24 }}>
        {editing ? (
          <>
            <div style={S.fieldGroup}>
              <label style={S.label}>Display name</label>
              <input
                style={S.input}
                value={formData.displayName}
                onChange={(e) => setFormData((f) => ({ ...f, displayName: e.target.value }))}
              />
            </div>
            <div style={S.fieldGroup}>
              <label style={S.label}>Bio</label>
              <textarea
                style={{ ...S.input, height: 72, resize: 'vertical' }}
                value={formData.bio}
                onChange={(e) => setFormData((f) => ({ ...f, bio: e.target.value }))}
              />
            </div>
            {saveError && <p style={{ color: 'red', fontSize: 13 }}>{saveError}</p>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={S.btn} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button style={S.btn} onClick={() => setEditing(false)} disabled={saving}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>{profile.displayName}</h2>
            <p style={{ margin: '0 0 8px', color: '#555', fontSize: 14 }}>
              {profile.bio || <span style={S.muted}>No bio yet.</span>}
            </p>
            {isOwner && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={S.btn} onClick={() => setEditing(true)}>Edit</button>
                <button style={{ ...S.btn, color: 'red' }} onClick={handleLogout}>Sign out</button>
              </div>
            )}
          </>
        )}
      </div>

      <hr style={S.hr} />

      {/* Participation History */}
      <div>
        <h3 style={{ fontSize: 15, margin: '0 0 12px', fontWeight: 'bold' }}>Participation history</h3>
        {profile.participationHistory && profile.participationHistory.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {profile.participationHistory.map((log) => (
              <li key={log.id} style={{ marginBottom: 10, borderBottom: '1px solid #eee', paddingBottom: 10 }}>
                <Link to={`/logs/${log.id}`} style={S.link}>{log.title}</Link>
                <span style={{ ...S.muted, marginLeft: 8 }}>{log.category}</span>
                <span style={{ ...S.muted, marginLeft: 8 }}>
                  {log.status === 'COMPLETED' ? '✓ completed' : 'active'}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={S.muted}>No logs yet.</p>
        )}
      </div>
    </div>
  );
}
