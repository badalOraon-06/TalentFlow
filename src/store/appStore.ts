import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Job, Candidate } from '../types';

interface AppState {
  // UI State
  selectedJob: Job | null;
  selectedCandidate: Candidate | null;
  isJobModalOpen: boolean;
  isCandidateModalOpen: boolean;
  
  // Filters
  jobFilters: {
    search: string;
    status: 'all' | 'active' | 'archived';
    page: number;
    pageSize: number;
  };
  
  candidateFilters: {
    search: string;
    stage: string;
    jobId: string;
    page: number;
    pageSize: number;
  };
  
  // Actions
  setSelectedJob: (job: Job | null) => void;
  setSelectedCandidate: (candidate: Candidate | null) => void;
  setJobModalOpen: (open: boolean) => void;
  setCandidateModalOpen: (open: boolean) => void;
  
  updateJobFilters: (filters: Partial<AppState['jobFilters']>) => void;
  updateCandidateFilters: (filters: Partial<AppState['candidateFilters']>) => void;
  
  // Reset functions
  resetJobFilters: () => void;
  resetCandidateFilters: () => void;
}

const initialJobFilters = {
  search: '',
  status: 'all' as const,
  page: 1,
  pageSize: 10,
};

const initialCandidateFilters = {
  search: '',
  stage: '',
  jobId: '',
  page: 1,
  pageSize: 20,
};

export const useAppStore = create<AppState>()(
  subscribeWithSelector((set) => ({
    // Initial state
    selectedJob: null,
    selectedCandidate: null,
    isJobModalOpen: false,
    isCandidateModalOpen: false,
    
    jobFilters: initialJobFilters,
    candidateFilters: initialCandidateFilters,
    
    // Actions
    setSelectedJob: (job) => set({ selectedJob: job }),
    setSelectedCandidate: (candidate) => set({ selectedCandidate: candidate }),
    setJobModalOpen: (open) => set({ isJobModalOpen: open }),
    setCandidateModalOpen: (open) => set({ isCandidateModalOpen: open }),
    
    updateJobFilters: (filters) => 
      set((state) => ({
        jobFilters: { ...state.jobFilters, ...filters }
      })),
      
    updateCandidateFilters: (filters) => 
      set((state) => ({
        candidateFilters: { ...state.candidateFilters, ...filters }
      })),
    
    resetJobFilters: () => set({ jobFilters: initialJobFilters }),
    resetCandidateFilters: () => set({ candidateFilters: initialCandidateFilters }),
  }))
);

// Selector hooks for better performance
export const useSelectedJob = () => useAppStore((state) => state.selectedJob);
export const useSelectedCandidate = () => useAppStore((state) => state.selectedCandidate);
export const useJobFilters = () => useAppStore((state) => state.jobFilters);
export const useCandidateFilters = () => useAppStore((state) => state.candidateFilters);
export const useJobModal = () => useAppStore((state) => ({
  isOpen: state.isJobModalOpen,
  setOpen: state.setJobModalOpen
}));
export const useCandidateModal = () => useAppStore((state) => ({
  isOpen: state.isCandidateModalOpen,
  setOpen: state.setCandidateModalOpen
}));