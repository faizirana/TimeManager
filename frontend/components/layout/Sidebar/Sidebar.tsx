"use client";

import { useState, cloneElement, isValidElement, ReactElement } from "react";
import { cn } from "@/lib/utils";
import SidebarItem from "./SidebarItem";
import { SidebarProps } from "@/lib/types/sidebar";
import Image from "next/image";
// import { PanelLeftClose, PanelLeftOpen } from "lucide-react"; // Icons plus utilisés

export default function Sidebar({
  items,
  className,
  children,
  collapsed: collapsedProp,
}: SidebarProps & { collapsed?: boolean }) {
  const [collapsedState, setCollapsedState] = useState(false);
  const collapsed = collapsedProp ?? collapsedState;

  // const iconColor = "var(--color-primary)"; // Plus utilisé
  // const toggleIconColor = iconColor; // Plus utilisé

  return (
    <aside
      className={cn(
        "flex flex-col bg-[var(--background-2)] shadow-md h-full rounded-r-lg transition-all duration-200 ease-in-out",
        collapsed ? "w-20 p-2" : "w-72 p-5",
        className,
      )}
      onMouseEnter={() => setCollapsedState(false)}
      onMouseLeave={() => setCollapsedState(true)}
      style={{ zIndex: 100 }}
    >
      {/* Le bouton de toggle est supprimé, le panneau se déplie/replie au survol */}
      <div
        className={cn(
          "flex gap-3 items-center mb-6",
          collapsed ? "justify-center px-0 py-0 flex-col gap-0" : "px-3 py-2",
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
                <SidebarItem {...item} collapsed={collapsed} />
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className={cn("flex flex-col mt-6 gap-3", collapsed && "items-center")}>
        {children && typeof children === "object" && "map" in children
          ? (children as ReactElement[]).map((child, index) =>
              isValidElement(child)
                ? cloneElement(child, { ...child.props, collapsed, key: index } as unknown)
                : child,
            )
          : isValidElement(children)
            ? cloneElement(children as ReactElement, { collapsed } as unknown)
            : children}
      </div>
    </aside>
  );
}
