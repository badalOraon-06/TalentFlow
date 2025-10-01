import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { 
  Notification, 
  NotificationSettings, 
  NotificationFilter, 
  NotificationStats,
  CreateNotificationInput,
  ToastNotification
} from '../types/notification';

interface NotificationStore {
  // State
  notifications: Notification[];
  toasts: ToastNotification[];
  settings: NotificationSettings;
  isLoading: boolean;
  error: string | null;
  lastFetch: Date | null;

  // Computed values
  unreadCount: number;
  stats: NotificationStats;

  // Actions
  fetchNotifications: (filter?: NotificationFilter) => Promise<void>;
  addNotification: (input: CreateNotificationInput) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  
  // Toast actions
  showToast: (toast: Omit<ToastNotification, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  
  // Settings actions
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  resetSettings: () => void;
  
  // Utility actions
  setError: (error: string | null) => void;
  clearError: () => void;
  refreshNotifications: () => Promise<void>;
  _updateComputedValues: (notifications: Notification[]) => { unreadCount: number; stats: NotificationStats };
}

// Default settings
const defaultSettings: NotificationSettings = {
  emailNotifications: true,
  browserNotifications: true,
  soundEnabled: true,
  categories: {
    candidate: true,
    job: true,
    assessment: true,
    system: true,
    user: true,
  },
  frequency: 'immediate',
};

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      notifications: [],
      toasts: [],
      settings: defaultSettings,
      isLoading: false,
      error: null,
      lastFetch: null,
      unreadCount: 0,
      stats: {
        total: 0,
        unread: 0,
        byCategory: {
          candidate: 0,
          job: 0,
          assessment: 0,
          system: 0,
          user: 0,
        },
        byType: {
          info: 0,
          success: 0,
          warning: 0,
          error: 0,
        },
      },

      // Helper function to update computed values
      _updateComputedValues: (notifications: Notification[]) => {
        const unreadCount = notifications.filter(n => !n.isRead).length;
        const stats: NotificationStats = {
          total: notifications.length,
          unread: unreadCount,
          byCategory: {
            candidate: 0,
            job: 0,
            assessment: 0,
            system: 0,
            user: 0,
          },
          byType: {
            info: 0,
            success: 0,
            warning: 0,
            error: 0,
          },
        };

        notifications.forEach(notification => {
          stats.byCategory[notification.category]++;
          stats.byType[notification.type]++;
        });

        return { unreadCount, stats };
      },

