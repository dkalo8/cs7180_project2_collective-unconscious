import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { useLanguage } from '../context/LanguageContext';
import { CAT_KEY_MAP } from '../context/LanguageContext';

// Default category value must match backend schema default
const CATEGORIES = ['FREEWRITING', 'HAIKU', 'POEM', 'SHORT_NOVEL'];

const TIMEOUT_VALUES = ['', '1h', '6h', '12h', '24h', '48h', '7d'];
const PER_TURN_VALUES = ['', '1_sentence', '2_sentences', '1_paragraph', 'custom_word_count'];

export default function CreateLogPage() {
    const navigate = useNavigate();
    const { t, cat } = useLanguage();

    // Required fields
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('FREEWRITING');
    const [accessMode, setAccessMode] = useState('OPEN');
    const [turnMode, setTurnMode] = useState('FREESTYLE');

    // Advanced / optional
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [seed, setSeed] = useState('');
    const [participantLimit, setParticipantLimit] = useState('');
    const [turnLimit, setTurnLimit] = useState('');
    const [turnTimeout, setTurnTimeout] = useState('');
    const [perTurnLengthLimit, setPerTurnLengthLimit] = useState('');

    // UI state
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [createdLogId, setCreatedLogId] = useState(null);
    const [accessCode, setAccessCode] = useState(null);
    const [copyStatus, setCopyStatus] = useState('');

    const handleSubmit = async () => {
        setError(null);

        // Client-side validation
        if (!title.trim()) {
            return setError('Title is required');
        }

        let parsedLimit = null;
        if (participantLimit !== '') {
            parsedLimit = parseInt(participantLimit, 10);
            if (isNaN(parsedLimit) || parsedLimit < 2) {
                return setError('Participant limit must be at least 2');
            }
        }

        const parsedTurnLimit = turnLimit !== '' ? parseInt(turnLimit, 10) : null;

        try {
            setIsLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    category,
                    accessMode,
                    turnMode,
                    seed: seed.trim() || undefined,
                    participantLimit: parsedLimit,
                    turnLimit: parsedTurnLimit,
                    turnTimeout: turnTimeout || undefined,
                    perTurnLengthLimit: perTurnLengthLimit || undefined,
                }),
            });

            if (!res.ok) {
                let msg = 'An error occurred';
                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const body = await res.json();
                    msg = body.errors
                        ? Object.values(body.errors).flat().join(', ')
                        : body.error || 'An error occurred';
                } else {
                    msg = `Server error (${res.status}): ${res.statusText}`;
                }
                throw new Error(msg);
            }

            const newLog = await res.json();

            if (newLog.accessCode) {
                setCreatedLogId(newLog.id);
                setAccessCode(newLog.accessCode);
            } else {
                navigate(`/logs/${newLog.id}`);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyCode = async () => {
        if (!accessCode) return;
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(accessCode);
                setCopyStatus(t.log.copied);
                setTimeout(() => setCopyStatus(''), 2000);
            } else {
                setCopyStatus('Manual copy: ' + accessCode);
            }
        } catch {
            setCopyStatus('Failed to copy');
        }
    };

    const handleDone = () => {
        if (createdLogId) {
            navigate(`/logs/${createdLogId}`);
        }
    };

    return (
        <div className="create-form">
            <h1>{t.create.title}</h1>

            {error && (
                <p
                    role="alert"
                    style={{ color: 'red', marginBottom: 12 }}
                >
                    {error}
                </p>
            )}

            {/* Title */}
            <div style={{ marginBottom: 16 }}>
                <label htmlFor="log-title">
                    <strong>{t.create.logTitle} *</strong>
                </label>
                <br />
                <input
                    id="log-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t.create.logTitlePh}
                    style={{ width: '100%', marginTop: 4 }}
                />
            </div>

            {/* Category */}
            <div style={{ marginBottom: 16 }}>
                <label htmlFor="log-category">
                    <strong>{t.create.category}</strong>
                </label>
                <br />
                <select
                    id="log-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ marginTop: 4 }}
                >
                    {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                            {cat[CAT_KEY_MAP[c]]}
                        </option>
                    ))}
                </select>
            </div>

            {/* Access Mode */}
            <div style={{ marginBottom: 16 }}>
                <strong>{t.create.access}</strong>
                <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                    <label>
                        <input
                            type="radio"
                            name="accessMode"
                            value="OPEN"
                            checked={accessMode === 'OPEN'}
                            onChange={() => setAccessMode('OPEN')}
                        />{' '}
                        {t.create.open}
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="accessMode"
                            value="PRIVATE"
                            checked={accessMode === 'PRIVATE'}
                            onChange={() => setAccessMode('PRIVATE')}
                        />{' '}
                        {t.create.private}
                    </label>
                </div>
            </div>

            {/* Turn Mode */}
            <div style={{ marginBottom: 16 }}>
                <strong>{t.create.turnMode}</strong>
                <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                    <label>
                        <input
                            type="radio"
                            name="turnMode"
                            value="FREESTYLE"
                            checked={turnMode === 'FREESTYLE'}
                            onChange={() => setTurnMode('FREESTYLE')}
                        />{' '}
                        {t.create.freestyle}
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="turnMode"
                            value="STRUCTURED"
                            checked={turnMode === 'STRUCTURED'}
                            onChange={() => setTurnMode('STRUCTURED')}
                        />{' '}
                        {t.create.structured}
                    </label>
                </div>
            </div>

            <hr />

            {/* Advanced toggle */}
            <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', color: 'inherit', fontSize: 14 }}
            >
                {showAdvanced ? '▾' : '▸'} {t.create.advanced}
            </button>

            {showAdvanced && (
                <div style={{ marginTop: 12 }}>
                    {/* Seed */}
                    <div style={{ marginBottom: 12 }}>
                        <label htmlFor="log-seed">
                            {t.create.seed}
                        </label>
                        <br />
                        <textarea
                            id="log-seed"
                            value={seed}
                            onChange={(e) => setSeed(e.target.value)}
                            placeholder={t.create.seedPh}
                            style={{ width: '100%', marginTop: 4 }}
                        />
                    </div>

                    {/* Participant Limit */}
                    <div style={{ marginBottom: 12 }}>
                        <label htmlFor="participant-limit">
                            {t.create.participantLimit}
                        </label>
                        <br />
                        <input
                            id="participant-limit"
                            type="number"
                            min="2"
                            value={participantLimit}
                            onChange={(e) => setParticipantLimit(e.target.value)}
                            placeholder={t.create.unlimited}
                            style={{ maxWidth: 120, marginTop: 4 }}
                        />
                    </div>

                    {/* Turn Limit */}
                    <div style={{ marginBottom: 12 }}>
                        <label htmlFor="turn-limit">
                            {t.create.turnLimit}
                        </label>
                        <br />
                        <input
                            id="turn-limit"
                            type="number"
                            min="1"
                            value={turnLimit}
                            onChange={(e) => setTurnLimit(e.target.value)}
                            placeholder={t.create.unlimited}
                            style={{ maxWidth: 120, marginTop: 4 }}
                        />
                    </div>

                    {/* Turn Timeout */}
                    <div style={{ marginBottom: 12 }}>
                        <label htmlFor="turn-timeout">
                            {t.create.timeout}
                        </label>
                        <br />
                        <select
                            id="turn-timeout"
                            value={turnTimeout}
                            onChange={(e) => setTurnTimeout(e.target.value)}
                            style={{ marginTop: 4 }}
                        >
                            {t.create.timeoutOpts.map((opt, i) => (
                                <option key={i} value={TIMEOUT_VALUES[i]}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    {/* Per-turn Length Limit */}
                    <div style={{ marginBottom: 12 }}>
                        <label htmlFor="per-turn-length-limit">
                            {t.create.perTurn}
                        </label>
                        <br />
                        <select
                            id="per-turn-length-limit"
                            value={perTurnLengthLimit}
                            onChange={(e) => setPerTurnLengthLimit(e.target.value)}
                            style={{ marginTop: 4 }}
                        >
                            {t.create.perTurnOpts.map((opt, i) => (
                                <option key={i} value={PER_TURN_VALUES[i]}>{opt}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            <div style={{ marginTop: 24 }}>
                <button
                    id="submit-btn"
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="touch-target"
                >
                    {isLoading ? '...' : t.create.submit}
                </button>
            </div>

            {/* Access Code Modal */}
            {accessCode && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '32px',
                        borderRadius: '8px',
                        maxWidth: '400px',
                        width: '90%',
                        textAlign: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}>
                        <h2 style={{ marginTop: 0 }}>{t.access.title}</h2>
                        <p>{t.access.desc}</p>

                        <div style={{
                            fontSize: '32px',
                            fontWeight: 'bold',
                            letterSpacing: '4px',
                            margin: '24px 0',
                            padding: '12px',
                            border: '1px dashed #ccc',
                            backgroundColor: '#f9f9f9'
                        }}>
                            {accessCode}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button
                                onClick={handleCopyCode}
                                style={{ padding: '8px 16px', cursor: 'pointer' }}
                            >
                                {copyStatus || t.log.copy}
                            </button>
                            <button
                                onClick={handleDone}
                                style={{
                                    padding: '8px 16px',
                                    cursor: 'pointer',
                                    border: 'none',
                                    backgroundColor: 'black',
                                    color: 'white',
                                    borderRadius: '4px'
                                }}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
