/**
 * Unit tests for the MealForm component.
 * Verifies field rendering, required validation, and submit payload shape.
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import MealForm from "@/app/dashboard/diet/_components/MealForm";
import { handleAnalyzeFoodPhoto } from "@/lib/actions/diet-action";
import { toast } from "react-toastify";

jest.mock("react-toastify", () => ({
    toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock("@/lib/actions/diet-action", () => ({
    handleAnalyzeFoodPhoto: jest.fn(),
}));

describe("MealForm", () => {
    const noop = () => {};

    it("renders the core fields", () => {
        render(<MealForm mode="create" submitting={false} onSubmit={noop} onCancel={noop} />);
        expect(screen.getByLabelText(/food/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^meal$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/calories/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    });

    it("renders the Log Meal button in create mode", () => {
        render(<MealForm mode="create" submitting={false} onSubmit={noop} onCancel={noop} />);
        expect(screen.getByRole("button", { name: /log meal/i })).toBeInTheDocument();
    });

    it("shows a required error for food name on empty submit", async () => {
        render(<MealForm mode="create" submitting={false} onSubmit={noop} onCancel={noop} />);
        fireEvent.submit(screen.getByLabelText(/meal form/i));
        await waitFor(() => {
            expect(screen.getByText(/food name is required/i)).toBeInTheDocument();
        });
    });

    it("calls onSubmit with the expected payload when the form is valid", async () => {
        const onSubmit = jest.fn();
        render(<MealForm mode="create" submitting={false} onSubmit={onSubmit} onCancel={noop} />);

        fireEvent.change(screen.getByLabelText(/food/i), { target: { value: "Grilled Chicken Salad" } });
        fireEvent.change(screen.getByLabelText(/calories/i), { target: { value: "450" } });
        fireEvent.submit(screen.getByLabelText(/meal form/i));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({ foodName: "Grilled Chicken Salad", calories: 450 })
            );
        });
    });

    it("auto-fills food name and calories after a successful photo analysis", async () => {
        (handleAnalyzeFoodPhoto as jest.Mock).mockResolvedValue({
            success: true,
            data: { isFood: true, foodName: "Banana", estimatedCalories: 105, confidence: "high" },
        });

        render(<MealForm mode="create" submitting={false} onSubmit={noop} onCancel={noop} />);
        const file = new File(["fake"], "banana.jpg", { type: "image/jpeg" });
        const input = document.getElementById("meal-photo") as HTMLInputElement;
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByLabelText(/food/i)).toHaveValue("Banana");
            expect(screen.getByLabelText(/calories/i)).toHaveValue(105);
        });
    });

    it("shows an error toast when the photo is not food", async () => {
        (handleAnalyzeFoodPhoto as jest.Mock).mockResolvedValue({
            success: true,
            data: { isFood: false, foodName: "", estimatedCalories: 0, confidence: "low" },
        });

        render(<MealForm mode="create" submitting={false} onSubmit={noop} onCancel={noop} />);
        const file = new File(["fake"], "notfood.jpg", { type: "image/jpeg" });
        const input = document.getElementById("meal-photo") as HTMLInputElement;
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/doesn't look like food/i));
        });
    });
});
