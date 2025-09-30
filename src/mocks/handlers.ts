import { http, HttpResponse, delay } from 'msw';
import { dbOperations } from '../lib/database';
import type { JobCreateInput, JobUpdateInput, CandidateCreateInput, CandidateUpdateInput } from '../types';

// Utility function to simulate network delay and occasional errors
async function simulateNetwork() {
  // Random delay between 200-1200ms
  await delay(200 + Math.random() * 1000);
  
  // 5-10% chance of network error for write operations
  if (Math.random() < 0.075) {
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

  // PATCH /jobs/:id/reorder - Reorder jobs (with occasional failures for testing)
  http.patch('/api/jobs/:id/reorder', async ({ request }) => {
    try {
      await simulateNetwork();
      
      // Higher chance of failure for reorder operations (10-15%)
      if (Math.random() < 0.125) {
        return HttpResponse.json(
          { success: false, message: 'Reorder operation failed' },
          { status: 500 }
        );
      }
      
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

// Combine all handlers
export const handlers = [
  ...jobHandlers,
  ...candidateHandlers,
  ...assessmentHandlers
];