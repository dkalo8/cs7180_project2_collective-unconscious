import { useState } from 'react';
import { randomNick } from '../utils/nickname';
import { useLanguage } from '../context/LanguageContext';
import './WriteZone.css';

const DEFAULT_COLORS = ['#FF0000', '#FF8C00', '#0000FF', '#008000', '#800080', '#000000'];

function WriteZone({ colorHex, perTurnLengthLimit = 500, onSubmit, myWriter = null }) {
    const { t, lang } = useLanguage();
    const [content, setContent] = useState('');
    const [nickname, setNickname] = useState(myWriter?.nickname || '');
    const [placeholderNick] = useState(() => randomNick(lang));
    const [selectedColor, setSelectedColor] = useState(myWriter?.colorHex || colorHex || '#000000');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isReturningWriter = !!myWriter;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (!content.trim() || content.length > perTurnLengthLimit) {
            return;
        }

        setIsSubmitting(true);
        try {
            if (onSubmit) {
                await onSubmit({ content, nickname: nickname.trim() || placeholderNick, colorHex: selectedColor });
            }
            setContent('');
            setNickname('');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isOverLimit = content.length > perTurnLengthLimit;

    return (
        <div className="write-zone">
            <form onSubmit={handleSubmit}>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={t.log.placeholder}
                    className={isOverLimit ? 'over-limit' : ''}
                    style={{ color: selectedColor }}
                />
                <div className="write-zone-controls">
                    <span className={`char-count ${isOverLimit ? 'error' : ''}`}>
                        {content.length} / {perTurnLengthLimit}
                    </span>
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder={`${t.log.nickLabel} ${placeholderNick}`}
                        className="nickname-input"
                        disabled={isReturningWriter}
                    />
                    <div className="color-picker">
                        {DEFAULT_COLORS.map(c => (
                            <button
                                key={c}
                                type="button"
                                className={`color-option ${selectedColor === c ? 'selected' : ''}`}
                                style={{ backgroundColor: c }}
                                onClick={() => !isReturningWriter && setSelectedColor(c)}
                                disabled={isReturningWriter}
                                aria-label={`Select color ${c}`}
                            />
                        ))}
                        <input
                            type="color"
                            value={selectedColor}
                            onChange={(e) => setSelectedColor(e.target.value)}
                            className="custom-color-picker"
                            aria-label="Pick custom color"
                            disabled={isReturningWriter}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!content.trim() || isOverLimit || isSubmitting}
                        className="submit-button"
                    >
                        {t.log.submit}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default WriteZone;
