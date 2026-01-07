"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import SidebarItem from "@/components/layout/Sidebar/SidebarItem";
import { Moon, Sun } from "lucide-react";

export default function DarkModeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // On attend que le composant soit monté pour éviter le bug d'hydratation
  // (le serveur ne connaît pas le thème, seul le client le sait)
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // On peut retourner un placeholder de la même taille que le bouton
    return <div className="p-2 w-10 h-10" />;
  }

  // resolvedTheme prend en compte le choix "system" (si theme === 'system')
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
    />
  );
}
