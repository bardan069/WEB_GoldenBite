/**
 * Unit tests for the RegisterForm component.
 * Verifies all required fields, validation messages, and navigation link.
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import RegisterForm from "@/app/(auth)/_components/RegisterForm";

jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/lib/actions/auth-action", () => ({
    handleRegisterUser: jest.fn().mockResolvedValue({ success: true, message: "Registration successful!" }),
}));

jest.mock("react-toastify", () => ({
    toast: { success: jest.fn(), error: jest.fn() },
}));

describe("RegisterForm", () => {
    it("renders all required fields", () => {
        render(<RegisterForm />);
        expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it("renders Create Account button", () => {
        render(<RegisterForm />);
        expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
    });

    it("renders link to login page", () => {
        render(<RegisterForm />);
        expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
    });

    it("shows required errors on empty submit", async () => {
        render(<RegisterForm />);
        fireEvent.submit(screen.getByRole("button", { name: /create account/i }).closest("form")!);
        await waitFor(() => {
            expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
            expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
            expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        });
    });

    it("accepts typed values in all fields", () => {
        render(<RegisterForm />);
        fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "John" } });
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: "Doe" } });
        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "johndoe" } });
        fireEvent.change(screen.getByLabelText(/^email/i), { target: { value: "john@example.com" } });
        expect(screen.getByLabelText(/first name/i)).toHaveValue("John");
        expect(screen.getByLabelText(/^email/i)).toHaveValue("john@example.com");
    });
});
