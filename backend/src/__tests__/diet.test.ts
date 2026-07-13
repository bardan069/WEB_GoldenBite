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

const validMeal = {
    mealType: "lunch",
    foodName: "Grilled Chicken Salad",
    calories: 450,
    date: "2026-01-01",
};

describe("Diet API", () => {
    describe("GET /api/v1/diet/recommendation", () => {
        it("returns 400 when the user has no date of birth set", async () => {
            const token = await registerAndLogin(userA);
            const res = await request(app)
                .get("/api/v1/diet/recommendation")
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(400);
        });

        it("returns nutrition targets once a date of birth is set", async () => {
            const token = await registerAndLogin(userA);
            await request(app)
                .put("/api/v1/auth/update")
                .set("Authorization", `Bearer ${token}`)
                .send({ dateOfBirth: "1970-01-01" });

            const res = await request(app)
                .get("/api/v1/diet/recommendation")
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty("caloriesKcal");
            expect(res.body.data).toHaveProperty("proteinGrams");
            expect(res.body.data).toHaveProperty("waterMl");
        });

        it("rejects unauthenticated requests", async () => {
            const res = await request(app).get("/api/v1/diet/recommendation");
            expect(res.status).toBe(401);
        });
    });

    describe("POST /api/v1/diet/entries", () => {
        it("creates a meal entry for the authenticated user", async () => {
            const token = await registerAndLogin(userA);
            const res = await request(app)
                .post("/api/v1/diet/entries")
                .set("Authorization", `Bearer ${token}`)
                .send(validMeal);
            expect(res.status).toBe(201);
            expect(res.body.data.foodName).toBe("Grilled Chicken Salad");
        });

        it("rejects invalid data", async () => {
            const token = await registerAndLogin(userA);
            const res = await request(app)
                .post("/api/v1/diet/entries")
                .set("Authorization", `Bearer ${token}`)
                .send({ mealType: "brunch", foodName: "", calories: -5 });
            expect(res.status).toBe(400);
        });
    });

    describe("GET /api/v1/diet/entries", () => {
        it("returns only the caller's meal entries", async () => {
            const tokenA = await registerAndLogin(userA);
            const tokenB = await registerAndLogin(userB);

            await request(app)
                .post("/api/v1/diet/entries")
                .set("Authorization", `Bearer ${tokenA}`)
                .send(validMeal);

            const resA = await request(app)
                .get("/api/v1/diet/entries")
                .set("Authorization", `Bearer ${tokenA}`);
            const resB = await request(app)
                .get("/api/v1/diet/entries")
                .set("Authorization", `Bearer ${tokenB}`);

            expect(resA.body.data).toHaveLength(1);
            expect(resB.body.data).toHaveLength(0);
        });
    });

    describe("ownership isolation", () => {
        it("returns 404 when a user tries to read another user's meal entry", async () => {
            const tokenA = await registerAndLogin(userA);
            const tokenB = await registerAndLogin(userB);

            const createRes = await request(app)
                .post("/api/v1/diet/entries")
                .set("Authorization", `Bearer ${tokenA}`)
                .send(validMeal);
            const entryId = createRes.body.data._id;

            const res = await request(app)
                .get(`/api/v1/diet/entries/${entryId}`)
                .set("Authorization", `Bearer ${tokenB}`);
            expect(res.status).toBe(404);
        });

        it("returns 404 when a user tries to delete another user's meal entry", async () => {
            const tokenA = await registerAndLogin(userA);
            const tokenB = await registerAndLogin(userB);

            const createRes = await request(app)
                .post("/api/v1/diet/entries")
                .set("Authorization", `Bearer ${tokenA}`)
                .send(validMeal);
            const entryId = createRes.body.data._id;

            const res = await request(app)
                .delete(`/api/v1/diet/entries/${entryId}`)
                .set("Authorization", `Bearer ${tokenB}`);
            expect(res.status).toBe(404);
        });
    });

    describe("PUT /api/v1/diet/entries/:id", () => {
        it("updates a meal entry owned by the caller", async () => {
            const token = await registerAndLogin(userA);
            const createRes = await request(app)
                .post("/api/v1/diet/entries")
                .set("Authorization", `Bearer ${token}`)
                .send(validMeal);
            const entryId = createRes.body.data._id;

            const res = await request(app)
                .put(`/api/v1/diet/entries/${entryId}`)
                .set("Authorization", `Bearer ${token}`)
                .send({ calories: 500 });
            expect(res.status).toBe(200);
            expect(res.body.data.calories).toBe(500);
        });
    });

    describe("DELETE /api/v1/diet/entries/:id", () => {
        it("deletes a meal entry owned by the caller", async () => {
            const token = await registerAndLogin(userA);
            const createRes = await request(app)
                .post("/api/v1/diet/entries")
                .set("Authorization", `Bearer ${token}`)
                .send(validMeal);
            const entryId = createRes.body.data._id;

            const res = await request(app)
                .delete(`/api/v1/diet/entries/${entryId}`)
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(200);

            const check = await request(app)
                .get(`/api/v1/diet/entries/${entryId}`)
                .set("Authorization", `Bearer ${token}`);
            expect(check.status).toBe(404);
        });
    });
});
