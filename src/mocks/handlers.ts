import { http, HttpResponse, delay } from 'msw';
import { dbOperations } from '../lib/database';
import type { JobCreateInput, JobUpdateInput, CandidateCreateInput, CandidateUpdateInput, LoginCredentials, SignupData, AuthUser } from '../types';

// Utility function to simulate network delay and occasional errors
async function simulateNetwork() {
  // Random delay between 100-500ms for faster UX
  await delay(100 + Math.random() * 400);
  
  // 0.1% chance of network error (extremely rare, for realistic simulation)
  if (Math.random() < 0.001) {
    throw new Error('Network error: Request failed');
  }
}

// Helper function to handle errors consistently
function handleError(error: unknown, defaultMessage: string, status = 500) {
  const message = error instanceof Error ? error.message : defaultMessage;
  return HttpResponse.json(
    { success: false, message, error: String(error) },
    { status }
  );
}

// Helper function to safely extract error message
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// Job handlers
export const jobHandlers = [
  // GET /jobs - List jobs with filtering and pagination
  http.get('/api/jobs', async ({ request }) => {
    await simulateNetwork();
    
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || undefined;
    const status = url.searchParams.get('status') || undefined;
    const sort = url.searchParams.get('sort') || undefined;
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    
    try {
      const result = await dbOperations.getJobs({ search, status, page, pageSize, sort });
      return HttpResponse.json(result);
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch jobs', error: String(error) },
        { status: 500 }
      );
    }
  }),

  // GET /jobs/:id - Get single job
  http.get('/api/jobs/:id', async ({ params }) => {
    await simulateNetwork();
    
    try {
      const job = await dbOperations.getJobById(params.id as string);
      
      if (!job) {
        return HttpResponse.json(
          { success: false, message: 'Job not found' },
          { status: 404 }
        );
      }
      
      return HttpResponse.json({ data: job, success: true });
    } catch (error) {
      return handleError(error, 'Failed to fetch job');
    }
  }),

  // POST /jobs - Create job
  http.post('/api/jobs', async ({ request }) => {
    await simulateNetwork();
    
    try {
      const jobData = await request.json() as JobCreateInput;
      
      // Validate required fields
      if (!jobData.title || !jobData.tags?.length) {
        return HttpResponse.json(
          { success: false, message: 'Title and tags are required' },
          { status: 400 }
        );
      }
      
      // Generate slug and check for duplicates
      const slug = jobData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      
      const job = await dbOperations.createJob({ ...jobData, slug, status: 'active' });
      
      return HttpResponse.json({ data: job, success: true }, { status: 201 });
    } catch (error) {
      return handleError(error, 'Failed to create job');
    }
  }),

  // PATCH /jobs/:id - Update job
  http.patch('/api/jobs/:id', async ({ params, request }) => {
    await simulateNetwork();
    
    try {
      const updates = await request.json() as JobUpdateInput;
      const job = await dbOperations.updateJob(params.id as string, updates);
      
      if (!job) {
        return HttpResponse.json(
          { success: false, message: 'Job not found' },
          { status: 404 }
        );
      }
      
      return HttpResponse.json({ data: job, success: true });
    } catch (error) {
      return handleError(error, 'Failed to update job');
    }
  }),

  // PATCH /jobs/:id/reorder - Reorder jobs
  http.patch('/api/jobs/:id/reorder', async ({ request }) => {
    try {
      await simulateNetwork();
      
      const { fromOrder, toOrder } = await request.json() as { fromOrder: number; toOrder: number };
      console.log(`🔄 MSW: Reordering jobs from ${fromOrder} to ${toOrder}`);
      
      await dbOperations.reorderJobs(fromOrder, toOrder);
      
      console.log('✅ MSW: Job reorder successful');
      return HttpResponse.json({ success: true, message: 'Jobs reordered successfully' });
    } catch (error) {
      console.error('❌ MSW: Reorder failed:', error);
      return HttpResponse.json(
        { success: false, message: 'Failed to reorder jobs', error: String(error) },
        { status: 500 }
      );
    }
  }),

  // DELETE /jobs/:id - Delete job
  http.delete('/api/jobs/:id', async ({ params }) => {
    await simulateNetwork();
    
    try {
      await dbOperations.deleteJob(params.id as string);
      return HttpResponse.json({ success: true });
    } catch (error) {
      return handleError(error, 'Failed to delete job');
    }
  })
];

