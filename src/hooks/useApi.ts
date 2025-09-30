import { useState, useEffect, useCallback } from 'react';
import type { Job, Candidate, Assessment, JobsResponse, CandidatesResponse } from '../types';

// Generic API hook
function useApi<T>(url: string, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(url, options);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Request failed');
      }
      
      setData(result.data || result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Jobs hooks
export function useJobs(filters: { search?: string; status?: string; page?: number; pageSize?: number } = {}) {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });
  
  const url = `/api/jobs${params.toString() ? `?${params.toString()}` : ''}`;
  
  return useApi<JobsResponse>(url);
}

export function useJob(id: string | undefined) {
  const url = id ? `/api/jobs/${id}` : '';
  
  const [data, setData] = useState<Job | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchJob = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/jobs/${id}`);
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch job');
        }
        
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  return { data, loading, error };
}

export function useCreateJob() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createJob = async (jobData: { title: string; description?: string; tags: string[]; location?: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to create job');
      }
      
      return result.data;
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
      
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update job');
      }
      
      return result.data;
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

// Candidates hooks
export function useCandidates(filters: { search?: string; stage?: string; jobId?: string; page?: number; pageSize?: number } = {}) {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });
  
  const url = `/api/candidates${params.toString() ? `?${params.toString()}` : ''}`;
  
  return useApi<CandidatesResponse>(url);
}

export function useCandidate(id: string | undefined) {
  const [data, setData] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchCandidate = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/candidates/${id}`);
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch candidate');
        }
        
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [id]);

  return { data, loading, error };
}

export function useCreateCandidate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCandidate = async (candidateData: { name: string; email: string; phone?: string; jobId: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidateData)
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to create candidate');
      }
      
      return result.data;
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
      
      const response = await fetch(`/api/candidates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update candidate');
      }
      
      return result.data;
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

// Assessments hooks
export function useAssessments(jobId: string | undefined) {
  const [data, setData] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(!!jobId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchAssessments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/assessments/${jobId}`);
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch assessments');
        }
        
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [jobId]);

  return { data, loading, error };
}