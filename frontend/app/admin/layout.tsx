/**
 * Main layout for the admin area.
 * Provides a dedicated sidebar (Dashboard, Users, Teams, Timetables) and user menu.
 * Uses the same components as the user dashboard for consistent UI/UX.
 *
 * - Sidebar items are dynamically marked as active based on the current route.
 * - The user menu (profile, settings, logout) is displayed at the bottom of the sidebar.
 * - The DarkModeSwitcher component allows theme switching.
 *
 * @param children The child components to display in the main area
 * @returns JSX.Element
 */
"use client";
import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar/Sidebar";
import { Users, Calendar, UserCog, LayoutDashboard, ArrowLeftRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import DarkModeSwitcher from "@/components/UI/DarkModeSwitcher";
import FloatingMenu from "@/components/UI/FloatingMenu";
import SidebarItem from "@/components/layout/Sidebar/SidebarItem";
import { useAuth } from "@/lib/hooks/useAuth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname() ?? "/";
  const router = useRouter();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Normalize paths for comparison
  const normalize = (p: string) => (p === "/" ? "/" : p.replace(/\/$/, ""));
  // Define admin sidebar items
  const sidebarItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    { label: "Users", icon: UserCog, href: "/admin/users" },
    { label: "Teams", icon: Users, href: "/admin/teams" },
    { label: "Timetables", icon: Calendar, href: "/admin/timetables" },
  ].map((item) => {
    const itemPath = normalize(item.href);
    const current = normalize(pathname);
    // Mark item as active if the path matches or is nested
    const active = current === itemPath || current.startsWith(`${itemPath}/`);
    return { ...item, active };
  });
  // User menu (profile, settings, logout)
  const userMenuItems = [
    { label: "Voir mon profil", onClick: () => router.push("/profile") },
    { label: "Déconnexion", color: "text-red-600", onClick: logout },
  ];
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        items={sidebarItems}
        collapsed={sidebarCollapsed}
        setCollapsedState={setSidebarCollapsed}
      >
        <SidebarItem
          label="Utilisateur"
          icon={ArrowLeftRight}
          variant="primary"
          onClick={() => router.push("/dashboard")}
          collapsed={sidebarCollapsed}
        />
        <DarkModeSwitcher />
        <FloatingMenu
          menuItems={userMenuItems}
          collapsed={sidebarCollapsed}
          buttonContent={
            <SidebarItem
              label={`${user?.name} ${user?.surname}`}
              size={"profile"}
              hasAvatar={true}
              user={user ?? undefined}
            />
          }
        />
      </Sidebar>
      <main
        className="flex-1 h-full overflow-y-auto transition-[margin-left] duration-500 ease-in-out"
        style={{ marginLeft: sidebarCollapsed ? 80 : 288 }}
      >
        {children}
      </main>
    </div>
  );
}
