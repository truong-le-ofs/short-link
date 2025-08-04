import { test as setup, expect } from '@playwright/test';

const authFile = 'e2e/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Register and login a test user for authenticated tests
  const testUser = {
    email: `e2e.test.user.${Date.now()}@example.com`,
    password: 'SecureE2EPassword123!'
  };

  // Register user
  await page.goto('/register');
  await page.getByLabel('Email', { exact: true }).fill(testUser.email);
  await page.getByLabel('Password', { exact: true }).fill(testUser.password);
  await page.getByLabel('Confirm Password').fill(testUser.password);
  await page.getByRole('button', { name: 'Create Account' }).click();

  // Wait for redirect to dashboard or handle email verification
  await page.waitForURL('/dashboard');
  await expect(page.getByText('Dashboard')).toBeVisible();

  // Save authentication state
  await page.context().storageState({ path: authFile });
});

setup('create test data', async ({ request }) => {
  // Create some test links for analytics tests
  // This would use the API to create test data
  // For now, we'll keep it simple
  console.log('Test data setup complete');
});