/**
 * Unit tests for the LoginForm component.
 * Verifies field rendering, validation messages, and submit button state.
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginForm from "@/app/(auth)/_components/LoginForm";
import { handleLoginUser } from "@/lib/actions/auth-action";

/* ── Mocks ──────────────────────────────────────────────────────────────── */
jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/lib/contexts/AuthContext", () => ({
    useAuth: () => ({ checkAuth: jest.fn() }),
}));

jest.mock("@/lib/actions/auth-action", () => ({
    handleLoginUser: jest.fn().mockResolvedValue({ success: true, message: "Login successful!" }),
}));

jest.mock("react-toastify", () => ({
    toast: { success: jest.fn(), error: jest.fn() },
}));

/* ── Tests ──────────────────────────────────────────────────────────────── */
describe("LoginForm", () => {
    it("renders email and password fields", () => {
        render(<LoginForm />);
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    });

    it("renders the Sign In button", () => {
        render(<LoginForm />);
        expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    });

    it("renders link to register page", () => {
        render(<LoginForm />);
        expect(screen.getByRole("link", { name: /create account/i })).toBeInTheDocument();
    });

    it("shows required error when submitting empty form", async () => {
        render(<LoginForm />);
        fireEvent.submit(screen.getByRole("button", { name: /sign in/i }).closest("form")!);
        await waitFor(() => {
            expect(screen.getByText(/email is required/i)).toBeInTheDocument();
            expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        });
    });

    it("accepts typed input", () => {
        render(<LoginForm />);
        const emailInput = screen.getByLabelText(/email/i);
        fireEvent.change(emailInput, { target: { value: "test@example.com" } });
        expect(emailInput).toHaveValue("test@example.com");
    });

    it("disables button while submitting", async () => {
        (handleLoginUser as jest.Mock).mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500))
        );
        render(<LoginForm />);
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } });
        fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: "password123" } });
        fireEvent.submit(screen.getByRole("button", { name: /sign in/i }).closest("form")!);
        await waitFor(() => {
            expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
        });
    });
});