      // Fetch notifications from API
      fetchNotifications: async (filter?: NotificationFilter) => {
        set({ isLoading: true, error: null });

        try {
          const queryParams = new URLSearchParams();
          if (filter?.category) queryParams.set('category', filter.category);
          if (filter?.type) queryParams.set('type', filter.type);
          if (filter?.isRead !== undefined) queryParams.set('isRead', filter.isRead.toString());
          if (filter?.limit) queryParams.set('limit', filter.limit.toString());
          if (filter?.offset) queryParams.set('offset', filter.offset.toString());

          const response = await fetch(`/api/notifications?${queryParams}`);
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch notifications');
          }

          const notifications = data.data || data.notifications || [];
          const { unreadCount, stats } = get()._updateComputedValues(notifications);

          set({
            notifications,
            unreadCount,
            stats,
            isLoading: false,
            lastFetch: new Date(),
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch notifications',
            isLoading: false,
          });
        }
      },

      // Add new notification
      addNotification: async (input: CreateNotificationInput) => {
        try {
          const response = await fetch('/api/notifications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Failed to create notification');
          }

          // Add to local state
          set(state => {
            const newNotifications = [data.data || data.notification, ...state.notifications];
            const { unreadCount, stats } = state._updateComputedValues(newNotifications);
            return {
              notifications: newNotifications,
              unreadCount,
              stats,
            };
          });

          // Show as toast if settings allow
          const settings = get().settings;
          if (settings.categories[input.category]) {
            get().showToast({
              type: input.type,
              title: input.title,
              message: input.message,
              duration: 5000,
            });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create notification',
          });
        }
      },

      // Mark notification as read
      markAsRead: async (id: string) => {
        try {
          const response = await fetch(`/api/notifications/${id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ isRead: true }),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to mark notification as read');
          }

          // Update local state
          set(state => {
            const updatedNotifications = state.notifications.map(notification =>
              notification.id === id 
                ? { ...notification, isRead: true }
                : notification
            );
            const { unreadCount, stats } = state._updateComputedValues(updatedNotifications);
            return {
              notifications: updatedNotifications,
              unreadCount,
              stats,
            };
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to mark notification as read',
          });
        }
      },

      // Mark all notifications as read
      markAllAsRead: async () => {
        try {
          const response = await fetch('/api/notifications/mark-all-read', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to mark all notifications as read');
          }

          // Update local state
          set(state => {
            const updatedNotifications = state.notifications.map(notification => ({
              ...notification,
              isRead: true,
            }));
            const { unreadCount, stats } = state._updateComputedValues(updatedNotifications);
            return {
              notifications: updatedNotifications,
              unreadCount,
              stats,
            };
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to mark all notifications as read',
          });
        }
      },

      // Delete notification
      deleteNotification: async (id: string) => {
        try {
          const response = await fetch(`/api/notifications/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to delete notification');
          }

          // Remove from local state
          set(state => ({
            notifications: state.notifications.filter(notification => notification.id !== id),
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete notification',
          });
        }
      },

      // Clear all notifications
      clearAllNotifications: async () => {
        try {
          const response = await fetch('/api/notifications', {
            method: 'DELETE',
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to clear notifications');
          }

          set({ notifications: [] });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to clear notifications',
          });
        }
      },

      // Toast actions
      showToast: (toast: Omit<ToastNotification, 'id'>) => {
        const id = Date.now().toString();
        const newToast: ToastNotification = {
          id,
          duration: 5000,
          ...toast,
        };

        set(state => ({
          toasts: [...state.toasts, newToast],
        }));

        // Auto-remove toast after duration
        if (newToast.duration && newToast.duration > 0) {
          setTimeout(() => {
            get().removeToast(id);
          }, newToast.duration);
        }
      },

      removeToast: (id: string) => {
        set(state => ({
          toasts: state.toasts.filter(toast => toast.id !== id),
        }));
      },

      clearToasts: () => {
        set({ toasts: [] });
      },

      // Settings actions
      updateSettings: async (newSettings: Partial<NotificationSettings>) => {
        try {
          const updatedSettings = { ...get().settings, ...newSettings };

          const response = await fetch('/api/notifications/settings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedSettings),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to update settings');
          }

          set({ settings: updatedSettings });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update settings',
          });
        }
      },

      resetSettings: () => {
        set({ settings: defaultSettings });
      },

      // Utility actions
      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      refreshNotifications: async () => {
        await get().fetchNotifications();
      },
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        settings: state.settings,
        // Don't persist notifications, fetch fresh on app load
      }),
    }
  )
);

// Selector hooks for better performance
export const useNotifications = () => useNotificationStore((state) => state.notifications);
export const useUnreadCount = () => useNotificationStore((state) => state.unreadCount);
export const useNotificationSettings = () => useNotificationStore((state) => state.settings);
export const useToasts = () => useNotificationStore((state) => state.toasts);
export const useNotificationStats = () => useNotificationStore((state) => state.stats);
export const useNotificationLoading = () => useNotificationStore((state) => state.isLoading);
export const useNotificationError = () => useNotificationStore((state) => state.error);

// Action hooks - using stable selectors to prevent re-renders
export const useNotificationActions = () => {
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const deleteNotification = useNotificationStore((state) => state.deleteNotification);
  const clearAllNotifications = useNotificationStore((state) => state.clearAllNotifications);
  const showToast = useNotificationStore((state) => state.showToast);
  const removeToast = useNotificationStore((state) => state.removeToast);
  const clearToasts = useNotificationStore((state) => state.clearToasts);
  const updateSettings = useNotificationStore((state) => state.updateSettings);
  const resetSettings = useNotificationStore((state) => state.resetSettings);
  const setError = useNotificationStore((state) => state.setError);
  const clearError = useNotificationStore((state) => state.clearError);
  const refreshNotifications = useNotificationStore((state) => state.refreshNotifications);
  
  return {
    fetchNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    showToast,
    removeToast,
    clearToasts,
    updateSettings,
    resetSettings,
    setError,
    clearError,
    refreshNotifications,
  };
};