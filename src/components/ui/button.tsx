"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "small" | "medium" | "large";
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "medium", ...props }, ref) => {
    const variants = {
      primary: "bg-gradient-to-r from-[#B799FF] to-[#928EFF] text-white shadow-lg shadow-purple-500/20",
      secondary: "bg-white text-[#928EFF] hover:bg-zinc-50 border border-zinc-100 shadow-sm",
      outline: "bg-transparent border-2 border-[#928EFF] text-[#928EFF] hover:bg-purple-50",
      ghost: "bg-transparent text-zinc-600 hover:bg-zinc-100",
    };

    const sizes = {
      small: "px-4 py-2 text-sm",
      medium: "px-6 py-3 text-base",
      large: "px-8 py-4 text-lg",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
