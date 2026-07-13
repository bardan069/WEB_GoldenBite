/**
 * End-to-end tests for the Admin User Management panel.
 *
 * Prerequisites:
 *  - Next.js dev server running on http://localhost:3000
 *  - Express backend running on http://localhost:8089
 *  - An admin account exists: email=admintest@example.com, password=password123
 *
 * The tests authenticate via the API to set the auth cookie, then drive
 * the browser through the full CRUD flow of the admin users page.
 */
import { test, expect, type BrowserContext } from "@playwright/test";

const ADMIN_EMAIL = "admintest@example.com";
const ADMIN_PASSWORD = "password123";
const BASE = "http://localhost:3000";

/** Login via API and store auth cookie into the browser context. */
async function loginAsAdmin(context: BrowserContext) {
    const response = await context.request.post(`${BASE}/api/v1/auth/login`, {
        data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
    const body = await response.json();
    const token: string = body?.data?.token ?? "";
    const user = body?.data?.user ?? {};

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
            value: encodeURIComponent(JSON.stringify(user)),
            domain: "localhost",
            path: "/",
            httpOnly: false,
            secure: false,
        },
    ]);
}

test.describe("Admin Users Panel", () => {
    test.beforeEach(async ({ context }) => {
        await loginAsAdmin(context);
    });

    test("page loads with User Management heading", async ({ page }) => {
        await page.goto(`${BASE}/dashboard/admin/users`);
        await expect(page.getByRole("heading", { name: /user management/i })).toBeVisible();
    });

    test("displays user table with expected columns", async ({ page }) => {
        await page.goto(`${BASE}/dashboard/admin/users`);
        await page.waitForSelector("thead th");
        const headers = await page.locator("thead th").allTextContents();
        expect(headers.some((h) => /name/i.test(h))).toBe(true);
        expect(headers.some((h) => /email/i.test(h))).toBe(true);
        expect(headers.some((h) => /role/i.test(h))).toBe(true);
    });

    test("shows users in the table", async ({ page }) => {
        await page.goto(`${BASE}/dashboard/admin/users`);
        await page.waitForSelector("tbody tr");
        const rows = await page.locator("tbody tr").count();
        expect(rows).toBeGreaterThan(0);
    });

    test("search filters results", async ({ page }) => {
        await page.goto(`${BASE}/dashboard/admin/users`);
        await page.waitForSelector("tbody tr");

        await page.fill('input[placeholder="Search by name or email..."]', "admintest");
        await page.waitForTimeout(500);
        const rows = await page.locator("tbody tr").count();
        expect(rows).toBeGreaterThanOrEqual(1);
    });

    test("Add User modal opens and closes", async ({ page }) => {
        await page.goto(`${BASE}/dashboard/admin/users`);
        await page.click('button:has-text("Add User")');
        await expect(page.getByRole("heading", { name: /create user/i })).toBeVisible();

        await page.click('button:has-text("Cancel")');
        await expect(page.getByRole("heading", { name: /create user/i })).not.toBeVisible();
    });

    test("Create form shows validation on empty submit", async ({ page }) => {
        await page.goto(`${BASE}/dashboard/admin/users`);
        await page.click('button:has-text("Add User")');
        await page.click('button[type="submit"]:has-text("Create")');
        await expect(page.locator("text=Required").first()).toBeVisible();
    });

    test("full CRUD flow: create, edit, delete", async ({ page }) => {
        const suffix = Date.now();
        const testEmail = `e2etestuser${suffix}@example.com`;
        const testUsername = `e2etestuser${suffix}`;

        await page.goto(`${BASE}/dashboard/admin/users`);

        /* --- Create --- */
        await page.click('button:has-text("Add User")');
        await expect(page.getByRole("heading", { name: /create user/i })).toBeVisible();

        const modal = page.locator(".fixed");
        await modal.locator('input[type="text"]').nth(0).fill("E2E");
        await modal.locator('input[type="text"]').nth(1).fill("Testuser");
        await modal.locator('input[type="email"]').fill(testEmail);
        await modal.locator('input[type="text"]').nth(2).fill(testUsername);
        await modal.locator('input[type="password"]').fill("password123");
        await modal.locator('button[type="submit"]:has-text("Create")').click();

        await page.waitForSelector('text=User created', { timeout: 10_000 });

        /* --- Search for the created user --- */
        await page.fill('input[placeholder="Search by name or email..."]', testUsername);
        await page.waitForTimeout(600);
        await expect(page.locator("tbody tr")).toHaveCount(1);

        /* --- Edit --- */
        await page.click('button:has-text("Edit")');
        await expect(page.getByRole("heading", { name: /edit user/i })).toBeVisible();
        const editModal = page.locator(".fixed");
        const firstNameInput = editModal.locator('input[type="text"]').nth(0);
        await firstNameInput.fill("E2EEdited");
        await editModal.locator('button[type="submit"]:has-text("Save")').click();
        await page.waitForSelector('text=User updated', { timeout: 10_000 });

        /* --- Delete --- */
        await page.fill('input[placeholder="Search by name or email..."]', testUsername);
        await page.waitForTimeout(600);
        await page.click('button:has-text("Delete")');
        await expect(page.getByRole("heading", { name: /delete user/i })).toBeVisible();
        await page.locator(".fixed").locator('button:has-text("Delete")').click();
        await page.waitForSelector('text=User deleted', { timeout: 10_000 });
    });
});

test.describe("Auth flow", () => {
    test("unauthenticated user is redirected from admin page", async ({ page }) => {
        await page.goto(`${BASE}/dashboard/admin/users`);
        await expect(page).not.toHaveURL(/admin\/users/);
    });

    test("login page renders correctly", async ({ page }) => {
        await page.goto(`${BASE}/login`);
        await expect(page.getByLabel(/email/i)).toBeVisible();
        await expect(page.getByLabel(/^password$/i)).toBeVisible();
        await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
    });

    test("register page renders all fields", async ({ page }) => {
        await page.goto(`${BASE}/register`);
        await expect(page.getByLabel(/first name/i)).toBeVisible();
        await expect(page.getByLabel(/last name/i)).toBeVisible();
        await expect(page.getByLabel(/username/i)).toBeVisible();
        await expect(page.getByLabel(/^email/i)).toBeVisible();
    });
});
