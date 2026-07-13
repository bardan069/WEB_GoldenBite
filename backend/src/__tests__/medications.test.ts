import request from "supertest";
import app from "../app";
import "./setup";

const userA = {
    firstName: "Alice",
    lastName: "Anderson",
    email: "alice@example.com",
    username: "alicea",
    password: "password123",
};

const userB = {
    firstName: "Bob",
    lastName: "Brown",
    email: "bob@example.com",
    username: "bobb",
    password: "password123",
};

async function registerAndLogin(user: typeof userA): Promise<string> {
    await request(app).post("/api/v1/auth/register").send(user);
    const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: user.email, password: user.password });
    return loginRes.body.data.token;
}

const validMedication = {
    name: "Vitamin D",
    dosage: "1 tablet",
    frequencyPerDay: 1,
    reminderTimes: ["08:00"],
    startDate: "2026-01-01",
};

describe("Medications API", () => {
    describe("POST /api/v1/medications", () => {
        it("creates a medication for the authenticated user", async () => {
            const token = await registerAndLogin(userA);
            const res = await request(app)
                .post("/api/v1/medications")
                .set("Authorization", `Bearer ${token}`)
                .send(validMedication);
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe("Vitamin D");
            expect(res.body.data.isActive).toBe(true);
        });

        it("rejects invalid data", async () => {
            const token = await registerAndLogin(userA);
            const res = await request(app)
                .post("/api/v1/medications")
                .set("Authorization", `Bearer ${token}`)
                .send({ name: "X" });
            expect(res.status).toBe(400);
        });

        it("rejects unauthenticated requests", async () => {
            const res = await request(app).post("/api/v1/medications").send(validMedication);
            expect(res.status).toBe(401);
        });
    });

    describe("GET /api/v1/medications", () => {
        it("returns only the caller's medications", async () => {
            const tokenA = await registerAndLogin(userA);
            const tokenB = await registerAndLogin(userB);

            await request(app)
                .post("/api/v1/medications")
                .set("Authorization", `Bearer ${tokenA}`)
                .send(validMedication);

            const resA = await request(app)
                .get("/api/v1/medications")
                .set("Authorization", `Bearer ${tokenA}`);
            const resB = await request(app)
                .get("/api/v1/medications")
                .set("Authorization", `Bearer ${tokenB}`);

            expect(resA.body.data).toHaveLength(1);
            expect(resB.body.data).toHaveLength(0);
        });
    });

    describe("GET /api/v1/medications/today", () => {
        it("includes an active medication whose schedule covers today", async () => {
            const token = await registerAndLogin(userA);
            await request(app)
                .post("/api/v1/medications")
                .set("Authorization", `Bearer ${token}`)
                .send({ ...validMedication, startDate: new Date().toISOString() });

            const res = await request(app)
                .get("/api/v1/medications/today")
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
        });

        it("excludes a medication that has not started yet", async () => {
            const token = await registerAndLogin(userA);
            const future = new Date();
            future.setFullYear(future.getFullYear() + 1);
            await request(app)
                .post("/api/v1/medications")
                .set("Authorization", `Bearer ${token}`)
                .send({ ...validMedication, startDate: future.toISOString() });

            const res = await request(app)
                .get("/api/v1/medications/today")
                .set("Authorization", `Bearer ${token}`);
            expect(res.body.data).toHaveLength(0);
        });
    });

    describe("ownership isolation", () => {
        it("returns 404 when a user tries to read another user's medication", async () => {
            const tokenA = await registerAndLogin(userA);
            const tokenB = await registerAndLogin(userB);

            const createRes = await request(app)
                .post("/api/v1/medications")
                .set("Authorization", `Bearer ${tokenA}`)
                .send(validMedication);
            const medicationId = createRes.body.data._id;

            const res = await request(app)
                .get(`/api/v1/medications/${medicationId}`)
                .set("Authorization", `Bearer ${tokenB}`);
            expect(res.status).toBe(404);
        });

        it("returns 404 when a user tries to update another user's medication", async () => {
            const tokenA = await registerAndLogin(userA);
            const tokenB = await registerAndLogin(userB);

            const createRes = await request(app)
                .post("/api/v1/medications")
                .set("Authorization", `Bearer ${tokenA}`)
                .send(validMedication);
            const medicationId = createRes.body.data._id;

            const res = await request(app)
                .put(`/api/v1/medications/${medicationId}`)
                .set("Authorization", `Bearer ${tokenB}`)
                .send({ name: "Hijacked" });
            expect(res.status).toBe(404);
        });

        it("returns 404 when a user tries to delete another user's medication", async () => {
            const tokenA = await registerAndLogin(userA);
            const tokenB = await registerAndLogin(userB);

            const createRes = await request(app)
                .post("/api/v1/medications")
                .set("Authorization", `Bearer ${tokenA}`)
                .send(validMedication);
            const medicationId = createRes.body.data._id;

            const res = await request(app)
                .delete(`/api/v1/medications/${medicationId}`)
                .set("Authorization", `Bearer ${tokenB}`);
            expect(res.status).toBe(404);
        });
    });

    describe("PUT /api/v1/medications/:id", () => {
        it("updates a medication owned by the caller", async () => {
            const token = await registerAndLogin(userA);
            const createRes = await request(app)
                .post("/api/v1/medications")
                .set("Authorization", `Bearer ${token}`)
                .send(validMedication);
            const medicationId = createRes.body.data._id;

            const res = await request(app)
                .put(`/api/v1/medications/${medicationId}`)
                .set("Authorization", `Bearer ${token}`)
                .send({ dosage: "2 tablets" });
            expect(res.status).toBe(200);
            expect(res.body.data.dosage).toBe("2 tablets");
        });
    });

    describe("PATCH /api/v1/medications/:id/taken", () => {
        it("marks a medication as taken", async () => {
            const token = await registerAndLogin(userA);
            const createRes = await request(app)
                .post("/api/v1/medications")
                .set("Authorization", `Bearer ${token}`)
                .send(validMedication);
            const medicationId = createRes.body.data._id;

            const res = await request(app)
                .patch(`/api/v1/medications/${medicationId}/taken`)
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.data.lastTakenAt).not.toBeNull();
        });
    });

    describe("DELETE /api/v1/medications/:id", () => {
        it("deletes a medication owned by the caller", async () => {
            const token = await registerAndLogin(userA);
            const createRes = await request(app)
                .post("/api/v1/medications")
                .set("Authorization", `Bearer ${token}`)
                .send(validMedication);
            const medicationId = createRes.body.data._id;

            const res = await request(app)
                .delete(`/api/v1/medications/${medicationId}`)
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(200);

            const check = await request(app)
                .get(`/api/v1/medications/${medicationId}`)
                .set("Authorization", `Bearer ${token}`);
            expect(check.status).toBe(404);
        });
    });
});
