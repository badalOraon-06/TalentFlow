import { useState } from 'react';
import { 
  CheckCheck, 
  Trash2, 
  Filter, 
  RefreshCw, 
  Settings,
  BellOff,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotificationActions, useNotificationLoading, useNotificationStats } from '../store/notificationStore';
import { NotificationItem } from './NotificationItem';
import type { Notification, NotificationCategory, NotificationType } from '../types/notification';

interface NotificationDropdownProps {
  notifications: Notification[];
  onNotificationClick: (notificationId: string) => void;
  onClose: () => void;
}

type FilterType = 'all' | NotificationCategory | NotificationType;

export function NotificationDropdown({ 
  notifications, 
  onNotificationClick, 
  onClose 
}: NotificationDropdownProps) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  
  const {
    markAllAsRead,
    clearAllNotifications,
    refreshNotifications,
  } = useNotificationActions();
  
  const isLoading = useNotificationLoading();
  const stats = useNotificationStats();

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter(notification => {
    if (showOnlyUnread && notification.isRead) return false;
    
    if (filter === 'all') return true;
    
    // Check if filter matches category or type
    return notification.category === filter || notification.type === filter;
  });

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete all notifications? This action cannot be undone.')) {
      await clearAllNotifications();
    }
  };

  const handleRefresh = async () => {
    await refreshNotifications();
  };

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick(notification.id);
    
    // Navigate to action URL if available
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      onClose();
    }
  };

  const handleViewAll = () => {
    navigate('/notifications');
    onClose();
  };

  const getFilterLabel = (filterType: FilterType): string => {
    switch (filterType) {
      case 'all': return 'All';
      case 'candidate': return 'Candidates';
      case 'job': return 'Jobs';
      case 'assessment': return 'Assessments';
      case 'system': return 'System';
      case 'user': return 'Account';
      case 'info': return 'Info';
      case 'success': return 'Success';
      case 'warning': return 'Warnings';
      case 'error': return 'Errors';
      default: return filterType;
    }
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-[80vh] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {stats.unread > 0 && (
              <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                {stats.unread} new
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh notifications"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => navigate('/settings/notifications')}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Notification settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Filter Dropdown */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className="text-sm bg-white border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <optgroup label="Categories">
                <option value="candidate">Candidates ({stats.byCategory.candidate})</option>
                <option value="job">Jobs ({stats.byCategory.job})</option>
                <option value="assessment">Assessments ({stats.byCategory.assessment})</option>
                <option value="system">System ({stats.byCategory.system})</option>
                <option value="user">Account ({stats.byCategory.user})</option>
              </optgroup>
              <optgroup label="Types">
                <option value="info">Info ({stats.byType.info})</option>
                <option value="success">Success ({stats.byType.success})</option>
                <option value="warning">Warnings ({stats.byType.warning})</option>
                <option value="error">Errors ({stats.byType.error})</option>
              </optgroup>
            </select>

            {/* Unread Filter Toggle */}
            <button
              onClick={() => setShowOnlyUnread(!showOnlyUnread)}
              className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                showOnlyUnread 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Filter className="w-3 h-3 inline mr-1" />
              Unread Only
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1">
            {stats.unread > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 hover:bg-blue-50 rounded-lg transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="w-3 h-3 inline mr-1" />
                Read All
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-red-600 hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded-lg transition-colors"
                title="Clear all notifications"
              >
                <Trash2 className="w-3 h-3 inline mr-1" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <BellOff className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-sm font-medium text-gray-600 mb-1">
              {filter === 'all' && !showOnlyUnread
                ? 'No notifications yet'
                : `No ${showOnlyUnread ? 'unread ' : ''}${getFilterLabel(filter).toLowerCase()} notifications`
              }
            </h4>
            <p className="text-xs text-gray-500">
              {filter === 'all' && !showOnlyUnread
                ? "You'll see updates about candidates, jobs, and system activities here."
                : 'Try adjusting your filters to see more notifications.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.slice(0, 10).map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
              />
            ))}
            
            {filteredNotifications.length > 10 && (
              <div className="p-3 text-center border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">
                  Showing 10 of {filteredNotifications.length} notifications
                </p>
                <button
                  onClick={handleViewAll}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All Notifications
                  <ExternalLink className="w-3 h-3 inline ml-1" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {stats.total} total • {stats.unread} unread
            </span>
            <button
              onClick={handleViewAll}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Manage All
              <ExternalLink className="w-3 h-3 inline ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}