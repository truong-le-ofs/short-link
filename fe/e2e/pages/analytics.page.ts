import { Page, Locator, expect } from '@playwright/test';

export class AnalyticsPage {
  readonly page: Page;
  readonly totalClicksCard: Locator;
  readonly uniqueVisitorsCard: Locator;
  readonly clicksChart: Locator;
  readonly deviceStatsSection: Locator;
  readonly geographicStatsSection: Locator;
  readonly dateRangeSelector: Locator;
  readonly exportButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.totalClicksCard = page.locator('[data-testid="total-clicks-card"]');
    this.uniqueVisitorsCard = page.locator('[data-testid="unique-visitors-card"]');
    this.clicksChart = page.locator('[data-testid="clicks-chart"]');
    this.deviceStatsSection = page.locator('[data-testid="device-stats"]');
    this.geographicStatsSection = page.locator('[data-testid="geographic-stats"]');
    this.dateRangeSelector = page.locator('[data-testid="date-range-selector"]');
    this.exportButton = page.getByRole('button', { name: 'Export Data' });
  }

  async goto() {
    await this.page.goto('/analytics');
  }

  async expectToBeOnAnalytics() {
    await expect(this.page).toHaveURL(/.*\/analytics/);
    await expect(this.totalClicksCard).toBeVisible();
  }

  async expectAnalyticsCards() {
    await expect(this.totalClicksCard).toBeVisible();
    await expect(this.uniqueVisitorsCard).toBeVisible();
  }

  async expectClicksChart() {
    await expect(this.clicksChart).toBeVisible();
  }

  async expectDeviceStats() {
    await expect(this.deviceStatsSection).toBeVisible();
  }

  async getTotalClicks(): Promise<string> {
    return await this.totalClicksCard.locator('.text-3xl').textContent() || '0';
  }

  async getUniqueVisitors(): Promise<string> {
    return await this.uniqueVisitorsCard.locator('.text-3xl').textContent() || '0';
  }
}