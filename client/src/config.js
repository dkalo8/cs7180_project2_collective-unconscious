// src/config.js
const rawEnvUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || 'http://127.0.0.1:3000';
// In production, we use /api which is a relative path. In local dev, we use the absolute URL.
export const API_BASE_URL = rawEnvUrl.startsWith('/') ? rawEnvUrl : rawEnvUrl.trim().replace(/\/$/, '');
