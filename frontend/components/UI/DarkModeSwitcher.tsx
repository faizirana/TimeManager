"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import SidebarItem from "@/components/layout/Sidebar/SidebarItem";
import { Moon, Sun } from "lucide-react";

export default function DarkModeSwitcher({ collapsed }: { collapsed?: boolean }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-2 w-10 h-10" />;
  }

  const isDark = resolvedTheme === "dark";

  const toggleDark = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <SidebarItem
      className="cursor-pointer"
      variant="secondary"
      size="icon"
      icon={isDark ? Sun : Moon}
      onClick={toggleDark}
      collapsed={collapsed}
    />
  );
}
