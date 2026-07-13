import mongoose, { Schema, Document } from "mongoose";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface IMealEntry extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    mealType: MealType;
    foodName: string;
    calories: number;
    date: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const MealEntrySchema: Schema = new Schema<IMealEntry>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        mealType: { type: String, enum: ["breakfast", "lunch", "dinner", "snack"], required: true },
        foodName: { type: String, required: true },
        calories: { type: Number, required: true, min: 0 },
        date: { type: Date, required: true },
        notes: { type: String, required: false },
    },
    {
        timestamps: true,
    }
);

export const MealEntryModel = mongoose.model<IMealEntry>("MealEntry", MealEntrySchema);