// Candidate handlers
export const candidateHandlers = [
  // GET /candidates - List candidates with filtering and pagination
  http.get('/api/candidates', async ({ request }) => {
    await simulateNetwork();
    
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || undefined;
    const stage = url.searchParams.get('stage') || undefined;
    const jobId = url.searchParams.get('jobId') || undefined;
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '1000');
    
    try {
      const result = await dbOperations.getCandidates({ search, stage, jobId, page, pageSize });
      return HttpResponse.json(result);
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch candidates', error: getErrorMessage(error) },
        { status: 500 }
      );
    }
  }),

  // GET /candidates/:id - Get single candidate
  http.get('/api/candidates/:id', async ({ params }) => {
    await simulateNetwork();
    
    try {
      const candidate = await dbOperations.getCandidateById(params.id as string);
      
      if (!candidate) {
        return HttpResponse.json(
          { success: false, message: 'Candidate not found' },
          { status: 404 }
        );
      }
      
      return HttpResponse.json({ data: candidate, success: true });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch candidate', error: getErrorMessage(error) },
        { status: 500 }
      );
    }
  }),

  // GET /candidates/:id/timeline - Get candidate timeline
  http.get('/api/candidates/:id/timeline', async ({ params }) => {
    await simulateNetwork();
    
    try {
      const timeline = await dbOperations.getCandidateTimeline(params.id as string);
      return HttpResponse.json({ data: timeline, success: true });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch timeline', error: getErrorMessage(error) },
        { status: 500 }
      );
    }
  }),

  // POST /candidates - Create candidate
  http.post('/api/candidates', async ({ request }) => {
    await simulateNetwork();
    
    try {
      const candidateData = await request.json() as CandidateCreateInput;
      
      // Validate required fields
      if (!candidateData.name || !candidateData.email || !candidateData.jobId) {
        return HttpResponse.json(
          { success: false, message: 'Name, email, and job ID are required' },
          { status: 400 }
        );
      }
      
      const candidate = await dbOperations.createCandidate({ ...candidateData, stage: 'applied' });
      
      return HttpResponse.json({ data: candidate, success: true }, { status: 201 });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to create candidate', error: getErrorMessage(error) },
        { status: 500 }
      );
    }
  }),

  // PATCH /candidates/:id - Update candidate (mainly for stage changes)
  http.patch('/api/candidates/:id', async ({ params, request }) => {
    await simulateNetwork();
    
    try {
      const updates = await request.json() as CandidateUpdateInput;
      const candidate = await dbOperations.updateCandidate(params.id as string, updates);
      
      if (!candidate) {
        return HttpResponse.json(
          { success: false, message: 'Candidate not found' },
          { status: 404 }
        );
      }
      
      return HttpResponse.json({ data: candidate, success: true });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to update candidate', error: getErrorMessage(error) },
        { status: 500 }
      );
    }
  }),

  // DELETE /candidates/:id - Delete candidate
  http.delete('/api/candidates/:id', async ({ params }) => {
    await simulateNetwork();
    
    try {
      await dbOperations.deleteCandidate(params.id as string);
      return HttpResponse.json({ success: true });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to delete candidate', error: getErrorMessage(error) },
        { status: 500 }
      );
    }
  })
];

// Assessment handlers
export const assessmentHandlers = [
  // GET /assessments/:jobId - Get assessments for a job
  http.get('/api/assessments/:jobId', async ({ params }) => {
    await simulateNetwork();
    
    try {
      const assessments = await dbOperations.getAssessments(params.jobId as string);
      return HttpResponse.json({ data: assessments, success: true });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch assessments', error: getErrorMessage(error) },
        { status: 500 }
      );
    }
  }),

  // PUT /assessments/:jobId - Create or update assessment
  http.put('/api/assessments/:jobId', async ({ params, request }) => {
    await simulateNetwork();
    
    try {
      const assessmentData = await request.json() as any;
      
      // Check if assessment already exists
      const existing = await dbOperations.getAssessments(params.jobId as string);
      
      let assessment;
      if (existing.length > 0) {
        assessment = await dbOperations.updateAssessment(existing[0].id, assessmentData);
      } else {
        assessment = await dbOperations.createAssessment({
          ...assessmentData,
          jobId: params.jobId as string
        });
      }
      
      return HttpResponse.json({ data: assessment, success: true });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to save assessment', error: getErrorMessage(error) },
        { status: 500 }
      );
    }
  }),

  // POST /assessments/:jobId/submit - Submit assessment response
  http.post('/api/assessments/:jobId/submit', async ({ params, request }) => {
    await simulateNetwork();
    
    try {
      const responseData = await request.json() as any;
      
      const response = await dbOperations.saveAssessmentResponse({
        ...responseData,
        assessmentId: params.jobId as string,
        submittedAt: new Date()
      });
      
      return HttpResponse.json({ data: response, success: true });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to submit assessment', error: getErrorMessage(error) },
        { status: 500 }
      );
    }
  })
];

