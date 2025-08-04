import { nanoid } from 'nanoid';

// Test data generators
export const generateTestData = {
  user: (suffix = '') => ({
    email: `test.user.${nanoid(8)}${suffix}@example.com`,
    password: 'SecurePassword123!',
    name: `Test User ${nanoid(4)}`
  }),

  link: (overrides = {}) => ({
    url: 'https://example.com',
    customCode: nanoid(6),
    ...overrides
  }),

  urls: {
    valid: [
      'https://example.com',
      'https://www.google.com',
      'https://github.com/microsoft/playwright',
      'http://localhost:3000',
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    ],
    invalid: [
      'not-a-url',
      'ftp://invalid.com',
      'javascript:alert("xss")',
      '',
      'http://',
      'https://'
    ]
  }
};

// Common test constants
export const TEST_CONSTANTS = {
  TIMEOUTS: {
    SHORT: 5000,
    MEDIUM: 15000,
    LONG: 30000
  },
  
  SELECTORS: {
    LOADING: '[data-testid="loading"]',
    ERROR: '[data-testid="error-message"]',
    SUCCESS: '[data-testid="success-message"]'
  },

  EXPECTED_REDIRECTS: {
    AFTER_LOGIN: '/dashboard',
    AFTER_LOGOUT: '/login',
    AFTER_REGISTER: '/dashboard' // or email verification page
  }
};

// Mock data for testing
export const MOCK_ANALYTICS_DATA = {
  totalClicks: 42,
  uniqueVisitors: 28,
  topCountries: [
    { country: 'United States', count: 15 },
    { country: 'United Kingdom', count: 8 },
    { country: 'Canada', count: 5 }
  ],
  deviceBreakdown: [
    { device: 'Desktop', count: 25 },
    { device: 'Mobile', count: 15 },
    { device: 'Tablet', count: 2 }
  ]
};