import asyncio
from playwright.async_api import async_playwright, TimeoutError
import pathlib

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # The Vite server should be running on port 5173 by default
        await page.goto('http://localhost:5173')

        # Wait for the login section to be visible
        await page.wait_for_selector('#login-section', state='visible', timeout=10000)

        # Login
        await page.fill('#username', 'admin')
        await page.fill('#password', 'demo123')
        await page.click('button[type="submit"]')

        # Wait for the app to load
        await page.wait_for_selector('#app-container', state='visible', timeout=5000)

        await page.screenshot(path="jules-scratch/verification/vite_setup_verification.png")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
