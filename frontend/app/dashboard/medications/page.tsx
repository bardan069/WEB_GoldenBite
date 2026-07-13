"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    handleGetMedications,
    handleCreateMedication,
    handleUpdateMedication,
    handleDeleteMedication,
    handleMarkMedicationTaken,
} from "@/lib/actions/medication-action";
import { MedicationInput } from "@/lib/api/medications";
import MedicationForm, { MedicationRecord } from "./_components/MedicationForm";

type ModalMode = "create" | "edit" | "delete" | null;

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function MedicationsPage() {
    const [medications, setMedications] = useState<MedicationRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [selected, setSelected] = useState<MedicationRecord | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchMedications = useCallback(async () => {
        setLoading(true);
        setError(null);
        const result = await handleGetMedications();
        setLoading(false);
        if (result.success) {
            setMedications(result.data);
        } else {
            setError(result.message || "Failed to load medications");
        }
    }, []);

    useEffect(() => {
        // Standard mount/refetch-on-change data-fetching effect.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchMedications();
    }, [fetchMedications]);

    const openCreate = () => {
        setSelected(null);
        setModalMode("create");
    };

    const openEdit = (medication: MedicationRecord) => {
        setSelected(medication);
        setModalMode("edit");
    };

    const openDelete = (medication: MedicationRecord) => {
        setSelected(medication);
        setModalMode("delete");
    };

    const closeModal = () => {
        setModalMode(null);
        setSelected(null);
    };

    const onSubmitCreate = async (data: MedicationInput) => {
        setSubmitting(true);
        const result = await handleCreateMedication(data);
        setSubmitting(false);
        if (result.success) {
            toast.success(result.message || "Medication added");
            closeModal();
            fetchMedications();
        } else {
            toast.error(result.message || "Failed to add medication");
        }
    };

    const onSubmitEdit = async (data: MedicationInput) => {
        if (!selected) return;
        setSubmitting(true);
        const result = await handleUpdateMedication(selected._id, data);
        setSubmitting(false);
        if (result.success) {
            toast.success(result.message || "Medication updated");
            closeModal();
            fetchMedications();
        } else {
            toast.error(result.message || "Failed to update medication");
        }
    };

    const onConfirmDelete = async () => {
        if (!selected) return;
        setSubmitting(true);
        const result = await handleDeleteMedication(selected._id);
        setSubmitting(false);
        if (result.success) {
            toast.success(result.message || "Medication deleted");
            closeModal();
            fetchMedications();
        } else {
            toast.error(result.message || "Failed to delete medication");
        }
    };

    const onMarkTaken = async (medication: MedicationRecord) => {
        const result = await handleMarkMedicationTaken(medication._id);
        if (result.success) {
            toast.success("Marked as taken for today");
            fetchMedications();
        } else {
            toast.error(result.message || "Failed to update medication");
        }
    };

    return (
        <section className="py-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[1.5px] text-brand">Wellness</p>
                    <h1 className="text-4xl font-bold text-text-primary">
                        Medication <span className="gradient-text">Reminders</span>
                    </h1>
                    <p className="mt-2 text-text-secondary">Keep track of what to take and when.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="self-start rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark sm:self-auto"
                >
                    + Add Medication
                </button>
            </div>

            <div className="mt-8">
                {loading ? (
                    <div className="glass flex justify-center rounded-2xl p-16">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                    </div>
                ) : error ? (
                    <div className="glass rounded-2xl p-16 text-center text-red-400">{error}</div>
                ) : medications.length === 0 ? (
                    <div className="glass rounded-2xl p-16 text-center text-text-muted">
                        No medications yet. Add your first reminder to get started.
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {medications.map((medication) => (
                            <div key={medication._id} className="glass flex flex-col rounded-2xl p-6">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-lg font-bold text-text-primary">{medication.name}</h3>
                                        <p className="text-sm text-text-secondary">{medication.dosage}</p>
                                    </div>
                                    <span
                                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                            medication.isActive
                                                ? "bg-brand/15 text-brand"
                                                : "bg-surface-elevated text-text-muted"
                                        }`}
                                    >
                                        {medication.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-1.5">
                                    {medication.reminderTimes.map((time) => (
                                        <span key={time} className="rounded-lg bg-surface-elevated px-2 py-1 text-xs font-medium text-text-secondary">
                                            {time}
                                        </span>
                                    ))}
                                </div>

                                <p className="mt-3 text-xs text-text-muted">
                                    Since {formatDate(medication.startDate)}
                                    {medication.endDate ? ` until ${formatDate(medication.endDate)}` : ""}
                                </p>
                                {medication.notes && <p className="mt-2 text-sm text-text-secondary">{medication.notes}</p>}

                                <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                                    <button
                                        onClick={() => onMarkTaken(medication)}
                                        className="rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand/20"
                                    >
                                        Mark taken
                                    </button>
                                    <button
                                        onClick={() => openEdit(medication)}
                                        className="rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-brand/40 hover:text-brand"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => openDelete(medication)}
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
                            {modalMode === "create" ? "Add Medication" : "Edit Medication"}
                        </h2>
                        <MedicationForm
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
                        <h2 className="mb-2 text-xl font-bold text-text-primary">Delete Medication</h2>
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
