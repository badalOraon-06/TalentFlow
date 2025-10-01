// Auto-trigger notifications for app actions
export class AutoNotificationService {
  // Create notification when a new candidate applies
  static async onCandidateApplication(candidateData: any, jobData: any) {
    try {
      const notification = {
        title: 'New Application Received',
        message: `${candidateData.name} applied for ${jobData.title}`,
        type: 'info' as const,
        category: 'candidate' as const,
        userId: 'admin',
        metadata: {
          candidateId: candidateData.id,
          candidateName: candidateData.name,
          jobId: jobData.id,
          jobTitle: jobData.title
        }
      };

      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification)
      });
    } catch (error) {
      console.error('Failed to create candidate notification:', error);
    }
  }

  // Create notification when candidate stage changes
  static async onCandidateStageChange(candidateData: any, oldStage: string, newStage: string) {
    try {
      const stageLabels: Record<string, string> = {
        applied: 'Applied',
        screen: 'Phone Screen',
        tech: 'Technical Interview',
        offer: 'Offer Extended',
        hired: 'Hired',
        rejected: 'Rejected'
      };

      const notification = {
        title: 'Candidate Status Updated',
        message: `${candidateData.name} moved from ${stageLabels[oldStage]} to ${stageLabels[newStage]}`,
        type: newStage === 'hired' ? 'success' : newStage === 'rejected' ? 'warning' : 'info' as const,
        category: 'candidate' as const,
        userId: 'admin',
        metadata: {
          candidateId: candidateData.id,
          candidateName: candidateData.name,
          oldStage,
          newStage
        }
      };

      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification)
      });
    } catch (error) {
      console.error('Failed to create stage change notification:', error);
    }
  }

  // Create notification when new job is posted
  static async onJobPosted(jobData: any) {
    try {
      const notification = {
        title: 'New Job Posted',
        message: `${jobData.title} position is now open for applications`,
        type: 'info' as const,
        category: 'job' as const,
        userId: 'admin',
        metadata: {
          jobId: jobData.id,
          jobTitle: jobData.title
        }
      };

      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification)
      });
    } catch (error) {
      console.error('Failed to create job notification:', error);
    }
  }
}