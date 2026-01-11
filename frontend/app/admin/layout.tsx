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
import React from "react";
import Sidebar from "@/components/layout/Sidebar/Sidebar";
import { Users, Calendar, UserCog, LayoutDashboard, ArrowLeftRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import DarkModeSwitcher from "@/components/UI/DarkModeSwitcher";
import FloatingMenu from "@/components/UI/FloatingMenu";
import SidebarItem from "@/components/layout/Sidebar/SidebarItem";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/UI/Button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname() ?? "/";
  const router = useRouter();
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
    <div className="flex min-h-screen w-screen">
      {/* Admin sidebar with user menu and dark mode */}
      <Sidebar className="min-w-[220px]" items={sidebarItems}>
        <div className="flex gap-2">
          <DarkModeSwitcher />
          <Button
            variant="secondary"
            icon={<ArrowLeftRight size={18} />}
            iconPosition="right"
            onClick={() => router.push("/dashboard")}
            className="flex-1 justify-start"
          >
            Utilisateur
          </Button>
        </div>
        <FloatingMenu
          menuItems={userMenuItems}
          buttonContent={
            <SidebarItem
              label={`${user?.name} ${user?.surname}`}
              size={"profile"}
              hasAvatar={true}
            />
          }
        />
      </Sidebar>
      {/* Main area for child pages */}
      <main className="w-full h-full">{children}</main>
    </div>
  );
}
