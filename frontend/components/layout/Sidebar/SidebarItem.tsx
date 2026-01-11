"use client";

import Link from "next/link";
import type { SidebarItemProps } from "@/lib/types/sidebar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/UI/Avatar";

const sidebarItemVariants = cva(
  "flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "text-[var(--foreground)]",
        secondary: "bg-zinc-100 dark:bg-zinc-900",
        important: "bg-green-700 text-white",
        disabled: "opacity-50 cursor-not-allowed pointer-events-none text-[var(--foreground)]",
      },
      // Style spécial pour l'élément actif (anciennement clock in)
      active: {
        true: "bg-secondary pointer-events-none",
        false: "",
      },
      size: { full: "w-full px-4 py-2", icon: "px-3 py-3", profile: "w-full px-2 py-2" },
    },
    compoundVariants: [
      { variant: "default", active: false, class: "hover:bg-zinc-100 dark:hover:bg-zinc-900" },
      { variant: "secondary", active: false, class: "hover:bg-zinc-200 dark:hover:bg-zinc-800" },
      { variant: "important", active: false, class: "hover:bg-green-800" },
    ],
    defaultVariants: { variant: "default", active: false, size: "full" },
  },
);

type SidebarItemVariantProps = VariantProps<typeof sidebarItemVariants>;

export default function SidebarItem({
  label,
  hasAvatar,
  icon: Icon,
  href,
  onClick,
  className,
  variant,
  size,
  active,
  collapsed,
  user,
}: SidebarItemProps & SidebarItemVariantProps) {
  const Wrapper = href ? Link : onClick ? "button" : "div";
  const effectiveSize = collapsed ? "icon" : size;

  return (
    <Wrapper
      href={variant === "disabled" ? "#" : (href as string)}
      onClick={variant === "disabled" ? undefined : onClick}
      className={cn(
        sidebarItemVariants({ variant, active, size: effectiveSize }),
        collapsed && "justify-center",
        // Ajout d'une bordure à gauche pour l'item actif quand le panneau est rétracté
        collapsed &&
          active &&
          "border-l-4 border-green-800 dark:border-green-400 bg-green-50 dark:bg-green-200",
        className,
      )}
      aria-disabled={variant === "disabled"}
      tabIndex={variant === "disabled" ? -1 : undefined}
      title={collapsed ? label : undefined}
    >
      {/* Render image if provided, otherwise render icon */}
      {hasAvatar ? (
        <div className={collapsed ? "flex justify-center w-full" : undefined}>
          <Avatar
            name={user?.name ?? ""}
            surname={user?.surname ?? ""}
            size={size === "profile" ? "w-10 h-10" : "w-6 h-6"}
          />
        </div>
      ) : (
        Icon && (
          <Icon
            size={18}
            stroke={variant === "important" && !active ? "white" : "var(--color-primary)"}
            color={variant === "important" && !active ? "white" : "var(--color-primary)"}
          />
        )
      )}
      {!collapsed && label && <span>{label}</span>}
    </Wrapper>
  );
}
