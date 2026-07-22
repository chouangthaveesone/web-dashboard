import sys
import time
from playwright.sync_api import sync_playwright

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        # Direct URL serving from the Go backend
        page = browser.new_page()
        page.goto("http://localhost:8080/")
        
        # Wait for fallback initialization to sample data
        page.wait_for_timeout(2500)
        
        # Take general landing page screenshot
        page.screenshot(path="/home/jules/verification/compact_table_dashboard.png", full_page=True)
        print("Compact dashboard screenshot saved.")

        # Click the first project name to enter Detailed View
        first_pj = page.locator("button:has-text('CRM HQV 01 Miss USD 01 Note')").first
        first_pj.click()
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/detailed_view_spa.png", full_page=True)
        print("Detailed View screenshot saved.")

        # Try out the Quick Append input
        page.fill("#quick-activity-input", "Playwright verified automatic weekly worklog append.")
        page.click("button:has-text('Append')")
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/detailed_view_after_append.png", full_page=True)
        print("Quick append verification screenshot saved.")

        # Click Edit inside Detail View to check the modal trigger
        page.click("#detail-btn-edit")
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/edit_modal_from_detailed.png", full_page=True)
        print("Edit Modal from Detailed view saved.")

        browser.close()

if __name__ == "__main__":
    main()
