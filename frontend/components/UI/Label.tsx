import { LabelHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const labelVariants = cva("text-sm font-medium", {
  variants: {
    variant: {
      default:
        "peer-focus:font-medium absolute text-[var(--muted-foreground)] duration-300 transform -translate-y-6 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-[var(--color-primary)] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-80 peer-focus:-translate-y-6",
      secondary:
        "peer-focus:font-medium absolute text-[var(--muted-foreground)] duration-300 transform -translate-y-6 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-[var(--color-secondary)] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-80 peer-focus:-translate-y-6",
      static: "block mb-2 text-[var(--foreground)]",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface LabelProps
  extends LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {}

export function Label({ className, variant, ...props }: LabelProps) {
  return <label className={cn(labelVariants({ variant }), className)} {...props} />;
}
