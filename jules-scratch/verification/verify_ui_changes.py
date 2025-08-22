from playwright.sync_api import sync_playwright, expect
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    try:
        # Navigate to the local server
        page.goto('http://localhost:8000/royalties.html')

        # Wait for the loading screen to disappear
        expect(page.locator('#loading-screen')).to_be_hidden(timeout=10000)

        # Login
        page.locator('#username').fill('admin')
        page.locator('#password').fill('demo123')
        page.locator('#login-form button[type="submit"]').click()

        # Wait for the app container to be visible
        expect(page.locator('#app-container')).to_be_visible(timeout=10000)

        # Navigate to User Management
        page.locator('a[href="#user-management"]').click()
        expect(page.locator('#user-management')).to_be_visible()

        # --- Verification Steps ---

        # 1. Test Filtering
        page.locator('#filter-search').fill('j.doe')
        expect(page.locator('#users-table-tbody tr')).to_have_count(1)
        expect(page.locator('#users-table-tbody tr')).to_contain_text('j.doe')
        page.locator('#filter-search').fill('') # Clear search

        # 2. Test Adding a User
        page.locator('#add-user-btn').click()
        expect(page.locator('#add-user-form-container')).to_be_visible()
        page.locator('#new-username').fill('testuser')
        page.locator('#new-email').fill('test@example.com')
        page.locator('#new-role').select_option('Editor')
        page.locator('#new-department').select_option('Finance')
        page.locator('#new-password').fill('password123')
        page.locator('#confirm-password').fill('password123')
        page.locator('#add-user-form button[type="submit"]').click()
        expect(page.locator('#add-user-form-container')).to_be_hidden()
        expect(page.locator('#users-table-tbody')).to_contain_text('testuser')

        # 3. Test Editing the New User
        # Find the row for 'testuser' and click its edit button
        user_row = page.locator('tr', has_text='testuser')
        user_row.locator('button[title="Edit user"]').click()
        expect(page.locator('#add-user-form-container')).to_be_visible()
        page.locator('#new-department').select_option('Operations')
        page.locator('#add-user-form button[type="submit"]').click()
        expect(page.locator('#add-user-form-container')).to_be_hidden()
        expect(user_row).to_contain_text('Operations')

        # 4. Test Deleting the New User
        # Re-find the row to ensure we have the latest state
        user_row = page.locator('tr', has_text='testuser')
        # Handle the confirmation dialog
        page.on('dialog', lambda dialog: dialog.accept())
        user_row.locator('button[title="Delete user"]').click()

        # Verify the user is gone
        expect(page.locator('#users-table-tbody')).not_to_contain_text('testuser')

        # Take a final screenshot
        page.screenshot(path="jules-scratch/verification/user_management_verification.png")

        print("User management verification script completed successfully!")

    finally:
        browser.close()


with sync_playwright() as playwright:
    run(playwright)
