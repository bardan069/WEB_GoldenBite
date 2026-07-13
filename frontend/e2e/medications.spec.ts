/**
 * End-to-end tests for the Medication Reminders panel.
 *
 * Prerequisites:
 *  - Next.js dev server running on http://localhost:3000
 *  - Express backend running on http://localhost:8089
 *
 * Each test registers a fresh user via the API and authenticates by setting
 * the auth cookie directly, then drives the browser through the medication
 * CRUD flow.
 */
import { test, expect, type BrowserContext } from "@playwright/test";

const BASE = "http://localhost:3000";

function uniqueUser() {
    const suffix = Date.now();
    return {
        firstName: "E2E",
        lastName: "Medication",
        email: `e2e-medication-${suffix}@example.com`,
        username: `e2emed${suffix}`,
        password: "password123",
    };
}

/** Register a fresh user via the API and store the auth cookie into the browser context. */
async function registerAndLogin(context: BrowserContext) {
    const user = uniqueUser();
    await context.request.post(`${BASE}/api/v1/auth/register`, { data: user });
    const response = await context.request.post(`${BASE}/api/v1/auth/login`, {
        data: { email: user.email, password: user.password },
    });
    const body = await response.json();
    const token: string = body?.data?.token ?? "";
    const loggedInUser = body?.data?.user ?? {};

    await context.addCookies([
        {
            name: "auth_token",
            value: token,
            domain: "localhost",
            path: "/",
            httpOnly: true,
            secure: false,
        },
        {
            name: "user_data",
            value: encodeURIComponent(JSON.stringify(loggedInUser)),
            domain: "localhost",
            path: "/",
            httpOnly: false,
            secure: false,
        },
    ]);
}

test.describe("Medication Reminders Panel", () => {
    test.beforeEach(async ({ context }) => {
        await registerAndLogin(context);
    });

    test("page loads with Medication Reminders heading", async ({ page }) => {
        await page.goto(`${BASE}/dashboard/medications`);
        await expect(page.getByRole("heading", { name: /medication reminders/i })).toBeVisible();
    });

    test("shows empty state when no medications exist", async ({ page }) => {
        await page.goto(`${BASE}/dashboard/medications`);
        await expect(page.getByText(/no medications yet/i)).toBeVisible();
    });

    test("Add Medication modal opens and closes", async ({ page }) => {
        await page.goto(`${BASE}/dashboard/medications`);
        await page.click('button:has-text("Add Medication")');
        await expect(page.getByRole("heading", { name: /add medication/i })).toBeVisible();

        await page.click('button:has-text("Cancel")');
        await expect(page.getByRole("heading", { name: /add medication/i })).not.toBeVisible();
    });

    test("full CRUD flow: create, edit, mark taken, delete", async ({ page }) => {
        await page.goto(`${BASE}/dashboard/medications`);

        /* --- Create --- */
        await page.click('button:has-text("Add Medication")');
        const modal = page.locator(".fixed");
        await modal.locator("#med-name").fill("Vitamin D");
        await modal.locator("#med-dosage").fill("1 tablet");
        await modal.locator("#med-frequency").fill("1");
        await modal.locator('input[type="time"]').first().fill("08:00");
        await modal.locator("#med-start").fill(new Date().toISOString().slice(0, 10));
        await modal.locator('button[type="submit"]').click();
        await page.waitForSelector("text=Medication created", { timeout: 10_000 });

        await expect(page.getByRole("heading", { name: "Vitamin D" })).toBeVisible();

        /* --- Edit --- */
        await page.click('button:has-text("Edit")');
        await expect(page.getByRole("heading", { name: /edit medication/i })).toBeVisible();
        await page.locator(".fixed").locator("#med-dosage").fill("2 tablets");
        await page.locator(".fixed").locator('button[type="submit"]').click();
        await page.waitForSelector("text=Medication updated", { timeout: 10_000 });
        await expect(page.getByText("2 tablets")).toBeVisible();

        /* --- Mark taken --- */
        await page.click('button:has-text("Mark taken")');
        await page.waitForSelector("text=Marked as taken for today", { timeout: 10_000 });

        /* --- Delete --- */
        await page.click('button:has-text("Delete")');
        await expect(page.getByRole("heading", { name: /delete medication/i })).toBeVisible();
        await page.locator(".fixed").locator('button:has-text("Delete")').click();
        await page.waitForSelector("text=Medication deleted", { timeout: 10_000 });
        await expect(page.getByText(/no medications yet/i)).toBeVisible();
    });

    test("Create form shows validation on empty submit", async ({ page }) => {
        await page.goto(`${BASE}/dashboard/medications`);
        await page.click('button:has-text("Add Medication")');
        await page.click('button[type="submit"]:has-text("Add Medication")');
        await expect(page.locator("text=Name is required")).toBeVisible();
    });
});

test.describe("Medications auth guard", () => {
    test("unauthenticated user is redirected from medications page", async ({ page }) => {
        await page.goto(`${BASE}/dashboard/medications`);
        await expect(page).not.toHaveURL(/dashboard\/medications/);
    });
});
