import { test, expect } from '@playwright/test';

test.describe('Dashboard Navigation', () => {
  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('http://localhost:8000/royalties.html');

    // Wait for the login form to be visible
    await page.waitForSelector('#login-form');

    // Perform login
    await page.fill('#username', 'admin');
    await page.fill('#password', 'demo123');
    await page.click('button[type="submit"]');

    // Wait for the main app container to be visible
    await page.waitForSelector('#app-container', { state: 'visible' });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('should navigate to royalty records when "Total Royalties" card is clicked', async () => {
    // Click on the "Total Royalties" card
    await page.click('#dashboard .metric-card:nth-child(1)');

    // Wait for the royalty records section to be visible
    await page.waitForSelector('#royalty-records', { state: 'visible' });

    // Verify that the royalty records section is visible
    const royaltyRecordsSection = await page.locator('#royalty-records');
    await expect(royaltyRecordsSection).toBeVisible();

    // Verify that the table contains the seeded data
    const tableBody = await page.locator('#royalty-records-tbody');
    const rows = await tableBody.locator('tr').count();
    expect(rows).toBeGreaterThan(0);

    // Check for a specific record
    const kwaliniRecord = await tableBody.locator('tr:has-text("Kwalini Quarry")');
    await expect(kwaliniRecord).toBeVisible();
  });
});
