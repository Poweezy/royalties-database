import pytest
from playwright.sync_api import sync_playwright, expect, Page
import re

@pytest.fixture(scope="function")
def page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        page.goto('http://localhost:8001/royalties.html')
        expect(page.locator('#loading-screen')).to_be_hidden(timeout=10000)

        yield page

        browser.close()

def test_login_and_idle_logout(page: Page):
    """
    Tests login, waits for idle timeout, and confirms automatic logout.
    """
    # Login
    page.locator('#username').fill('admin')
    page.locator('#password').fill('demo123')
    page.locator('#login-form button[type="submit"]').click()
    expect(page.locator('#app-container')).to_be_visible(timeout=10000)

    # 1. Wait for the idle timeout to trigger the modal
    page.wait_for_timeout(31 * 1000)

    # 2. Assert that the countdown modal is visible
    idle_modal = page.locator("#idle-modal")
    expect(idle_modal).to_be_visible()

    # 3. Check the initial countdown text
    countdown_element = page.locator("#idle-countdown")
    # Use a regex to account for timing variance; check that it's a number.
    expect(countdown_element).to_have_text(re.compile(r'\d{1,2}'))

    # 4. Wait for the countdown to finish and trigger logout
    with page.expect_navigation():
        page.wait_for_timeout(11 * 1000)

    # 5. Assert that the login screen is now visible
    login_section = page.locator("#login-section")
    expect(login_section).to_be_visible(timeout=10000)
