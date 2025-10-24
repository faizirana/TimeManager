"use client";

import { useEffect, useState } from "react";

export default function DarkModeSwitcher() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      root.classList.add("dark");
      setIsDark(true);
    } else {
      root.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleDark = () => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleDark}
      className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer bg-secondary dark:bg-zinc-800 text-black dark:text-white transition-colors"
    >
      {isDark ? "Light mode ☀️" : "Dark mode 🌙"}
    </button>
  );
}
