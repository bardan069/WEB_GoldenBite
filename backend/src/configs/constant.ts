import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 8089;
export const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/golden_bite";
export const SECRET_KEY = process.env.SECRET_KEY || "supersecretdevkey";
