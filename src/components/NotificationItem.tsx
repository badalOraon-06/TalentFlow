import { useState } from 'react';
import { 
  User, 
  Briefcase, 
  ClipboardList, 
  Settings, 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  ExternalLink,
  Trash2,
  Eye
} from 'lucide-react';
import { useNotificationActions } from '../store/notificationStore';
import { formatNotificationTime } from '../lib/notificationService';
import type { Notification } from '../types/notification';

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  showActions?: boolean;
  compact?: boolean;
}

export function NotificationItem({ 
  notification, 
  onClick, 
  showActions = true, 
  compact = false 
}: NotificationItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { markAsRead, deleteNotification } = useNotificationActions();

  const handleToggleRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(notification.id);
  };

  // Get category icon
  const getCategoryIcon = () => {
    switch (notification.category) {
      case 'candidate':
        return <User className="w-4 h-4" />;
      case 'job':
        return <Briefcase className="w-4 h-4" />;
      case 'assessment':
        return <ClipboardList className="w-4 h-4" />;
      case 'system':
        return <Settings className="w-4 h-4" />;
      case 'user':
      default:
        return <User className="w-4 h-4" />;
    }
  };

  // Get type icon
  const getTypeIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  // Get category color
  const getCategoryColor = () => {
    switch (notification.category) {
      case 'candidate':
        return 'bg-purple-100 text-purple-600';
      case 'job':
        return 'bg-green-100 text-green-600';
      case 'assessment':
        return 'bg-orange-100 text-orange-600';
      case 'system':
        return 'bg-gray-100 text-gray-600';
      case 'user':
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  // Get priority styling based on type
  const getPriorityStyles = () => {
    if (notification.type === 'error') {
      return 'border-l-4 border-red-500 bg-red-50';
    }
    if (notification.type === 'warning') {
      return 'border-l-4 border-yellow-500 bg-yellow-50';
    }
    if (!notification.isRead) {
      return 'border-l-4 border-blue-500 bg-blue-50';
    }
    return 'border-l-4 border-transparent bg-white';
  };

  return (
    <div
      className={`
        relative p-4 cursor-pointer transition-all duration-200 
        ${getPriorityStyles()}
        ${isHovered ? 'bg-gray-50' : ''}
        ${compact ? 'p-3' : 'p-4'}
        ${!notification.isRead ? 'font-medium' : ''}
      `}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start space-x-3">
        {/* Category Icon */}
        <div className={`
          p-2 rounded-lg flex-shrink-0 
          ${getCategoryColor()}
          ${compact ? 'p-1.5' : 'p-2'}
        `}>
          {getCategoryIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Title and Type Icon */}
              <div className="flex items-center space-x-2 mb-1">
                <h4 className={`
                  text-sm truncate 
                  ${notification.isRead ? 'text-gray-700' : 'text-gray-900 font-semibold'}
                  ${compact ? 'text-xs' : 'text-sm'}
                `}>
                  {notification.title}
                </h4>
                {getTypeIcon()}
              </div>

              {/* Message */}
              <p className={`
                text-gray-600 leading-relaxed 
                ${compact ? 'text-xs line-clamp-1' : 'text-sm line-clamp-2'}
                ${!notification.isRead ? 'text-gray-700' : 'text-gray-600'}
              `}>
                {notification.message}
              </p>

              {/* Metadata */}
              {notification.metadata && !compact && (
                <div className="mt-2 flex items-center space-x-3 text-xs text-gray-500">
                  {notification.metadata.candidateName && (
                    <span className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {notification.metadata.candidateName}
                    </span>
                  )}
                  {notification.metadata.jobTitle && (
                    <span className="flex items-center">
                      <Briefcase className="w-3 h-3 mr-1" />
                      {notification.metadata.jobTitle}
                    </span>
                  )}
                </div>
              )}

              {/* Time and Action */}
              <div className="mt-2 flex items-center justify-between">
                <span className={`
                  text-xs text-gray-500 
                  ${compact ? 'text-xs' : 'text-xs'}
                `}>
                  {formatNotificationTime(notification.createdAt)}
                </span>

                {notification.actionLabel && notification.actionUrl && (
                  <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center">
                    {notification.actionLabel}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </button>
                )}
              </div>
            </div>

            {/* Actions */}
            {showActions && isHovered && (
              <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                {!notification.isRead && (
                  <button
                    onClick={handleToggleRead}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Mark as read"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete notification"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Unread Indicator */}
        {!notification.isRead && (
          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
        )}
      </div>

      {/* Category Badge */}
      {!compact && (
        <div className="absolute top-2 right-2">
          <span className={`
            px-2 py-1 text-xs font-medium rounded-full 
            ${getCategoryColor()}
          `}>
            {notification.category}
          </span>
        </div>
      )}
    </div>
  );
}