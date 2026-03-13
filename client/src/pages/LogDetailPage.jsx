import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import WriteZone from '../components/WriteZone';
import ReportButton from '../components/ReportButton';
import { useState } from 'react';
import ShareModal from '../components/ShareModal';

import { API_BASE_URL } from '../config';
import { getLogById, closeLog } from '../services/log.service';
import { addReaction, removeReaction } from '../services/reaction.service';
import { useLanguage } from '../context/LanguageContext';

const submitTurnApi = async ({ logId, content, nickname, colorHex, accessCode, lang }) => {
    const res = await fetch(`${API_BASE_URL}/api/logs/${logId}/turns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content, nickname, colorHex, lang, ...(accessCode ? { accessCode } : {}) })
    });
    if (!res.ok) {
        let errorData = {};
        try {
            errorData = await res.json();
        } catch {
            // No JSON body
        }
        throw new Error(errorData.error || 'Failed to submit turn');
    }
    return res.json();
};

const skipTurnApi = async (logId) => {
    const res = await fetch(`${API_BASE_URL}/api/logs/${logId}/skip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });
    if (!res.ok) {
        let errorData = {};
        try {
            errorData = await res.json();
        } catch {
            // No JSON body
        }
        throw new Error(errorData.error || 'Failed to skip turn');
    }
    return res.json();
};

