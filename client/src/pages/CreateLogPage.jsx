import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Default category value must match backend schema default
const CATEGORIES = ['Freewriting', 'Haiku', 'Poem', 'Short Novel'];

export default function CreateLogPage() {
    const navigate = useNavigate();

    // Required fields
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Freewriting');
    const [accessMode, setAccessMode] = useState('OPEN');
    const [turnMode, setTurnMode] = useState('FREESTYLE');

    // Advanced / optional
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [seed, setSeed] = useState('');
    const [participantLimit, setParticipantLimit] = useState('');
    const [roundLimit, setRoundLimit] = useState('');
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

        const parsedRound = roundLimit !== '' ? parseInt(roundLimit, 10) : null;

        try {
            setIsLoading(true);
            const res = await fetch('/api/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    category,
                    accessMode,
                    turnMode,
                    seed: seed.trim() || undefined,
                    participantLimit: parsedLimit,
                    roundLimit: parsedRound,
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
                setCopyStatus('Copied!');
                setTimeout(() => setCopyStatus(''), 2000);
            } else {
                setCopyStatus('Manual copy: ' + accessCode);
            }
        } catch (err) {
            setCopyStatus('Failed to copy');
        }
    };

    const handleDone = () => {
        if (createdLogId) {
            navigate(`/logs/${createdLogId}`);
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: 600 }}>
            <h1>Create a New Log</h1>

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
                    <strong>Title *</strong>
                </label>
                <br />
                <input
                    id="log-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your log a title..."
                    style={{ width: '100%', marginTop: 4 }}
                />
            </div>

            {/* Category */}
            <div style={{ marginBottom: 16 }}>
                <label htmlFor="log-category">
                    <strong>Category</strong>
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
                            {c}
                        </option>
                    ))}
                </select>
            </div>

            {/* Access Mode */}
            <div style={{ marginBottom: 16 }}>
                <strong>Access Mode</strong>
                <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                    <label>
                        <input
                            type="radio"
                            name="accessMode"
                            value="OPEN"
                            checked={accessMode === 'OPEN'}
                            onChange={() => setAccessMode('OPEN')}
                        />{' '}
                        Open
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="accessMode"
                            value="PRIVATE"
                            checked={accessMode === 'PRIVATE'}
                            onChange={() => setAccessMode('PRIVATE')}
                        />{' '}
                        Private
                    </label>
                </div>
            </div>

            {/* Turn Mode */}
            <div style={{ marginBottom: 16 }}>
                <strong>Turn Mode</strong>
                <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                    <label>
                        <input
                            type="radio"
                            name="turnMode"
                            value="FREESTYLE"
                            checked={turnMode === 'FREESTYLE'}
                            onChange={() => setTurnMode('FREESTYLE')}
                        />{' '}
                        Freestyle
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="turnMode"
                            value="STRUCTURED"
                            checked={turnMode === 'STRUCTURED'}
                            onChange={() => setTurnMode('STRUCTURED')}
                        />{' '}
                        Structured
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
                {showAdvanced ? '▾' : '▸'} Advanced settings
            </button>

            {showAdvanced && (
                <div style={{ marginTop: 12 }}>
                    {/* Seed */}
                    <div style={{ marginBottom: 12 }}>
                        <label htmlFor="log-seed">
                            Seed / creative constraint
                        </label>
                        <br />
                        <textarea
                            id="log-seed"
                            value={seed}
                            onChange={(e) => setSeed(e.target.value)}
                            placeholder="Optional starting prompt..."
                            style={{ width: '100%', marginTop: 4 }}
                        />
                    </div>

                    {/* Participant Limit */}
                    <div style={{ marginBottom: 12 }}>
                        <label htmlFor="participant-limit">
                            Participant limit (blank = unlimited, min 2 if set)
                        </label>
                        <br />
                        <input
                            id="participant-limit"
                            type="number"
                            min="2"
                            value={participantLimit}
                            onChange={(e) => setParticipantLimit(e.target.value)}
                            placeholder="Unlimited"
                            style={{ maxWidth: 120, marginTop: 4 }}
                        />
                    </div>

                    {/* Round Limit */}
                    <div style={{ marginBottom: 12 }}>
                        <label htmlFor="round-limit">
                            Round limit (blank = unlimited)
                        </label>
                        <br />
                        <input
                            id="round-limit"
                            type="number"
                            min="1"
                            value={roundLimit}
                            onChange={(e) => setRoundLimit(e.target.value)}
                            placeholder="Unlimited"
                            style={{ maxWidth: 120, marginTop: 4 }}
                        />
                    </div>

                    {/* Turn Timeout */}
                    <div style={{ marginBottom: 12 }}>
                        <label htmlFor="turn-timeout">
                            Turn timeout
                        </label>
                        <br />
                        <select
                            id="turn-timeout"
                            value={turnTimeout}
                            onChange={(e) => setTurnTimeout(e.target.value)}
                            style={{ marginTop: 4 }}
                        >
                            <option value="">No timeout (default)</option>
                            <option value="1h">Auto-skip after 1 hour</option>
                            <option value="6h">Auto-skip after 6 hours</option>
                            <option value="12h">Auto-skip after 12 hours</option>
                            <option value="24h">Auto-skip after 24 hours</option>
                            <option value="48h">Auto-skip after 48 hours</option>
                            <option value="7d">Auto-skip after 7 days</option>
                        </select>
                    </div>

                    {/* Per-turn Length Limit */}
                    <div style={{ marginBottom: 12 }}>
                        <label htmlFor="per-turn-length-limit">
                            Per-turn length limit
                        </label>
                        <br />
                        <select
                            id="per-turn-length-limit"
                            value={perTurnLengthLimit}
                            onChange={(e) => setPerTurnLengthLimit(e.target.value)}
                            style={{ marginTop: 4 }}
                        >
                            <option value="">No limit (default)</option>
                            <option value="1_sentence">1 sentence</option>
                            <option value="2_sentences">2 sentences</option>
                            <option value="1_paragraph">1 paragraph</option>
                            <option value="custom_word_count">Custom word count</option>
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
                >
                    {isLoading ? 'Creating...' : 'Start Log'}
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
                        <h2 style={{ marginTop: 0 }}>Private Log Created</h2>
                        <p>Share this access code with participants you want to invite:</p>
                        
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
                                {copyStatus || 'Copy Code'}
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
