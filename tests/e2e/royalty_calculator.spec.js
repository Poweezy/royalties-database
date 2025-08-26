import { test, expect } from '@playwright/test';

test.describe('RoyaltyCalculator', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the test page
    await page.goto('http://localhost:8000/tests/royalty_calculator_test.html');
  });

  test('should run all calculator tests successfully', async ({ page }) => {
    // Wait for the results to be populated
    await page.waitForSelector('#results p');

    // Get all the test result paragraphs
    const results = await page.locator('#results p').allTextContents();

    // Check that all tests passed
    for (const result of results) {
      expect(result).toContain('PASS');
    }
  });
});
