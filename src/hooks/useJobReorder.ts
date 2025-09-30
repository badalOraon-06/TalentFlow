import { useState } from 'react';
import type { Job } from '../types';

interface UseJobReorderResult {
  reorderJobs: (jobs: Job[], fromIndex: number, toIndex: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useJobReorder(): UseJobReorderResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reorderJobs = async (jobs: Job[], fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    try {
      setLoading(true);
      setError(null);

      // Get the job being moved
      const jobBeingMoved = jobs[fromIndex];
      const fromOrder = jobBeingMoved.order;
      const toOrder = jobs[toIndex].order;

      // Add artificial delay to simulate network latency
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));

      // Call the API endpoint (which occasionally fails)
      console.log(`🔄 Calling reorder API: /api/jobs/${jobBeingMoved.id}/reorder`);
      console.log(`📋 Payload:`, { fromOrder, toOrder });
      
      const response = await fetch(`/api/jobs/${jobBeingMoved.id}/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fromOrder, toOrder })
      });

      console.log(`📡 Response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`📋 Response body:`, result);

      if (!result.success) {
        throw new Error(result.message || 'Failed to reorder jobs');
      }

      console.log('✅ Job reorder successful');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reorder jobs';
      setError(errorMessage);
      console.error('❌ Job reorder failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { reorderJobs, loading, error };
}

// Optimistic updates hook for job reordering
interface UseOptimisticJobReorderResult {
  reorderJobsOptimistically: (
    jobs: Job[],
    fromIndex: number,
    toIndex: number,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => Promise<Job[]>;
  loading: boolean;
  error: string | null;
  isRollingBack: boolean;
}

export function useOptimisticJobReorder(): UseOptimisticJobReorderResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const { reorderJobs } = useJobReorder();

  const reorderJobsOptimistically = async (
    jobs: Job[],
    fromIndex: number,
    toIndex: number,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ): Promise<Job[]> => {
    if (fromIndex === toIndex) return jobs;

    // Step 1: Create optimistic update (immediate UI feedback)
    const optimisticJobs = [...jobs];
    const [movedJob] = optimisticJobs.splice(fromIndex, 1);
    optimisticJobs.splice(toIndex, 0, movedJob);

    // Update order properties for optimistic state
    const optimisticUpdatedJobs = optimisticJobs.map((job, index) => ({
      ...job,
      order: index + 1,
    }));

    try {
      setLoading(true);
      setError(null);

      // Step 2: Attempt the server update
      await reorderJobs(jobs, fromIndex, toIndex);

      // Step 3: Success - the optimistic update was correct
      onSuccess?.();
      console.log('✅ Optimistic reorder confirmed by server');
      return optimisticUpdatedJobs;

    } catch (err) {
      // Step 4: Rollback on failure
      setIsRollingBack(true);
      setError(err instanceof Error ? err.message : 'Reorder failed');
      
      console.log('🔄 Rolling back optimistic reorder...');
      
      // Rollback delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onError?.(err instanceof Error ? err.message : 'Reorder failed');
      
      setIsRollingBack(false);
      
      // Return original jobs array (rollback)
      return jobs;
    } finally {
      setLoading(false);
    }
  };

  return {
    reorderJobsOptimistically,
    loading,
    error,
    isRollingBack
  };
}

export default useJobReorder;