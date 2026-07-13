import Link from "next/link";
import UpdateForm from "../_components/UpdateForm";

export default function ProfilePage() {
    return (
        <section className="mx-auto w-full max-w-2xl py-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-[1.5px] text-brand">
                Settings
            </p>
            <h1 className="mb-2 text-3xl font-bold text-text-primary">Edit Profile</h1>
            <p className="mb-8 text-text-secondary">
                Update your personal information and profile picture.{" "}
                <Link href="/dashboard/password" className="font-semibold text-brand hover:text-brand-light">
                    Change your password &rarr;
                </Link>
            </p>
            <UpdateForm />
        </section>
    );
}
