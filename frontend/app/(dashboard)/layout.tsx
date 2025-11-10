"use client";

import { Sidebar } from "@/components/layout";
import { LayoutDashboard, Clock, User, Users, ChartNoAxesCombined } from "lucide-react";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() ?? "/";

    const normalize = (p: string) => (p === "/" ? "/" : p.replace(/\/$/, ""));

    const sidebarItems = [
        { label: "Clock in", icon: Clock, href: "/clock-in", variant: "important" },
        { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", variant: undefined },
        { label: "Teams", icon: Users, href: "/teams", variant: undefined },
        { label: "Employees", icon: User, href: "/employees", variant: "disabled" },
        { label: "Statistics", icon: ChartNoAxesCombined, href: "/stats", variant: "disabled" },
    ].map((item) => {
        const itemPath = normalize(item.href);
        const current = normalize(pathname);
        // mark active when exact match or when current path is nested under the item's href
        const active = itemPath === "/"
            ? current === "/"
            : current === itemPath || current.startsWith(itemPath + "/");
        return { ...item, active };
    });

    return (
        <div className="flex h-screen w-screen">
            <Sidebar className="min-w-[220px]" items={sidebarItems} />
            <main className="w-full h-full bg-zinc-50 dark:bg-zinc-900 transition-colors">{children}</main>
        </div>
    );
}
