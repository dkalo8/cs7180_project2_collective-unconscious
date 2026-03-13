// src/config.js
const rawEnvUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || '';
// In production proxying, we set VITE_API_URL to '/api'. 
// This logic ensures that if it's set to 'api' or '/api' (with any trailing slashes/spaces), 
// we return an empty string so that services (which add '/api') don't duplicate the path.
export const API_BASE_URL = rawEnvUrl.trim().replace(/\/$/, '').replace(/^\/?api$/, '');
