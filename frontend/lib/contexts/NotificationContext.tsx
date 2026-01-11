"use client";

/**
 * Notification Context Provider
 * Manages global toast/notification state
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Notification, registerNotificationCallbacks } from "@/lib/services/notificationService";

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [...prev, notification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Register callbacks with the notification service
  React.useEffect(() => {
    registerNotificationCallbacks({
      onAdd: addNotification,
      onRemove: removeNotification,
    });
  }, [addNotification, removeNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}
