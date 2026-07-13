/**
 * End-to-end tests for the Exercise Reminders panel.
 *
 * Prerequisites:
 *  - Next.js dev server running on http://localhost:3000
 *  - Express backend running on http://localhost:8089
 *
 * Each test registers a fresh user via the API and authenticates by setting
 * the auth cookie directly, then drives the browser through the exercise
 * CRUD flow.
 */
import { test, expect, type BrowserContext } from "@playwright/test";

const BASE = "http://localhost:3000";

function uniqueUser() {
    const suffix = Date.now();
    return {
        firstName: "E2E",
        lastName: "Exercise",
        email: `e2e-exercise-${suffix}@example.com`,
        username: `e2eex${suffix}`,
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

test.describe("Exercise Reminders Panel", () => {
    test.beforeEach(async ({ context }) => {
        await registerAndLogin(context);
    });

    test("page loads with Exercise Reminders heading", async ({ page }) => {
        await page.goto(`${BASE}/dashboard/exercises`);
        await expect(page.getByRole("heading", { name: /exercise reminders/i })).toBeVisible();
    });

    test("shows empty state when no exercises exist", async ({ page }) => {
        await page.goto(`${BASE}/dashboard/exercises`);
        await expect(page.getByText(/no exercises yet/i)).toBeVisible();
    });

    test("Add Exercise modal opens and closes", async ({ page }) => {
        await page.goto(`${BASE}/dashboard/exercises`);
        await page.click('button:has-text("Add Exercise")');
        await expect(page.getByRole("heading", { name: /add exercise/i })).toBeVisible();

        await page.click('button:has-text("Cancel")');
        await expect(page.getByRole("heading", { name: /add exercise/i })).not.toBeVisible();
    });

    test("full CRUD flow: create, edit, mark complete, delete", async ({ page }) => {
        await page.goto(`${BASE}/dashboard/exercises`);

        /* --- Create --- */
        await page.click('button:has-text("Add Exercise")');
        const modal = page.locator(".fixed");
        await modal.locator("#ex-name").fill("Morning Walk");
        await modal.locator('button[aria-pressed]:has-text("Mon")').click();
        await modal.locator('button[type="submit"]').click();
        await page.waitForSelector("text=Exercise created", { timeout: 10_000 });

        await expect(page.getByRole("heading", { name: "Morning Walk" })).toBeVisible();

        /* --- Edit --- */
        await page.click('button:has-text("Edit")');
        await expect(page.getByRole("heading", { name: /edit exercise/i })).toBeVisible();
        await page.locator(".fixed").locator("#ex-duration").fill("30");
        await page.locator(".fixed").locator('button[type="submit"]').click();
        await page.waitForSelector("text=Exercise updated", { timeout: 10_000 });
        await expect(page.getByText(/30 min/)).toBeVisible();

        /* --- Mark complete --- */
        await page.click('button:has-text("Mark complete")');
        await page.waitForSelector("text=Marked as complete for today", { timeout: 10_000 });

        /* --- Delete --- */
        await page.click('button:has-text("Delete")');
        await expect(page.getByRole("heading", { name: /delete exercise/i })).toBeVisible();
        await page.locator(".fixed").locator('button:has-text("Delete")').click();
        await page.waitForSelector("text=Exercise deleted", { timeout: 10_000 });
        await expect(page.getByText(/no exercises yet/i)).toBeVisible();
    });

    test("Create form shows validation on empty submit", async ({ page }) => {
        await page.goto(`${BASE}/dashboard/exercises`);
        await page.click('button:has-text("Add Exercise")');
        await page.click('button[type="submit"]:has-text("Add Exercise")');
        await expect(page.locator("text=Name is required")).toBeVisible();
    });
});

test.describe("Exercises auth guard", () => {
    test("unauthenticated user is redirected from exercises page", async ({ page }) => {
        await page.goto(`${BASE}/dashboard/exercises`);
        await expect(page).not.toHaveURL(/dashboard\/exercises/);
    });
});
