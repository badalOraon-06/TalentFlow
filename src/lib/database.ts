import Dexie, { type Table } from 'dexie';
import type { Job, Candidate, Assessment, CandidateTimelineEvent, AssessmentResponse, User } from '../types';

export class TalentFlowDatabase extends Dexie {
  jobs!: Table<Job>;
  candidates!: Table<Candidate>;
  assessments!: Table<Assessment>;
  candidateTimeline!: Table<CandidateTimelineEvent>;
  assessmentResponses!: Table<AssessmentResponse>;
  users!: Table<User>;

  constructor() {
    super('TalentFlowDatabase');
    
    this.version(2).stores({
      jobs: 'id, title, status, createdAt, order',
      candidates: 'id, name, email, jobId, stage, appliedAt',
      assessments: 'id, jobId, title, createdAt',
      candidateTimeline: 'id, candidateId, type, createdAt',
      assessmentResponses: 'id, candidateId, assessmentId, submittedAt',
      users: 'id, email, role, isActive, createdAt'
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
    const userCount = await db.users.count();
    
    if (jobCount === 0) {
      console.log('🌱 Seeding database with initial data...');
      try {
        await seedDatabase();
        console.log('✅ Database seeded successfully!');
      } catch (seedError) {
        console.warn('⚠️ Database seeding failed, but continuing:', seedError);
        // Don't fail initialization if seeding fails
      }
    } else {
      console.log('📊 Database already contains data');
    }
    
    if (userCount === 0) {
      console.log('👥 Creating default users...');
      try {
        await seedUsers();
        console.log('✅ Default users created!');
      } catch (userError) {
        console.warn('⚠️ User seeding failed:', userError);
        // Try to ensure at least one admin user exists
        await createEmergencyAdmin();
      }
    } else {
      console.log('👥 Users already exist in database');
      // Ensure default users exist even if some users are present
      try {
        await ensureDefaultUsers();
      } catch (ensureError) {
        console.warn('⚠️ Could not ensure default users:', ensureError);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    // Try to create emergency admin if everything fails
    try {
      await createEmergencyAdmin();
      console.log('🆘 Created emergency admin user');
      return true;
    } catch (emergencyError) {
      console.error('❌ Failed to create emergency admin:', emergencyError);
      return false;
    }
  }
}

// Seed the database with sample data
async function seedDatabase() {
  try {
    const { generateJobs, generateCandidates, generateAssessments, generateTimelineEvents } = await import('./seedData');
    
    // Generate seed data
    const jobs = generateJobs(25);
    const candidates = generateCandidates(1000, jobs);
    const assessments = generateAssessments(jobs);
    const timelineEvents = generateTimelineEvents(candidates);
    
    // Insert data into database with error handling
    await db.transaction('rw', db.jobs, db.candidates, db.assessments, db.candidateTimeline, async () => {
      try {
        await db.jobs.bulkAdd(jobs);
      } catch (error) {
        console.warn('⚠️ Some jobs may already exist, adding individually...');
        for (const job of jobs) {
          try {
            await db.jobs.add(job);
          } catch (jobError) {
            // Job already exists, skip
          }
        }
      }

      try {
        await db.candidates.bulkAdd(candidates);
      } catch (error) {
        console.warn('⚠️ Some candidates may already exist, adding individually...');
        for (const candidate of candidates) {
          try {
            await db.candidates.add(candidate);
          } catch (candidateError) {
            // Candidate already exists, skip
          }
        }
      }

      try {
        await db.assessments.bulkAdd(assessments);
      } catch (error) {
        console.warn('⚠️ Some assessments may already exist, adding individually...');
        for (const assessment of assessments) {
          try {
            await db.assessments.add(assessment);
          } catch (assessmentError) {
            // Assessment already exists, skip
          }
        }
      }

      try {
        await db.candidateTimeline.bulkAdd(timelineEvents);
      } catch (error) {
        console.warn('⚠️ Some timeline events may already exist, adding individually...');
        for (const event of timelineEvents) {
          try {
            await db.candidateTimeline.add(event);
          } catch (eventError) {
            // Timeline event already exists, skip
          }
        }
      }
    });
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Seed users with default accounts
async function seedUsers() {
  const defaultUsers: User[] = [
    {
      id: 'user-admin-001',
      email: 'admin@talentflow.com',
      name: 'System Administrator',
      role: 'admin',
      department: 'IT',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'user-hr-001',
      email: 'hr@talentflow.com',
      name: 'HR Manager',
      role: 'hr_manager',
      department: 'Human Resources',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'user-recruiter-001',
      email: 'recruiter@talentflow.com',
      name: 'Senior Recruiter',
      role: 'recruiter',
      department: 'Human Resources',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'user-hiring-001',
      email: 'hiring@talentflow.com',
      name: 'Hiring Manager',
      role: 'hiring_manager',
      department: 'Engineering',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  try {
    await db.users.bulkAdd(defaultUsers);
    console.log('👥 Created default users:', defaultUsers.map(u => `${u.name} (${u.email})`));
  } catch (error) {
    // Handle duplicate key errors gracefully
    console.log('👥 Some default users may already exist, checking individually...');
    for (const user of defaultUsers) {
      try {
        const existing = await db.users.get(user.id);
        if (!existing) {
          await db.users.add(user);
          console.log(`👤 Created user: ${user.name} (${user.email})`);
        }
      } catch (userError) {
        console.log(`👤 User ${user.email} already exists`);
      }
    }
  }
}

// Create emergency admin user as fallback
async function createEmergencyAdmin() {
  const emergencyAdmin: User = {
    id: 'emergency-admin-001',
    email: 'admin@talentflow.com',
    name: 'Emergency Admin',
    role: 'admin',
    department: 'System',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    await db.users.add(emergencyAdmin);
    console.log('🆘 Emergency admin created successfully');
  } catch (error) {
    // Admin might already exist, try to update instead
    await db.users.put(emergencyAdmin);
    console.log('🆘 Emergency admin updated successfully');
  }
}

// Ensure default users exist (called when database already has users)
async function ensureDefaultUsers() {
  const requiredUsers = [
    'admin@talentflow.com',
    'hr@talentflow.com', 
    'recruiter@talentflow.com',
    'hiring@talentflow.com'
  ];

  for (const email of requiredUsers) {
    const existing = await db.users.where('email').equals(email).first();
    if (!existing) {
      console.log(`👤 Creating missing default user: ${email}`);
      await seedUsers(); // This will handle duplicates gracefully
      break; // Only run once if any users are missing
    }
  }
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
  },

  // Users
  async getUsers(filters: { search?: string; role?: string; isActive?: boolean; page?: number; pageSize?: number } = {}) {
    const { search, role, isActive, page = 1, pageSize = 50 } = filters;
    
    let query = db.users.orderBy('createdAt').reverse();
    
    if (role) {
      query = query.filter(user => user.role === role);
    }
    
    if (typeof isActive === 'boolean') {
      query = query.filter(user => user.isActive === isActive);
    }
    
    if (search) {
      query = query.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        (user.department && user.department.toLowerCase().includes(search.toLowerCase())) ||
        false
      );
    }
    
    const total = await query.count();
    const users = await query.offset((page - 1) * pageSize).limit(pageSize).toArray();
    
    return {
      users,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  },

  async getUserById(id: string) {
    return await db.users.get(id);
  },

  async getUserByEmail(email: string) {
    return await db.users.where('email').equals(email).first();
  },

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    // Check for unique email
    const existingUser = await db.users.where('email').equals(userData.email).first();
    if (existingUser) {
      throw new Error(`A user with email "${userData.email}" already exists`);
    }
    
    const user: User = {
      ...userData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.users.add(user);
    return user;
  },

  async updateUser(id: string, updates: Partial<User>) {
    // Check for unique email if email is being updated
    if (updates.email) {
      const existingUser = await db.users.where('email').equals(updates.email).first();
      if (existingUser && existingUser.id !== id) {
        throw new Error(`A user with email "${updates.email}" already exists`);
      }
    }
    
    const updated = { ...updates, updatedAt: new Date() };
    await db.users.update(id, updated);
    return await db.users.get(id);
  },

  async updateUserLastLogin(id: string) {
    await db.users.update(id, { 
      lastLoginAt: new Date(),
      updatedAt: new Date()
    });
  },

  async deactivateUser(id: string) {
    await db.users.update(id, { 
      isActive: false,
      updatedAt: new Date()
    });
  },

  async activateUser(id: string) {
    await db.users.update(id, { 
      isActive: true,
      updatedAt: new Date()
    });
  },

  async deleteUser(id: string) {
    await db.users.delete(id);
  },

  // Authentication helpers
  async authenticateUser(email: string, password: string) {
    // In a real app, you'd hash and compare passwords
    // For demo purposes, we'll use simple logic
    const user = await this.getUserByEmail(email);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (!user.isActive) {
      throw new Error('User account is deactivated');
    }
    
    // Simple password check for demo (normally you'd hash and compare)
    // Default passwords: admin123, hr123, recruiter123, hiring123
    const defaultPasswords: Record<string, string> = {
      'admin@talentflow.com': 'admin123',
      'hr@talentflow.com': 'hr123',
      'recruiter@talentflow.com': 'recruiter123',
      'hiring@talentflow.com': 'hiring123',
    };
    
    const expectedPassword = defaultPasswords[email] || 'password123';
    
    if (password !== expectedPassword) {
      throw new Error('Invalid credentials');
    }
    
    // Update last login
    await this.updateUserLastLogin(user.id);
    
    return user;
  }
};