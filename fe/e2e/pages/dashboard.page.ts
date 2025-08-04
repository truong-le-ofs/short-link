import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly createLinkButton: Locator;
  readonly linksTable: Locator;
  readonly analyticsLink: Locator;
  readonly userMenu: Locator;
  readonly logoutButton: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createLinkButton = page.getByRole('button', { name: 'Create Link' });
    this.linksTable = page.locator('[data-testid="links-table"]');
    this.analyticsLink = page.getByRole('link', { name: 'Analytics' });
    this.userMenu = page.locator('[data-testid="user-menu"]');
    this.logoutButton = page.getByRole('button', { name: 'Log out' });
    this.searchInput = page.getByPlaceholder('Search links...');
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async expectToBeOnDashboard() {
    await expect(this.page).toHaveURL(/.*\/dashboard/);
    await expect(this.createLinkButton).toBeVisible();
  }

  async clickCreateLink() {
    await this.createLinkButton.click();
  }

  async logout() {
    await this.userMenu.click();
    await this.logoutButton.click();
  }

  async searchLinks(query: string) {
    await this.searchInput.fill(query);
    await this.page.keyboard.press('Enter');
  }

  async expectLinkInTable(shortCode: string) {
    await expect(this.linksTable.locator(`text=${shortCode}`)).toBeVisible();
  }

  async clickLinkByShortCode(shortCode: string) {
    await this.linksTable.locator(`text=${shortCode}`).click();
  }
}