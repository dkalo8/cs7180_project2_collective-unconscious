import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock the config module globally for all tests to ensure valid absolute URLs
vi.mock('./src/config', () => ({
  API_BASE_URL: 'http://127.0.0.1:3000'
}));

vi.stubEnv('VITE_API_URL', 'http://127.0.0.1:3000');
