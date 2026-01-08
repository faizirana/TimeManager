"use client";

import React from "react";
import Sidebar from "@/components/layout/Sidebar/Sidebar";
import { LayoutDashboard, Clock, Users, ChartNoAxesCombined } from "lucide-react";
import { usePathname } from "next/navigation";
import DarkModeSwitcher from "@/components/UI/DarkModeSwitcher";
import FloatingMenu from "@/components/UI/FloatingMenu";
import SidebarItem from "@/components/layout/Sidebar/SidebarItem";
import { useAuth } from "@/lib/contexts/AuthContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const pathname = usePathname() ?? "/";

  const normalize = (p: string) => (p === "/" ? "/" : p.replace(/\/$/, ""));

  const sidebarItems = [
    { label: "Clock in", icon: Clock, href: "/clock-in", variant: "important" },
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", variant: undefined },
    { label: "Teams", icon: Users, href: "/teams", variant: undefined },
    { label: "Statistics", icon: ChartNoAxesCombined, href: "/stats", variant: "disabled" },
  ].map((item) => {
    const itemPath = normalize(item.href);
    const current = normalize(pathname);
    // mark active when exact match or when current path is nested under the item's href
    const active =
      itemPath === "/"
        ? current === "/"
        : current === itemPath || current.startsWith(`${itemPath}/`);
    return { ...item, active };
  });

  const userMenuItems = [
    { label: "Voir mon profil", onClick: () => alert("Profile à faire") },
    { label: "Paramètres", onClick: () => alert("Paramètres à faire") },
    { label: "Déconnexion", color: "text-red-600", onClick: () => alert("Déconnexion à faire") },
  ];

  return (
    <div className="flex h-screen w-screen">
      <Sidebar className="min-w-[220px]" items={sidebarItems}>
        <DarkModeSwitcher />
        <FloatingMenu
          menuItems={userMenuItems}
          buttonContent={
            <SidebarItem
              label={`${user?.name} ${user?.surname}`}
              size={"profile"}
              hasAvatar={true}
            ></SidebarItem>
          }
        />
      </Sidebar>
      <main className="w-full h-full">{children}</main>
    </div>
  );
}
