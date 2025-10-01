import { useState, useRef, useEffect } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { useNotifications, useUnreadCount, useNotificationError, useNotificationStore } from '../store/notificationStore';
import { NotificationDropdown } from './NotificationDropdownSimple';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const notifications = useNotifications();
  const unreadCount = useUnreadCount();
  const error = useNotificationError();
  
  // Debug: Log notification changes
  useEffect(() => {
    console.log('🔔 NotificationBell: Notifications updated', {
      total: notifications.length,
      unread: unreadCount,
      error: error
    });
  }, [notifications, unreadCount, error]);
  
  // Get fetchNotifications from the store
  const store = useNotificationStore();

  // Fetch notifications on mount - using useRef to avoid dependency loops
  const fetchNotificationsRef = useRef(store.fetchNotifications);
  fetchNotificationsRef.current = store.fetchNotifications;

  useEffect(() => {
    console.log('🔔 NotificationBell: Fetching notifications on mount...');
    fetchNotificationsRef.current().catch(err => {
      console.error('Error fetching notifications:', err);
    });
  }, []); // Empty dependency array - only run on mount

  // Listen for new notification events and refresh
  useEffect(() => {
    const handleNewNotification = (event: CustomEvent) => {
      console.log('🔔 NotificationBell: Received notificationCreated event', event.detail);
      fetchNotificationsRef.current().catch(err => {
        console.error('Error refreshing notifications:', err);
      });
    };

    window.addEventListener('notificationCreated', handleNewNotification as EventListener);
    return () => window.removeEventListener('notificationCreated', handleNewNotification as EventListener);
  }, []); // Empty dependency array

  // Animate bell when new notifications arrive
  useEffect(() => {
    if (unreadCount > 0) {
      setHasNewNotification(true);
      const timer = setTimeout(() => setHasNewNotification(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        buttonRef.current && 
        dropdownRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    
    // Mark the first few unread notifications as read when opening
    if (!isOpen && unreadCount > 0) {
      const unreadNotifications = notifications.filter(n => !n.isRead).slice(0, 3);
      unreadNotifications.forEach(notification => {
        setTimeout(async () => {
          try {
            await fetch(`/api/notifications/${notification.id}/read`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isRead: true })
            });
            // Refresh notifications after marking as read
            fetchNotificationsRef.current();
          } catch (err) {
            console.error('Failed to mark notification as read:', err);
          }
        }, 500);
      });
    }
  };

  const handleNotificationClick = async (notificationId: string) => {
    try {
      // Mark as read
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true })
      });
      
      // Refresh notifications
      fetchNotificationsRef.current();
      setIsOpen(false);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className={`
          relative w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl 
          flex items-center justify-center transition-all duration-300 
          hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 
          focus:ring-offset-2 group
          ${hasNewNotification ? 'animate-pulse' : ''}
          ${isOpen ? 'bg-gray-200 scale-105' : ''}
          ${error ? 'bg-red-50 hover:bg-red-100 border border-red-200' : ''}
        `}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}${error ? ' (Error loading)' : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Bell Icon */}
        <div className="relative">
          {hasNewNotification && unreadCount > 0 ? (
            <BellRing className={`w-5 h-5 transition-colors animate-bounce ${error ? 'text-red-600' : 'text-gray-600 group-hover:text-gray-800'}`} />
          ) : (
            <Bell className={`w-5 h-5 transition-colors ${error ? 'text-red-600' : 'text-gray-600 group-hover:text-gray-800'}`} />
          )}
          
          {/* Notification Badge */}
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 min-w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 shadow-lg border-2 border-white animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
          
          {/* Pulse indicator for new notifications */}
          {hasNewNotification && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75"></div>
          )}
        </div>
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div ref={dropdownRef}>
          <NotificationDropdown
            notifications={notifications}
            onNotificationClick={handleNotificationClick}
            onClose={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  );
}