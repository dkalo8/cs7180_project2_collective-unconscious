import React, { useState, useEffect } from 'react';
import LogCard from '../components/LogCard';
import { fetchLogs } from '../services/log.service';

export default function HomePage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true);
        const data = await fetchLogs({ page: 1, limit: 20 });
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
  }, []);

  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '32px', color: '#999', fontSize: '14px' }}>
        共 {total} 篇
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
