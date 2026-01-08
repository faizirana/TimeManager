import { SelectHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const selectVariants = cva(
  "w-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default:
          "px-4 py-2 text-sm rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent",
        outline:
          "px-4 py-2 text-sm rounded-lg bg-transparent border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent",
        filled:
          "px-4 py-2 text-sm rounded-lg bg-[var(--surface-hover)] border-0 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]",
      },
      selectSize: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      selectSize: "md",
    },
  },
);

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size">,
    VariantProps<typeof selectVariants> {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant, selectSize, children, ...props }, ref) => {
    return (
      <select
        className={cn(selectVariants({ variant, selectSize }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  },
);

Select.displayName = "Select";
