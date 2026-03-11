export const addReaction = async (logId, symbol) => {
    const res = await fetch(`/api/logs/${logId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol }),
    });
    if (!res.ok) throw await res.json();
    return res.json();
};

export const removeReaction = async (logId, symbol) => {
    const res = await fetch(`/api/logs/${logId}/reactions`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol }),
    });
    if (!res.ok) throw await res.json();
    return res.json();
};
