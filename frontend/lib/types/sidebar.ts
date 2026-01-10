import { LucideIcon } from "lucide-react";

export interface SidebarItemProps {
  label?: string;
  icon?: LucideIcon;
  hasAvatar?: boolean;
  href?: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  collapsed?: boolean;
}

export interface SidebarProps {
  items: SidebarItemProps[];
  collapsed?: boolean;
  className?: string;
  children?: React.ReactNode;
}
