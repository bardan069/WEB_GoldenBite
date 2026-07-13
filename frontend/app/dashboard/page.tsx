import Link from "next/link";
import { getUserData } from "@/lib/cookies";
import { handleGetMedicationsDueToday, handleMarkMedicationTaken } from "@/lib/actions/medication-action";
import { handleGetExercisesDueToday, handleMarkExerciseComplete } from "@/lib/actions/exercise-action";
import { handleGetMealEntries } from "@/lib/actions/diet-action";

function isToday(iso: string) {
    return new Date(iso).toDateString() === new Date().toDateString();
}

export default async function DashboardPage() {
    const user = await getUserData();
    const name = user?.firstName || user?.username || user?.name || user?.email || "User";

    const [medicationsResult, exercisesResult, mealsResult] = await Promise.all([
        handleGetMedicationsDueToday(),
        handleGetExercisesDueToday(),
        handleGetMealEntries(),
    ]);

    const dueMedications = medicationsResult.success ? medicationsResult.data : [];
    const dueExercises = exercisesResult.success ? exercisesResult.data : [];
    const meals = mealsResult.success ? mealsResult.data : [];
    const mealsLoggedToday = meals.filter((entry: { date: string }) => isToday(entry.date)).length;

    const takenToday = dueMedications.filter((m: { lastTakenAt?: string }) => m.lastTakenAt && isToday(m.lastTakenAt));
    const completedToday = dueExercises.filter((e: { lastCompletedAt?: string }) => e.lastCompletedAt && isToday(e.lastCompletedAt));

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
                <Link href="/dashboard/medications" className="glass rounded-2xl p-6 transition-all hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5 group">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-widest text-brand">Medications</p>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand/20">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0M14.25 3.104v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5M19.8 15.3l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 20.25c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>
                        </div>
                    </div>
                    <p className="mt-4 text-3xl font-bold text-text-primary">{dueMedications.length}</p>
                    <p className="mt-1 text-sm text-text-muted">Due today &middot; {takenToday.length} taken</p>
                </Link>

                <Link href="/dashboard/exercises" className="glass rounded-2xl p-6 transition-all hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 group">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-widest text-gold">Exercises</p>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold transition-colors group-hover:bg-gold/20">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" /></svg>
                        </div>
                    </div>
                    <p className="mt-4 text-3xl font-bold text-text-primary">{dueExercises.length}</p>
                    <p className="mt-1 text-sm text-text-muted">Scheduled today &middot; {completedToday.length} done</p>
                </Link>

                <Link href="/dashboard/diet" className="glass rounded-2xl p-6 transition-all hover:border-rust/30 hover:shadow-lg hover:shadow-rust/5 group">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-widest text-rust">Diet</p>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rust/10 text-rust transition-colors group-hover:bg-rust/20">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>
                        </div>
                    </div>
                    <p className="mt-4 text-3xl font-bold text-text-primary">{mealsLoggedToday}</p>
                    <p className="mt-1 text-sm text-text-muted">Meals logged today</p>
                </Link>
            </div>

            <div className="mt-10">
                <h2 className="text-xl font-bold text-text-primary">Today&apos;s reminders</h2>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div className="glass rounded-2xl p-6">
                        <p className="text-xs font-bold uppercase tracking-widest text-brand">Medications</p>
                        {dueMedications.length === 0 ? (
                            <p className="mt-4 text-sm text-text-muted">Nothing scheduled for today.</p>
                        ) : (
                            <ul className="mt-4 space-y-3">
                                {dueMedications.map((medication: {
                                    _id: string;
                                    name: string;
                                    dosage: string;
                                    reminderTimes: string[];
                                    lastTakenAt?: string;
                                }) => {
                                    const taken = medication.lastTakenAt && isToday(medication.lastTakenAt);
                                    return (
                                        <li key={medication._id} className="flex items-center justify-between gap-3 rounded-xl border border-border/50 px-4 py-3">
                                            <div>
                                                <p className="font-medium text-text-primary">{medication.name}</p>
                                                <p className="text-xs text-text-muted">{medication.dosage} &middot; {medication.reminderTimes.join(", ")}</p>
                                            </div>
                                            {taken ? (
                                                <span className="shrink-0 rounded-full bg-brand/15 px-3 py-1 text-xs font-semibold text-brand">Taken</span>
                                            ) : (
                                                <form action={async () => { await handleMarkMedicationTaken(medication._id); }}>
                                                    <button type="submit" className="shrink-0 rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand/20">
                                                        Mark taken
                                                    </button>
                                                </form>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    <div className="glass rounded-2xl p-6">
                        <p className="text-xs font-bold uppercase tracking-widest text-gold">Exercises</p>
                        {dueExercises.length === 0 ? (
                            <p className="mt-4 text-sm text-text-muted">Nothing scheduled for today.</p>
                        ) : (
                            <ul className="mt-4 space-y-3">
                                {dueExercises.map((exercise: {
                                    _id: string;
                                    name: string;
                                    durationMinutes: number;
                                    reminderTime: string;
                                    lastCompletedAt?: string;
                                }) => {
                                    const done = exercise.lastCompletedAt && isToday(exercise.lastCompletedAt);
                                    return (
                                        <li key={exercise._id} className="flex items-center justify-between gap-3 rounded-xl border border-border/50 px-4 py-3">
                                            <div>
                                                <p className="font-medium text-text-primary">{exercise.name}</p>
                                                <p className="text-xs text-text-muted">{exercise.durationMinutes} min &middot; {exercise.reminderTime}</p>
                                            </div>
                                            {done ? (
                                                <span className="shrink-0 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">Done</span>
                                            ) : (
                                                <form action={async () => { await handleMarkExerciseComplete(exercise._id); }}>
                                                    <button type="submit" className="shrink-0 rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand/20">
                                                        Mark complete
                                                    </button>
                                                </form>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
