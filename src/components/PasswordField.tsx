import React from "react";

interface PasswordFieldProps {
  id: string;
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export default function PasswordField({
  id,
  label,
  placeholder,
  value,
  onChange,
}: PasswordFieldProps) {
  return (
    <label className="block text-sm font-medium text-slate-200" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        name={id}
        type="password"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
      />
    </label>
  );
}
