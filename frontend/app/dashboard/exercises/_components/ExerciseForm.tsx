"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { exerciseFormSchema, ExerciseFormData, WEEKDAYS } from "./schema";
import { ExerciseInput } from "@/lib/api/exercises";

export interface ExerciseRecord {
    _id: string;
    name: string;
    type: "cardio" | "strength" | "flexibility" | "balance";
    durationMinutes: number;
    daysOfWeek: string[];
    reminderTime: string;
    notes?: string;
    isActive: boolean;
}

interface ExerciseFormProps {
    mode: "create" | "edit";
    defaultValues?: ExerciseRecord | null;
    submitting: boolean;
    onSubmit: (data: ExerciseInput) => void;
    onCancel: () => void;
}

export default function ExerciseForm({ mode, defaultValues, submitting, onSubmit, onCancel }: ExerciseFormProps) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<ExerciseFormData>({
        defaultValues: {
            name: defaultValues?.name || "",
            type: defaultValues?.type || "cardio",
            durationMinutes: defaultValues?.durationMinutes || 15,
            daysOfWeek: (defaultValues?.daysOfWeek as ExerciseFormData["daysOfWeek"]) || [],
            reminderTime: defaultValues?.reminderTime || "07:00",
            notes: defaultValues?.notes || "",
            isActive: defaultValues?.isActive ?? true,
        },
    });

    const selectedDays = watch("daysOfWeek");
    const [daysError, setDaysError] = useState<string | null>(null);

    const toggleDay = (day: (typeof WEEKDAYS)[number]) => {
        const current = selectedDays || [];
        const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day];
        setValue("daysOfWeek", next, { shouldValidate: true });
        if (next.length > 0) setDaysError(null);
    };

    const submit = (data: ExerciseFormData) => {
        if (!data.daysOfWeek || data.daysOfWeek.length === 0) {
            setDaysError("Select at least one day");
            return;
        }
        setDaysError(null);

        const parsed = exerciseFormSchema.safeParse(data);
        if (!parsed.success) {
            toast.error("Please fix the form errors");
            return;
        }
        onSubmit(parsed.data);
    };

    return (
        <form onSubmit={handleSubmit(submit)} className="space-y-4" aria-label="Exercise form">
            <div>
                <label htmlFor="ex-name" className="mb-1 block text-sm font-medium text-text-secondary">
                    Exercise name
                </label>
                <input
                    id="ex-name"
                    type="text"
                    placeholder="e.g. Morning Walk"
                    {...register("name", { required: "Name is required" })}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="ex-type" className="mb-1 block text-sm font-medium text-text-secondary">
                        Type
                    </label>
                    <select
                        id="ex-type"
                        {...register("type")}
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    >
                        <option value="cardio">Cardio</option>
                        <option value="strength">Strength</option>
                        <option value="flexibility">Flexibility</option>
                        <option value="balance">Balance</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="ex-duration" className="mb-1 block text-sm font-medium text-text-secondary">
                        Duration (minutes)
                    </label>
                    <input
                        id="ex-duration"
                        type="number"
                        min={1}
                        {...register("durationMinutes", { required: "Required", valueAsNumber: true, min: { value: 1, message: "Must be at least 1" } })}
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                    {errors.durationMinutes && <p className="mt-1 text-xs text-red-400">{errors.durationMinutes.message}</p>}
                </div>
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-text-secondary">Days of the week</label>
                <div className="flex flex-wrap gap-2">
                    {WEEKDAYS.map((day) => (
                        <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            aria-pressed={selectedDays?.includes(day)}
                            className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                                selectedDays?.includes(day)
                                    ? "bg-brand text-white"
                                    : "border border-border bg-surface-elevated text-text-secondary hover:border-brand/40"
                            }`}
                        >
                            {day}
                        </button>
                    ))}
                </div>
                {daysError && <p className="mt-1 text-xs text-red-400">{daysError}</p>}
            </div>

            <div>
                <label htmlFor="ex-time" className="mb-1 block text-sm font-medium text-text-secondary">
                    Reminder time
                </label>
                <input
                    id="ex-time"
                    type="time"
                    {...register("reminderTime", { required: "Reminder time is required" })}
                    className="w-full max-w-[200px] rounded-xl border border-border bg-surface px-4 py-3 text-text-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
                {errors.reminderTime && <p className="mt-1 text-xs text-red-400">{errors.reminderTime.message}</p>}
            </div>

            <div>
                <label htmlFor="ex-notes" className="mb-1 block text-sm font-medium text-text-secondary">
                    Notes (optional)
                </label>
                <textarea
                    id="ex-notes"
                    rows={2}
                    {...register("notes")}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
            </div>

            <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input type="checkbox" {...register("isActive")} className="h-4 w-4 rounded border-border" />
                Active reminder
            </label>

            <div className="flex justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-hover"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-brand px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark disabled:opacity-60"
                >
                    {submitting ? "Saving…" : mode === "create" ? "Add Exercise" : "Save Changes"}
                </button>
            </div>
        </form>
    );
}
