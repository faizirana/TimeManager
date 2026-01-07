import { LucideIcon } from "lucide-react";

export interface SidebarItemProps {
  label?: string;
  icon?: LucideIcon;
  image?: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export interface SidebarProps {
  items: SidebarItemProps[];
  collapsed?: boolean;
  className?: string;
}
