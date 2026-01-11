"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar/Sidebar";
import { LayoutDashboard, Clock, Users, ChartNoAxesCombined } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import DarkModeSwitcher from "@/components/UI/DarkModeSwitcher";
import FloatingMenu from "@/components/UI/FloatingMenu";
import SidebarItem from "@/components/layout/Sidebar/SidebarItem";
import { useAuth } from "@/lib/hooks/useAuth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const pathname = usePathname() ?? "/";

  const normalize = (p: string) => (p === "/" ? "/" : p.replace(/\/$/, ""));

  const sidebarItems = [
    { label: "Clock in", icon: Clock, href: "/clock-in" },
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Teams", icon: Users, href: "/teams" },
    { label: "Statistiques", icon: ChartNoAxesCombined, href: "/statistics" },
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
    { label: "Voir mon profil", onClick: () => router.push("/profile") },
    { label: "Déconnexion", color: "text-red-600", onClick: logout },
  ];

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  return (
    <div className="h-screen w-screen">
      <Sidebar
        items={sidebarItems}
        collapsed={sidebarCollapsed}
        // On transmet le setter via une prop spéciale pour le contrôle parent
        setCollapsedState={setSidebarCollapsed}
      >
        <DarkModeSwitcher />
        <FloatingMenu
          menuItems={userMenuItems}
          buttonContent={
            <SidebarItem label={undefined} size={"profile"} hasAvatar={true}></SidebarItem>
          }
        />
      </Sidebar>
      <main
        className="flex-1 h-full transition-all duration-500 ease-in-out"
        style={{ marginLeft: sidebarCollapsed ? 80 : 288, minHeight: "100vh" }}
      >
        {children}
      </main>
    </div>
  );
}
