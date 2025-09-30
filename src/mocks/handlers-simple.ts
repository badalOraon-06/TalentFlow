import { http, HttpResponse, delay } from 'msw';
import { dbOperations } from '../lib/database';

// Simple network simulation
async function simulateNetwork() {
  await delay(200 + Math.random() * 1000);
  if (Math.random() < 0.075) {
    throw new Error('Network error');
  }
}

export const handlers = [
  // Test endpoint
  http.get('/api/test', async () => {
    return HttpResponse.json({ message: 'MSW is working!' });
  }),

  // Jobs endpoints
  http.get('/api/jobs', async ({ request }) => {
    await simulateNetwork();
    try {
      const url = new URL(request.url);
      const search = url.searchParams.get('search') || undefined;
      const status = url.searchParams.get('status') || undefined;
      const page = parseInt(url.searchParams.get('page') || '1');
      const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
      
      const result = await dbOperations.getJobs({ search, status, page, pageSize });
      return HttpResponse.json(result);
    } catch (error) {
      return HttpResponse.json({ success: false, message: String(error) }, { status: 500 });
    }
  }),

  http.get('/api/jobs/:id', async ({ params }) => {
    await simulateNetwork();
    try {
      const job = await dbOperations.getJobById(params.id as string);
      if (!job) {
        return HttpResponse.json({ success: false, message: 'Job not found' }, { status: 404 });
      }
      return HttpResponse.json({ data: job, success: true });
    } catch (error) {
      return HttpResponse.json({ success: false, message: String(error) }, { status: 500 });
    }
  }),

  http.post('/api/jobs', async ({ request }) => {
    await simulateNetwork();
    try {
      const jobData = await request.json() as any;
      if (!jobData.title) {
        return HttpResponse.json({ success: false, message: 'Title is required' }, { status: 400 });
      }
      
      const slug = jobData.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
      const job = await dbOperations.createJob({ ...jobData, slug, status: 'active' });
      
      return HttpResponse.json({ data: job, success: true }, { status: 201 });
    } catch (error) {
      return HttpResponse.json({ success: false, message: String(error) }, { status: 500 });
    }
  }),

  http.patch('/api/jobs/:id', async ({ params, request }) => {
    await simulateNetwork();
    try {
      const updates = await request.json() as any;
      const job = await dbOperations.updateJob(params.id as string, updates);
      if (!job) {
        return HttpResponse.json({ success: false, message: 'Job not found' }, { status: 404 });
      }
      return HttpResponse.json({ data: job, success: true });
    } catch (error) {
      return HttpResponse.json({ success: false, message: String(error) }, { status: 500 });
    }
  }),

  // PATCH /jobs/:id/reorder - Reorder jobs
  http.patch('/api/jobs/:id/reorder', async ({ request }) => {
    try {
      await simulateNetwork();
      
      // Lower chance of failure for reorder operations (5%)
      if (Math.random() < 0.05) {
        console.log('❌ MSW: Simulated reorder failure');
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

  http.delete('/api/jobs/:id', async ({ params }) => {
    await simulateNetwork();
    try {
      await dbOperations.deleteJob(params.id as string);
      return HttpResponse.json({ success: true });
    } catch (error) {
      return HttpResponse.json({ success: false, message: String(error) }, { status: 500 });
    }
  }),

  // Candidates endpoints
  http.get('/api/candidates', async ({ request }) => {
    await simulateNetwork();
    try {
      const url = new URL(request.url);
      const search = url.searchParams.get('search') || undefined;
      const stage = url.searchParams.get('stage') || undefined;
      const jobId = url.searchParams.get('jobId') || undefined;
      const page = parseInt(url.searchParams.get('page') || '1');
      const pageSize = parseInt(url.searchParams.get('pageSize') || '1000');
      
      const result = await dbOperations.getCandidates({ search, stage, jobId, page, pageSize });
      return HttpResponse.json(result);
    } catch (error) {
      return HttpResponse.json({ success: false, message: String(error) }, { status: 500 });
    }
  }),

  http.get('/api/candidates/:id', async ({ params }) => {
    await simulateNetwork();
    try {
      const candidate = await dbOperations.getCandidateById(params.id as string);
      if (!candidate) {
        return HttpResponse.json({ success: false, message: 'Candidate not found' }, { status: 404 });
      }
      return HttpResponse.json({ data: candidate, success: true });
    } catch (error) {
      return HttpResponse.json({ success: false, message: String(error) }, { status: 500 });
    }
  }),

  http.post('/api/candidates', async ({ request }) => {
    await simulateNetwork();
    try {
      const candidateData = await request.json() as any;
      if (!candidateData.name || !candidateData.email) {
        return HttpResponse.json({ success: false, message: 'Name and email are required' }, { status: 400 });
      }
      
      const candidate = await dbOperations.createCandidate({ ...candidateData, stage: 'applied' });
      return HttpResponse.json({ data: candidate, success: true }, { status: 201 });
    } catch (error) {
      return HttpResponse.json({ success: false, message: String(error) }, { status: 500 });
    }
  }),

  http.patch('/api/candidates/:id', async ({ params, request }) => {
    await simulateNetwork();
    try {
      const updates = await request.json() as any;
      const candidate = await dbOperations.updateCandidate(params.id as string, updates);
      if (!candidate) {
        return HttpResponse.json({ success: false, message: 'Candidate not found' }, { status: 404 });
      }
      return HttpResponse.json({ data: candidate, success: true });
    } catch (error) {
      return HttpResponse.json({ success: false, message: String(error) }, { status: 500 });
    }
  }),

  // Assessments endpoints
  http.get('/api/assessments/:jobId', async ({ params }) => {
    await simulateNetwork();
    try {
      const assessments = await dbOperations.getAssessments(params.jobId as string);
      return HttpResponse.json({ data: assessments, success: true });
    } catch (error) {
      return HttpResponse.json({ success: false, message: String(error) }, { status: 500 });
    }
  }),
];