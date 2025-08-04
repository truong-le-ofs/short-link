import { test as base } from '@playwright/test';
import { AuthPage } from '../pages/auth.page';
import { DashboardPage } from '../pages/dashboard.page';
import { LinkFormPage } from '../pages/link-form.page';
import { AnalyticsPage } from '../pages/analytics.page';

// Test data types
export interface TestUser {
  email: string;
  password: string;
  name?: string;
}

export interface TestLink {
  url: string;
  customCode?: string;
  password?: string;
  expiryDate?: string;
  maxClicks?: number;
}

// Page object fixtures
type TestFixtures = {
  authPage: AuthPage;
  dashboardPage: DashboardPage;
  linkFormPage: LinkFormPage;
  analyticsPage: AnalyticsPage;
  testUser: TestUser;
  authenticatedUser: void;
};

// Extend the base test with page objects and fixtures
export const test = base.extend<TestFixtures>({
  authPage: async ({ page }, use) => {
    await use(new AuthPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  linkFormPage: async ({ page }, use) => {
    await use(new LinkFormPage(page));
  },

  analyticsPage: async ({ page }, use) => {
    await use(new AnalyticsPage(page));
  },

  testUser: async ({}, use) => {
    const timestamp = Date.now();
    const testUser: TestUser = {
      email: `test.user.${timestamp}@example.com`,
      password: 'SecurePassword123!',
      name: `Test User ${timestamp}`
    };
    await use(testUser);
  },

  authenticatedUser: async ({ authPage, testUser }, use) => {
    // Register and login before each test that uses this fixture
    await authPage.register(testUser.email, testUser.password);
    // Note: In a real app, you might need to handle email verification
    // For this example, we assume auto-login after registration or skip verification
    await use();
  },
});

export { expect } from '@playwright/test';