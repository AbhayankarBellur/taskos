import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = InputHTMLAttributes<HTMLInputElement> & { label?: string };

export function Input({ label, className, id, ...props }: Props) {
  const inputId = id ?? props.name;
  return (
    <label htmlFor={inputId} className="block space-y-1.5 text-sm">
      {label && <span className="font-medium text-gray-700">{label}</span>}
      <input
        id={inputId}
        className={cn(
          "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none",
          "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100",
          className
        )}
        {...props}
      />
    </label>
  );
}
