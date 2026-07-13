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

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const todayLabel = WEEKDAY_LABELS[new Date().getDay()];

const validExercise = {
    name: "Morning Walk",
    type: "cardio",
    durationMinutes: 20,
    daysOfWeek: [todayLabel],
    reminderTime: "07:00",
};

describe("Exercises API", () => {
    describe("POST /api/v1/exercises", () => {
        it("creates an exercise for the authenticated user", async () => {
            const token = await registerAndLogin(userA);
            const res = await request(app)
                .post("/api/v1/exercises")
                .set("Authorization", `Bearer ${token}`)
                .send(validExercise);
            expect(res.status).toBe(201);
            expect(res.body.data.name).toBe("Morning Walk");
        });

        it("rejects invalid data", async () => {
            const token = await registerAndLogin(userA);
            const res = await request(app)
                .post("/api/v1/exercises")
                .set("Authorization", `Bearer ${token}`)
                .send({ name: "X", type: "unknown" });
            expect(res.status).toBe(400);
        });

        it("rejects unauthenticated requests", async () => {
            const res = await request(app).post("/api/v1/exercises").send(validExercise);
            expect(res.status).toBe(401);
        });
    });

    describe("GET /api/v1/exercises", () => {
        it("returns only the caller's exercises", async () => {
            const tokenA = await registerAndLogin(userA);
            const tokenB = await registerAndLogin(userB);

            await request(app)
                .post("/api/v1/exercises")
                .set("Authorization", `Bearer ${tokenA}`)
                .send(validExercise);

            const resA = await request(app)
                .get("/api/v1/exercises")
                .set("Authorization", `Bearer ${tokenA}`);
            const resB = await request(app)
                .get("/api/v1/exercises")
                .set("Authorization", `Bearer ${tokenB}`);

            expect(resA.body.data).toHaveLength(1);
            expect(resB.body.data).toHaveLength(0);
        });
    });

    describe("GET /api/v1/exercises/today", () => {
        it("includes an exercise scheduled for today's weekday", async () => {
            const token = await registerAndLogin(userA);
            await request(app)
                .post("/api/v1/exercises")
                .set("Authorization", `Bearer ${token}`)
                .send(validExercise);

            const res = await request(app)
                .get("/api/v1/exercises/today")
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
        });

        it("excludes an exercise not scheduled for today", async () => {
            const token = await registerAndLogin(userA);
            const otherDay = WEEKDAY_LABELS.find((day) => day !== todayLabel)!;
            await request(app)
                .post("/api/v1/exercises")
                .set("Authorization", `Bearer ${token}`)
                .send({ ...validExercise, daysOfWeek: [otherDay] });

            const res = await request(app)
                .get("/api/v1/exercises/today")
                .set("Authorization", `Bearer ${token}`);
            expect(res.body.data).toHaveLength(0);
        });
    });

    describe("ownership isolation", () => {
        it("returns 404 when a user tries to read another user's exercise", async () => {
            const tokenA = await registerAndLogin(userA);
            const tokenB = await registerAndLogin(userB);

            const createRes = await request(app)
                .post("/api/v1/exercises")
                .set("Authorization", `Bearer ${tokenA}`)
                .send(validExercise);
            const exerciseId = createRes.body.data._id;

            const res = await request(app)
                .get(`/api/v1/exercises/${exerciseId}`)
                .set("Authorization", `Bearer ${tokenB}`);
            expect(res.status).toBe(404);
        });

        it("returns 404 when a user tries to delete another user's exercise", async () => {
            const tokenA = await registerAndLogin(userA);
            const tokenB = await registerAndLogin(userB);

            const createRes = await request(app)
                .post("/api/v1/exercises")
                .set("Authorization", `Bearer ${tokenA}`)
                .send(validExercise);
            const exerciseId = createRes.body.data._id;

            const res = await request(app)
                .delete(`/api/v1/exercises/${exerciseId}`)
                .set("Authorization", `Bearer ${tokenB}`);
            expect(res.status).toBe(404);
        });
    });

    describe("PUT /api/v1/exercises/:id", () => {
        it("updates an exercise owned by the caller", async () => {
            const token = await registerAndLogin(userA);
            const createRes = await request(app)
                .post("/api/v1/exercises")
                .set("Authorization", `Bearer ${token}`)
                .send(validExercise);
            const exerciseId = createRes.body.data._id;

            const res = await request(app)
                .put(`/api/v1/exercises/${exerciseId}`)
                .set("Authorization", `Bearer ${token}`)
                .send({ durationMinutes: 30 });
            expect(res.status).toBe(200);
            expect(res.body.data.durationMinutes).toBe(30);
        });
    });

    describe("PATCH /api/v1/exercises/:id/complete", () => {
        it("marks an exercise as complete", async () => {
            const token = await registerAndLogin(userA);
            const createRes = await request(app)
                .post("/api/v1/exercises")
                .set("Authorization", `Bearer ${token}`)
                .send(validExercise);
            const exerciseId = createRes.body.data._id;

            const res = await request(app)
                .patch(`/api/v1/exercises/${exerciseId}/complete`)
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.data.lastCompletedAt).not.toBeNull();
        });
    });

    describe("DELETE /api/v1/exercises/:id", () => {
        it("deletes an exercise owned by the caller", async () => {
            const token = await registerAndLogin(userA);
            const createRes = await request(app)
                .post("/api/v1/exercises")
                .set("Authorization", `Bearer ${token}`)
                .send(validExercise);
            const exerciseId = createRes.body.data._id;

            const res = await request(app)
                .delete(`/api/v1/exercises/${exerciseId}`)
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(200);

            const check = await request(app)
                .get(`/api/v1/exercises/${exerciseId}`)
                .set("Authorization", `Bearer ${token}`);
            expect(check.status).toBe(404);
        });
    });
});
