/**
 * Unit tests for the ExerciseForm component.
 * Verifies field rendering, day-of-week selection, required validation, and submit payload shape.
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ExerciseForm from "@/app/dashboard/exercises/_components/ExerciseForm";

jest.mock("react-toastify", () => ({
    toast: { success: jest.fn(), error: jest.fn() },
}));

describe("ExerciseForm", () => {
    const noop = () => {};

    it("renders the core fields", () => {
        render(<ExerciseForm mode="create" submitting={false} onSubmit={noop} onCancel={noop} />);
        expect(screen.getByLabelText(/exercise name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/duration/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/reminder time/i)).toBeInTheDocument();
        expect(screen.getByText("Mon")).toBeInTheDocument();
    });

    it("shows a required error for name on empty submit", async () => {
        render(<ExerciseForm mode="create" submitting={false} onSubmit={noop} onCancel={noop} />);
        fireEvent.submit(screen.getByLabelText(/exercise form/i));
        await waitFor(() => {
            expect(screen.getByText(/name is required/i)).toBeInTheDocument();
        });
    });

    it("shows an error when no day of the week is selected", async () => {
        render(<ExerciseForm mode="create" submitting={false} onSubmit={noop} onCancel={noop} />);
        fireEvent.change(screen.getByLabelText(/exercise name/i), { target: { value: "Morning Walk" } });
        fireEvent.submit(screen.getByLabelText(/exercise form/i));
        await waitFor(() => {
            expect(screen.getByText(/select at least one day/i)).toBeInTheDocument();
        });
    });

    it("toggles a day of the week on click", () => {
        render(<ExerciseForm mode="create" submitting={false} onSubmit={noop} onCancel={noop} />);
        const monButton = screen.getByRole("button", { name: "Mon" });
        expect(monButton).toHaveAttribute("aria-pressed", "false");
        fireEvent.click(monButton);
        expect(monButton).toHaveAttribute("aria-pressed", "true");
    });

    it("calls onSubmit with the expected payload when the form is valid", async () => {
        const onSubmit = jest.fn();
        render(<ExerciseForm mode="create" submitting={false} onSubmit={onSubmit} onCancel={noop} />);

        fireEvent.change(screen.getByLabelText(/exercise name/i), { target: { value: "Morning Walk" } });
        fireEvent.click(screen.getByRole("button", { name: "Mon" }));
        fireEvent.submit(screen.getByLabelText(/exercise form/i));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({ name: "Morning Walk", daysOfWeek: ["Mon"] })
            );
        });
    });
});
