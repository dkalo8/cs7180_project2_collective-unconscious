// src/config.js
const rawEnvUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || 'http://127.0.0.1:3000';
// In production, if VITE_API_URL is '/api', we set API_BASE_URL to empty string 
// because services already append '/api'. This prevents '/api/api' paths.
export const API_BASE_URL = rawEnvUrl === '/api' ? '' : (rawEnvUrl.startsWith('/') ? rawEnvUrl : rawEnvUrl.trim().replace(/\/$/, ''));
