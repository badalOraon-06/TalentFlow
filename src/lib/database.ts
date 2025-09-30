import Dexie, { type Table } from 'dexie';
import type { Job, Candidate, Assessment, CandidateTimelineEvent, AssessmentResponse } from '../types';

export class TalentFlowDatabase extends Dexie {
  jobs!: Table<Job>;
  candidates!: Table<Candidate>;
  assessments!: Table<Assessment>;
  candidateTimeline!: Table<CandidateTimelineEvent>;
  assessmentResponses!: Table<AssessmentResponse>;

  constructor() {
    super('TalentFlowDatabase');
    
    this.version(1).stores({
      jobs: 'id, title, status, createdAt, order',
      candidates: 'id, name, email, jobId, stage, appliedAt',
      assessments: 'id, jobId, title, createdAt',
      candidateTimeline: 'id, candidateId, type, createdAt',
      assessmentResponses: 'id, candidateId, assessmentId, submittedAt'
    });
  }
}

// Create database instance
export const db = new TalentFlowDatabase();

// Database initialization and seeding
export async function initializeDatabase() {
  try {
    await db.open();
    
    // Check if data already exists
    const jobCount = await db.jobs.count();
    if (jobCount === 0) {
      console.log('🌱 Seeding database with initial data...');
      await seedDatabase();
      console.log('✅ Database seeded successfully!');
    } else {
      console.log('📊 Database already contains data');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    return false;
  }
}

// Seed the database with sample data
async function seedDatabase() {
  const { generateJobs, generateCandidates, generateAssessments, generateTimelineEvents } = await import('./seedData');
  
  // Generate seed data
  const jobs = generateJobs(25);
  const candidates = generateCandidates(1000, jobs);
  const assessments = generateAssessments(jobs);
  const timelineEvents = generateTimelineEvents(candidates);
  
  // Insert data into database
  await db.transaction('rw', db.jobs, db.candidates, db.assessments, db.candidateTimeline, async () => {
    await db.jobs.bulkAdd(jobs);
    await db.candidates.bulkAdd(candidates);
    await db.assessments.bulkAdd(assessments);
    await db.candidateTimeline.bulkAdd(timelineEvents);
  });
}

// Utility functions for database operations
export const dbOperations = {
  // Jobs
  async getJobs(filters: { search?: string; status?: string; page?: number; pageSize?: number; sort?: string } = {}) {
    const { search, status, page = 1, pageSize = 10, sort = 'order' } = filters;
    
    // Handle different sort options
    let query;
    switch (sort) {
      case 'title':
        query = db.jobs.orderBy('title');
        break;
      case 'createdAt':
        query = db.jobs.orderBy('createdAt');
        break;
      case 'updatedAt':
        query = db.jobs.orderBy('updatedAt');
        break;
      case 'status':
        query = db.jobs.orderBy('status');
        break;
      case 'order':
      default:
        query = db.jobs.orderBy('order');
        break;
    }
    
    if (status && status !== 'all') {
      query = query.filter(job => job.status === status);
    }
    
    if (search) {
      query = query.filter(job => 
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    const total = await query.count();
    const jobs = await query.offset((page - 1) * pageSize).limit(pageSize).toArray();
    
    return {
      jobs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  },

  async getJobById(id: string) {
    return await db.jobs.get(id);
  },

  async createJob(jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'order'>) {
    // Check for unique slug
    const existingJob = await db.jobs.where('slug').equals(jobData.slug).first();
    if (existingJob) {
      throw new Error(`A job with slug "${jobData.slug}" already exists`);
    }
    
    const maxOrder = await db.jobs.orderBy('order').reverse().first();
    const job: Job = {
      ...jobData,
      id: crypto.randomUUID(),
      order: (maxOrder?.order || 0) + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.jobs.add(job);
    return job;
  },

  async updateJob(id: string, updates: Partial<Job>) {
    // Check for unique slug if slug is being updated
    if (updates.slug) {
      const existingJob = await db.jobs.where('slug').equals(updates.slug).first();
      if (existingJob && existingJob.id !== id) {
        throw new Error(`A job with slug "${updates.slug}" already exists`);
      }
    }
    
    const updated = { ...updates, updatedAt: new Date() };
    await db.jobs.update(id, updated);
    return await db.jobs.get(id);
  },

  async deleteJob(id: string) {
    await db.jobs.delete(id);
  },

  async reorderJobs(fromOrder: number, toOrder: number) {
    console.log(`🔄 DB: Reordering from ${fromOrder} to ${toOrder}`);
    
    const jobs = await db.jobs.orderBy('order').toArray();
    console.log('📋 DB: Current jobs:', jobs.map(j => ({ id: j.id, order: j.order })));
    
    if (fromOrder === toOrder) {
      console.log('⚠️ DB: fromOrder equals toOrder, no changes needed');
      return;
    }
    
    // Update order values
    const updatedJobs = jobs.map(job => {
      if (job.order === fromOrder) {
        // This is the job being moved
        return { ...job, order: toOrder, updatedAt: new Date() };
      } else if (fromOrder < toOrder && job.order > fromOrder && job.order <= toOrder) {
        // Moving down: shift items up to fill the gap
        return { ...job, order: job.order - 1, updatedAt: new Date() };
      } else if (fromOrder > toOrder && job.order >= toOrder && job.order < fromOrder) {
        // Moving up: shift items down to make room
        return { ...job, order: job.order + 1, updatedAt: new Date() };
      }
      return job;
    });

    console.log('📋 DB: Updated jobs:', updatedJobs.map(j => ({ id: j.id, order: j.order })));
    
    await db.jobs.bulkPut(updatedJobs);
    console.log('✅ DB: Jobs reordered successfully');
  },

  // Candidates
  async getCandidates(filters: { search?: string; stage?: string; jobId?: string; page?: number; pageSize?: number } = {}) {
    const { search, stage, jobId, page = 1, pageSize = 1000 } = filters;
    
    let query = db.candidates.orderBy('appliedAt').reverse();
    
    if (jobId) {
      query = query.filter(candidate => candidate.jobId === jobId);
    }
    
    if (stage) {
      query = query.filter(candidate => candidate.stage === stage);
    }
    
    if (search) {
      query = query.filter(candidate => 
        candidate.name.toLowerCase().includes(search.toLowerCase()) ||
        candidate.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    const total = await query.count();
    const candidates = await query.offset((page - 1) * pageSize).limit(pageSize).toArray();
    
    return {
      candidates,
      total,
      page,
      pageSize
    };
  },

  async getCandidateById(id: string) {
    return await db.candidates.get(id);
  },

  async createCandidate(candidateData: Omit<Candidate, 'id' | 'appliedAt' | 'updatedAt' | 'notes'>) {
    const candidate: Candidate = {
      ...candidateData,
      id: crypto.randomUUID(),
      notes: [],
      appliedAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.candidates.add(candidate);
    
    // Add timeline event
    await this.addTimelineEvent({
      candidateId: candidate.id,
      type: 'stage_change',
      data: { to: candidate.stage }
    });
    
    return candidate;
  },

  async updateCandidate(id: string, updates: Partial<Candidate>) {
    const current = await db.candidates.get(id);
    if (!current) throw new Error('Candidate not found');
    
    const updated = { ...updates, updatedAt: new Date() };
    await db.candidates.update(id, updated);
    
    // Add timeline event for stage changes
    if (updates.stage && updates.stage !== current.stage) {
      await this.addTimelineEvent({
        candidateId: id,
        type: 'stage_change',
        data: { from: current.stage, to: updates.stage }
      });
    }
    
    return await db.candidates.get(id);
  },

  async deleteCandidate(id: string) {
    await db.candidates.delete(id);
    await db.candidateTimeline.where('candidateId').equals(id).delete();
  },

  // Timeline
  async getCandidateTimeline(candidateId: string) {
    return await db.candidateTimeline
      .where('candidateId')
      .equals(candidateId)
      .reverse()
      .sortBy('createdAt');
  },

  async addTimelineEvent(event: Omit<CandidateTimelineEvent, 'id' | 'createdAt'>) {
    const timelineEvent: CandidateTimelineEvent = {
      ...event,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };
    
    await db.candidateTimeline.add(timelineEvent);
    return timelineEvent;
  },

  // Assessments
  async getAssessments(jobId?: string) {
    if (jobId) {
      return await db.assessments.where('jobId').equals(jobId).toArray();
    }
    return await db.assessments.orderBy('createdAt').toArray();
  },

  async getAssessmentById(id: string) {
    return await db.assessments.get(id);
  },

  async createAssessment(assessmentData: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>) {
    const assessment: Assessment = {
      ...assessmentData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.assessments.add(assessment);
    return assessment;
  },

  async updateAssessment(id: string, updates: Partial<Assessment>) {
    const updated = { ...updates, updatedAt: new Date() };
    await db.assessments.update(id, updated);
    return await db.assessments.get(id);
  },

  async deleteAssessment(id: string) {
    await db.assessments.delete(id);
    await db.assessmentResponses.where('assessmentId').equals(id).delete();
  },

  // Assessment Responses
  async getAssessmentResponses(assessmentId?: string, candidateId?: string) {
    let query = db.assessmentResponses.toCollection();
    
    if (assessmentId) {
      query = query.filter(response => response.assessmentId === assessmentId);
    }
    
    if (candidateId) {
      query = query.filter(response => response.candidateId === candidateId);
    }
    
    return await query.toArray();
  },

  async saveAssessmentResponse(responseData: Omit<AssessmentResponse, 'id'>) {
    const response: AssessmentResponse = {
      ...responseData,
      id: crypto.randomUUID()
    };
    
    await db.assessmentResponses.put(response);
    return response;
  }
};