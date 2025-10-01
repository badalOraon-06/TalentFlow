// Simple Notification Types
export interface SimpleNotification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface SimpleNotificationStore {
  notifications: SimpleNotification[];
  unreadCount: number;
  addNotification: (message: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}