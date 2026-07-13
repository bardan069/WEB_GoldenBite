jest.mock("@anthropic-ai/sdk", () => {
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => ({
            messages: {
                parse: jest.fn().mockResolvedValue({
                    stop_reason: "end_turn",
                    parsed_output: {
                        isFood: true,
                        foodName: "Apple",
                        estimatedCalories: 95,
                        confidence: "high",
                    },
                }),
            },
        })),
    };
});

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

async function registerAndLogin(user: typeof userA): Promise<string> {
    await request(app).post("/api/v1/auth/register").send(user);
    const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: user.email, password: user.password });
    return loginRes.body.data.token;
}

describe("Diet photo analysis API", () => {
    const originalKey = process.env.ANTHROPIC_API_KEY;

    beforeEach(() => {
        process.env.ANTHROPIC_API_KEY = "test-key";
    });

    afterAll(() => {
        process.env.ANTHROPIC_API_KEY = originalKey;
    });

    it("analyzes an uploaded photo and returns structured food data", async () => {
        const token = await registerAndLogin(userA);
        const res = await request(app)
            .post("/api/v1/diet/analyze-photo")
            .set("Authorization", `Bearer ${token}`)
            .attach("photo", Buffer.from("fake-image-bytes"), {
                filename: "meal.jpg",
                contentType: "image/jpeg",
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toMatchObject({
            isFood: true,
            foodName: "Apple",
            estimatedCalories: 95,
        });
    });

    it("rejects requests with no photo attached", async () => {
        const token = await registerAndLogin(userA);
        const res = await request(app)
            .post("/api/v1/diet/analyze-photo")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(400);
    });

    it("rejects non-image file types", async () => {
        const token = await registerAndLogin(userA);
        const res = await request(app)
            .post("/api/v1/diet/analyze-photo")
            .set("Authorization", `Bearer ${token}`)
            .attach("photo", Buffer.from("not an image"), {
                filename: "notes.txt",
                contentType: "text/plain",
            });

        expect(res.status).toBe(400);
    });

    it("rejects unauthenticated requests", async () => {
        const res = await request(app)
            .post("/api/v1/diet/analyze-photo")
            .attach("photo", Buffer.from("fake-image-bytes"), {
                filename: "meal.jpg",
                contentType: "image/jpeg",
            });
        expect(res.status).toBe(401);
    });
});
