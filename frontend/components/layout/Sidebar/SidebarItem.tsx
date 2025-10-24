"use client";

import Link from "next/link";
import { SidebarItemProps } from "./types";
import { cva, type VariantProps } from "class-variance-authority";

const sidebarItemVariants = cva(
  "flex items-center gap-3 w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "text-black dark:text-white",
        important:
          "bg-primary text-white",
        disabled:
          "opacity-50 cursor-not-allowed pointer-events-none text-black dark:text-white",
      },
      active: {
        true: "text-black dark:text-white bg-secondary pointer-events-none",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        active: false,
        class: "hover:bg-zinc-100 dark:hover:bg-zinc-900",
      },
      {
        variant: "important",
        active: false,
        class: "hover:bg-primary-soft",
      },
    ],
    defaultVariants: {
      variant: "default",
      active: false,
    },
  }
);


type SidebarItemVariantProps = VariantProps<typeof sidebarItemVariants>;

export default function SidebarItem({
  label,
  icon: Icon,
  href,
  onClick,
  variant,
  active,
}: SidebarItemProps & SidebarItemVariantProps) {
  const Wrapper = href ? Link : "button";

  return (
    <Wrapper
      href={variant === "disabled" ? "#" : (href as string)}
      onClick={variant === "disabled" ? undefined : onClick}
      className={sidebarItemVariants({ variant, active })}
      aria-disabled={variant === "disabled"}
      tabIndex={variant === "disabled" ? -1 : undefined}
    >
      {Icon && <Icon size={18} color={variant === "important" ? "white" : "var(--color-primary)"} />}
      <span>{label}</span>
    </Wrapper>
  );
}

