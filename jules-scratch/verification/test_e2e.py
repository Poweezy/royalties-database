import pytest
from playwright.sync_api import sync_playwright, expect, Page
import re

# A list of all the main navigation links and their corresponding section IDs
# Note: Logout is tested separately because it causes a page reload.
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

@pytest.fixture(scope="function")
def page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Login once for all tests in this module
        page.goto('http://localhost:8001/royalties.html')
        expect(page.locator('#loading-screen')).to_be_hidden(timeout=10000)
        page.locator('#username').fill('admin')
        page.locator('#password').fill('demo123')
        page.locator('#login-form button[type="submit"]').click()
        expect(page.locator('#app-container')).to_be_visible(timeout=10000)

        yield page

        browser.close()

def test_login_successful(page: Page):
    """
    Tests if the login was successful and the dashboard is visible.
    """
    expect(page.locator("#dashboard")).to_be_visible()

@pytest.mark.parametrize("name, section_id", NAV_LINKS)
def test_navigation_links(page: Page, name: str, section_id: str):
    """
    Tests that all main navigation links work correctly by making the relevant section visible.
    """
    nav_link_selector = f'nav#main-nav a[href="{section_id}"]'
    nav_link = page.locator(nav_link_selector)

    expect(nav_link).to_be_visible()
    nav_link.click()

    section = page.locator(section_id)
    expect(section).to_be_visible(timeout=5000)

    # Ensure other sections are not visible after navigation
    for other_name, other_section_id in NAV_LINKS:
        if other_section_id != section_id:
            # A small delay to allow for fade-out animations if any
            page.wait_for_timeout(50)
            other_section = page.locator(other_section_id)
            expect(other_section).not_to_be_visible()

def test_user_add_and_delete_flow(page: Page):
    """
    Tests the full user management flow: navigating, adding a user,
    verifying the user is added, deleting the user, and verifying deletion.
    """
    # Navigate to User Management
    page.locator('nav#main-nav a[href="#user-management"]').click()
    user_management_section = page.locator("#user-management")
    expect(user_management_section).to_be_visible()

    # --- Add User ---
    add_user_btn = page.locator("#add-user-btn")
    add_user_form = page.locator("#add-user-form-container")

    expect(add_user_btn).to_be_visible()
    add_user_btn.click()
    expect(add_user_form).to_be_visible()

    # Fill out the form
    test_username = "testuser_jules"
    page.locator("#new-username").fill(test_username)
    page.locator("#new-email").fill("test@example.com")
    page.locator("#new-role").select_option("Editor")
    page.locator("#new-department").select_option("Operations")
    page.locator("#new-password").fill("password123")
    page.locator("#confirm-password").fill("password123")

    create_user_btn = page.locator("#create-user-btn")
    create_user_btn.click()

    # Verify success notification for user creation
    creation_notification = page.locator(f".notification-toast:has-text('User \\'{test_username}\\' created successfully.')")
    expect(creation_notification).to_be_visible()

    # Verify the form is hidden
    expect(add_user_form).to_be_hidden()

    # Verify the new user appears in the table
    user_row = page.locator(f"//tr[td[text()='{test_username}']]")
    expect(user_row).to_be_visible()
    expect(user_row.locator("td").nth(2)).to_have_text("test@example.com")
    expect(user_row.locator("td").nth(3)).to_have_text("Editor")

    # --- Delete User ---
    delete_button = user_row.locator("button[title='Delete user']")

    # Handle the confirmation dialog
    page.on("dialog", lambda dialog: dialog.accept())

    delete_button.click()

    # Verify success notification for deletion
    deletion_notification = page.locator(f".notification-toast:has-text('User \\'{test_username}\\' has been deleted.')")
    expect(deletion_notification).to_be_visible()

    # Verify the user is no longer in the table
    expect(user_row).to_be_hidden()


def test_royalty_records_add_flow(page: Page):
    """
    Tests adding a new royalty record.
    """
    # Navigate to Royalty Records
    page.locator('nav#main-nav a[href="#royalty-records"]').click()
    royalty_section = page.locator("#royalty-records")
    expect(royalty_section).to_be_visible()

    # Fill out the form
    page.locator("#entity").select_option("Kwalini Quarry")
    page.locator("#mineral").select_option("Gravel")
    page.locator("#volume").fill("1500")
    page.locator("#tariff").fill("12.5")
    page.locator("#payment-date").fill("2025-08-22")

    # Click save
    page.locator("#save-royalty-btn").click()

    # Verify the new record appears in the table
    record_row = page.locator("#royalty-records-tbody tr").last
    expect(record_row.locator("td").nth(0)).to_have_text("Kwalini Quarry")
    expect(record_row.locator("td").nth(1)).to_have_text("Gravel")
    expect(record_row.locator("td").nth(2)).to_have_text("1,500")


def test_contract_management_add_flow(page: Page):
    """
    Tests adding a new contract.
    """
    # Navigate to Contract Management
    page.locator('nav#main-nav a[href="#contract-management"]').click()
    contract_section = page.locator("#contract-management")
    expect(contract_section).to_be_visible()

    # Click the "Add Contract" button to show the form
    add_contract_btn = contract_section.locator("#add-contract-btn")
    add_contract_btn.click()

    # Get the form and assert it's visible
    form_container = contract_section.locator("#add-contract-form-container")
    expect(form_container).to_be_visible()

    # Fill out the form
    form_container.locator("#contract-entity").select_option("Maloma Colliery")
    form_container.locator("#royalty-rate").fill("25.50")
    form_container.locator("#start-date").fill("2025-09-01")

    # Click save
    save_button = form_container.get_by_role("button", name="Save Contract")
    save_button.click()

    # Verify the new record appears in the table
    table = contract_section.locator("table")
    # Find the specific row for the entity we added
    record_row = table.locator("tr", has_text="Maloma Colliery").last
    expect(record_row.locator("td").nth(0)).to_have_text("Maloma Colliery")
    expect(record_row.locator("td").nth(1)).to_have_text("E25.50")
    expect(record_row.locator("td").nth(2)).to_have_text("2025-09-01")


def test_logout_functionality(page: Page):
    """
    Tests that the two-step logout process works correctly.
    """
    # 1. Click the sidebar link
    logout_link_selector = 'nav#main-nav a[href="#logout"]'
    logout_link = page.locator(logout_link_selector)
    expect(logout_link).to_be_visible()
    logout_link.click()

    # 2. Assert that the logout confirmation page is visible
    logout_section = page.locator("#logout")
    expect(logout_section).to_be_visible()
    confirm_button = page.locator("#confirm-logout-btn")
    expect(confirm_button).to_be_visible()

    # 3. Click the confirmation button and wait for the reload
    with page.expect_navigation():
        confirm_button.click()

    # 4. Assert that the login screen is now visible
    login_section = page.locator("#login-section")
    expect(login_section).to_be_visible(timeout=10000)

# To run this test:
# 1. Make sure you have a web server running in the root directory (e.g., python -m http.server 8001 &)
# 2. Run pytest: `pytest jules-scratch/verification/test_e2e.py`
