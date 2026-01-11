"use client";

import { useState, cloneElement, isValidElement, useRef } from "react";
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
  setCollapsedState: setCollapsedStateProp,
}: SidebarProps & { collapsed?: boolean; setCollapsedState?: (collapsed: boolean) => void }) {
  const [collapsedState, setCollapsedStateLocal] = useState(true);
  const setCollapsedState = setCollapsedStateProp || setCollapsedStateLocal;
  const collapsed = collapsedProp ?? collapsedState;
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Récupérer user côté client uniquement ici
  const { user } = useAuth ? useAuth() : { user: undefined };
  // Ensure user is undefined if null or not an object with name/surname
  const sidebarUser =
    user && typeof user === "object" && ("name" in user || "surname" in user) ? user : undefined;

  // const iconColor = "var(--color-primary)"; // Plus utilisé
  // const toggleIconColor = iconColor; // Plus utilisé

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setCollapsedState(false);
    }, 100);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setCollapsedState(true);
    }, 300);
  };

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-screen shadow-md z-[100] flex flex-col",
        "md:min-w-16",
        "bg-[var(--background-2)] dark:bg-zinc-900 bg-white",
        "transition-[width,padding] duration-500 ease-in-out",
        collapsed ? "w-20 p-2" : "w-72 p-5",
        className,
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
