import { useState } from 'react';
import { S } from '../utils/styles';

/**
 * ReportButton
 * Small link/button to report a Turn or Log.
 * Opens a modal or inline form to select a reason.
 */
export default function ReportButton({ targetType, targetId, onReported }) {
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reported, setReported] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, reason }),
      });

      if (res.ok) {
        setReported(true);
        if (onReported) onReported();
        setTimeout(() => setShowForm(false), 2000);
      } else {
        alert('Failed to submit report. Please try again.');
      }
    } catch (err) {
      console.error('Report error:', err);
      alert('Error submitting report.');
    } finally {
      setSubmitting(false);
    }
  };

  if (reported) {
    return <span style={{ ...S.muted, fontSize: 11, marginLeft: 8 }}>Reported</span>;
  }

  if (showForm) {
    return (
      <div style={{ 
        display: 'inline-block', 
        marginLeft: 8, 
        padding: '4px 8px', 
        background: '#fff9f0', 
        border: '1px solid #ddd',
        borderRadius: 4,
        fontSize: 12,
        verticalAlign: 'middle'
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <select 
            style={{ ...S.select, fontSize: 11, padding: '1px 2px' }}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={submitting}
            required
          >
            <option value="">Reason...</option>
            <option value="spam">Spam</option>
            <option value="hateful">Hateful</option>
            <option value="off-topic">Off-topic</option>
            <option value="other">Other</option>
          </select>
          <button type="submit" style={{ ...S.btn, fontSize: 10, padding: '1px 4px' }} disabled={submitting || !reason}>
            {submitting ? '...' : 'Send'}
          </button>
          <button type="button" style={{ ...S.link, fontSize: 11, marginLeft: 2 }} onClick={() => setShowForm(false)} disabled={submitting}>
            Cancel
          </button>
        </form>
      </div>
    );
  }

  return (
    <button 
      style={{ ...S.link, fontSize: 11, marginLeft: 8, color: '#999', textDecoration: 'none' }} 
      onClick={() => setShowForm(true)}
    >
      [report]
    </button>
  );
}
