from playwright.sync_api import sync_playwright, expect
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Navigate to the local server
    page.goto('http://localhost:8000/royalties.html')

    # Wait for the loading screen to disappear
    expect(page.locator('#loading-screen')).to_be_hidden(timeout=10000)

    # Login
    page.locator('#username').fill('admin')
    page.locator('#password').fill('anypassword') # Since I refactored the login
    page.locator('#login-form button[type="submit"]').click()

    # Wait for the app container to be visible
    expect(page.locator('#app-container')).to_be_visible(timeout=10000)

    # Navigate to User Management
    page.locator('a[href="#user-management"]').click()
    expect(page.locator('#user-management')).to_be_visible()

    # Click "Add User" to show the form
    page.locator('#add-user-btn').click()
    expect(page.locator('#add-user-form-container')).to_be_visible()

    # Take a screenshot of the User Management page with the form open
    page.screenshot(path="jules-scratch/verification/ui_verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
