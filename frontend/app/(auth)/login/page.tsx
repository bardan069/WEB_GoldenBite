import LoginForm from "../_components/LoginForm";
import Logo from "@/app/_components/Logo";

export default function LoginPage() {
    return (
        <div className="w-full max-w-[460px]">
            <div className="mb-8 text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-light to-gold shadow-lg shadow-gold/30 glow-gold">
                    <Logo className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-text-primary">
                    Welcome back
                </h1>
                <p className="mt-2 text-sm text-text-muted">
                    Sign in to your Golden Bite account
                </p>
            </div>

            <div className="glass rounded-2xl p-8 glow-brand">
                <LoginForm />
            </div>
        </div>
    );
}
