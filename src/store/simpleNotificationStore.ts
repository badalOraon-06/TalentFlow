import { create } from 'zustand';
import type { SimpleNotification, SimpleNotificationStore } from '../types/simpleNotification';

export const useSimpleNotificationStore = create<SimpleNotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (message: string) => {
    const notification: SimpleNotification = {
      id: Date.now().toString(),
      message,
      isRead: false,
      createdAt: new Date(),
    };

    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50), // Keep only 50 most recent
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  clearAll: () => {
    set({
      notifications: [],
      unreadCount: 0,
    });
  },
}));