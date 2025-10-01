import { useState } from 'react';
import { Bell, Plus, User, Briefcase, ClipboardList, Settings } from 'lucide-react';

export function NotificationTester() {
  const [isCreating, setIsCreating] = useState(false);

  const createTestNotification = async (type: string) => {
    setIsCreating(true);
    try {
      const notifications = {
        candidate: {
          title: 'New Candidate Application',
          message: `John Doe just applied for Senior Developer position (${new Date().toLocaleTimeString()})`,
          type: 'info',
          category: 'candidate',
          userId: 'admin'
        },
        interview: {
          title: 'Interview Scheduled',
          message: `Interview with Jane Smith scheduled for tomorrow at 2 PM (${new Date().toLocaleTimeString()})`,
          type: 'info',
          category: 'interview',
          userId: 'admin'
        },
        assessment: {
          title: 'Assessment Completed',
          message: `Mike Johnson completed the technical assessment with 85% score (${new Date().toLocaleTimeString()})`,
          type: 'success',
          category: 'assessment',
          userId: 'admin'
        },
        system: {
          title: 'System Alert',
          message: `Your trial period expires in 7 days. Please upgrade your plan. (${new Date().toLocaleTimeString()})`,
          type: 'warning',
          category: 'system',
          userId: 'admin'
        }
      };

      const notification = notifications[type as keyof typeof notifications];
      
      console.log('🚀 Creating notification:', notification);
      
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notification)
      });

      const result = await response.json();
      console.log('📦 Server response:', result);
      
      if (result.success) {
        console.log('✅ Notification created successfully!');
        
        // Instead of reloading, dispatch a custom event to update the notification store
        window.dispatchEvent(new CustomEvent('notificationCreated', { 
          detail: result.data 
        }));
        
        // Show a temporary success message
        const successMsg = document.createElement('div');
        successMsg.textContent = `✅ ${type} notification created!`;
        successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50 shadow-lg';
        document.body.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 3000);
      } else {
        console.error('❌ Failed to create notification:', result.message);
        
        // Show error message
        const errorMsg = document.createElement('div');
        errorMsg.textContent = `❌ Failed: ${result.message}`;
        errorMsg.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg z-50 shadow-lg';
        document.body.appendChild(errorMsg);
        setTimeout(() => errorMsg.remove(), 3000);
      }
    } catch (error) {
      console.error('❌ Error creating notification:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-4 h-4 text-blue-600" />
        <span className="font-medium text-gray-900">Test Notifications</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => createTestNotification('candidate')}
          disabled={isCreating}
          className="flex items-center gap-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
        >
          <User className="w-3 h-3" />
          New Candidate
        </button>
        
        <button
          onClick={() => createTestNotification('interview')}
          disabled={isCreating}
          className="flex items-center gap-1 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
        >
          <Briefcase className="w-3 h-3" />
          Interview
        </button>
        
        <button
          onClick={() => createTestNotification('assessment')}
          disabled={isCreating}
          className="flex items-center gap-1 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
        >
          <ClipboardList className="w-3 h-3" />
          Assessment
        </button>
        
        <button
          onClick={() => createTestNotification('system')}
          disabled={isCreating}
          className="flex items-center gap-1 px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
        >
          <Settings className="w-3 h-3" />
          System Alert
        </button>
      </div>
      
      {isCreating && (
        <div className="mt-3 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600">
            <Plus className="w-4 h-4 animate-spin" />
            Creating notification...
          </div>
        </div>
      )}
    </div>
  );
}