// src/services/log.service.js

const API_BASE_URL = '/api/logs';

export const fetchLogs = async ({ category, page = 1, limit = 20 } = {}) => {
    let url = `${API_BASE_URL}?page=${page}&limit=${limit}`;
    if (category && category !== 'All') {
        url += `&category=${encodeURIComponent(category)}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch logs');
    }

    return response.json();
};
