import { useState, useEffect, useCallback } from 'react';
import { dbOperations } from '../lib/database';
import type { Job, Candidate, Assessment, JobsResponse, CandidatesResponse, CandidateCreateInput } from '../types';

// Hook to use direct database operations when MSW is not working
function useDirectDb<T>(
  operation: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add artificial delay to simulate network
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
      
      const result = await operation();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
}

// Jobs hooks using direct database access
export function useJobs(filters: { search?: string; status?: string; page?: number; pageSize?: number } = {}) {
  return useDirectDb<JobsResponse>(
    () => dbOperations.getJobs(filters),
    [filters.search, filters.status, filters.page, filters.pageSize]
  );
}

export function useJob(id: string | undefined) {
  return useDirectDb<Job | undefined>(
    () => id ? dbOperations.getJobById(id) : Promise.resolve(undefined),
    [id]
  );
}

export function useCreateJob() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createJob = async (jobData: { title: string; description?: string; tags: string[]; location?: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      // Add artificial delay
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      
      // Simulate occasional errors (5% chance)
      if (Math.random() < 0.05) {
        throw new Error('Network error: Failed to create job');
      }
      
      const slug = jobData.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
      const job = await dbOperations.createJob({ ...jobData, slug, status: 'active' });
      
      return job;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create job';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { createJob, loading, error };
}

export function useUpdateJob() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateJob = async (id: string, updates: Partial<Job>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Add artificial delay
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      
      // Simulate occasional errors (5% chance)
      if (Math.random() < 0.05) {
        throw new Error('Network error: Failed to update job');
      }
      
      const job = await dbOperations.updateJob(id, updates);
      
      if (!job) {
        throw new Error('Job not found');
      }
      
      return job;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update job';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { updateJob, loading, error };
}

// Candidates hooks using direct database access
export function useCandidates(filters: { search?: string; stage?: string; jobId?: string; page?: number; pageSize?: number } = {}) {
  return useDirectDb<CandidatesResponse>(
    () => dbOperations.getCandidates(filters),
    [filters.search, filters.stage, filters.jobId, filters.page, filters.pageSize]
  );
}

export function useCandidate(id: string | undefined) {
  return useDirectDb<Candidate | undefined>(
    () => id ? dbOperations.getCandidateById(id) : Promise.resolve(undefined),
    [id]
  );
}

export function useCreateCandidate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCandidate = async (candidateData: CandidateCreateInput) => {
    try {
      setLoading(true);
      setError(null);
      
      // Add artificial delay
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      
      // Simulate occasional errors (5% chance)
      if (Math.random() < 0.05) {
        throw new Error('Network error: Failed to create candidate');
      }
      
      const candidate = await dbOperations.createCandidate({ ...candidateData, stage: 'applied' });
      
      return candidate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create candidate';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { createCandidate, loading, error };
}

export function useUpdateCandidate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCandidate = async (id: string, updates: Partial<Candidate>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Add artificial delay
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      
      // Simulate occasional errors (1% chance)
      if (Math.random() < 0.01) {
        throw new Error('Network error: Failed to update candidate');
      }
      
      const candidate = await dbOperations.updateCandidate(id, updates);
      
      if (!candidate) {
        throw new Error('Candidate not found');
      }
      
      return candidate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update candidate';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { updateCandidate, loading, error };
}

// Assessments hooks using direct database access
export function useAssessments(jobId: string | undefined) {
  return useDirectDb<Assessment[]>(
    () => jobId ? dbOperations.getAssessments(jobId) : Promise.resolve([]),
    [jobId]
  );
}

export function useSaveAssessment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveAssessment = async (jobId: string, assessmentData: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);

      // Check if assessment already exists for this job
      const existingAssessments = await dbOperations.getAssessments(jobId);
      
      let result;
      if (existingAssessments.length > 0) {
        // Update existing assessment
        result = await dbOperations.updateAssessment(existingAssessments[0].id, assessmentData);
      } else {
        // Create new assessment
        result = await dbOperations.createAssessment(assessmentData);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save assessment';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { saveAssessment, loading, error };
}

// Hook to get all assessments count
export function useAllAssessments() {
  return useDirectDb<Assessment[]>(
    () => dbOperations.getAssessments(),
    []
  );
}

// Hook to get database statistics
export function useDatabaseStats() {
  return useDirectDb<{
    jobs: number;
    candidates: number;
    users: number;
    assessments: number;
    responses: number;
    version: number;
  }>(
    () => dbOperations.getDatabaseStats(),
    []
  );
}