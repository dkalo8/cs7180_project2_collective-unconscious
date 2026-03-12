import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { S } from '../utils/styles';

export default function ModerationPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminSecret, setAdminSecret] = useState(localStorage.getItem('adminSecret') || '');
  const [isAuthorized, setIsAuthorized] = useState(false);

  const fetchQueue = async (secret) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/moderation/queue`, {
        headers: { 'x-admin-secret': secret }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data);
        setIsAuthorized(true);
        localStorage.setItem('adminSecret', secret);
      } else if (res.status === 403 || res.status === 401) {
        setIsAuthorized(false);
      }
    } catch (err) {
      console.error('Fetch queue error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminSecret) {
      fetchQueue(adminSecret);
    } else {
      setLoading(false);
    }
  }, []);

  const handleAction = async (reportId, action) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/moderation/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret
        },
        body: JSON.stringify({ reportId, action }),
      });

      if (res.ok) {
        setReports(reports.filter(r => r.id !== reportId));
      } else {
        alert('Action failed');
      }
    } catch (err) {
      console.error('Action error:', err);
    }
  };

  if (loading) return <div style={S.body}>Loading queue...</div>;

  if (!isAuthorized) {
    return (
      <div style={S.body}>
        <h2>Moderation Access</h2>
        <div style={S.fieldGroup}>
          <label style={S.label}>Admin Secret</label>
          <input
            type="password"
            style={S.input}
            value={adminSecret}
            onChange={(e) => setAdminSecret(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchQueue(adminSecret)}
          />
        </div>
        <button style={S.btn} onClick={() => fetchQueue(adminSecret)}>Login to Moderation</button>
      </div>
    );
  }

  return (
    <div style={S.body}>
      <h2>Moderation Queue</h2>
      {reports.length === 0 ? (
        <p style={S.muted}>No pending reports.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reports.map(report => (
            <div key={report.id} style={{ border: '1px solid #000', padding: 12, background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <b style={{ textTransform: 'uppercase', fontSize: 12 }}>{report.targetType} Report</b>
                <span style={S.muted}>{new Date(report.createdAt).toLocaleString()}</span>
              </div>

              <div style={{ marginBottom: 8 }}>
                <span style={S.label}>Reason:</span> {report.reason}
              </div>

              <div style={{ marginBottom: 16, padding: 8, background: '#f5f5f5', fontStyle: 'italic', fontSize: 14 }}>
                "{report.targetSummary}"
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {report.targetType === 'TURN' && (
                  <button style={S.btn} onClick={() => handleAction(report.id, 'HIDE_TURN')}>Hide Turn</button>
                )}
                {report.targetType === 'LOG' && (
                  <button style={S.btn} onClick={() => handleAction(report.id, 'CLOSE_LOG')}>Close Log</button>
                )}
                <button style={{ ...S.btn, background: '#eee' }} onClick={() => handleAction(report.id, 'DISMISS')}>Dismiss</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
