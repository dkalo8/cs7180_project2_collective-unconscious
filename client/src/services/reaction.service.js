import { API_BASE_URL } from '../config';

const API_BASE = `${API_BASE_URL}/api/logs`;

export const addReaction = async (logId, symbol) => {
    const res = await fetch(`${API_BASE}/${logId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ symbol }),
    });
    if (!res.ok) throw await res.json();
    return res.json();
};

export const removeReaction = async (logId, symbol) => {
    const res = await fetch(`${API_BASE}/${logId}/reactions`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ symbol }),
    });
    if (!res.ok) throw await res.json();
    return res.json();
};
