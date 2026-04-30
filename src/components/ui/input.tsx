"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, label, error, ...props }, ref) => {
    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-4 text-zinc-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "flex h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-base text-zinc-900 transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#928EFF]/20 focus:border-[#928EFF] disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:ring-offset-zinc-950 dark:placeholder:text-zinc-500",
              icon && "pl-11",
              error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
