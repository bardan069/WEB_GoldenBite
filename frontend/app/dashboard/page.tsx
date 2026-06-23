import { getUserData } from "@/lib/cookies";

export default async function DashboardPage() {
    const user = await getUserData();
    const name =
        user?.firstName || user?.username || user?.name || user?.email || "User";

    return (
        <section className="py-8">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
                <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-[1.5px] text-brand">
                        Dashboard
                    </p>
                    <h1 className="text-4xl font-bold leading-none text-text-primary md:text-5xl">
                        Welcome, <span className="gradient-text">{name}</span>
                    </h1>
                    <p className="mt-3 text-text-secondary">
                        Here&apos;s an overview of your wellness journey.
                    </p>
                </div>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="glass rounded-2xl p-6 transition-all hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5 group">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-widest text-brand">Recipes</p>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand/20">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>
                        </div>
                    </div>
                    <p className="mt-4 text-3xl font-bold text-text-primary">12</p>
                    <p className="mt-1 text-sm text-text-muted">Saved recipes</p>
                </div>

                <div className="glass rounded-2xl p-6 transition-all hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 group">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-widest text-gold">Meal Plans</p>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold transition-colors group-hover:bg-gold/20">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
                        </div>
                    </div>
                    <p className="mt-4 text-3xl font-bold text-text-primary">3</p>
                    <p className="mt-1 text-sm text-text-muted">Active plans</p>
                </div>

                <div className="glass rounded-2xl p-6 transition-all hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 group">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-widest text-purple-400">Streak</p>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 transition-colors group-hover:bg-purple-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" /></svg>
                        </div>
                    </div>
                    <p className="mt-4 text-3xl font-bold text-text-primary">7</p>
                    <p className="mt-1 text-sm text-text-muted">Days active</p>
                </div>
            </div>
        </section>
    );
}
