import mongoose, { Schema, Document } from "mongoose";

export interface IMedication extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    name: string;
    dosage: string;
    frequencyPerDay: number;
    reminderTimes: string[];
    startDate: Date;
    endDate?: Date;
    notes?: string;
    isActive: boolean;
    lastTakenAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const MedicationSchema: Schema = new Schema<IMedication>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequencyPerDay: { type: Number, required: true, min: 1 },
        reminderTimes: { type: [String], default: [] },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: false },
        notes: { type: String, required: false },
        isActive: { type: Boolean, default: true },
        lastTakenAt: { type: Date, required: false },
    },
    {
        timestamps: true,
    }
);

export const MedicationModel = mongoose.model<IMedication>("Medication", MedicationSchema);
