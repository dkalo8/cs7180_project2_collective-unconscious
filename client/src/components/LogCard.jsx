import React from 'react';
import { Link } from 'react-router-dom';
import './LogCard.css';

const CATEGORY_MAP = {
  'Freewriting': '自由写作',
  'Haiku': '俳句',
  'Poem': '诗',
  'Short Novel': '短篇小说',
  'Flash Fiction': '闪小说',
};

const LogCard = ({ log }) => {
  const categoryChinese = CATEGORY_MAP[log.category] || log.category;
  const statusSuffix = log.status === 'COMPLETED' ? ', 已完成' : '';

  return (
    <div className="log-entry" data-testid="log-card">
      <div className="log-entry-header">
        <Link to={`/logs/${log.id}`} className="log-entry-title">
          {log.title}
        </Link>
        <span className="log-entry-meta">
          ({categoryChinese}{statusSuffix})
        </span>
      </div>
      
      <div className="log-entry-excerpt">
        {log.excerpt || "暂无内容"}
      </div>
    </div>
  );
};

export default LogCard;
