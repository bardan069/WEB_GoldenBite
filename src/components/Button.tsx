import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export default function Button({ children, type = "button", className = "" }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex w-full items-center justify-center rounded-3xl bg-emerald-500 px-5 py-3 text-base font-semibold text-slate-950 transition hover:bg-emerald-400 ${className}`}
    >
      {children}
    </button>
  );
}
