import type { Metadata } from "next";
import { Fraunces, Figtree } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { Bounce, ToastContainer } from "react-toastify";

const fraunces = Fraunces({
    variable: "--font-fraunces",
    subsets: ["latin"],
    weight: ["500", "600", "700"],
    style: ["normal", "italic"],
});

const figtree = Figtree({
    variable: "--font-figtree",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
    title: "Golden Bite",
    description: "Golden Bite - Nourishing vitality for the golden years",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${fraunces.variable} ${figtree.variable} h-full antialiased`}
        >
            <AuthProvider>
                <body className="min-h-full flex flex-col bg-bg text-text-primary">
                    {children}
                    <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        pauseOnFocusLoss
                        transition={Bounce}
                        theme="light"
                    />
                </body>
            </AuthProvider>
        </html>
    );
}
