// src/services/log.service.js

const API_BASE_URL = '/api/logs';

export const fetchLogs = async ({ category, page = 1, limit = 20, canWrite = false } = {}) => {
    let url = `${API_BASE_URL}?page=${page}&limit=${limit}`;
    if (category && category !== 'All') {
        url += `&category=${encodeURIComponent(category)}`;
    }
    if (canWrite) {
        url += '&canWrite=true';
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch logs');
    }

    return response.json();
};

export const getLogById = async (id) => {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Log not found');
        }
        throw new Error('Failed to fetch log details');
    }

    return response.json();
};

export const closeLog = async (logId) => {
    const response = await fetch(`${API_BASE_URL}/${logId}/close`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to close log');
    }
    return response.json();
};
