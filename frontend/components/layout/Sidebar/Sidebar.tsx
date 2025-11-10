"use client";

import DarkModeSwitcher from "@/components/ui/DarkModeSwitcher";
import { cn } from "@/lib/utils";
import SidebarItem from "./SidebarItem";
import { SidebarProps } from "./types";

export default function Sidebar({ items, collapsed, className }: SidebarProps) {
    return (
        <aside
            className={cn(
                "flex flex-col bg-white dark:bg-zinc-950 shadow-md p-5 h-full transition-all",
                collapsed ? "w-16" : "w-56",
                className,
            )}
        >
            <div className="mb-6 px-3 py-2">
                {!collapsed && <h1 className="text-lg font-bold text-zinc-950 dark:text-white transition-colors">Time Manager</h1>}
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
            <div className="mt-6">
                <DarkModeSwitcher />
            </div>
        </aside>
    );
}
