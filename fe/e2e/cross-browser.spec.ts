import { test, expect } from '../fixtures/test-fixtures';

test.describe('Responsive Design', () => {
  test.describe('Mobile View', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

    test('should display mobile-friendly navigation', async ({ page, authPage, testUser }) => {
      await authPage.register(testUser.email, testUser.password);
      await page.goto('/dashboard');

      // Check mobile navigation elements
      const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
        await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      }
    });

    test('should work properly on mobile devices', async ({ page, authPage, linkFormPage, dashboardPage, testUser }) => {
      await authPage.register(testUser.email, testUser.password);
      await dashboardPage.goto();

      // Test mobile link creation
      await dashboardPage.clickCreateLink();
      await linkFormPage.createLink({ url: 'https://example.com' });
      await linkFormPage.expectSuccessMessage();
    });
  });

  test.describe('Tablet View', () => {
    test.use({ viewport: { width: 768, height: 1024 } }); // iPad size

    test('should display properly on tablet', async ({ page, authPage, testUser }) => {
      await authPage.register(testUser.email, testUser.password);
      await page.goto('/dashboard');

      // Verify tablet layout
      await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
    });
  });
});

test.describe('Performance', () => {
  test('should load dashboard quickly', async ({ page, authPage, testUser }) => {
    await authPage.register(testUser.email, testUser.password);
    
    const startTime = Date.now();
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
    const loadTime = Date.now() - startTime;

    // Should load within 2 seconds (as per PRD requirement)
    expect(loadTime).toBeLessThan(2000);
  });

  test('should resolve links quickly', async ({ page, authPage, linkFormPage, dashboardPage, testUser }) => {
    await authPage.register(testUser.email, testUser.password);
    
    // Create a test link
    await dashboardPage.goto();
    await dashboardPage.clickCreateLink();
    const linkData = { url: 'https://example.com', customCode: 'PERF123' };
    await linkFormPage.createLink(linkData);

    // Test link resolution performance
    const startTime = Date.now();
    await page.goto(`/${linkData.customCode}`);
    await page.waitForURL(linkData.url);
    const resolveTime = Date.now() - startTime;

    // Should resolve within 100ms (as per PRD requirement)
    expect(resolveTime).toBeLessThan(100);
  });
});

test.describe('Accessibility', () => {
  test('should be keyboard navigable', async ({ page, authPage, testUser }) => {
    await authPage.goto('login');

    // Test keyboard navigation
    await page.keyboard.press('Tab'); // Focus email field
    await expect(authPage.emailInput).toBeFocused();

    await page.keyboard.press('Tab'); // Focus password field
    await expect(authPage.passwordInput).toBeFocused();

    await page.keyboard.press('Tab'); // Focus login button
    await expect(authPage.loginButton).toBeFocused();
  });

  test('should have proper ARIA labels', async ({ page, authPage }) => {
    await authPage.goto('login');

    // Check ARIA attributes
    await expect(authPage.emailInput).toHaveAttribute('aria-label', /email/i);
    await expect(authPage.passwordInput).toHaveAttribute('aria-label', /password/i);
  });
});

test.describe('Error Scenarios', () => {
  test('should handle network errors gracefully', async ({ page, authPage }) => {
    // Simulate network failure
    await page.route('**/api/**', route => route.abort());

    await authPage.goto('login');
    await authPage.login('test@example.com', 'password');

    // Should show appropriate error message
    await expect(page.locator('text=Network error')).toBeVisible();
  });

  test('should handle server errors gracefully', async ({ page, authPage }) => {
    // Simulate server error
    await page.route('**/api/auth/login', route => 
      route.fulfill({ status: 500, body: 'Internal Server Error' })
    );

    await authPage.goto('login');
    await authPage.login('test@example.com', 'password');

    // Should show appropriate error message
    await expect(page.locator('text=Server error')).toBeVisible();
  });
});