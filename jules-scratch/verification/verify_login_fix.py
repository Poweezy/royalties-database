import os
from playwright.sync_api import sync_playwright, Page, expect

def verify_login_fix(page: Page):
    """
    This test verifies that the login functionality is working after the fix.
    """
    # 1. Arrange: Go to the royalties.html page.
    page.goto('http://localhost:8000/royalties.html')

    # 2. Act: Log in with "Remember Me" checked
    page.locator("#username").fill("admin")
    page.locator("#password").fill("demo123")
    page.locator("#remember-me").check()
    page.get_by_role("button", name="Sign In").click()

    # 3. Assert: Wait for the app container to be visible
    expect(page.locator("#app-container")).to_be_visible(timeout=10000)

    # 4. Act: Take a screenshot
    page.screenshot(path="jules-scratch/verification/login_fix.png")

# Boilerplate to run the test
if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1920, "height": 1080})
        verify_login_fix(page)
        browser.close()
