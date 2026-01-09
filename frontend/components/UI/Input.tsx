import { InputHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const inputVariants = cva(
  "w-full text-[var(--foreground)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-[var(--muted)]",
  {
    variants: {
      variant: {
        default:
          "block py-2.5 px-0 text-sm bg-transparent border-0 border-b-2 border-[var(--border)] appearance-none focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] peer",
        secondary:
          "block py-2.5 px-0 text-sm bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-[var(--color-secondary)] peer",
        outline:
          "rounded-lg bg-transparent border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent",
        filled:
          "rounded-lg bg-[var(--surface-hover)] border-0 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]",
      },
      inputSize: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "md",
    },
  },
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, ...props }, ref) => {
    return (
      <input
        className={cn(inputVariants({ variant, inputSize }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
