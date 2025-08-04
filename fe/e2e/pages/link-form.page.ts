import { Page, Locator, expect } from '@playwright/test';

export class LinkFormPage {
  readonly page: Page;
  readonly urlInput: Locator;
  readonly customCodeInput: Locator;
  readonly passwordInput: Locator;
  readonly expiryDateInput: Locator;
  readonly maxClicksInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.urlInput = page.getByLabel('Target URL');
    this.customCodeInput = page.getByLabel('Custom Short Code');
    this.passwordInput = page.getByLabel('Password Protection');
    this.expiryDateInput = page.getByLabel('Expiry Date');
    this.maxClicksInput = page.getByLabel('Max Clicks');
    this.submitButton = page.getByRole('button', { name: 'Create Link' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.successMessage = page.locator('[data-testid="success-message"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
  }

  async goto() {
    await this.page.goto('/links/new');
  }

  async createLink(data: {
    url: string;
    customCode?: string;
    password?: string;
    expiryDate?: string;
    maxClicks?: number;
  }) {
    await this.urlInput.fill(data.url);
    
    if (data.customCode) {
      await this.customCodeInput.fill(data.customCode);
    }
    
    if (data.password) {
      await this.passwordInput.fill(data.password);
    }
    
    if (data.expiryDate) {
      await this.expiryDateInput.fill(data.expiryDate);
    }
    
    if (data.maxClicks) {
      await this.maxClicksInput.fill(data.maxClicks.toString());
    }
    
    await this.submitButton.click();
  }

  async expectSuccessMessage() {
    await expect(this.successMessage).toBeVisible();
  }

  async expectErrorMessage(message?: string) {
    await expect(this.errorMessage).toBeVisible();
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }

  async expectToBeOnCreateForm() {
    await expect(this.page).toHaveURL(/.*\/links\/new/);
    await expect(this.submitButton).toBeVisible();
  }
}