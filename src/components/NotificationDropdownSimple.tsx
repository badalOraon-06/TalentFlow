import { useState } from 'react';
import { 
  CheckCheck, 
  Filter, 
  Settings,
  BellOff,
  ExternalLink,
  User,
  Briefcase,
  ClipboardList,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import type { Notification, NotificationCategory, NotificationType } from '../types/notification';

interface NotificationDropdownProps {
  notifications: Notification[];
  onNotificationClick: (notificationId: string) => void;
  onClose: () => void;
}

export function NotificationDropdown({ 
  notifications, 
  onNotificationClick, 
  onClose 
}: NotificationDropdownProps) {
  const [filter, setFilter] = useState<'all' | NotificationCategory>('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  
  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (showOnlyUnread && notification.isRead) return false;
    if (filter === 'all') return true;
    return notification.category === filter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'candidate': return <User className="w-4 h-4" />;
      case 'job': return <Briefcase className="w-4 h-4" />;
      case 'assessment': return <ClipboardList className="w-4 h-4" />;
      case 'system': return <Settings className="w-4 h-4" />;
      case 'user': return <User className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      // Trigger refresh
      window.dispatchEvent(new CustomEvent('notificationCreated'));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-[80vh] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{unreadCount} unread</span>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3 h-3 text-gray-400" />
          {(['all', 'candidate', 'job', 'assessment', 'system'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-2 py-1 rounded-full capitalize transition-colors ${
                filter === filterType
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterType}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => setShowOnlyUnread(!showOnlyUnread)}
            className={`text-xs px-2 py-1 rounded-full transition-colors ${
              showOnlyUnread
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Unread only
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors flex items-center gap-1"
            >
              <CheckCheck className="w-3 h-3" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <BellOff className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">
              {showOnlyUnread ? 'No unread notifications' : 'No notifications'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => onNotificationClick(notification.id)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.isRead ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getCategoryIcon(notification.category)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-gray-900 text-sm leading-5">
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {getTypeIcon(notification.type)}
                        <span className="text-xs text-gray-400">
                          {formatTime(new Date(notification.createdAt))}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1 leading-5">
                      {notification.message}
                    </p>
                    
                    {!notification.isRead && (
                      <div className="flex items-center justify-between mt-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredNotifications.length > 0 && (
        <div className="p-3 border-t border-gray-100 bg-gray-50">
          <button
            onClick={() => {/* TODO: Navigate to all notifications */}}
            className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All Notifications
            <ExternalLink className="w-3 h-3 inline ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}