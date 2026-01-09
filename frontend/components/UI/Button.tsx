import { ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap",
  {
    variants: {
      variant: {
        primary: "bg-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] text-white",
        secondary: "bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-soft)] text-white",
        destructive: "bg-red-600 hover:bg-red-700 text-white",
        outline:
          "border border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--foreground)]",
        ghost: "hover:bg-[var(--surface-hover)] text-[var(--foreground)]",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

export function Button({
  className,
  variant,
  size,
  icon,
  iconPosition = "right",
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {icon && iconPosition === "left" && icon}
      {children}
      {icon && iconPosition === "right" && icon}
    </button>
  );
}
