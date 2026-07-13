import request from "supertest";
import app from "../app";
import "./setup";

const adminUser = {
    firstName: "Admin",
    lastName: "User",
    email: "admin@example.com",
    username: "adminuser",
    password: "password123",
};

const regularUser = {
    firstName: "Regular",
    lastName: "User",
    email: "regular@example.com",
    username: "regularuser",
    password: "password123",
};

/** Helper: register a user and promote them to admin via the DB model directly. */
async function createAdminAndGetToken(): Promise<string> {
    const { UserModel } = await import("../models/user.model");
    await request(app).post("/api/v1/auth/register").send(adminUser);
    await UserModel.updateOne({ email: adminUser.email }, { role: "admin" });
    const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: adminUser.email, password: adminUser.password });
    return loginRes.body.data.token;
}

async function createRegularAndGetToken(): Promise<string> {
    await request(app).post("/api/v1/auth/register").send(regularUser);
    const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: regularUser.email, password: regularUser.password });
    return loginRes.body.data.token;
}

describe("Admin Users API", () => {
    describe("GET /api/v1/admin/users", () => {
        it("should return paginated user list for admin", async () => {
            const token = await createAdminAndGetToken();
            const res = await request(app)
                .get("/api/v1/admin/users")
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty("data");
            expect(res.body.data).toHaveProperty("meta");
            expect(res.body.data.meta).toMatchObject({ page: 1, limit: 10 });
        });

        it("should return 403 for non-admin user", async () => {
            const token = await createRegularAndGetToken();
            const res = await request(app)
                .get("/api/v1/admin/users")
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(403);
        });

        it("should return 401 for unauthenticated request", async () => {
            const res = await request(app).get("/api/v1/admin/users");
            expect(res.status).toBe(401);
        });

        it("should filter users by search term", async () => {
            const token = await createAdminAndGetToken();
            const res = await request(app)
                .get("/api/v1/admin/users?search=admin")
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.data.data.length).toBeGreaterThan(0);
        });

        it("should support page and limit query params", async () => {
            const token = await createAdminAndGetToken();
            const res = await request(app)
                .get("/api/v1/admin/users?page=1&limit=5")
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.data.meta.limit).toBe(5);
        });
    });

    describe("POST /api/v1/admin/users", () => {
        it("should allow admin to create a user", async () => {
            const token = await createAdminAndGetToken();
            const res = await request(app)
                .post("/api/v1/admin/users")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    firstName: "New",
                    lastName: "Person",
                    email: "newperson@example.com",
                    username: "newperson",
                    password: "password123",
                    role: "user",
                });
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.email).toBe("newperson@example.com");
        });

        it("should allow admin to create another admin", async () => {
            const token = await createAdminAndGetToken();
            const res = await request(app)
                .post("/api/v1/admin/users")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    firstName: "Second",
                    lastName: "Admin",
                    email: "secondadmin@example.com",
                    username: "secondadmin",
                    password: "password123",
                    role: "admin",
                });
            expect(res.status).toBe(201);
            expect(res.body.data.role).toBe("admin");
        });

        it("should reject creation with invalid data", async () => {
            const token = await createAdminAndGetToken();
            const res = await request(app)
                .post("/api/v1/admin/users")
                .set("Authorization", `Bearer ${token}`)
                .send({ email: "bad" });
            expect(res.status).toBe(400);
        });

        it("should block non-admin from creating users", async () => {
            const token = await createRegularAndGetToken();
            const res = await request(app)
                .post("/api/v1/admin/users")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    firstName: "X",
                    lastName: "Y",
                    email: "x@example.com",
                    username: "xy",
                    password: "password123",
                    role: "user",
                });
            expect(res.status).toBe(403);
        });
    });

    describe("GET /api/v1/admin/users/:id", () => {
        it("should fetch a user by id", async () => {
            const token = await createAdminAndGetToken();
            const listRes = await request(app)
                .get("/api/v1/admin/users")
                .set("Authorization", `Bearer ${token}`);
            const userId = listRes.body.data.data[0]._id;

            const res = await request(app)
                .get(`/api/v1/admin/users/${userId}`)
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.data._id).toBe(userId);
        });

        it("should return 404 for unknown id", async () => {
            const token = await createAdminAndGetToken();
            const res = await request(app)
                .get("/api/v1/admin/users/000000000000000000000000")
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(404);
        });
    });

    describe("PUT /api/v1/admin/users/:id", () => {
        it("should update a user's role", async () => {
            const token = await createAdminAndGetToken();
            await request(app).post("/api/v1/auth/register").send(regularUser);
            const listRes = await request(app)
                .get("/api/v1/admin/users?search=regular")
                .set("Authorization", `Bearer ${token}`);
            const userId = listRes.body.data.data[0]._id;

            const res = await request(app)
                .put(`/api/v1/admin/users/${userId}`)
                .set("Authorization", `Bearer ${token}`)
                .send({ role: "admin" });
            expect(res.status).toBe(200);
            expect(res.body.data.role).toBe("admin");
        });

        it("should return 404 for unknown user", async () => {
            const token = await createAdminAndGetToken();
            const res = await request(app)
                .put("/api/v1/admin/users/000000000000000000000000")
                .set("Authorization", `Bearer ${token}`)
                .send({ firstName: "Ghost" });
            expect(res.status).toBe(404);
        });
    });

    describe("DELETE /api/v1/admin/users/:id", () => {
        it("should delete a user", async () => {
            const token = await createAdminAndGetToken();
            await request(app).post("/api/v1/auth/register").send(regularUser);
            const listRes = await request(app)
                .get("/api/v1/admin/users?search=regular")
                .set("Authorization", `Bearer ${token}`);
            const userId = listRes.body.data.data[0]._id;

            const res = await request(app)
                .delete(`/api/v1/admin/users/${userId}`)
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Confirm deletion
            const check = await request(app)
                .get(`/api/v1/admin/users/${userId}`)
                .set("Authorization", `Bearer ${token}`);
            expect(check.status).toBe(404);
        });

        it("should return 404 for unknown user", async () => {
            const token = await createAdminAndGetToken();
            const res = await request(app)
                .delete("/api/v1/admin/users/000000000000000000000000")
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(404);
        });

        it("should block non-admin from deleting", async () => {
            const adminToken = await createAdminAndGetToken();
            const regularToken = await createRegularAndGetToken();
            const listRes = await request(app)
                .get("/api/v1/admin/users?search=admin")
                .set("Authorization", `Bearer ${adminToken}`);
            const userId = listRes.body.data.data[0]._id;

            const res = await request(app)
                .delete(`/api/v1/admin/users/${userId}`)
                .set("Authorization", `Bearer ${regularToken}`);
            expect(res.status).toBe(403);
        });
    });
});
