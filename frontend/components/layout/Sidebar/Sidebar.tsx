"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import SidebarItem from "./SidebarItem";
import { SidebarProps } from "@/lib/types/sidebar";
import Image from "next/image";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"; // Import Lucide icons

export default function Sidebar({ items, className, children }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const iconColor = "var(--color-primary)"; // Default color
  const toggleIconColor = iconColor; // Dynamic color logic

  return (
    <aside
      className={cn(
        "flex flex-col bg-[var(--background-2)] shadow-md p-5 h-full rounded-r-lg",
        collapsed ? "w-16" : "w-72",
        className,
      )}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="self-end mb-2 p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer transition-all"
        aria-label="Toggle Sidebar"
      >
        {collapsed ? (
          <PanelLeftOpen size={20} color={toggleIconColor} />
        ) : (
          <PanelLeftClose size={20} color={toggleIconColor} />
        )}
      </button>
      <div className="flex gap-3 items-center mb-6 px-3 py-2">
        <Image src={"/logo.png"} width={40} height={40} alt="Logo Time Manager"></Image>
        {!collapsed && (
          <h1 className="text-md font-bold text-zinc-950 dark:text-white">Time Manager</h1>
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
      <div className="flex flex-col mt-6 gap-3">{children}</div>
    </aside>
  );
}
