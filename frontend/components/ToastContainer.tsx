"use client";

/**
 * Toast Notification Component
 * Displays notifications at the top of the screen
 */

import React from "react";
import { useNotifications } from "@/lib/contexts/NotificationContext";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

export function ToastContainer() {
  const { notifications, removeNotification } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5" />;
      case "error":
        return <AlertCircle className="h-5 w-5" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5" />;
      case "info":
        return <Info className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 text-green-900 border-green-200";
      case "error":
        return "bg-red-50 text-red-900 border-red-200";
      case "warning":
        return "bg-yellow-50 text-yellow-900 border-yellow-200";
      case "info":
        return "bg-blue-50 text-blue-900 border-blue-200";
      default:
        return "bg-gray-50 text-gray-900 border-gray-200";
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      case "info":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2 pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            flex items-start gap-3 p-4 rounded-lg border
            ${getColors(notification.type)}
            pointer-events-auto
            animation-in fade-in slide-in-from-top-2
            max-w-md
          `}
          role="alert"
        >
          <span className={getIconColor(notification.type)}>{getIcon(notification.type)}</span>
          <div className="flex-1">
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="text-current opacity-70 hover:opacity-100 transition-opacity flex-shrink-0"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
