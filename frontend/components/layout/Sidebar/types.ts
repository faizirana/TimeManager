import { LucideIcon } from "lucide-react";

export interface SidebarItemProps {
  label: string;
  icon?: LucideIcon;
  href?: string;
  active?: boolean;
  onClick?: () => void;
}

export interface SidebarProps {
  items: SidebarItemProps[];
  collapsed?: boolean;
  className?: string;
}
