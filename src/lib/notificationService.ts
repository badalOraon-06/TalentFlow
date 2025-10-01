import type { 
  NotificationTemplate, 
  NotificationRule, 
  NotificationEvent,
  CreateNotificationInput,
  NotificationType,
  NotificationCategory
} from '../types/notification';

// Notification Templates
const notificationTemplates: Record<string, NotificationTemplate> = {
  // Candidate Templates
  candidateStageChanged: {
    id: 'candidate-stage-changed',
    category: 'candidate',
    type: 'info',
    title: 'Candidate Status Updated',
    message: '{{candidateName}} has moved from {{oldStage}} to {{newStage}}',
    actionUrl: '/candidates/{{candidateId}}',
    actionLabel: 'View Candidate',
  },
  candidateApplied: {
    id: 'candidate-applied',
    category: 'candidate',
    type: 'success',
    title: 'New Application',
    message: '{{candidateName}} applied for {{jobTitle}}',
    actionUrl: '/candidates/{{candidateId}}',
    actionLabel: 'Review Application',
  },
  candidateHired: {
    id: 'candidate-hired',
    category: 'candidate',
    type: 'success',
    title: 'Candidate Hired!',
    message: '{{candidateName}} has been hired for {{jobTitle}}',
    actionUrl: '/candidates/{{candidateId}}',
    actionLabel: 'View Details',
  },

  // Job Templates
  jobCreated: {
    id: 'job-created',
    category: 'job',
    type: 'success',
    title: 'Job Created',
    message: 'New job "{{jobTitle}}" has been created',
    actionUrl: '/jobs/{{jobId}}',
    actionLabel: 'View Job',
  },
  jobUpdated: {
    id: 'job-updated',
    category: 'job',
    type: 'info',
    title: 'Job Updated',
    message: 'Job "{{jobTitle}}" has been updated',
    actionUrl: '/jobs/{{jobId}}',
    actionLabel: 'View Changes',
  },
  jobArchived: {
    id: 'job-archived',
    category: 'job',
    type: 'warning',
    title: 'Job Archived',
    message: 'Job "{{jobTitle}}" has been archived',
    actionUrl: '/jobs/{{jobId}}',
    actionLabel: 'View Job',
  },

  // Assessment Templates
  assessmentCompleted: {
    id: 'assessment-completed',
    category: 'assessment',
    type: 'success',
    title: 'Assessment Completed',
    message: '{{candidateName}} completed the {{assessmentTitle}} assessment',
    actionUrl: '/assessments/responses/{{jobId}}',
    actionLabel: 'View Results',
  },
  assessmentCreated: {
    id: 'assessment-created',
    category: 'assessment',
    type: 'info',
    title: 'Assessment Created',
    message: 'New assessment "{{assessmentTitle}}" has been created',
    actionUrl: '/assessments',
    actionLabel: 'View Assessment',
  },

  // System Templates
  systemUpdate: {
    id: 'system-update',
    category: 'system',
    type: 'info',
    title: 'System Update',
    message: 'TalentFlow has been updated with new features',
    actionUrl: '/dashboard',
    actionLabel: 'Learn More',
  },
  systemMaintenance: {
    id: 'system-maintenance',
    category: 'system',
    type: 'warning',
    title: 'Scheduled Maintenance',
    message: 'System maintenance scheduled for {{maintenanceDate}}',
    actionUrl: '/dashboard',
    actionLabel: 'View Details',
  },

  // User Templates
  userWelcome: {
    id: 'user-welcome',
    category: 'user',
    type: 'success',
    title: 'Welcome to TalentFlow!',
    message: 'Your account has been created successfully',
    actionUrl: '/dashboard',
    actionLabel: 'Get Started',
  },
  userProfileUpdated: {
    id: 'user-profile-updated',
    category: 'user',
    type: 'info',
    title: 'Profile Updated',
    message: 'Your profile has been updated successfully',
    actionUrl: '/profile',
    actionLabel: 'View Profile',
  },
};

// Notification Rules - Define when notifications should be created
const notificationRules: NotificationRule[] = [
  {
    id: 'candidate-stage-changed-rule',
    event: 'candidate_stage_changed',
    category: 'candidate',
    type: 'info',
    template: notificationTemplates.candidateStageChanged,
    enabled: true,
  },
  {
    id: 'job-created-rule',
    event: 'job_created',
    category: 'job',
    type: 'success',
    template: notificationTemplates.jobCreated,
    enabled: true,
  },
  {
    id: 'assessment-completed-rule',
    event: 'assessment_completed',
    category: 'assessment',
    type: 'success',
    template: notificationTemplates.assessmentCompleted,
    enabled: true,
  },
  {
    id: 'user-signup-rule',
    event: 'user_signup',
    category: 'user',
    type: 'success',
    template: notificationTemplates.userWelcome,
    enabled: true,
  },
];

