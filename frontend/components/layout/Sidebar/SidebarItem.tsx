"use client";

import Image from "next/image";
import Link from "next/link";
import { SidebarItemProps } from "@/lib/types/sidebar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const sidebarItemVariants = cva(
  "flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "text-black dark:text-white",
        important: "bg-primary text-white",
        secondary: "bg-zinc-100 dark:bg-zinc-900",
        disabled: "opacity-50 cursor-not-allowed pointer-events-none text-black dark:text-white",
      },
      active: { true: "text-black dark:text-white bg-secondary pointer-events-none", false: "" },
      size: { full: "w-full px-4 py-2", icon: "w-fit px-3 py-3", profile: "w-full px-2 py-2" },
    },
    compoundVariants: [
      { variant: "default", active: false, class: "hover:bg-zinc-100 dark:hover:bg-zinc-900" },
      { variant: "important", active: false, class: "hover:bg-primary-soft" },
      { variant: "secondary", active: false, class: "hover:bg-zinc-200 dark:hover:bg-zinc-800" },
    ],
    defaultVariants: { variant: "default", active: false, size: "full" },
  },
);

type SidebarItemVariantProps = VariantProps<typeof sidebarItemVariants>;

export default function SidebarItem({
  label,
  icon: Icon,
  image,
  href,
  onClick,
  className,
  variant,
  size,
  active,
}: SidebarItemProps & SidebarItemVariantProps) {
  const Wrapper = href ? Link : onClick ? "button" : "div";
  return (
    <Wrapper
      href={variant === "disabled" ? "#" : (href as string)}
      onClick={variant === "disabled" ? undefined : onClick}
      className={cn(sidebarItemVariants({ variant, active, size }), className)}
      aria-disabled={variant === "disabled"}
      tabIndex={variant === "disabled" ? -1 : undefined}
    >
      {/* Render image if provided, otherwise render icon */}
      {image ? (
        <Image
          src={image}
          alt=""
          width={size === "profile" ? 40 : 24}
          height={size === "profile" ? 40 : 24}
          className="object-cover rounded-lg" // Ensures the image is square and cropped
          unoptimized
        />
      ) : (
        Icon && (
          <Icon
            size={18}
            color={variant === "important" && active === false ? "white" : "var(--color-primary)"}
          />
        )
      )}
      {label && <span>{label}</span>}
    </Wrapper>
  );
}
