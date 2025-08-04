# E2E Testing with Playwright

This directory contains end-to-end tests for the URL Shortener application using [Playwright](https://playwright.dev/).

## Overview

The e2e tests cover the main user flows and functionality:

- **Authentication**: Registration, login, logout
- **Link Management**: Creating, editing, deleting links
- **Link Resolution**: Accessing short links, password protection, expiration
- **Analytics**: Dashboard metrics, charts, real-time updates
- **Cross-browser**: Responsive design, performance, accessibility

## Test Structure

```
e2e/
├── fixtures/           # Test fixtures and shared utilities
│   └── test-fixtures.ts
├── pages/              # Page Object Model classes
│   ├── auth.page.ts
│   ├── dashboard.page.ts
│   ├── link-form.page.ts
│   └── analytics.page.ts
├── utils/              # Test utilities and data generators
│   └── test-data.ts
├── auth.setup.ts       # Authentication setup for tests
├── auth.spec.ts        # Authentication flow tests
├── link-management.spec.ts  # Link CRUD operations
├── link-resolution.spec.ts  # Link access and redirection
├── analytics.spec.ts   # Analytics dashboard tests
└── cross-browser.spec.ts    # Cross-browser and edge cases
```

## Configuration

The tests are configured in `playwright.config.ts` with:

- **Multiple browsers**: Chromium, Firefox, WebKit
- **Mobile testing**: iPhone and Android viewports
- **Web server**: Automatically starts Next.js dev server
- **Artifacts**: Screenshots, videos, traces on failure
- **Timeouts**: Optimized for CI/CD environments

## Running Tests

### Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

3. Ensure the app can run locally:
   ```bash
   npm run dev
   ```

### Test Commands

```bash
# Run all tests
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (visible browser)
npm run test:e2e:headed

# Debug tests step by step
npm run test:e2e:debug

# View test report
npm run test:e2e:report

# Run specific test file
npx playwright test auth.spec.ts

# Run tests for specific browser
npx playwright test --project=chromium

# Run tests in mobile viewport
npx playwright test --project="Mobile Chrome"
```

### CI/CD

For continuous integration:

```bash
# Run tests with CI optimizations
CI=true npm run test:e2e
```

## Test Scenarios

### Authentication Flow (`auth.spec.ts`)

- ✅ User registration with valid data
- ✅ Registration validation (email format, password strength)
- ✅ User login with correct credentials
- ✅ Login error handling (wrong credentials)
- ✅ Navigation between login/register pages
- ✅ User logout functionality
- ✅ Protected route access control

### Link Management (`link-management.spec.ts`)

- ✅ Basic link creation
- ✅ Custom short code assignment
- ✅ Password-protected links
- ✅ URL validation
- ✅ Duplicate custom code handling
- ✅ Link display in dashboard
- ✅ Link search functionality

### Link Resolution (`link-resolution.spec.ts`)

- ✅ Valid link redirection
- ✅ 404 handling for non-existent links
- ✅ 410 handling for expired links
- ✅ Password prompt for protected links
- ✅ Password validation
- ✅ Click limit enforcement
- ✅ Analytics tracking on access

### Analytics Dashboard (`analytics.spec.ts`)

- ✅ Metrics display (clicks, visitors)
- ✅ Charts rendering (clicks over time)
- ✅ Device breakdown statistics
- ✅ Geographic statistics
- ✅ Date range filtering
- ✅ Export functionality
- ✅ Real-time updates
- ✅ Error handling

### Cross-browser & Edge Cases (`cross-browser.spec.ts`)

- ✅ Mobile responsive design
- ✅ Tablet layout
- ✅ Performance benchmarks
- ✅ Accessibility compliance
- ✅ Keyboard navigation
- ✅ Network error handling
- ✅ Server error handling

## Page Object Model

Tests use the Page Object Model pattern for maintainability:

```typescript
// Example usage
test('should login successfully', async ({ authPage, testUser }) => {
  await authPage.login(testUser.email, testUser.password);
  await authPage.expectToBeOnDashboard();
});
```

### Available Page Objects

- **AuthPage**: Login, register, logout operations
- **DashboardPage**: Main dashboard navigation and actions
- **LinkFormPage**: Link creation and editing forms
- **AnalyticsPage**: Analytics dashboard interactions

## Test Fixtures

Custom fixtures provide:

- **Authenticated user**: Pre-logged in user for protected routes
- **Test data**: Generated test users, links, and mock data
- **Page objects**: Instantiated page classes

## Best Practices

1. **Isolation**: Each test is independent and can run alone
2. **Reliability**: Tests handle async operations and wait conditions
3. **Maintainability**: Page objects abstract UI interactions
4. **Readability**: Tests describe user behaviors, not implementation
5. **Performance**: Tests run in parallel where possible

## Debugging

When tests fail:

1. **Screenshots**: Automatically captured on failure
2. **Videos**: Recorded for failed tests
3. **Traces**: Full browser traces available
4. **Debug mode**: Step through tests interactively

```bash
# Debug specific test
npx playwright test auth.spec.ts --debug

# View last test report
npm run test:e2e:report
```

## Mock Data & API

Tests use mocking for:

- External API responses
- Analytics data
- Network error simulation
- Authentication states

Example:
```typescript
await page.route('/api/analytics*', route => {
  route.fulfill({
    status: 200,
    body: JSON.stringify(MOCK_ANALYTICS_DATA)
  });
});
```

## Performance Testing

Tests include performance benchmarks:

- Dashboard load time < 2 seconds
- Link resolution < 100ms
- First contentful paint optimization

## Accessibility Testing

Basic accessibility checks:

- Keyboard navigation
- ARIA labels
- Focus management
- Screen reader compatibility

## Contributing

When adding new tests:

1. Follow the existing page object pattern
2. Use descriptive test names
3. Include both happy path and error scenarios
4. Add proper assertions and wait conditions
5. Update this README if needed

## Requirements Coverage

These tests cover the requirements from:

- ✅ PRD (Product Requirements Document)
- ✅ Test Plan specifications
- ✅ Performance benchmarks
- ✅ Accessibility standards
- ✅ Cross-browser compatibility

## Known Issues

- Email verification flow may need manual setup
- Real-time analytics require WebSocket mocking
- Some tests depend on backend API availability

For issues or questions, refer to the main project documentation or open a GitHub issue.