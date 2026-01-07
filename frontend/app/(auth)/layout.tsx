"use client";

/**
 * Layout component for authentication-related pages.
 * It centers its children both vertically and horizontally on the screen.
 *
 * @param children - The child components to be rendered within the layout.
 * @returns A React component that wraps its children in a centered layout.
 */
import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-container flex min-h-screen items-center justify-center bg-gray-50">
      {children}
    </main>
  );
}
