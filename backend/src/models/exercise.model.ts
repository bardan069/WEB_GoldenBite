import mongoose, { Schema, Document } from "mongoose";

export type ExerciseType = "cardio" | "strength" | "flexibility" | "balance";

export interface IExercise extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    name: string;
    type: ExerciseType;
    durationMinutes: number;
    daysOfWeek: string[];
    reminderTime: string;
    notes?: string;
    isActive: boolean;
    lastCompletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ExerciseSchema: Schema = new Schema<IExercise>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
        type: { type: String, enum: ["cardio", "strength", "flexibility", "balance"], required: true },
        durationMinutes: { type: Number, required: true, min: 1 },
        daysOfWeek: { type: [String], default: [] },
        reminderTime: { type: String, required: true },
        notes: { type: String, required: false },
        isActive: { type: Boolean, default: true },
        lastCompletedAt: { type: Date, required: false },
    },
    {
        timestamps: true,
    }
);

export const ExerciseModel = mongoose.model<IExercise>("Exercise", ExerciseSchema);
