"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import {
    handleGetDietRecommendation,
    handleGetMealEntries,
    handleCreateMealEntry,
    handleUpdateMealEntry,
    handleDeleteMealEntry,
} from "@/lib/actions/diet-action";
import { MealEntryInput } from "@/lib/api/diet";
import MealForm, { MealEntryRecord } from "./_components/MealForm";

type ModalMode = "create" | "edit" | "delete" | null;

interface NutritionTarget {
    caloriesKcal: number;
    proteinGrams: number;
    waterMl: number;
    ageRangeLabel: string;
}

const MEAL_LABELS: Record<MealEntryRecord["mealType"], string> = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snack",
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function isToday(iso: string) {
    return new Date(iso).toDateString() === new Date().toDateString();
}

export default function DietPage() {
    const [entries, setEntries] = useState<MealEntryRecord[]>([]);
    const [recommendation, setRecommendation] = useState<NutritionTarget | null>(null);
    const [recommendationError, setRecommendationError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [selected, setSelected] = useState<MealEntryRecord | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        setRecommendationError(null);

        const [entriesResult, recommendationResult] = await Promise.all([
            handleGetMealEntries(),
            handleGetDietRecommendation(),
        ]);

        setLoading(false);

        if (entriesResult.success) {
            setEntries(entriesResult.data);
        } else {
            setError(entriesResult.message || "Failed to load meal entries");
        }

        if (recommendationResult.success) {
            setRecommendation(recommendationResult.data);
        } else {
            setRecommendationError(recommendationResult.message || "Failed to load diet recommendation");
        }
    }, []);

    useEffect(() => {
        // Standard mount-time data-fetching effect.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData();
    }, [fetchData]);

    const todaysCalories = entries.filter((entry) => isToday(entry.date)).reduce((sum, entry) => sum + entry.calories, 0);

    const openCreate = () => {
        setSelected(null);
        setModalMode("create");
    };

    const openEdit = (entry: MealEntryRecord) => {
        setSelected(entry);
        setModalMode("edit");
    };

    const openDelete = (entry: MealEntryRecord) => {
        setSelected(entry);
        setModalMode("delete");
    };

    const closeModal = () => {
        setModalMode(null);
        setSelected(null);
    };

    const onSubmitCreate = async (data: MealEntryInput) => {
        setSubmitting(true);
        const result = await handleCreateMealEntry(data);
        setSubmitting(false);
        if (result.success) {
            toast.success(result.message || "Meal logged");
            closeModal();
            fetchData();
        } else {
            toast.error(result.message || "Failed to log meal");
        }
    };

    const onSubmitEdit = async (data: MealEntryInput) => {
        if (!selected) return;
        setSubmitting(true);
        const result = await handleUpdateMealEntry(selected._id, data);
        setSubmitting(false);
        if (result.success) {
            toast.success(result.message || "Meal updated");
            closeModal();
            fetchData();
        } else {
            toast.error(result.message || "Failed to update meal");
        }
    };

    const onConfirmDelete = async () => {
        if (!selected) return;
        setSubmitting(true);
        const result = await handleDeleteMealEntry(selected._id);
        setSubmitting(false);
        if (result.success) {
            toast.success(result.message || "Meal entry deleted");
            closeModal();
            fetchData();
        } else {
            toast.error(result.message || "Failed to delete meal entry");
        }
    };

    return (
        <section className="py-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[1.5px] text-gold">Wellness</p>
                    <h1 className="text-4xl font-bold text-text-primary">
                        Diet <span className="gradient-text">Tracker</span>
                    </h1>
                    <p className="mt-2 text-text-secondary">Meals logged against targets suited to your age.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="self-start rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark sm:self-auto"
                >
                    + Log Meal
                </button>
            </div>

            {/* Recommendation card */}
            <div className="mt-8">
                {recommendationError ? (
                    <div className="glass rounded-2xl p-6 text-sm text-text-secondary">
                        {recommendationError}.{" "}
                        <Link href="/dashboard/profile" className="font-semibold text-brand hover:text-brand-light">
                            Set your date of birth in your profile
                        </Link>{" "}
                        to see personalised targets.
                    </div>
                ) : recommendation ? (
                    <div className="glass rounded-2xl p-6">
                        <p className="text-xs font-bold uppercase tracking-widest text-gold">
                            Daily target &middot; age group {recommendation.ageRangeLabel}
                        </p>
                        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <div>
                                <p className="text-2xl font-bold text-text-primary">{todaysCalories}</p>
                                <p className="text-xs text-text-muted">kcal logged today</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-text-primary">{recommendation.caloriesKcal}</p>
                                <p className="text-xs text-text-muted">kcal target</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-text-primary">{recommendation.proteinGrams}g</p>
                                <p className="text-xs text-text-muted">protein target</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-text-primary">{recommendation.waterMl}ml</p>
                                <p className="text-xs text-text-muted">water target</p>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Meal log */}
            <div className="mt-6">
                {loading ? (
                    <div className="glass flex justify-center rounded-2xl p-16">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                    </div>
                ) : error ? (
                    <div className="glass rounded-2xl p-16 text-center text-red-400">{error}</div>
                ) : entries.length === 0 ? (
                    <div className="glass rounded-2xl p-16 text-center text-text-muted">
                        No meals logged yet. Log your first meal to start tracking.
                    </div>
                ) : (
                    <div className="glass overflow-hidden rounded-2xl">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-text-muted">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-text-muted">Meal</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-text-muted">Food</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-text-muted">Calories</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-text-muted">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.map((entry) => (
                                        <tr key={entry._id} className="border-b border-border/50 transition hover:bg-surface-hover">
                                            <td className="px-6 py-4 text-text-muted">{formatDate(entry.date)}</td>
                                            <td className="px-6 py-4 text-text-secondary">{MEAL_LABELS[entry.mealType]}</td>
                                            <td className="px-6 py-4 font-medium text-text-primary">{entry.foodName}</td>
                                            <td className="px-6 py-4 text-text-secondary">{entry.calories} kcal</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEdit(entry)}
                                                        className="rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-brand/40 hover:text-brand"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => openDelete(entry)}
                                                        className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {(modalMode === "create" || modalMode === "edit") && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
                    <div className="glass w-full max-w-lg rounded-2xl p-6 shadow-2xl">
                        <h2 className="mb-6 text-xl font-bold text-text-primary">
                            {modalMode === "create" ? "Log Meal" : "Edit Meal"}
                        </h2>
                        <MealForm
                            mode={modalMode}
                            defaultValues={selected}
                            submitting={submitting}
                            onSubmit={modalMode === "create" ? onSubmitCreate : onSubmitEdit}
                            onCancel={closeModal}
                        />
                    </div>
                </div>
            )}

            {modalMode === "delete" && selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="glass w-full max-w-sm rounded-2xl p-6 shadow-2xl">
                        <h2 className="mb-2 text-xl font-bold text-text-primary">Delete Meal Entry</h2>
                        <p className="mb-6 text-sm text-text-secondary">
                            Are you sure you want to remove{" "}
                            <span className="font-semibold text-text-primary">{selected.foodName}</span>? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeModal}
                                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-hover"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirmDelete}
                                disabled={submitting}
                                className="rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                            >
                                {submitting ? "Deleting…" : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
