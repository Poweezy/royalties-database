import os
from playwright.sync_api import sync_playwright, Page, expect

def login(page: Page, remember_me=False):
    """Helper function to log in."""
    page.goto('http://localhost:8000/royalties.html')
    page.locator("#username").fill("admin")
    page.locator("#password").fill("demo123")
    if remember_me:
        page.locator("#remember-me").check()
    page.get_by_role("button", name="Sign In").click()
    expect(page.locator("#app-container")).to_be_visible(timeout=10000)

def test_remember_me(page: Page):
    """Tests that the session persists when 'Remember Me' is checked."""
    print("Testing 'Remember Me' functionality...")
    login(page, remember_me=True)

    # Reload the page and check if the user is still logged in.
    page.reload()
    expect(page.locator("#app-container")).to_be_visible(timeout=10000)
    print("'Remember Me' test passed.")

def test_no_remember_me(context):
    """Tests that the session does not persist when 'Remember Me' is not checked."""
    print("Testing 'Remember Me' not checked functionality...")
    page = context.new_page()
    login(page, remember_me=False)

    # The session is in sessionStorage, so it should be cleared when the context is closed.
    # We will create a new context to simulate this.
    # In a real test suite, we would close and reopen the browser.

    # For this verification, we can simulate by clearing session storage and reloading.
    page.evaluate("sessionStorage.clear()")
    page.reload()
    expect(page.locator("#login-section")).to_be_visible(timeout=10000)
    print("'Remember Me' not checked test passed.")


# Boilerplate to run the tests
if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        page.set_viewport_size({"width": 1920, "height": 1080})

        test_remember_me(page)

        # Create a new context for the second test to ensure isolation
        context2 = browser.new_context()
        test_no_remember_me(context2)

        browser.close()
