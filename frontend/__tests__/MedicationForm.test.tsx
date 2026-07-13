/**
 * Unit tests for the MedicationForm component.
 * Verifies field rendering, required-field validation, and submit payload shape.
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import MedicationForm from "@/app/dashboard/medications/_components/MedicationForm";

jest.mock("react-toastify", () => ({
    toast: { success: jest.fn(), error: jest.fn() },
}));

describe("MedicationForm", () => {
    const noop = () => {};

    it("renders the core fields", () => {
        render(<MedicationForm mode="create" submitting={false} onSubmit={noop} onCancel={noop} />);
        expect(screen.getByLabelText(/medication name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/dosage/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/times per day/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    });

    it("renders the Add Medication button in create mode", () => {
        render(<MedicationForm mode="create" submitting={false} onSubmit={noop} onCancel={noop} />);
        expect(screen.getByRole("button", { name: /add medication/i })).toBeInTheDocument();
    });

    it("renders the Save Changes button in edit mode", () => {
        render(<MedicationForm mode="edit" submitting={false} onSubmit={noop} onCancel={noop} />);
        expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
    });

    it("shows required errors when submitting with empty name/dosage", async () => {
        render(<MedicationForm mode="create" submitting={false} onSubmit={noop} onCancel={noop} />);
        fireEvent.submit(screen.getByLabelText(/medication form/i));
        await waitFor(() => {
            expect(screen.getByText(/name is required/i)).toBeInTheDocument();
            expect(screen.getByText(/dosage is required/i)).toBeInTheDocument();
        });
    });

    it("calls onSubmit with the expected payload when the form is valid", async () => {
        const onSubmit = jest.fn();
        render(<MedicationForm mode="create" submitting={false} onSubmit={onSubmit} onCancel={noop} />);

        fireEvent.change(screen.getByLabelText(/medication name/i), { target: { value: "Vitamin D" } });
        fireEvent.change(screen.getByLabelText(/dosage/i), { target: { value: "1 tablet" } });
        fireEvent.submit(screen.getByLabelText(/medication form/i));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: "Vitamin D",
                    dosage: "1 tablet",
                    reminderTimes: expect.arrayContaining([expect.any(String)]),
                })
            );
        });
    });

    it("adds another reminder time row when clicking add", () => {
        render(<MedicationForm mode="create" submitting={false} onSubmit={noop} onCancel={noop} />);
        const before = screen.getAllByDisplayValue("08:00").length;
        fireEvent.click(screen.getByRole("button", { name: /add another time/i }));
        const after = screen.getAllByDisplayValue("08:00").length;
        expect(after).toBe(before + 1);
    });

    it("calls onCancel when Cancel is clicked", () => {
        const onCancel = jest.fn();
        render(<MedicationForm mode="create" submitting={false} onSubmit={noop} onCancel={onCancel} />);
        fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
        expect(onCancel).toHaveBeenCalled();
    });
});
