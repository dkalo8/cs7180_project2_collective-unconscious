import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Default category value must match backend schema default
const CATEGORIES = ['Freewriting', 'Haiku', 'Poem', 'Short Novel', 'Flash Fiction'];

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

    // UI state
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

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
                }),
            });

            if (!res.ok) {
                const body = await res.json();
                const msg = body.errors
                    ? Object.values(body.errors).flat().join(', ')
                    : 'An error occurred';
                throw new Error(msg);
            }

            const newLog = await res.json();
            // Show the access code in a simple alert if private, then redirect to feed
            if (newLog.accessCode) {
                alert(`Log created!\nShare code: ${newLog.accessCode}`);
            }
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
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
        </div>
    );
}
