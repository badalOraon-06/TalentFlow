// Notification System Types

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationCategory = 'candidate' | 'job' | 'assessment' | 'system' | 'user';

export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  isRead: boolean;
  createdAt: Date;
  userId: string;
  metadata?: {
    candidateId?: string;
    candidateName?: string;
    jobId?: string;
    jobTitle?: string;
    assessmentId?: string;
    assessmentTitle?: string;
    oldStage?: string;
    newStage?: string;
    [key: string]: any;
  };
}

export interface NotificationSettings {
  emailNotifications: boolean;
  browserNotifications: boolean;
  soundEnabled: boolean;
  categories: {
    candidate: boolean;
    job: boolean;
    assessment: boolean;
    system: boolean;
    user: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily';
}

export interface NotificationTemplate {
  id: string;
  category: NotificationCategory;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface NotificationRule {
  id: string;
  event: string;
  category: NotificationCategory;
  type: NotificationType;
  template: NotificationTemplate;
  conditions?: {
    [key: string]: any;
  };
  enabled: boolean;
}

export interface NotificationFilter {
  category?: NotificationCategory;
  type?: NotificationType;
  isRead?: boolean;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byCategory: Record<NotificationCategory, number>;
  byType: Record<NotificationType, number>;
}

// Notification Events
export interface NotificationEvent {
  type: 'candidate_stage_changed' | 'job_created' | 'job_updated' | 'assessment_completed' | 'user_signup' | 'system_update';
  data: {
    userId: string;
    [key: string]: any;
  };
}

// API Response Types
export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unread: number;
  hasMore: boolean;
}

export interface CreateNotificationInput {
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  userId: string;
  metadata?: Notification['metadata'];
}

export interface UpdateNotificationInput {
  isRead?: boolean;
  metadata?: Notification['metadata'];
}

// Toast Notification Types (for real-time notifications)
export interface ToastNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

// Notification Preferences
export interface NotificationPreferences {
  id: string;
  userId: string;
  settings: NotificationSettings;
  rules: NotificationRule[];
  createdAt: Date;
  updatedAt: Date;
}