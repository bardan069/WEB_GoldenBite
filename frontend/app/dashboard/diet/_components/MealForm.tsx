"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { mealFormSchema, MealFormData } from "./schema";
import { MealEntryInput } from "@/lib/api/diet";
import { handleAnalyzeFoodPhoto } from "@/lib/actions/diet-action";

export interface MealEntryRecord {
    _id: string;
    mealType: "breakfast" | "lunch" | "dinner" | "snack";
    foodName: string;
    calories: number;
    date: string;
    notes?: string;
}

interface MealFormProps {
    mode: "create" | "edit";
    defaultValues?: MealEntryRecord | null;
    submitting: boolean;
    onSubmit: (data: MealEntryInput) => void;
    onCancel: () => void;
}

export default function MealForm({ mode, defaultValues, submitting, onSubmit, onCancel }: MealFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<MealFormData>({
        defaultValues: {
            mealType: defaultValues?.mealType || "breakfast",
            foodName: defaultValues?.foodName || "",
            calories: defaultValues?.calories ?? 0,
            date: defaultValues?.date ? defaultValues.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
            notes: defaultValues?.notes || "",
        },
    });

    const [analyzing, setAnalyzing] = useState(false);
    const photoInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAnalyzing(true);
        try {
            const formData = new FormData();
            formData.append("photo", file);
            const result = await handleAnalyzeFoodPhoto(formData);

            if (!result.success) {
                toast.error(result.message || "Failed to analyze photo");
                return;
            }

            const analysis = result.data;
            if (!analysis.isFood) {
                toast.error("That doesn't look like food — try another photo or enter it manually.");
                return;
            }

            setValue("foodName", analysis.foodName, { shouldValidate: true });
            setValue("calories", analysis.estimatedCalories, { shouldValidate: true });
            toast.success(
                `Detected "${analysis.foodName}" (~${analysis.estimatedCalories} kcal, ${analysis.confidence} confidence). Review and adjust before saving.`
            );
        } finally {
            setAnalyzing(false);
            if (photoInputRef.current) photoInputRef.current.value = "";
        }
    };

    const submit = (data: MealFormData) => {
        const parsed = mealFormSchema.safeParse(data);
        if (!parsed.success) {
            toast.error("Please fix the form errors");
            return;
        }
        onSubmit(parsed.data);
    };

    return (
        <form onSubmit={handleSubmit(submit)} className="space-y-4" aria-label="Meal form">
            <div className="rounded-xl border border-dashed border-brand/30 bg-brand/5 p-4">
                <input
                    ref={photoInputRef}
                    id="meal-photo"
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handlePhotoSelected}
                    disabled={analyzing}
                    className="hidden"
                />
                <label
                    htmlFor="meal-photo"
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10 ${analyzing ? "pointer-events-none opacity-60" : ""}`}
                >
                    {analyzing ? (
                        <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                            Analyzing photo…
                        </>
                    ) : (
                        <>📷 Snap or upload a photo to auto-fill this meal</>
                    )}
                </label>
            </div>

            <div>
                <label htmlFor="meal-food" className="mb-1 block text-sm font-medium text-text-secondary">
                    Food
                </label>
                <input
                    id="meal-food"
                    type="text"
                    placeholder="e.g. Grilled chicken salad"
                    {...register("foodName", { required: "Food name is required" })}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
                {errors.foodName && <p className="mt-1 text-xs text-red-400">{errors.foodName.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="meal-type" className="mb-1 block text-sm font-medium text-text-secondary">
                        Meal
                    </label>
                    <select
                        id="meal-type"
                        {...register("mealType")}
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    >
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snack">Snack</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="meal-calories" className="mb-1 block text-sm font-medium text-text-secondary">
                        Calories
                    </label>
                    <input
                        id="meal-calories"
                        type="number"
                        min={0}
                        {...register("calories", { required: "Required", valueAsNumber: true, min: { value: 0, message: "Cannot be negative" } })}
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                    {errors.calories && <p className="mt-1 text-xs text-red-400">{errors.calories.message}</p>}
                </div>
            </div>

            <div>
                <label htmlFor="meal-date" className="mb-1 block text-sm font-medium text-text-secondary">
                    Date
                </label>
                <input
                    id="meal-date"
                    type="date"
                    {...register("date", { required: "Date is required" })}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
                {errors.date && <p className="mt-1 text-xs text-red-400">{errors.date.message}</p>}
            </div>

            <div>
                <label htmlFor="meal-notes" className="mb-1 block text-sm font-medium text-text-secondary">
                    Notes (optional)
                </label>
                <textarea
                    id="meal-notes"
                    rows={2}
                    {...register("notes")}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
            </div>

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
                    {submitting ? "Saving…" : mode === "create" ? "Log Meal" : "Save Changes"}
                </button>
            </div>
        </form>
    );
}
