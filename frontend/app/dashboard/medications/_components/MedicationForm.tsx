"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "react-toastify";
import { medicationFormSchema, MedicationFormData } from "./schema";
import { MedicationInput } from "@/lib/api/medications";

export interface MedicationRecord {
    _id: string;
    name: string;
    dosage: string;
    frequencyPerDay: number;
    reminderTimes: string[];
    startDate: string;
    endDate?: string;
    notes?: string;
    isActive: boolean;
}

interface MedicationFormProps {
    mode: "create" | "edit";
    defaultValues?: MedicationRecord | null;
    submitting: boolean;
    onSubmit: (data: MedicationInput) => void;
    onCancel: () => void;
}

function toDateInputValue(value?: string) {
    if (!value) return "";
    return value.slice(0, 10);
}

export default function MedicationForm({ mode, defaultValues, submitting, onSubmit, onCancel }: MedicationFormProps) {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<MedicationFormData>({
        defaultValues: {
            name: defaultValues?.name || "",
            dosage: defaultValues?.dosage || "",
            frequencyPerDay: defaultValues?.frequencyPerDay || 1,
            reminderTimes: defaultValues?.reminderTimes?.length
                ? defaultValues.reminderTimes.map((time) => ({ time }))
                : [{ time: "08:00" }],
            startDate: toDateInputValue(defaultValues?.startDate) || new Date().toISOString().slice(0, 10),
            endDate: toDateInputValue(defaultValues?.endDate),
            notes: defaultValues?.notes || "",
            isActive: defaultValues?.isActive ?? true,
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: "reminderTimes" });

    const submit = (data: MedicationFormData) => {
        const parsed = medicationFormSchema.safeParse(data);
        if (!parsed.success) {
            toast.error("Please fix the form errors");
            return;
        }

        onSubmit({
            name: parsed.data.name,
            dosage: parsed.data.dosage,
            frequencyPerDay: parsed.data.frequencyPerDay,
            reminderTimes: parsed.data.reminderTimes.map((r) => r.time),
            startDate: parsed.data.startDate,
            endDate: parsed.data.endDate || undefined,
            notes: parsed.data.notes || undefined,
            isActive: parsed.data.isActive,
        });
    };

    return (
        <form onSubmit={handleSubmit(submit)} className="space-y-4" aria-label="Medication form">
            <div>
                <label htmlFor="med-name" className="mb-1 block text-sm font-medium text-text-secondary">
                    Medication name
                </label>
                <input
                    id="med-name"
                    type="text"
                    {...register("name", { required: "Name is required" })}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="med-dosage" className="mb-1 block text-sm font-medium text-text-secondary">
                        Dosage
                    </label>
                    <input
                        id="med-dosage"
                        type="text"
                        placeholder="e.g. 1 tablet"
                        {...register("dosage", { required: "Dosage is required" })}
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                    {errors.dosage && <p className="mt-1 text-xs text-red-400">{errors.dosage.message}</p>}
                </div>
                <div>
                    <label htmlFor="med-frequency" className="mb-1 block text-sm font-medium text-text-secondary">
                        Times per day
                    </label>
                    <input
                        id="med-frequency"
                        type="number"
                        min={1}
                        {...register("frequencyPerDay", { required: "Required", valueAsNumber: true, min: { value: 1, message: "Must be at least 1" } })}
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                    {errors.frequencyPerDay && <p className="mt-1 text-xs text-red-400">{errors.frequencyPerDay.message}</p>}
                </div>
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-text-secondary">Reminder times</label>
                <div className="space-y-2">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2">
                            <input
                                type="time"
                                {...register(`reminderTimes.${index}.time` as const, { required: true })}
                                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                            />
                            {fields.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    aria-label="Remove reminder time"
                                    className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-3 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                {errors.reminderTimes && <p className="mt-1 text-xs text-red-400">{errors.reminderTimes.message as string}</p>}
                <button
                    type="button"
                    onClick={() => append({ time: "08:00" })}
                    className="mt-2 rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-brand/40 hover:text-brand"
                >
                    + Add another time
                </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="med-start" className="mb-1 block text-sm font-medium text-text-secondary">
                        Start date
                    </label>
                    <input
                        id="med-start"
                        type="date"
                        {...register("startDate", { required: "Start date is required" })}
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                    {errors.startDate && <p className="mt-1 text-xs text-red-400">{errors.startDate.message}</p>}
                </div>
                <div>
                    <label htmlFor="med-end" className="mb-1 block text-sm font-medium text-text-secondary">
                        End date (optional)
                    </label>
                    <input
                        id="med-end"
                        type="date"
                        {...register("endDate")}
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="med-notes" className="mb-1 block text-sm font-medium text-text-secondary">
                    Notes (optional)
                </label>
                <textarea
                    id="med-notes"
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
                    {submitting ? "Saving…" : mode === "create" ? "Add Medication" : "Save Changes"}
                </button>
            </div>
        </form>
    );
}
