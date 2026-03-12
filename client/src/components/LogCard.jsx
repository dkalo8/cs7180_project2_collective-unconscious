import { Link } from 'react-router-dom';
import { useLanguage, CAT_KEY_MAP } from '../context/LanguageContext';
import './LogCard.css';

const LogCard = ({ log }) => {
  const { cat } = useLanguage();
  const catKey = CAT_KEY_MAP[log.category];
  const translatedCategory = catKey ? cat[catKey] : log.category;
  
  const statusSuffix = log.status === 'COMPLETED' ? ', 已完成' : '';

  return (
    <div className="log-entry" data-testid="log-card">
      <div className="log-entry-header">
        <Link to={`/logs/${log.id}`} className="log-entry-title">
          {log.title}
        </Link>
        <span className="log-entry-meta">
          ({translatedCategory}{statusSuffix})
        </span>
      </div>
      
      <div className="log-entry-excerpt">
        {log.excerpt || "暂无内容"}
      </div>
    </div>
  );
};

export default LogCard;
