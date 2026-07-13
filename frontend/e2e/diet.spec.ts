/**
 * End-to-end tests for the Diet Tracker panel.
 *
 * Prerequisites:
 *  - Next.js dev server running on http://localhost:3000
 *  - Express backend running on http://localhost:8089
 *
 * Each test registers a fresh user via the API and authenticates by setting
 * the auth cookie directly, then drives the browser through the meal-log
 * CRUD flow.
 */
import { test, expect, type BrowserContext } from "@playwright/test";

const BASE = "http://localhost:3000";

function uniqueUser() {
    const suffix = Date.now();
    return {
        firstName: "E2E",
        lastName: "Diet",
        email: `e2e-diet-${suffix}@example.com`,
        username: `e2ediet${suffix}`,
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

test.describe("Diet Tracker Panel", () => {
    test.beforeEach(async ({ context }) => {
        await registerAndLogin(context);
    });

    test("page loads with Diet Tracker heading", async ({ page }) => {
        await page.goto(`${BASE}/dashboard/diet`);
        await expect(page.getByRole("heading", { name: /diet tracker/i })).toBeVisible();
    });

    test("shows empty state when no meals are logged", async ({ page }) => {
        await page.goto(`${BASE}/dashboard/diet`);
        await expect(page.getByText(/no meals logged yet/i)).toBeVisible();
    });

    test("shows a prompt to set date of birth when no recommendation exists", async ({ page }) => {
        await page.goto(`${BASE}/dashboard/diet`);
        await expect(page.getByText(/set your date of birth in your profile/i)).toBeVisible();
    });

    test("Log Meal modal opens and closes", async ({ page }) => {
        await page.goto(`${BASE}/dashboard/diet`);
        await page.click('button:has-text("Log Meal")');
        await expect(page.getByRole("heading", { name: /^log meal$/i })).toBeVisible();

        await page.click('button:has-text("Cancel")');
        await expect(page.getByRole("heading", { name: /^log meal$/i })).not.toBeVisible();
    });

    test("full CRUD flow: create, edit, delete", async ({ page }) => {
        await page.goto(`${BASE}/dashboard/diet`);

        /* --- Create --- */
        await page.click('button:has-text("Log Meal")');
        const modal = page.locator(".fixed");
        await modal.locator("#meal-food").fill("Grilled Chicken Salad");
        await modal.locator("#meal-calories").fill("450");
        await modal.locator('button[type="submit"]').click();
        await page.waitForSelector("text=Meal entry created", { timeout: 10_000 });

        await expect(page.getByText("Grilled Chicken Salad")).toBeVisible();

        /* --- Edit --- */
        await page.click('button:has-text("Edit")');
        await expect(page.getByRole("heading", { name: /edit meal/i })).toBeVisible();
        await page.locator(".fixed").locator("#meal-calories").fill("600");
        await page.locator(".fixed").locator('button[type="submit"]').click();
        await page.waitForSelector("text=Meal entry updated", { timeout: 10_000 });
        await expect(page.getByText("600 kcal")).toBeVisible();

        /* --- Delete --- */
        await page.click('button:has-text("Delete")');
        await expect(page.getByRole("heading", { name: /delete meal entry/i })).toBeVisible();
        await page.locator(".fixed").locator('button:has-text("Delete")').click();
        await page.waitForSelector("text=Meal entry deleted", { timeout: 10_000 });
        await expect(page.getByText(/no meals logged yet/i)).toBeVisible();
    });

    test("Create form shows validation on empty submit", async ({ page }) => {
        await page.goto(`${BASE}/dashboard/diet`);
        await page.click('button:has-text("Log Meal")');
        await page.click('button[type="submit"]:has-text("Log Meal")');
        await expect(page.locator("text=Food name is required")).toBeVisible();
    });
});

test.describe("Diet auth guard", () => {
    test("unauthenticated user is redirected from diet page", async ({ page }) => {
        await page.goto(`${BASE}/dashboard/diet`);
        await expect(page).not.toHaveURL(/dashboard\/diet/);
    });
});
