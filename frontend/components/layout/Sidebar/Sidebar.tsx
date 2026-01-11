"use client";

import { useState, cloneElement, isValidElement } from "react";
import { cn } from "@/lib/utils";
import SidebarItem from "./SidebarItem";
import { useAuth } from "@/lib/hooks/useAuth";
import { SidebarProps } from "@/lib/types/sidebar";
import Image from "next/image";
// import { PanelLeftClose, PanelLeftOpen } from "lucide-react"; // Icons plus utilisés

export default function Sidebar({
  items,
  className,
  children,
  collapsed: collapsedProp,
}: SidebarProps & { collapsed?: boolean }) {
  const [collapsedState, setCollapsedState] = useState(true);
  const collapsed = collapsedProp ?? collapsedState;
  // Récupérer user côté client uniquement ici
  const { user } = useAuth ? useAuth() : { user: undefined };
  // Ensure user is undefined if null or not an object with name/surname
  const sidebarUser =
    user && typeof user === "object" && ("name" in user || "surname" in user) ? user : undefined;

  // const iconColor = "var(--color-primary)"; // Plus utilisé
  // const toggleIconColor = iconColor; // Plus utilisé

  return (
    <aside
      className={cn(
        "flex flex-col bg-[var(--background-2)] shadow-md h-full rounded-r-lg",
        "transition-[width,padding] duration-500 ease-in-out",
        collapsed ? "w-20 p-2" : "w-72 p-5",
        className,
      )}
      onMouseEnter={() => setCollapsedState(false)}
      onMouseLeave={() => setCollapsedState(true)}
      style={{ zIndex: 100, overflow: "hidden" }}
    >
      {/* Le bouton de toggle est supprimé, le panneau se déplie/replie au survol */}
      <div
        className={cn(
          "flex gap-3 items-center mb-6 transition-all duration-500 ease-in-out",
          collapsed
            ? "justify-center px-0 py-0 flex-col gap-0 opacity-70"
            : "px-3 py-2 opacity-100",
        )}
      >
        <Image
          src="/logo.png"
          width={40}
          height={40}
          alt="Logo Time Manager"
          className="flex-shrink-0"
        />
        {!collapsed && (
          <h1 className="text-md font-bold text-zinc-950 dark:text-white">Time Manager</h1>
        )}
      </div>
      <div className="flex-1">
        <nav>
          <ul className="flex flex-col gap-1.5">
            {items.map((item) => (
              <li key={item.label}>
                <SidebarItem {...item} collapsed={collapsed} user={sidebarUser} />
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className={cn("flex flex-col mt-6 gap-3", collapsed && "items-center")}>
        {Array.isArray(children)
          ? children.map((child, index) =>
              isValidElement(child) ? cloneElement(child, { key: index }) : child,
            )
          : children}
      </div>
    </aside>
  );
}
