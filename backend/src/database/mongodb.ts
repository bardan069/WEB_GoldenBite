import mongoose from "mongoose";
import { MONGODB_URI } from "../configs/constant";

export const connectToMongoDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};
