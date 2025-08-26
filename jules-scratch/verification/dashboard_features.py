from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:8000/royalties.html")

    # Login
    expect(page.locator("#login-form")).to_be_visible()
    page.locator("#username").fill("admin")
    page.locator("#password").fill("demo123")
    page.get_by_role("button", name="Sign In").click()
    expect(page.locator("#app-container")).to_be_visible()

    # Verify Drill-Down for Active Entities
    page.get_by_text("Active Entities").click()
    expect(page.locator("#user-management")).to_be_visible()
    expect(page.locator("#filter-status")).to_have_value("active")
    page.locator("#filter-status").scroll_into_view_if_needed()
    page.screenshot(path="jules-scratch/verification/drill_down_active.png")

    # Go back to dashboard
    page.locator('a[href="#dashboard"]').click()
    expect(page.locator("#dashboard")).to_be_visible()

    # Verify Drill-Down for Pending Approvals
    page.get_by_text("Pending Approvals").click()
    expect(page.locator("#user-management")).to_be_visible()
    expect(page.locator("#filter-status")).to_have_value("inactive")
    page.screenshot(path="jules-scratch/verification/drill_down_pending.png")

    # Go back to dashboard
    page.locator('a[href="#dashboard"]').click()
    expect(page.locator("#dashboard")).to_be_visible()

    # Verify Leaderboards
    expect(page.locator("#top-entities-list")).to_be_visible()
    expect(page.locator("#overdue-entities-list")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/leaderboards.png")

    # Verify Export buttons
    page.locator('.export-chart-btn[data-chart-id="revenue-trends-chart"]').click()
    page.locator('.export-chart-btn[data-chart-id="production-by-entity-chart"]').click()

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
