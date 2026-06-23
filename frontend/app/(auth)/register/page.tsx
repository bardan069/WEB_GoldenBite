import RegisterForm from "../_components/RegisterForm";

export default function RegisterPage() {
    return (
        <div className="w-full max-w-5xl glass rounded-[2rem] p-6 glow-brand sm:p-10">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div className="space-y-6">
                    <p className="text-sm uppercase tracking-[0.35em] text-brand">Join Golden Bite</p>
                    <h1 className="text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
                        Create your account
                    </h1>
                    <p className="max-w-xl text-sm leading-7 text-text-secondary">
                        Register to access guided meal plans, curated recipes, and a calm wellness experience.
                    </p>
                    <RegisterForm />
                </div>

                <aside className="rounded-[2rem] border border-brand/10 bg-brand/5 p-6 sm:p-8">
                    <p className="text-sm uppercase tracking-[0.35em] text-brand">Why join?</p>
                    <h2 className="mt-4 text-3xl font-semibold text-text-primary">Build your wellness routine.</h2>
                    <p className="mt-4 text-sm leading-7 text-text-secondary">
                        Sign up once to unlock recipe collections, daily inspiration, and an easy way to plan healthier meals.
                    </p>
                    <div className="mt-8 space-y-4 rounded-[1.75rem] border border-border bg-surface-elevated p-5">
                        <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-text-muted">Fast setup</p>
                            <p className="mt-2 text-sm text-text-secondary">Complete your account quickly and start exploring.</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-text-muted">Curated meals</p>
                            <p className="mt-2 text-sm text-text-secondary">Receive tailored recipes and balanced meal ideas every week.</p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
