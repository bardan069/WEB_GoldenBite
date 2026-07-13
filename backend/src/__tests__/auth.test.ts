import request from "supertest";
import app from "../app";
import "./setup";

const baseUser = {
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    username: "testuser",
    password: "password123",
};

describe("Auth API", () => {
    describe("POST /api/v1/auth/register", () => {
        it("should register a new user", async () => {
            const res = await request(app).post("/api/v1/auth/register").send(baseUser);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.email).toBe(baseUser.email);
        });

        it("should reject duplicate email", async () => {
            await request(app).post("/api/v1/auth/register").send(baseUser);
            const res = await request(app).post("/api/v1/auth/register").send(baseUser);
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should reject missing required fields", async () => {
            const res = await request(app)
                .post("/api/v1/auth/register")
                .send({ email: "incomplete@example.com" });
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should reject short password", async () => {
            const res = await request(app)
                .post("/api/v1/auth/register")
                .send({ ...baseUser, password: "123" });
            expect(res.status).toBe(400);
        });
    });

    describe("POST /api/v1/auth/login", () => {
        beforeEach(async () => {
            await request(app).post("/api/v1/auth/register").send(baseUser);
        });

        it("should login with correct credentials", async () => {
            const res = await request(app)
                .post("/api/v1/auth/login")
                .send({ email: baseUser.email, password: baseUser.password });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.token).toBeTruthy();
            expect(res.body.data.user.email).toBe(baseUser.email);
        });

        it("should reject wrong password", async () => {
            const res = await request(app)
                .post("/api/v1/auth/login")
                .send({ email: baseUser.email, password: "wrongpassword" });
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should reject unknown email", async () => {
            const res = await request(app)
                .post("/api/v1/auth/login")
                .send({ email: "nobody@example.com", password: "password123" });
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe("GET /api/v1/auth/whoami", () => {
        let token: string;

        beforeEach(async () => {
            await request(app).post("/api/v1/auth/register").send(baseUser);
            const loginRes = await request(app)
                .post("/api/v1/auth/login")
                .send({ email: baseUser.email, password: baseUser.password });
            token = loginRes.body.data.token;
        });

        it("should return current user when authenticated", async () => {
            const res = await request(app)
                .get("/api/v1/auth/whoami")
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.data.email).toBe(baseUser.email);
        });

        it("should reject request without token", async () => {
            const res = await request(app).get("/api/v1/auth/whoami");
            expect(res.status).toBe(401);
        });

        it("should reject request with invalid token", async () => {
            const res = await request(app)
                .get("/api/v1/auth/whoami")
                .set("Authorization", "Bearer invalidtoken");
            expect(res.status).toBe(500);
        });
    });

    describe("PUT /api/v1/auth/update", () => {
        let token: string;

        beforeEach(async () => {
            await request(app).post("/api/v1/auth/register").send(baseUser);
            const loginRes = await request(app)
                .post("/api/v1/auth/login")
                .send({ email: baseUser.email, password: baseUser.password });
            token = loginRes.body.data.token;
        });

        it("should update user profile", async () => {
            const res = await request(app)
                .put("/api/v1/auth/update")
                .set("Authorization", `Bearer ${token}`)
                .field("firstName", "Updated");
            expect(res.status).toBe(200);
            expect(res.body.data.firstName).toBe("Updated");
        });

        it("should reject unauthenticated update", async () => {
            const res = await request(app)
                .put("/api/v1/auth/update")
                .send({ firstName: "Hacker" });
            expect(res.status).toBe(401);
        });
    });

    describe("PUT /api/v1/auth/update-password", () => {
        let token: string;

        beforeEach(async () => {
            await request(app).post("/api/v1/auth/register").send(baseUser);
            const loginRes = await request(app)
                .post("/api/v1/auth/login")
                .send({ email: baseUser.email, password: baseUser.password });
            token = loginRes.body.data.token;
        });

        it("should change password with correct current password", async () => {
            const res = await request(app)
                .put("/api/v1/auth/update-password")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    currentPassword: "password123",
                    newPassword: "newpassword123",
                    confirmPassword: "newpassword123",
                });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it("should reject wrong current password", async () => {
            const res = await request(app)
                .put("/api/v1/auth/update-password")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    currentPassword: "wrongpassword",
                    newPassword: "newpassword123",
                    confirmPassword: "newpassword123",
                });
            expect(res.status).toBe(400);
        });
    });
});
