import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './utils/mocks/server';

// Polyfill for TextEncoder/TextDecoder in Node.js environments
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Polyfill for URL if not available
if (typeof global.URL === 'undefined') {
  global.URL = require('url').URL;
}

// Polyfill for URLSearchParams if not available
if (typeof global.URLSearchParams === 'undefined') {
  global.URLSearchParams = require('url').URLSearchParams;
}

// Polyfill for fetch using undici in Node.js environments
if (typeof global.fetch === 'undefined') {
  const { fetch, Headers, Request, Response } = require('undici');
  global.fetch = fetch;
  global.Headers = Headers;
  global.Request = Request;
  global.Response = Response;
}

// Remove router mock from global setup - it's causing issues
// Mocks will be handled in individual test files or test-utils

// Remove global fetch mock since we're using MSW
// global.fetch = vi.fn();

// Mock IntersectionObserver
global.IntersectionObserver = class MockIntersectionObserver {
  root = null;
  rootMargin = '';
  thresholds = [];
  
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() { return []; }
} as any;

// Mock ResizeObserver
global.ResizeObserver = class MockResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock localStorage
let localStorageStore: Record<string, string> = {};

const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageStore[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageStore[key];
  }),
  clear: vi.fn(() => {
    localStorageStore = {};
  }),
  length: 0,
  key: vi.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock window.confirm and window.alert
global.confirm = vi.fn(() => true);
global.alert = vi.fn();

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:3000/api',
    MODE: 'test'
  },
  writable: true
});

// MSW server setup
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

beforeEach(() => {
  vi.clearAllMocks();
  // Reset localStorage for each test
  localStorageStore = {};
});

afterEach(() => {
  server.resetHandlers();
  cleanup();
});

afterAll(() => server.close());