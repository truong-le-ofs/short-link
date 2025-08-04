import { test, expect } from '../fixtures/test-fixtures';
import { generateTestData, TEST_CONSTANTS } from '../utils/test-data';

test.describe('Authentication Flow', () => {
  test.describe('User Registration', () => {
    test('should register a new user successfully', async ({ authPage }) => {
      const userData = generateTestData.user();
      
      await authPage.goto('register');
      await authPage.expectToBeOnRegisterPage();
      
      await authPage.register(userData.email, userData.password);
      
      // Should redirect to dashboard or email verification page
      await expect(authPage.page).toHaveURL(/\/(dashboard|verify-email)/);
    });

    test('should show error for invalid email format', async ({ authPage }) => {
      await authPage.goto('register');
      
      await authPage.register('invalid-email', 'ValidPassword123!');
      
      await authPage.expectErrorMessage('Invalid email format');
    });

    test('should show error for weak password', async ({ authPage }) => {
      const userData = generateTestData.user();
      
      await authPage.goto('register');
      
      await authPage.register(userData.email, 'weak');
      
      await authPage.expectErrorMessage('Password must be at least 8 characters');
    });
  });

  test.describe('User Login', () => {
    test('should login existing user successfully', async ({ authPage, testUser }) => {
      // First register the user
      await authPage.register(testUser.email, testUser.password);
      
      // Then try to login
      await authPage.login(testUser.email, testUser.password);
      
      // Should redirect to dashboard
      await expect(authPage.page).toHaveURL(TEST_CONSTANTS.EXPECTED_REDIRECTS.AFTER_LOGIN);
    });

    test('should show error for incorrect credentials', async ({ authPage }) => {
      await authPage.login('nonexistent@example.com', 'wrongpassword');
      
      await authPage.expectErrorMessage('Invalid credentials');
    });

    test('should navigate between login and register pages', async ({ authPage }) => {
      await authPage.goto('login');
      await authPage.expectToBeOnLoginPage();
      
      await authPage.registerLink.click();
      await authPage.expectToBeOnRegisterPage();
      
      await authPage.loginLink.click();
      await authPage.expectToBeOnLoginPage();
    });
  });

  test.describe('Authentication State', () => {
    test('should logout user successfully', async ({ authPage, dashboardPage, testUser }) => {
      // Login first
      await authPage.register(testUser.email, testUser.password);
      await dashboardPage.goto();
      await dashboardPage.expectToBeOnDashboard();
      
      // Logout
      await dashboardPage.logout();
      
      // Should redirect to login page
      await expect(authPage.page).toHaveURL(TEST_CONSTANTS.EXPECTED_REDIRECTS.AFTER_LOGOUT);
    });

    test('should redirect unauthenticated users to login', async ({ dashboardPage }) => {
      await dashboardPage.goto();
      
      // Should be redirected to login page
      await expect(dashboardPage.page).toHaveURL(/.*\/login/);
    });
  });
});