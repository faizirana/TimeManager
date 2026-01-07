"use client";

import { cn } from "@/lib/utils";
import SidebarItem from "./SidebarItem";
import { SidebarProps } from "@/lib/types/sidebar";
import DarkModeSwitcher from "@/components/UI/DarkModeSwitcher";
import FloatingMenu from "@/components/UI/FloatingMenu";

const userMenuItems = [
  { label: "Voir mon profil", onClick: () => alert("Profile à faire") },
  { label: "Paramètres", onClick: () => alert("Paramètres à faire") },
  { label: "Déconnexion", color: "text-red-600", onClick: () => alert("Déconnexion à faire") },
];

export default function Sidebar({ items, collapsed, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col bg-white dark:bg-zinc-950 shadow-md p-5 h-full rounded-r-lg",
        collapsed ? "w-16" : "w-56",
        className,
      )}
    >
      <div className="mb-6 px-3 py-2">
        {!collapsed && (
          <h1 className="text-lg font-bold text-zinc-950 dark:text-white">Time Manager</h1>
        )}
      </div>
      <div className="flex-1">
        <nav>
          <ul className="flex flex-col gap-1.5">
            {items.map((item) => (
              <li key={item.label}>
                <SidebarItem {...item} />
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="flex flex-col mt-6 gap-3">
        <DarkModeSwitcher />
        <FloatingMenu
          menuItems={userMenuItems}
          buttonContent={
            <SidebarItem
              label="Test"
              image="https://picsum.photos/200"
              size={"profile"}
            ></SidebarItem>
          }
        />
      </div>
    </aside>
  );
}
