import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-md bg-surface px-3 text-sm text-fg shadow-[0_0_0_1px_rgba(28,25,23,0.12)] outline-none transition-[box-shadow] duration-150 placeholder:text-faint focus-visible:shadow-[0_0_0_2px_rgba(15,92,69,0.35)] disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
