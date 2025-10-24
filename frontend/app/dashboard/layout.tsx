"use client";

import { Sidebar } from "@/components/layout";
import { LayoutDashboard, Clock, User, Users, ChartNoAxesCombined } from "lucide-react";

const sidebarItems = [
    { label: "Clock in", icon: Clock, href: "/clock-in", active: false, variant: "important" },
    { label: "Dashboard", icon: LayoutDashboard, href: "/", active: true },
    { label: "Teams", icon: Users, href: "/teams", active: false },
    { label: "Employees", icon: User, href: "/employees", active: false, variant: "disabled" },
    { label: "Statistics", icon: ChartNoAxesCombined, href: "/stats", active: false, variant: "disabled" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen w-screen">
            <Sidebar items={sidebarItems} />
            <main className="w-full h-full bg-zinc-50 dark:bg-zinc-900 transition-colors">{children}</main>
        </div>
    );
}
