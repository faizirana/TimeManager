/**
 * Global notification service using React context
 * Provides centralized toast/notification handling
 */

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

// In-memory store for notifications
// Will be hooked to React context in the component
let notificationCallbacks: {
  onAdd: (notification: Notification) => void;
  onRemove: (id: string) => void;
} | null = null;

/**
 * Register the callback functions from the NotificationProvider
 * This must be called on component mount
 */
export function registerNotificationCallbacks(callbacks: {
  onAdd: (notification: Notification) => void;
  onRemove: (id: string) => void;
}) {
  notificationCallbacks = callbacks;
}

/**
 * Generate unique notification ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Show a success notification
 */
export function showSuccess(message: string, duration = 3000): void {
  if (!notificationCallbacks) {
    console.warn("Notification service not initialized");
    return;
  }

  const notification: Notification = {
    id: generateId(),
    type: "success",
    message,
    duration,
  };

  notificationCallbacks.onAdd(notification);

  if (duration) {
    setTimeout(() => {
      notificationCallbacks?.onRemove(notification.id);
    }, duration);
  }
}

/**
 * Show an error notification
 */
export function showError(message: string, duration = 5000): void {
  if (!notificationCallbacks) {
    console.warn("Notification service not initialized");
    return;
  }

  const notification: Notification = {
    id: generateId(),
    type: "error",
    message,
    duration,
  };

  notificationCallbacks.onAdd(notification);

  if (duration) {
    setTimeout(() => {
      notificationCallbacks?.onRemove(notification.id);
    }, duration);
  }
}

/**
 * Show a warning notification
 */
export function showWarning(message: string, duration = 4000): void {
  if (!notificationCallbacks) {
    console.warn("Notification service not initialized");
    return;
  }

  const notification: Notification = {
    id: generateId(),
    type: "warning",
    message,
    duration,
  };

  notificationCallbacks.onAdd(notification);

  if (duration) {
    setTimeout(() => {
      notificationCallbacks?.onRemove(notification.id);
    }, duration);
  }
}

/**
 * Show an info notification
 */
export function showInfo(message: string, duration = 3000): void {
  if (!notificationCallbacks) {
    console.warn("Notification service not initialized");
    return;
  }

  const notification: Notification = {
    id: generateId(),
    type: "info",
    message,
    duration,
  };

  notificationCallbacks.onAdd(notification);

  if (duration) {
    setTimeout(() => {
      notificationCallbacks?.onRemove(notification.id);
    }, duration);
  }
}

/**
 * Remove a notification by ID
 */
export function removeNotification(id: string): void {
  notificationCallbacks?.onRemove(id);
}
