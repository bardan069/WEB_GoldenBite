"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    handleGetExercises,
    handleCreateExercise,
    handleUpdateExercise,
    handleDeleteExercise,
    handleMarkExerciseComplete,
} from "@/lib/actions/exercise-action";
import { ExerciseInput } from "@/lib/api/exercises";
import ExerciseForm, { ExerciseRecord } from "./_components/ExerciseForm";

type ModalMode = "create" | "edit" | "delete" | null;

const TYPE_LABELS: Record<ExerciseRecord["type"], string> = {
    cardio: "Cardio",
    strength: "Strength",
    flexibility: "Flexibility",
    balance: "Balance",
};

export default function ExercisesPage() {
    const [exercises, setExercises] = useState<ExerciseRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [selected, setSelected] = useState<ExerciseRecord | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchExercises = useCallback(async () => {
        setLoading(true);
        setError(null);
        const result = await handleGetExercises();
        setLoading(false);
        if (result.success) {
            setExercises(result.data);
        } else {
            setError(result.message || "Failed to load exercises");
        }
    }, []);

    useEffect(() => {
        // Standard mount/refetch-on-change data-fetching effect.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchExercises();
    }, [fetchExercises]);

    const openCreate = () => {
        setSelected(null);
        setModalMode("create");
    };

    const openEdit = (exercise: ExerciseRecord) => {
        setSelected(exercise);
        setModalMode("edit");
    };

    const openDelete = (exercise: ExerciseRecord) => {
        setSelected(exercise);
        setModalMode("delete");
    };

    const closeModal = () => {
        setModalMode(null);
        setSelected(null);
    };

    const onSubmitCreate = async (data: ExerciseInput) => {
        setSubmitting(true);
        const result = await handleCreateExercise(data);
        setSubmitting(false);
        if (result.success) {
            toast.success(result.message || "Exercise added");
            closeModal();
            fetchExercises();
        } else {
            toast.error(result.message || "Failed to add exercise");
        }
    };

    const onSubmitEdit = async (data: ExerciseInput) => {
        if (!selected) return;
        setSubmitting(true);
        const result = await handleUpdateExercise(selected._id, data);
        setSubmitting(false);
        if (result.success) {
            toast.success(result.message || "Exercise updated");
            closeModal();
            fetchExercises();
        } else {
            toast.error(result.message || "Failed to update exercise");
        }
    };

    const onConfirmDelete = async () => {
        if (!selected) return;
        setSubmitting(true);
        const result = await handleDeleteExercise(selected._id);
        setSubmitting(false);
        if (result.success) {
            toast.success(result.message || "Exercise deleted");
            closeModal();
            fetchExercises();
        } else {
            toast.error(result.message || "Failed to delete exercise");
        }
    };

    const onMarkComplete = async (exercise: ExerciseRecord) => {
        const result = await handleMarkExerciseComplete(exercise._id);
        if (result.success) {
            toast.success("Marked as complete for today");
            fetchExercises();
        } else {
            toast.error(result.message || "Failed to update exercise");
        }
    };

    return (
        <section className="py-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[1.5px] text-gold">Wellness</p>
                    <h1 className="text-4xl font-bold text-text-primary">
                        Exercise <span className="gradient-text">Reminders</span>
                    </h1>
                    <p className="mt-2 text-text-secondary">Stay active with a routine that fits your week.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="self-start rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark sm:self-auto"
                >
                    + Add Exercise
                </button>
            </div>

            <div className="mt-8">
                {loading ? (
                    <div className="glass flex justify-center rounded-2xl p-16">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                    </div>
                ) : error ? (
                    <div className="glass rounded-2xl p-16 text-center text-red-400">{error}</div>
                ) : exercises.length === 0 ? (
                    <div className="glass rounded-2xl p-16 text-center text-text-muted">
                        No exercises yet. Add your first routine to get started.
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {exercises.map((exercise) => (
                            <div key={exercise._id} className="glass flex flex-col rounded-2xl p-6">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-lg font-bold text-text-primary">{exercise.name}</h3>
                                        <p className="text-sm text-text-secondary">
                                            {TYPE_LABELS[exercise.type]} &middot; {exercise.durationMinutes} min
                                        </p>
                                    </div>
                                    <span
                                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                            exercise.isActive ? "bg-gold/15 text-gold" : "bg-surface-elevated text-text-muted"
                                        }`}
                                    >
                                        {exercise.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-1.5">
                                    {exercise.daysOfWeek.map((day) => (
                                        <span key={day} className="rounded-lg bg-surface-elevated px-2 py-1 text-xs font-medium text-text-secondary">
                                            {day}
                                        </span>
                                    ))}
                                </div>

                                <p className="mt-3 text-xs text-text-muted">Reminder at {exercise.reminderTime}</p>
                                {exercise.notes && <p className="mt-2 text-sm text-text-secondary">{exercise.notes}</p>}

                                <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                                    <button
                                        onClick={() => onMarkComplete(exercise)}
                                        className="rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand/20"
                                    >
                                        Mark complete
                                    </button>
                                    <button
                                        onClick={() => openEdit(exercise)}
                                        className="rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-brand/40 hover:text-brand"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => openDelete(exercise)}
                                        className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {(modalMode === "create" || modalMode === "edit") && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
                    <div className="glass w-full max-w-lg rounded-2xl p-6 shadow-2xl">
                        <h2 className="mb-6 text-xl font-bold text-text-primary">
                            {modalMode === "create" ? "Add Exercise" : "Edit Exercise"}
                        </h2>
                        <ExerciseForm
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
                        <h2 className="mb-2 text-xl font-bold text-text-primary">Delete Exercise</h2>
                        <p className="mb-6 text-sm text-text-secondary">
                            Are you sure you want to remove{" "}
                            <span className="font-semibold text-text-primary">{selected.name}</span>? This action cannot be undone.
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