class NotificationService {
  // Template string replacement utility
  private replaceTemplate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  // Generate notification from template
  private generateNotificationFromTemplate(
    template: NotificationTemplate,
    data: Record<string, any>,
    userId: string
  ): CreateNotificationInput {
    return {
      type: template.type,
      category: template.category,
      title: this.replaceTemplate(template.title, data),
      message: this.replaceTemplate(template.message, data),
      actionUrl: template.actionUrl ? this.replaceTemplate(template.actionUrl, data) : undefined,
      actionLabel: template.actionLabel,
      userId,
      metadata: data,
    };
  }

  // Create notification for specific event
  async createNotificationForEvent(event: NotificationEvent): Promise<void> {
    const rule = notificationRules.find(r => r.event === event.type && r.enabled);
    
    if (!rule) {
      console.log(`No rule found for event: ${event.type}`);
      return;
    }

    const notification = this.generateNotificationFromTemplate(
      rule.template,
      event.data,
      event.data.userId
    );

    // This would normally call the API or notification store
    console.log('Creating notification:', notification);
    
    // For now, we'll just log it. In a real app, you'd call:
    // await notificationStore.addNotification(notification);
  }

  // Predefined notification creators for common scenarios
  async notifyCandidateStageChanged(
    candidateId: string,
    candidateName: string,
    oldStage: string,
    newStage: string,
    jobTitle?: string,
    userId?: string
  ): Promise<CreateNotificationInput> {
    const currentUserId = userId || 'current-user-id'; // Get from auth context

    return this.generateNotificationFromTemplate(
      notificationTemplates.candidateStageChanged,
      {
        candidateId,
        candidateName,
        oldStage,
        newStage,
        jobTitle,
      },
      currentUserId
    );
  }

  async notifyJobCreated(
    jobId: string,
    jobTitle: string,
    userId?: string
  ): Promise<CreateNotificationInput> {
    const currentUserId = userId || 'current-user-id';

    return this.generateNotificationFromTemplate(
      notificationTemplates.jobCreated,
      {
        jobId,
        jobTitle,
      },
      currentUserId
    );
  }

  async notifyJobUpdated(
    jobId: string,
    jobTitle: string,
    changes: string[],
    userId?: string
  ): Promise<CreateNotificationInput> {
    const currentUserId = userId || 'current-user-id';

    return this.generateNotificationFromTemplate(
      notificationTemplates.jobUpdated,
      {
        jobId,
        jobTitle,
        changes: changes.join(', '),
      },
      currentUserId
    );
  }

  async notifyAssessmentCompleted(
    candidateId: string,
    candidateName: string,
    assessmentId: string,
    assessmentTitle: string,
    jobId: string,
    userId?: string
  ): Promise<CreateNotificationInput> {
    const currentUserId = userId || 'current-user-id';

    return this.generateNotificationFromTemplate(
      notificationTemplates.assessmentCompleted,
      {
        candidateId,
        candidateName,
        assessmentId,
        assessmentTitle,
        jobId,
      },
      currentUserId
    );
  }

  async notifyUserWelcome(
    userId: string,
    userName: string
  ): Promise<CreateNotificationInput> {
    return this.generateNotificationFromTemplate(
      notificationTemplates.userWelcome,
      {
        userName,
      },
      userId
    );
  }

  // Create custom notification
  async createCustomNotification(
    type: NotificationType,
    category: NotificationCategory,
    title: string,
    message: string,
    userId: string,
    actionUrl?: string,
    actionLabel?: string,
    metadata?: Record<string, any>
  ): Promise<CreateNotificationInput> {
    return {
      type,
      category,
      title,
      message,
      actionUrl,
      actionLabel,
      userId,
      metadata,
    };
  }

  // Utility methods
  getNotificationTemplate(templateId: string): NotificationTemplate | undefined {
    return notificationTemplates[templateId];
  }

  getAllTemplates(): NotificationTemplate[] {
    return Object.values(notificationTemplates);
  }

  getNotificationRules(): NotificationRule[] {
    return notificationRules;
  }

  // Format notification for display
  formatNotificationTime(createdAt: Date): string {
    const now = new Date();
    const diff = now.getTime() - createdAt.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return createdAt.toLocaleDateString();
  }

  // Get notification icon based on type
  getNotificationIcon(type: NotificationType): string {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': default: return 'ℹ️';
    }
  }

  // Get notification color based on type
  getNotificationColor(type: NotificationType): string {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Export utility functions for easy use in components
export const createNotificationForCandidateStageChange = notificationService.notifyCandidateStageChanged.bind(notificationService);
export const createNotificationForJobCreated = notificationService.notifyJobCreated.bind(notificationService);
export const createNotificationForJobUpdated = notificationService.notifyJobUpdated.bind(notificationService);
export const createNotificationForAssessmentCompleted = notificationService.notifyAssessmentCompleted.bind(notificationService);
export const createNotificationForUserWelcome = notificationService.notifyUserWelcome.bind(notificationService);
export const createCustomNotification = notificationService.createCustomNotification.bind(notificationService);
export const formatNotificationTime = notificationService.formatNotificationTime.bind(notificationService);
export const getNotificationIcon = notificationService.getNotificationIcon.bind(notificationService);
export const getNotificationColor = notificationService.getNotificationColor.bind(notificationService);