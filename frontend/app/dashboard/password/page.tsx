import PasswordResetForm from "../_components/PasswordResetForm";

export default function PasswordPage() {
    return (
        <section className="mx-auto w-full max-w-2xl py-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-[1.5px] text-gold">
                Security
            </p>
            <h1 className="mb-2 text-3xl font-bold text-text-primary">Change Password</h1>
            <p className="mb-8 text-text-secondary">Keep your account secure by using a strong password.</p>
            <PasswordResetForm />
        </section>
    );
}
