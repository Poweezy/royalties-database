from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Capture console logs
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

    try:
        page.goto("http://localhost:5174/royalties.html", wait_until='domcontentloaded')
        page.wait_for_timeout(1000)

        # Log in
        page.fill("#username", "admin")
        page.fill("#password", "demo123")
        page.click('button[type="submit"]')

        # Wait for app to load
        page.wait_for_selector("#app-container", state="visible")
        page.wait_for_timeout(1000)

        # Navigate to JIB/Expense Tracking
        page.click('a[href="#expense-tracking"]')

        # Wait for the expense tracking section to be visible
        page.wait_for_selector("#expense-tracking", state="visible")
        page.wait_for_timeout(2000)

        # Screenshot of the default chart
        page.screenshot(path="jules-scratch/verification/expense-by-category.png")

        # Click "By Entity" and take a screenshot
        page.click('button[data-chart="expense-entity-chart-container"]')
        page.wait_for_timeout(1000)
        page.screenshot(path="jules-scratch/verification/expense-by-entity.png")

        # Click "Over Time" and take a screenshot
        page.click('button[data-chart="expense-time-series-chart-container"]')
        page.wait_for_timeout(1000)
        page.screenshot(path="jules-scratch/verification/expense-over-time.png")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
