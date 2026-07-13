export default function FamilyPage() {
    return (
        <section className="py-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-[1.5px] text-rust">
                New
            </p>
            <h1 className="text-4xl font-bold text-text-primary">
                Family <span className="gradient-text">Notifications</span>
            </h1>
            <p className="mt-3 max-w-xl text-text-secondary">
                Bring someone you trust into the loop, without handing over your account.
            </p>

            <div className="mt-8 grid gap-8 rounded-3xl glass p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-rust/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-rust">
                        <span className="h-1.5 w-1.5 rounded-full bg-rust" />
                        Coming soon
                    </span>

                    <h2 className="mt-4 text-3xl font-bold text-text-primary">
                        Bring family into the loop.
                    </h2>
                    <p className="mt-3 text-text-secondary">
                        Invite someone you trust to quietly follow along — they&apos;ll be notified if a dose or a
                        routine gets missed, without needing their own account to manage.
                    </p>

                    <ul className="mt-6 space-y-3">
                        <li className="flex items-start gap-3 text-sm text-text-secondary">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-brand/15 text-xs font-bold text-brand">✓</span>
                            Invite by email — they just watch, no login required
                        </li>
                        <li className="flex items-start gap-3 text-sm text-text-secondary">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-brand/15 text-xs font-bold text-brand">✓</span>
                            Alerts only on missed medications or exercises, not every check-in
                        </li>
                        <li className="flex items-start gap-3 text-sm text-text-secondary">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-brand/15 text-xs font-bold text-brand">✓</span>
                            You choose exactly what they can see
                        </li>
                    </ul>

                    <button
                        type="button"
                        disabled
                        title="Coming soon"
                        className="mt-8 inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-surface-elevated px-5 py-3 text-sm font-semibold text-text-muted opacity-80"
                    >
                        🔔 Notify family — coming soon
                    </button>
                </div>

                <div className="rounded-2xl border border-border bg-gradient-to-br from-gold/10 to-brand/10 p-6">
                    <div className="flex items-center">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-surface bg-gold text-xs font-bold text-white">B</div>
                        <div className="-ml-2.5 flex h-9 w-9 items-center justify-center rounded-full border-2 border-surface bg-brand text-xs font-bold text-white">M</div>
                        <div className="-ml-2.5 flex h-9 w-9 items-center justify-center rounded-full border-2 border-surface bg-rust text-xs font-bold text-white">+</div>
                    </div>

                    <div className="mt-4 space-y-3">
                        <div className="rounded-xl bg-surface px-4 py-3 shadow-sm">
                            <p className="text-sm font-semibold text-text-primary">Missed reminder</p>
                            <p className="text-xs text-text-muted">Vitamin D wasn&apos;t marked taken by 10:00 AM</p>
                        </div>
                        <div className="rounded-xl bg-surface px-4 py-3 shadow-sm">
                            <p className="text-sm font-semibold text-text-primary">All caught up</p>
                            <p className="text-xs text-text-muted">Morning walk completed at 7:42 AM</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