export default function LogDetailPage() {
    const { id } = useParams();
    const queryClient = useQueryClient();
    const { t, lang } = useLanguage();
    const [submitError, setSubmitError] = useState('');
    const [accessCode, setAccessCode] = useState('');
    // Tracks which writer the creator has selected to skip (defaults to nextWriter)
    const [skipTargetId, setSkipTargetId] = useState('');
    const [colorsHidden, setColorsHidden] = useState(
        () => sessionStorage.getItem('colorsHidden') === 'true'
    );

    const toggleColors = () => {
        setColorsHidden(prev => {
            const next = !prev;
            sessionStorage.setItem('colorsHidden', String(next));
            return next;
        });
    };
    const [showShareModal, setShowShareModal] = useState(false);
    const [reactions, setReactions] = useState({});
    const [reacted, setReacted] = useState({});

    const { data: log, isLoading, isError, error } = useQuery({
        queryKey: ['log', id],
        queryFn: () => getLogById(id),
    });

    const handleTurnSubmit = async ({ content, nickname, colorHex }) => {
        setSubmitError('');
        try {
            await submitTurnApi({ logId: id, content, nickname, colorHex, accessCode, lang });
            queryClient.invalidateQueries({ queryKey: ['log', id] });
        } catch (err) {
            setSubmitError(err.message);
        }
    };

    const handleSkipTurn = async () => {
        setSubmitError('');
        try {
            await skipTurnApi(id);
            queryClient.invalidateQueries({ queryKey: ['log', id] });
            setSkipTargetId('');
        } catch (err) {
            setSubmitError(err.message);
        }
    };

    const handleCloseLog = async () => {
        setSubmitError('');
        try {
            await closeLog(id);
            queryClient.invalidateQueries({ queryKey: ['log', id] });
        } catch (err) {
            setSubmitError(err.message);
        }
    };

    if (isLoading) return <div style={{ padding: 48 }}>Loading log...</div>;

    if (isError) {
        return (
            <div style={{ padding: 48, color: 'red' }}>
                <h2>Error</h2>
                <p>{error.message}</p>
            </div>
        );
    }

    if (!log) return null;

    const isCompleted = log.status === 'COMPLETED';

    // Seed reaction counts from server data (only on first load)
    if (log.reactions && Object.keys(reactions).length === 0 && Object.keys(log.reactions).length > 0) {
        setReactions(log.reactions);
    }

    const handleReact = async (symbol) => {
        if (reacted[symbol]) {
            try {
                const { count } = await removeReaction(id, symbol);
                setReactions(prev => ({ ...prev, [symbol]: count }));
                setReacted(prev => ({ ...prev, [symbol]: false }));
            } catch (e) { console.error(e); }
        } else {
            try {
                const { count } = await addReaction(id, symbol);
                setReactions(prev => ({ ...prev, [symbol]: count }));
                setReacted(prev => ({ ...prev, [symbol]: true }));
            } catch (e) { console.error(e); }
        }
    };

    // All turns are visible except skipped ones (skipped turns are invisible per design)
    const visibleTurns = (log.turns || []).filter(t => !t.isSkip);

    // For the skip dropdown: show all current participating writers
    const skipableWriters = log.writers || [];

    // Default the skip target to nextWriter if not yet picked
    const resolvedSkipTarget = skipTargetId || (log.nextWriter?.id ?? '');

    return (
        <div className="log-detail">
            {/* Header */}
            <div style={{ paddingBottom: 8, marginBottom: 24 }}>
                <div className="log-detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <h1 style={{ margin: '0 0 8px 0', fontSize: 24 }}>{log.title}</h1>
                    <div className="log-detail-actions" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button
                            onClick={toggleColors}
                            style={{
                                padding: '4px 10px',
                                fontSize: 13,
                                backgroundColor: '#d4d0c8',
                                border: '1px solid #000',
                                cursor: 'pointer',
                            }}
                        >
                            {colorsHidden ? 'Show colors' : 'Hide colors'}
                        </button>
                    {log.isCreator && !isCompleted && (
                        <button
                            onClick={handleCloseLog}
                            style={{
                                padding: '6px 14px',
                                fontSize: 13,
                                backgroundColor: '#fff',
                                border: '1px solid #ccc',
                                borderRadius: 4,
                                cursor: 'pointer',
                                color: '#c00',
                            }}
                        >
                            {t.log.close}
                        </button>
                    )}
                    {!log.isCreator && <ReportButton targetType="LOG" targetId={id} />}
                    </div>
                </div>
                <div style={{ color: '#666', fontSize: 14 }}>
                    {t.log.mode(log.turnMode?.toLowerCase())} &middot; {t.log.status(log.status)}
                    {log.turnLimit && <span> &middot; {t.log.round(log.turns?.length ?? 0, log.turnLimit)}</span>}
                </div>
            </div>

            {/* Turns content */}
            {visibleTurns.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 40 }}>
                    {visibleTurns.map((turn, index) => {
                        const writer = log.writers?.find(w => w.id === turn.writerId);
                        const textColor = colorsHidden ? '#000000' : (writer?.colorHex || '#000');
                        return (
                            <div key={turn.id || index} style={{ marginBottom: 12 }}>
                                <div style={{ fontSize: 20, lineHeight: 1.6, whiteSpace: 'pre-wrap', color: textColor, display: 'inline' }}>
                                    {turn.content}
                                </div>
                                {!turn.isHidden && <ReportButton targetType="TURN" targetId={turn.id} />}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p style={{ color: '#666', fontStyle: 'italic', marginBottom: 40 }}>{t.log.empty}</p>
            )}

            {/* Write zone / completed state */}
            {isCompleted ? (
                <div style={{ padding: '24px 0', textAlign: 'center', fontWeight: 'bold' }}>
                    <p style={{ margin: '0 0 16px 0', fontSize: 20 }}>{t.log.completed}</p>
                    <button 
                        onClick={() => setShowShareModal(true)}
                        style={{
                            marginBottom: 24,
                            padding: '6px 16px',
                            backgroundColor: '#d4d0c8',
                            color: '#000',
                            border: '2px solid #000',
                            cursor: 'pointer',
                            fontSize: 14,
                            fontWeight: 'bold'
                        }}
                    >
                        {t.log.shareAsImage}
                    </button>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 24, fontSize: 28, fontWeight: 'normal', color: '#666' }}>
                        {['✦', '◎', '∿', '⌖'].map(sym => (
                            <button
                                key={sym}
                                onClick={() => handleReact(sym)}
                                style={{
                                    background: 'none', border: 'none', fontFamily: 'inherit',
                                    fontSize: 28, cursor: 'pointer',
                                    opacity: reacted[sym] ? 1 : 0.4,
                                    padding: '2px 4px',
                                    display: 'flex', alignItems: 'center', gap: 4,
                                }}
                            >
                                {sym}
                                {(reactions[sym] || 0) > 0 && (
                                    <span style={{ fontSize: 12, color: '#888' }}>{reactions[sym]}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {submitError && (
                        <div style={{ color: 'red', marginBottom: 16, padding: '12px', border: '1px solid red', borderRadius: 4, backgroundColor: '#ffeeee' }}>
                            {submitError}
                        </div>
                    )}

                    {/* Bug 1 fix: only render WriteZone when it is the user's turn */}
                    {log.isMyTurn && log.accessMode === 'PRIVATE' && !log.myWriter ? (
                        <div style={{ marginBottom: 16 }}>
                            <p style={{ fontSize: 14, color: '#555', marginBottom: 8 }}>
                                {t.access.title}. {t.access.desc}
                            </p>
                            <input
                                type="text"
                                value={accessCode}
                                onChange={(e) => setAccessCode(e.target.value)}
                                placeholder={t.access.placeholder}
                                style={{
                                    padding: '6px 10px',
                                    fontSize: 14,
                                    border: '1px solid #ccc',
                                    borderRadius: 4,
                                    marginRight: 8,
                                    width: 180,
                                }}
                            />
                            {accessCode.trim() && (
                                <WriteZone
                                    logId={id}
                                    colorHex="#000"
                                    perTurnLengthLimit={log.perTurnLengthLimit || 500}
                                    onSubmit={handleTurnSubmit}
                                    myWriter={null}
                                />
                            )}
                        </div>
                    ) : log.isMyTurn ? (
                        <WriteZone
                            logId={id}
                            colorHex="#000"
                            perTurnLengthLimit={log.perTurnLengthLimit || 500}
                            onSubmit={handleTurnSubmit}
                            myWriter={log.myWriter || null}
                        />
                    ) : (
                        <div style={{ padding: '20px 0', color: '#888', fontStyle: 'italic', fontSize: 14 }}>
                            {log.turnMode === 'STRUCTURED' && (log.writers || []).length > 1 && log.nextWriter
                                ? <strong style={{ color: log.nextWriter.colorHex }}>{t.log.turnOf(log.nextWriter.nickname || 'Anonymous')}</strong>
                                : t.log.waitingNext}
                        </div>
                    )}

                    {/* Bug 4 + 5 fix: Skip button below WriteZone, no emoji, with dropdown */}
                    {log.isCreator && log.turnMode === 'STRUCTURED' && skipableWriters.length > 1 && (
                        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 13, color: '#555' }}>Skip the next turn of:</span>
                            <select
                                value={resolvedSkipTarget}
                                onChange={e => setSkipTargetId(e.target.value)}
                                style={{
                                    fontSize: 13,
                                    padding: '3px 8px',
                                    border: '1px solid #ccc',
                                    borderRadius: 4,
                                    backgroundColor: '#fff',
                                    cursor: 'pointer',
                                }}
                            >
                                {skipableWriters.map(w => (
                                    <option key={w.id} value={w.id}>
                                        {w.nickname || 'Anonymous'} (#{w.joinOrder})
                                        {log.nextWriter?.id === w.id ? ' ← next' : ''}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleSkipTurn}
                                style={{
                                    padding: '4px 12px',
                                    fontSize: 13,
                                    backgroundColor: '#f0f0f0',
                                    border: '1px solid #ccc',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    color: '#333',
                                }}
                            >
                                Skip Turn
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Writers list at the bottom — Bug 2 fix: only shows writers with actual turns */}
            {log.writers && log.writers.length > 0 && (
                <div style={{ paddingTop: 40, marginTop: 40, borderTop: '1px solid #eee', fontSize: 14, textAlign: 'left' }}>
                    {log.writers.map((w, index) => (
                        <span key={w.id} style={{ display: 'inline-flex', alignItems: 'center' }}>
                            <span style={{ color: w.colorHex, fontWeight: 'bold' }}>{w.nickname || 'Anonymous'}</span>
                            {index < log.writers.length - 1 && (
                                <span style={{ color: '#000', margin: '0 8px', fontWeight: 'bold' }}>
                                    {log.turnMode === 'STRUCTURED' ? '→' : ' '}
                                </span>
                            )}
                        </span>
                    ))}
                </div>
            )}

            {/* Skip event notes */}
            {(log.turns || []).some(t => t.isSkip) && (
                <div style={{ paddingTop: 12, fontSize: 12, color: '#000' }}>
                    {(log.turns || []).filter(t => t.isSkip).map(t => {
                        const skippedWriter = (log.writers || []).find(w => w.id === t.writerId);
                        const keeperName = log.keeperNickname || 'Log Keeper';
                        const skippedName = skippedWriter?.nickname || 'Anonymous';
                        return (
                            <div key={t.id}>* {keeperName} skipped {skippedName} for a turn</div>
                        );
                    })}
                </div>
            )}

            {showShareModal && (
                <ShareModal log={log} onClose={() => setShowShareModal(false)} />
            )}
        </div>
    );
}
