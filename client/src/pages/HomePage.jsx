import { useState, useEffect } from 'react';
import LogCard from '../components/LogCard';
import { fetchLogs } from '../services/log.service';

export default function HomePage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canWriteOnly, setCanWriteOnly] = useState(false);
  const [category, setCategory] = useState('');

  const CATEGORIES = ['Freewriting', 'Haiku', 'Poem', 'Short Novel'];

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
        setError('加载失败');
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, [canWriteOnly, category]);

  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#999', fontSize: '14px' }}>共 {total} 篇</span>
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
            <option value=''>所有类型</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
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
            可参与
          </button>
        </div>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

      <div className="discovery-feed">
        {logs.length === 0 && !loading && !error ? (
          <p style={{ color: '#999' }}>暂无内容</p>
        ) : (
          logs.map(log => (
            <LogCard key={log.id} log={log} />
          ))
        )}
      </div>

      {loading && <p style={{ color: '#999' }}>加载中...</p>}
    </div>
  );
}
