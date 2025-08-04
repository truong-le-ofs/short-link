import { test, expect } from '../fixtures/test-fixtures';
import { generateTestData } from '../utils/test-data';

test.describe('Link Management', () => {
  // Use authenticated user fixture for all tests in this describe block
  test.use({ 
    storageState: 'e2e/.auth/user.json' // We'll set this up later
  });

  test.describe('Link Creation', () => {
    test('should create a basic link successfully', async ({ linkFormPage, dashboardPage }) => {
      const linkData = generateTestData.link();
      
      await dashboardPage.goto();
      await dashboardPage.clickCreateLink();
      
      await linkFormPage.expectToBeOnCreateForm();
      await linkFormPage.createLink({ url: linkData.url });
      
      await linkFormPage.expectSuccessMessage();
      
      // Should show the new link in the dashboard
      await dashboardPage.goto();
      // Note: We'd need the actual short code returned from the API
      // For now, we'll check that we're back on dashboard
      await dashboardPage.expectToBeOnDashboard();
    });

    test('should create link with custom short code', async ({ linkFormPage, dashboardPage }) => {
      const linkData = generateTestData.link({ customCode: 'CUSTOM123' });
      
      await dashboardPage.goto();
      await dashboardPage.clickCreateLink();
      
      await linkFormPage.createLink({
        url: linkData.url,
        customCode: linkData.customCode
      });
      
      await linkFormPage.expectSuccessMessage();
      
      // Verify the custom code appears in the dashboard
      await dashboardPage.goto();
      await dashboardPage.expectLinkInTable('CUSTOM123');
    });

    test('should create password-protected link', async ({ linkFormPage, dashboardPage }) => {
      const linkData = generateTestData.link({ password: 'secret123' });
      
      await dashboardPage.goto();
      await dashboardPage.clickCreateLink();
      
      await linkFormPage.createLink({
        url: linkData.url,
        password: linkData.password
      });
      
      await linkFormPage.expectSuccessMessage();
    });

    test('should show error for invalid URL', async ({ linkFormPage, dashboardPage }) => {
      await dashboardPage.goto();
      await dashboardPage.clickCreateLink();
      
      await linkFormPage.createLink({ url: 'not-a-valid-url' });
      
      await linkFormPage.expectErrorMessage('Please enter a valid URL');
    });

    test('should show error for duplicate custom code', async ({ linkFormPage, dashboardPage }) => {
      const customCode = 'DUPLICATE123';
      
      // Create first link with custom code
      await dashboardPage.goto();
      await dashboardPage.clickCreateLink();
      await linkFormPage.createLink({
        url: 'https://example.com',
        customCode: customCode
      });
      await linkFormPage.expectSuccessMessage();
      
      // Try to create second link with same custom code
      await dashboardPage.goto();
      await dashboardPage.clickCreateLink();
      await linkFormPage.createLink({
        url: 'https://google.com',
        customCode: customCode
      });
      
      await linkFormPage.expectErrorMessage('Custom code already exists');
    });
  });

  test.describe('Link Management Operations', () => {
    test('should display links in dashboard table', async ({ dashboardPage, linkFormPage }) => {
      // Create a test link first
      const linkData = generateTestData.link();
      
      await dashboardPage.goto();
      await dashboardPage.clickCreateLink();
      await linkFormPage.createLink({ url: linkData.url });
      await linkFormPage.expectSuccessMessage();
      
      // Check if link appears in dashboard
      await dashboardPage.goto();
      await dashboardPage.expectToBeOnDashboard();
      await expect(dashboardPage.linksTable).toBeVisible();
    });

    test('should search links', async ({ dashboardPage }) => {
      await dashboardPage.goto();
      
      await dashboardPage.searchLinks('test');
      
      // Table should update with search results
      await expect(dashboardPage.linksTable).toBeVisible();
    });

    test('should navigate to analytics from dashboard', async ({ dashboardPage, analyticsPage }) => {
      await dashboardPage.goto();
      
      await dashboardPage.analyticsLink.click();
      
      await analyticsPage.expectToBeOnAnalytics();
    });
  });
});