import { Page, Locator, expect } from '@playwright/test';

export class AuthPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly loginButton: Locator;
  readonly registerButton: Locator;
  readonly loginLink: Locator;
  readonly registerLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email', { exact: true });
    this.passwordInput = page.getByLabel('Password', { exact: true });
    this.confirmPasswordInput = page.getByLabel('Confirm Password');
    this.loginButton = page.getByRole('button', { name: 'Sign In' });
    this.registerButton = page.getByRole('button', { name: 'Create Account' });
    this.loginLink = page.getByRole('link', { name: 'Sign in' });
    this.registerLink = page.getByRole('link', { name: 'Create account' });
    this.errorMessage = page.locator('[data-testid="error-message"]');
  }

  async goto(type: 'login' | 'register') {
    await this.page.goto(`/${type}`);
  }

  async login(email: string, password: string) {
    await this.goto('login');
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async register(email: string, password: string) {
    await this.goto('register');
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
    await this.registerButton.click();
  }

  async expectToBeOnLoginPage() {
    await expect(this.page).toHaveURL(/.*\/login/);
    await expect(this.loginButton).toBeVisible();
  }

  async expectToBeOnRegisterPage() {
    await expect(this.page).toHaveURL(/.*\/register/);
    await expect(this.registerButton).toBeVisible();
  }

  async expectErrorMessage(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }
}