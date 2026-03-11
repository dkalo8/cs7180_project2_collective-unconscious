import { useState } from 'react';
import './WriteZone.css';

function WriteZone({ colorHex, perTurnLengthLimit = 500, onSubmit }) {
    const [content, setContent] = useState('');
    const [nickname, setNickname] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!content.trim() || content.length > perTurnLengthLimit) {
            return;
        }

        if (onSubmit) {
            await onSubmit({ content, nickname: nickname.trim() });
        }
        
        setContent('');
        setNickname('');
    };

    const isOverLimit = content.length > perTurnLengthLimit;

    return (
        <div className="write-zone" style={{ borderLeftColor: colorHex }}>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type your turn..."
                    className={isOverLimit ? 'over-limit' : ''}
                />
                <div className="write-zone-controls">
                    <span className={`char-count ${isOverLimit ? 'error' : ''}`}>
                        {content.length} / {perTurnLengthLimit}
                    </span>
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Nickname (optional)"
                        className="nickname-input"
                    />
                    <button 
                        type="submit" 
                        disabled={!content.trim() || isOverLimit}
                        className="submit-button"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
}

export default WriteZone;
