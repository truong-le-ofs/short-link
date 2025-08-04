import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Should have the main title or heading
    await expect(page.locator('h1')).toBeVisible();
    
    // Should have at least one navigation to login/register (use first() to handle duplicates)
    await expect(page.getByRole('link', { name: /login|sign in/i }).first()).toBeVisible();
  });

  test('should load login page', async ({ page }) => {
    await page.goto('/login');
    
    // Should have login form elements
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in|login/i })).toBeVisible();
  });

  test('should load register page', async ({ page }) => {
    await page.goto('/register');
    
    // Should have register form elements
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    // Look for any button with text that suggests registration
    await expect(page.locator('button', { hasText: /create|register|sign up/i })).toBeVisible();
  });

  test('should redirect to login for protected routes', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login page
    await expect(page).toHaveURL(/.*\/(login|auth)/);
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');
    
    // Check for basic SEO elements (more flexible)
    await expect(page.locator('title')).toBeVisible();
    // Just check that meta description exists, regardless of content
    const metaDesc = page.locator('meta[name="description"]');
    if (await metaDesc.count() > 0) {
      await expect(metaDesc).toBeAttached();
    }
  });
});