// Authentication handlers
export const authHandlers = [
  // POST /auth/login - User login
  http.post('/api/auth/login', async ({ request }) => {
    await simulateNetwork();
    
    try {
      const credentials = await request.json() as LoginCredentials;
      
      // Use the database authenticateUser method which handles stored passwords
      const user = await dbOperations.authenticateUser(credentials.email, credentials.password);

      // Create auth user response (excluding sensitive data)
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
      };

      // In a real app, you'd generate a JWT token here
      const sessionExpiry = new Date();
      sessionExpiry.setHours(sessionExpiry.getHours() + 24); // 24 hour session

      return HttpResponse.json({
        success: true,
        data: {
          user: authUser,
          sessionExpiry: sessionExpiry.toISOString(),
        },
      });
    } catch (error) {
      return handleError(error, 'Login failed');
    }
  }),

  // POST /auth/signup - User registration
  http.post('/api/auth/signup', async ({ request }) => {
    await simulateNetwork();
    
    try {
      const signupData = await request.json() as SignupData;
      
      // Check if user already exists
      const existingUser = await dbOperations.getUserByEmail(signupData.email);
      if (existingUser) {
        return HttpResponse.json(
          { success: false, message: 'A user with this email already exists' },
          { status: 409 }
        );
      }

      // Create new user
      const newUser = await dbOperations.createUser({
        email: signupData.email,
        name: signupData.name,
        role: signupData.role,
        department: signupData.department,
        password: signupData.password, // Store the user's password
        isActive: true,
      });

      // Create auth user response
      const authUser: AuthUser = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        department: newUser.department,
        avatar: newUser.avatar,
      };

      const sessionExpiry = new Date();
      sessionExpiry.setHours(sessionExpiry.getHours() + 24);

      return HttpResponse.json({
        success: true,
        data: {
          user: authUser,
          sessionExpiry: sessionExpiry.toISOString(),
        },
      });
    } catch (error) {
      return handleError(error, 'Signup failed');
    }
  }),

  // POST /auth/logout - User logout
  http.post('/api/auth/logout', async () => {
    await delay(100); // Minimal delay for logout
    
    return HttpResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  }),
];

// Notification handlers
const notificationHandlers = [
  // Get notifications
  http.get('/api/notifications', async ({ request }) => {
    try {
      await simulateNetwork();
      const url = new URL(request.url);
      const limit = Number(url.searchParams.get('limit')) || 20;
      const offset = Number(url.searchParams.get('offset')) || 0;
      const read = url.searchParams.get('read');
      const category = url.searchParams.get('category');
      const type = url.searchParams.get('type');

      const filters: any = { userId: 'admin' }; // Default to admin user
      if (read !== null) filters.read = read === 'true';
      if (category) filters.category = category;
      if (type) filters.type = type;

      const result = await dbOperations.getNotifications(filters, { limit, offset });
      return HttpResponse.json({ success: true, data: result });
    } catch (error) {
      return handleError(error, 'Failed to fetch notifications');
    }
  }),

  // Create notification
  http.post('/api/notifications', async ({ request }) => {
    try {
      await simulateNetwork();
      const data = await request.json() as any;
      const result = await dbOperations.createNotification(data);
      return HttpResponse.json({ success: true, data: result });
    } catch (error) {
      return handleError(error, 'Failed to create notification');
    }
  }),

  // Mark notification as read
  http.patch('/api/notifications/:id/read', async ({ params }) => {
    try {
      await simulateNetwork();
      const id = String(params.id);
      await dbOperations.markNotificationAsRead(id);
      return HttpResponse.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
      return handleError(error, 'Failed to mark notification as read');
    }
  }),

  // Delete notification
  http.delete('/api/notifications/:id', async ({ params }) => {
    try {
      await simulateNetwork();
      const id = String(params.id);
      await dbOperations.deleteNotification(id);
      return HttpResponse.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
      return handleError(error, 'Failed to delete notification');
    }
  }),

  // Get notification stats
  http.get('/api/notifications/stats', async () => {
    try {
      await simulateNetwork();
      const stats = await dbOperations.getNotificationStats('admin'); // Using default admin user
      return HttpResponse.json({ success: true, data: stats });
    } catch (error) {
      return handleError(error, 'Failed to fetch notification stats');
    }
  }),

  // Mark all notifications as read
  http.patch('/api/notifications/mark-all-read', async () => {
    try {
      await simulateNetwork();
      await dbOperations.markAllNotificationsAsRead('admin'); // Using default admin user
      return HttpResponse.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      return handleError(error, 'Failed to mark all notifications as read');
    }
  }),
];

// Combine all handlers
export const handlers = [
  ...jobHandlers,
  ...candidateHandlers,
  ...assessmentHandlers,
  ...authHandlers,
  ...notificationHandlers,
];