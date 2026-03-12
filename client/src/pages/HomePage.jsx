import { useState, useEffect } from 'react';
import LogCard from '../components/LogCard';
import { fetchLogs } from '../services/log.service';
import { useLanguage } from '../context/LanguageContext';
import { CAT_KEY_MAP } from '../context/LanguageContext';

const CATEGORIES = ['FREEWRITING', 'HAIKU', 'POEM', 'SHORT_NOVEL'];

export default function HomePage() {
  const { t, cat } = useLanguage();
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canWriteOnly, setCanWriteOnly] = useState(false);
  const [category, setCategory] = useState('');

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true);
        const data = await fetchLogs({ page: 1, limit: 20, canWrite: canWriteOnly, category });
        setLogs(data.data);
        setTotal(data.meta.totalCount);
        setError(null);
      } catch (err) {
        console.error('Failed to load logs', err);
        setError(t.feed.error);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canWriteOnly, category]);

  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#999', fontSize: '14px' }}>{t.feed.count(total)}</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              fontSize: '13px',
              padding: '4px 8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: '#fff',
              cursor: 'pointer',
            }}
          >
            <option value=''>{t.feed.allCategories}</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{cat[CAT_KEY_MAP[c]]}</option>
            ))}
          </select>
          <button
            onClick={() => setCanWriteOnly(v => !v)}
            style={{
              fontSize: '13px',
              padding: '4px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: canWriteOnly ? '#000' : '#fff',
              color: canWriteOnly ? '#fff' : '#333',
              cursor: 'pointer',
            }}
          >
            {t.feed.canWrite}
          </button>
        </div>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

      <div className="discovery-feed">
        {logs.length === 0 && !loading && !error ? (
          <p style={{ color: '#999' }}>{t.feed.empty}</p>
        ) : (
          logs.map(log => (
            <LogCard key={log.id} log={log} />
          ))
        )}
      </div>

      {loading && <p style={{ color: '#999' }}>{t.feed.loading}</p>}
    </div>
  );
}
