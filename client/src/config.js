// src/config.js
const rawEnvUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || 'http://127.0.0.1:3000';
export const API_BASE_URL = rawEnvUrl.trim().replace(/\/$/, '');
