import { test, expect } from '@playwright/test';

test.describe('Basic Functionality Tests', () => {
  test('should load the application homepage', async ({ page }) => {
    await page.goto('/');
    
    // Should have some main content
    await expect(page.locator('body')).toBeVisible();
    
    // Should have a title (regardless of content)
    const title = await page.title();
    expect(title).toBeTruthy();
    
    console.log(`✅ Homepage loaded with title: "${title}"`);
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/login');
    
    // Should have login form elements
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    
    console.log('✅ Login page loaded successfully');
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/register');
    
    // Should have register form elements
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    
    console.log('✅ Register page loaded successfully');
  });

  test('should redirect protected routes to auth', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login or auth page
    await page.waitForURL('**/login', { timeout: 5000 });
    await expect(page.url()).toContain('login');
    
    console.log('✅ Protected route redirection working');
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    
    // Should have at least one Sign In link
    const signInLinks = page.getByRole('link', { name: /sign in|login/i });
    await expect(signInLinks.first()).toBeVisible();
    
    console.log('✅ Navigation elements present');
  });
});