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
        page.locator('#username').fill('admin')
        page.locator('#password').fill('demo123')
        page.locator('#login-form button[type="submit"]').click()
        expect(page.locator('#app-container')).to_be_visible(timeout=10000)

        yield page

        browser.close()

NAV_LINKS = [
    ("Dashboard", "#dashboard"),
    ("User Management", "#user-management"),
    ("Royalty Records", "#royalty-records"),
    ("Contract Management", "#contract-management"),
    ("Audit Dashboard", "#audit-dashboard"),
    ("Reporting & Analytics", "#reporting-analytics"),
    ("Communication", "#communication"),
    ("Notifications", "#notifications"),
    ("Compliance & Regulatory", "#compliance"),
    ("Regulatory Management", "#regulatory-management"),
    ("AI Search", "#semantic-search"),
    ("My Profile", "#profile"),
]

@pytest.mark.parametrize("name, section_id", NAV_LINKS)
def test_navigation_links_and_titles(page: Page, name: str, section_id: str):
    """
    Tests that all main navigation links work correctly and each section has a non-empty title.
    """
    nav_link_selector = f'nav a[href="{section_id}"]'
    nav_link = page.locator(nav_link_selector)

    expect(nav_link).to_be_visible()
    nav_link.click()

    section = page.locator(section_id)
    expect(section).to_be_visible(timeout=5000)

    # Check that the main h1 title in the section is not empty
    title = section.locator("h1").first
    expect(title).not_to_be_empty()
    # Check for placeholder question marks
    expect(title).not_to_contain_text("??")


def test_user_management_full_flow(page: Page):
    """
    Tests the full user management flow: adding, editing, filtering, and deleting a user.
    """
    page.locator('nav a[href="#user-management"]').click()
    user_management_section = page.locator("#user-management")
    expect(user_management_section).to_be_visible()

    add_user_btn = page.locator("#add-user-btn")
    add_user_form = page.locator("#add-user-form-container")

    add_user_btn.click()
    expect(add_user_form).to_be_visible()

    test_username = "test_qa_user"
    page.locator("#new-username").fill(test_username)
    page.locator("#new-email").fill("qa@example.com")
    page.locator("#new-user-role").select_option("Editor")
    page.locator("#new-department").select_option("Operations")
    page.locator("#new-password").fill("password123")
    page.locator("#confirm-password").fill("password123")

    page.locator("#create-user-btn").click()
    expect(add_user_form).to_be_hidden()

    user_row = page.locator(f"tr:has-text('{test_username}')")
    expect(user_row).to_be_visible()

    user_row.locator("button[title='Edit user']").click()
    expect(add_user_form).to_be_visible()

    page.locator("#new-email").fill("qa_updated@example.com")
    page.locator("#new-user-role").select_option("Viewer")

    page.locator("#create-user-btn").click()
    expect(add_user_form).to_be_hidden()

    expect(user_row.locator("td").nth(2)).to_have_text("qa_updated@example.com")
    expect(user_row.locator("td").nth(3)).to_have_text("Viewer")

    page.on("dialog", lambda dialog: dialog.accept())
    user_row.locator("button[title='Delete user']").click()

    expect(user_row).to_be_hidden()

def test_royalty_records_add_flow(page: Page):
    page.locator('nav a[href="#royalty-records"]').click()
    royalty_section = page.locator("#royalty-records")
    expect(royalty_section).to_be_visible()

    page.locator("#entity").select_option("Kwalini Quarry")
    page.locator("#mineral").select_option("Gravel")
    page.locator("#volume").fill("2000")
    page.locator("#tariff").fill("15")
    page.locator("#payment-date").fill("2025-08-24")

    page.locator("#save-royalty-btn").click()

    record_row = page.locator("#royalty-records-tbody tr:has-text('Kwalini Quarry')").last
    expect(record_row).to_be_visible()
    expect(record_row.locator("td").nth(2)).to_have_text("Gravel")

def test_contract_management_add_flow(page: Page):
    page.locator('nav a[href="#contract-management"]').click()
    contract_section = page.locator("#contract-management")
    expect(contract_section).to_be_visible()

    contract_section.locator("#add-contract-btn").click()
    form_container = contract_section.locator("#add-contract-form-container")
    expect(form_container).to_be_visible()

    form_container.locator("#contract-entity").select_option("Ngwenya Mine")
    form_container.locator("#party-name").fill("Test Party")
    form_container.locator("#start-date").fill("2025-01-01")
    form_container.locator("#end-date").fill("2026-01-01")
    form_container.locator("#royalty-rate").fill("30.00")
    form_container.locator("#contract-status").select_option("Active")

    form_container.get_by_role("button", name="Save Contract").click()

    record_row = contract_section.locator("table tr:has-text('Ngwenya Mine')").last
    expect(record_row).to_be_visible()
    expect(record_row.locator("td").nth(5)).to_have_text("E30.00")

def test_idle_timer_logout(page: Page):
    page.wait_for_timeout(31 * 1000)

    page.screenshot(path="jules-scratch/verification/debug_screenshot.png")
    idle_modal = page.locator("#idle-modal")
    expect(idle_modal).to_be_visible()

    countdown_element = page.locator("#idle-countdown")
    expect(countdown_element).to_have_text(re.compile(r'\d{1,2}'))

    with page.expect_navigation():
        page.wait_for_timeout(11 * 1000)

    login_section = page.locator("#login-section")
    expect(login_section).to_be_visible(timeout=10000)
