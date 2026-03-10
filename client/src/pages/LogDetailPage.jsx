import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import WriteZone from '../components/WriteZone';
import React, { useState } from 'react';

// Temporary mock fetches until we have an auth and api client exported
const fetchLog = async (id) => {
    const res = await fetch(`/api/logs/${id}`);
    if (!res.ok) throw new Error('Failed to fetch log');
    return res.json();
};

const submitTurn = async ({ logId, content, nickname }) => {
    const res = await fetch(`/api/logs/${logId}/turns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, nickname })
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit turn');
    }
    return res.json();
};

export default function LogDetailPage() {
    const { id } = useParams();
    const queryClient = useQueryClient();
    const [submitError, setSubmitError] = useState('');

    const { data: log, isLoading, isError, error } = useQuery({
        queryKey: ['log', id],
        queryFn: () => fetchLog(id),
    });

    const handleTurnSubmit = async ({ content, nickname }) => {
        setSubmitError('');
        try {
            await submitTurn({ logId: id, content, nickname });
            // Invalidate to refetch the log and get the new turn
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

    // Check if current user is eligible to write
    // For now we render WriteZone unconditionally until we hook up full Auth state
    // but in a real app this should only render if it's their turn
    const isCompleted = log.status === 'COMPLETED';

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ borderBottom: '2px solid #ccc', paddingBottom: 16, marginBottom: 24 }}>
                <h1 style={{ margin: '0 0 8px 0', fontSize: 24 }}>{log.title}</h1>
                <div style={{ color: '#666', fontSize: 14 }}>
                    Mode: {log.turnMode} &middot; Status: {log.status} 
                    {log.roundLimit && (<span> &middot; Round Limit: {log.roundLimit}</span>)}
                </div>
            </div>

            {log.turns && log.turns.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 40 }}>
                    {log.turns.map((turn, index) => {
                        // Find writer color, fallback to grey
                        const writer = log.writers?.find(w => w.id === turn.writerId);
                        const borderColor = writer?.colorHex || '#ccc';
                        const nickname = writer?.nickname || 'Anonymous';

                        return (
                            <div key={turn.id || index} style={{
                                paddingLeft: 16,
                                borderLeft: `6px solid ${borderColor}`,
                                paddingBottom: 8
                            }}>
                                <div style={{ fontSize: 16, lineHeight: 1.6, marginBottom: 8, whiteSpace: 'pre-wrap' }}>
                                    {turn.content}
                                </div>
                                <div style={{ fontSize: 12, color: '#888' }}>
                                    &mdash; {nickname}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p style={{ color: '#666', fontStyle: 'italic', marginBottom: 40 }}>No turns written yet.</p>
            )}

            {!isCompleted ? (
                <>
                    {submitError && (
                        <div style={{ color: 'red', marginBottom: 16, padding: '12px', border: '1px solid red', borderRadius: 4, backgroundColor: '#ffeeee' }}>
                            {submitError}
                        </div>
                    )}
                    <WriteZone 
                        logId={id} 
                        colorHex="#000" // Fallback color until we know current user's color
                        perTurnLengthLimit={log.perTurnLengthLimit || 500}
                        onSubmit={handleTurnSubmit}
                    />
                </>
            ) : (
                <div style={{ padding: 24, textAlign: 'center', backgroundColor: '#f9f9f9', borderTop: '2px solid #ccc', fontWeight: 'bold' }}>
                    This log has been completed.
                </div>
            )}
        </div>
    );
}
