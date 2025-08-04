import { test, expect } from '../fixtures/test-fixtures';
import { MOCK_ANALYTICS_DATA } from '../utils/test-data';

test.describe('Analytics Dashboard', () => {
  // Use authenticated user for all analytics tests
  test.use({ 
    storageState: 'e2e/.auth/user.json'
  });

  test.describe('Analytics Display', () => {
    test('should display analytics dashboard with key metrics', async ({ analyticsPage }) => {
      await analyticsPage.goto();
      await analyticsPage.expectToBeOnAnalytics();
      
      // Check that main analytics components are visible
      await analyticsPage.expectAnalyticsCards();
      await analyticsPage.expectClicksChart();
      await analyticsPage.expectDeviceStats();
    });

    test('should show total clicks and unique visitors', async ({ analyticsPage, page }) => {
      // Mock analytics API response
      await page.route('/api/analytics*', route => {
        route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(MOCK_ANALYTICS_DATA)
        });
      });
      
      await analyticsPage.goto();
      
      // Verify that analytics data is displayed
      const totalClicks = await analyticsPage.getTotalClicks();
      const uniqueVisitors = await analyticsPage.getUniqueVisitors();
      
      expect(totalClicks).toBe(MOCK_ANALYTICS_DATA.totalClicks.toString());
      expect(uniqueVisitors).toBe(MOCK_ANALYTICS_DATA.uniqueVisitors.toString());
    });

    test('should display clicks over time chart', async ({ analyticsPage, page }) => {
      // Mock chart data
      await page.route('/api/analytics*', route => {
        route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...MOCK_ANALYTICS_DATA,
            clicksOverTime: [
              { date: '2024-01-01', clicks: 10 },
              { date: '2024-01-02', clicks: 15 },
              { date: '2024-01-03', clicks: 8 },
              { date: '2024-01-04', clicks: 22 }
            ]
          })
        });
      });
      
      await analyticsPage.goto();
      await analyticsPage.expectClicksChart();
      
      // Verify chart is rendered (Recharts creates SVG elements)
      await expect(analyticsPage.page.locator('svg')).toBeVisible();
    });

    test('should display device breakdown', async ({ analyticsPage, page }) => {
      await page.route('/api/analytics*', route => {
        route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(MOCK_ANALYTICS_DATA)
        });
      });
      
      await analyticsPage.goto();
      await analyticsPage.expectDeviceStats();
      
      // Check that device data is displayed
      await expect(analyticsPage.page.locator('text=Desktop')).toBeVisible();
      await expect(analyticsPage.page.locator('text=Mobile')).toBeVisible();
      await expect(analyticsPage.page.locator('text=Tablet')).toBeVisible();
    });

    test('should display geographic statistics', async ({ analyticsPage, page }) => {
      await page.route('/api/analytics*', route => {
        route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(MOCK_ANALYTICS_DATA)
        });
      });
      
      await analyticsPage.goto();
      await expect(analyticsPage.geographicStatsSection).toBeVisible();
      
      // Check that country data is displayed
      await expect(analyticsPage.page.locator('text=United States')).toBeVisible();
      await expect(analyticsPage.page.locator('text=United Kingdom')).toBeVisible();
      await expect(analyticsPage.page.locator('text=Canada')).toBeVisible();
    });
  });

  test.describe('Analytics Interactions', () => {
    test('should allow date range selection', async ({ analyticsPage, page }) => {
      await page.route('/api/analytics*', route => {
        route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(MOCK_ANALYTICS_DATA)
        });
      });
      
      await analyticsPage.goto();
      
      // Test date range picker if available
      if (await analyticsPage.dateRangeSelector.isVisible()) {
        await analyticsPage.dateRangeSelector.click();
        
        // Select last 7 days option (example)
        await analyticsPage.page.getByText('Last 7 days').click();
        
        // Verify that new data is loaded
        await expect(analyticsPage.totalClicksCard).toBeVisible();
      }
    });

    test('should handle export functionality', async ({ analyticsPage, page }) => {
      await page.route('/api/analytics*', route => {
        route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(MOCK_ANALYTICS_DATA)
        });
      });
      
      await analyticsPage.goto();
      
      // Test export button if available
      if (await analyticsPage.exportButton.isVisible()) {
        // Set up download handling
        const downloadPromise = analyticsPage.page.waitForEvent('download');
        
        await analyticsPage.exportButton.click();
        
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/analytics.*\.(csv|json|xlsx)$/);
      }
    });
  });

  test.describe('Real-time Updates', () => {
    test('should update analytics in real-time when new clicks occur', async ({ analyticsPage, page }) => {
      let clickCount = MOCK_ANALYTICS_DATA.totalClicks;
      
      // Mock initial analytics data
      await page.route('/api/analytics*', route => {
        route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...MOCK_ANALYTICS_DATA,
            totalClicks: clickCount
          })
        });
      });
      
      await analyticsPage.goto();
      
      const initialClicks = await analyticsPage.getTotalClicks();
      expect(initialClicks).toBe(clickCount.toString());
      
      // Simulate real-time update by updating the mock response
      clickCount += 1;
      await page.route('/api/analytics*', route => {
        route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...MOCK_ANALYTICS_DATA,
            totalClicks: clickCount
          })
        });
      });
      
      // Trigger a refresh or real-time update
      await analyticsPage.page.reload();
      
      const updatedClicks = await analyticsPage.getTotalClicks();
      expect(updatedClicks).toBe(clickCount.toString());
    });
  });

  test.describe('Error Handling', () => {
    test('should handle analytics API errors gracefully', async ({ analyticsPage, page }) => {
      // Mock API error
      await page.route('/api/analytics*', route => {
        route.fulfill({
          status: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Internal server error' })
        });
      });
      
      await analyticsPage.goto();
      
      // Should show error message or fallback UI
      await expect(analyticsPage.page.locator('text=Error loading analytics')).toBeVisible();
    });

    test('should show loading states', async ({ analyticsPage, page }) => {
      // Delay the API response to see loading state
      await page.route('/api/analytics*', route => {
        setTimeout(() => {
          route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(MOCK_ANALYTICS_DATA)
          });
        }, 1000);
      });
      
      await analyticsPage.goto();
      
      // Should show loading indicators
      await expect(analyticsPage.page.locator('[data-testid="loading"]')).toBeVisible();
      
      // Eventually show the data
      await analyticsPage.expectAnalyticsCards();
    });
  });
});