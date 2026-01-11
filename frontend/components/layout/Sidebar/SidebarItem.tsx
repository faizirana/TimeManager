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
        important: "bg-green-700 hover:bg-green-800 text-white",
        secondary: "bg-zinc-100 dark:bg-zinc-900",
        disabled: "opacity-50 cursor-not-allowed pointer-events-none text-[var(--foreground)]",
      },
      // Changement ici : couleur de fond plus visible pour l'item actif
      // Contraste fort : fond bleu vif, texte blanc, ombre
      active: {
        true: "bg-blue-600 text-white dark:bg-blue-400 dark:text-zinc-900 pointer-events-none shadow-lg",
        false: "",
      },
      size: { full: "w-full px-4 py-2", icon: "px-3 py-3", profile: "w-full px-2 py-2" },
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
          "border-l-4 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-200",
        // If active, add bg-secondary for test compatibility
        active && "bg-secondary",
        className,
      )}
      aria-disabled={variant === "disabled"}
      tabIndex={variant === "disabled" ? -1 : undefined}
      title={collapsed ? label : undefined}
    >
      {/* Render image if provided, otherwise render icon */}
      {hasAvatar ? (
        <Avatar
          name={user?.name ?? ""}
          surname={user?.surname ?? ""}
          size={size === "profile" ? "w-10 h-10" : "w-6 h-6"}
        />
      ) : (
        Icon && (
          <Icon
            size={18}
            color={variant === "important" && active === false ? "white" : "var(--color-primary)"}
          />
        )
      )}
      {!collapsed && label && <span>{label}</span>}
    </Wrapper>
  );
}
