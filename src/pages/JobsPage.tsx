import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Search, Filter, Edit, Archive, ArchiveRestore, MoreVertical, Grid, List, AlertTriangle } from 'lucide-react';
import { useJobs, useUpdateJob } from '../hooks/useApiDirect';
import { useOptimisticJobReorder } from '../hooks/useJobReorder';
import { useAppStore } from '../store/appStore';
import { Pagination, JobFormModal, SortableJobList } from '../components';
import { useSimpleToast } from '../components/SimpleToast';
import type { Job } from '../types';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function JobsPage() {
  const navigate = useNavigate();
  const { jobFilters, updateJobFilters } = useAppStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Use different filters based on view mode
  // In reorder mode (list), fetch all jobs without pagination
  const effectiveFilters = viewMode === 'list' 
    ? { 
        search: jobFilters.search, 
        status: jobFilters.status, 
        page: 1, 
        pageSize: 10000 // Large number to get all jobs
      }
    : jobFilters;
  
  const { data: jobsData, loading, error } = useJobs(effectiveFilters);
  const updateJobHook = useUpdateJob();
  const { reorderJobsOptimistically, loading: reorderLoading, error: reorderError, isRollingBack } = useOptimisticJobReorder();
  const { showToast } = useSimpleToast();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobMenuOpen, setJobMenuOpen] = useState<string | null>(null);
  const [localJobs, setLocalJobs] = useState<Job[]>([]);
  
  // Handle view mode changes
  const handleViewModeChange = (newMode: 'grid' | 'list') => {
    setViewMode(newMode);
    // When switching to reorder mode, we'll automatically fetch all jobs
    // When switching back to grid, we'll use the current pagination
  };
  
  // Local search state to prevent immediate API calls
  const [searchInput, setSearchInput] = useState(jobFilters.search);
  // Debounce the search input with 500ms delay
  const debouncedSearchTerm = useDebounce(searchInput, 500);

  // Update local jobs when data changes
  useEffect(() => {
    if (jobsData?.jobs) {
      setLocalJobs(jobsData.jobs);
    }
  }, [jobsData?.jobs]);

  // Update search input when filters change (e.g., from clear filters)
  useEffect(() => {
    setSearchInput(jobFilters.search);
  }, [jobFilters.search]);

  // Trigger search when debounced term changes
  useEffect(() => {
    if (debouncedSearchTerm !== jobFilters.search) {
      updateJobFilters({ search: debouncedSearchTerm, page: 1 });
    }
  }, [debouncedSearchTerm, jobFilters.search, updateJobFilters]);

  const handlePageChange = (page: number) => {
    updateJobFilters({ page });
  };

  const handlePageSizeChange = (pageSize: number) => {
    updateJobFilters({ pageSize, page: 1 }); // Reset to first page when changing page size
  };

  // Updated search handler - only updates local state
  const handleSearchChange = (search: string) => {
    setSearchInput(search); // This will trigger debounced search after 500ms
  };

  const handleStatusFilter = (status: 'all' | 'active' | 'archived') => {
    updateJobFilters({ status, page: 1 }); // Reset to first page when filtering
  };

  // Enhanced clear filters to also clear local search input
  const handleClearFilters = () => {
    setSearchInput('');
    updateJobFilters({ search: '', status: 'all', page: 1 });
  };

  const handleJobCreated = (job: Job) => {
    // Refresh the jobs list by updating the page (force refresh)
    updateJobFilters({ page: jobFilters.page });
  };

  const handleJobUpdated = (job: Job) => {
    // Refresh the jobs list
    updateJobFilters({ page: jobFilters.page });
    setEditingJob(null);
  };

  const handleArchiveToggle = async (job: Job) => {
    try {
      const newStatus = job.status === 'active' ? 'archived' : 'active';
      
      // Optimistically update the local jobs state immediately for instant UI feedback
      setLocalJobs(prevJobs => 
        prevJobs.map(j => 
          j.id === job.id 
            ? { ...j, status: newStatus, updatedAt: new Date() }
            : j
        )
      );
      
      // Update the job in the database
      await updateJobHook.updateJob(job.id, { status: newStatus });
      
      // Refresh the jobs list to ensure data consistency
      updateJobFilters({ page: jobFilters.page });
      setJobMenuOpen(null);
      
      showToast(`Job "${job.title}" ${newStatus === 'archived' ? 'archived' : 'restored'} successfully`, 'success');
    } catch (error) {
      console.error('Failed to update job status:', error);
      
      // Revert the optimistic update on error
      setLocalJobs(prevJobs => 
        prevJobs.map(j => 
          j.id === job.id 
            ? { ...j, status: job.status, updatedAt: job.updatedAt }
            : j
        )
      );
      
      showToast('Failed to update job status', 'error');
    }
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setJobMenuOpen(null);
  };

  const toggleJobMenu = (jobId: string) => {
    setJobMenuOpen(jobMenuOpen === jobId ? null : jobId);
  };

  // Handle drag and drop reordering
  const handleJobReorder = async (reorderedJobs: Job[]) => {
    console.log('🎯 JobsPage: Handling job reorder');
    console.log('📋 Original jobs:', localJobs.map(j => ({ id: j.id, order: j.order })));
    console.log('📋 Reordered jobs:', reorderedJobs.map(j => ({ id: j.id, order: j.order })));
    
    // Update local state immediately for optimistic update
    setLocalJobs(reorderedJobs);
    
    // Find which job was moved and what the change was
    let movedJob: Job | null = null;
    let oldOrder = -1;
    let newOrder = -1;
    
    // Compare the original and reordered arrays to find what changed
    for (let i = 0; i < reorderedJobs.length; i++) {
      const reorderedJob = reorderedJobs[i];
      const originalJob = localJobs.find(j => j.id === reorderedJob.id);
      
      if (originalJob && originalJob.order !== reorderedJob.order) {
        movedJob = reorderedJob;
        oldOrder = originalJob.order;
        newOrder = reorderedJob.order;
        break;
      }
    }
    
    if (movedJob && oldOrder !== -1 && newOrder !== -1) {
      console.log(`🎯 Moving job ${movedJob.id} from order ${oldOrder} to ${newOrder}`);
      
      try {
        // Call the API with the actual order values (not indices)
        const response = await fetch(`/api/jobs/${movedJob.id}/reorder`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fromOrder: oldOrder, toOrder: newOrder })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message || 'Reorder failed');
        }
        
        console.log('✅ Reorder successful, refreshing data');
        // Refresh the data to ensure consistency
        updateJobFilters({ page: jobFilters.page });
        
      } catch (error) {
        console.error('❌ Reorder failed:', error);
        // Revert the optimistic update
        setLocalJobs(localJobs);
        // Show error message (you might want to add a toast notification here)
      }
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (jobMenuOpen && !(event.target as Element).closest('.job-menu')) {
        setJobMenuOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [jobMenuOpen]);

  if (loading && jobFilters.page === 1 && !localJobs.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header skeleton */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl animate-pulse"></div>
                <div>
                  <div className="h-8 bg-white/20 rounded w-48 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-white/10 rounded w-32 animate-pulse"></div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-10 bg-white/20 rounded-xl w-32 animate-pulse"></div>
                <div className="h-10 bg-white/20 rounded-xl w-36 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Search skeleton */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-2">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
              <div>
                <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
          
          {/* Jobs grid skeleton */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-6 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading Jobs</h3>
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline ml-1">{error}</span>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                Retry Loading
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const jobs = jobsData?.jobs || [];
  const totalJobs = jobsData?.total || 0;
  const totalPages = Math.ceil(totalJobs / jobFilters.pageSize);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with Gradient Background */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Jobs Management</h1>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center text-blue-100">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-sm font-medium">{totalJobs} Total Jobs</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                    <span className="text-sm font-medium">{jobs.filter(job => job.status === 'active').length} Active</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                    <span className="text-sm font-medium">{jobs.filter(job => job.status === 'archived').length} Archived</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Enhanced View Toggle */}
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20">
                <button
                  onClick={() => handleViewModeChange('grid')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <Grid className="h-4 w-4 mr-2" />
                  Grid View
                </button>
                <button
                  onClick={() => handleViewModeChange('list')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <List className="h-4 w-4 mr-2" />
                  Reorder Mode
                </button>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold shadow-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Job
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Enhanced Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mr-3">
                <Filter className="h-5 w-5 text-white" />
              </div>
              Search & Filter Jobs
            </h3>
            <p className="text-gray-600 mt-1">Find and filter jobs by title, status, or tags</p>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Enhanced Search */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Jobs</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by job title, description, or tags..."
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Enhanced Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                <select
                  value={jobFilters.status}
                  onChange={(e) => handleStatusFilter(e.target.value as 'all' | 'active' | 'archived')}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Jobs</option>
                  <option value="archived">Archived Jobs</option>
                </select>
              </div>

              {/* Enhanced Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={handleClearFilters}
                  className="w-full px-6 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  Clear All Filters
                </button>
              </div>
            </div>

            {/* Enhanced Active Filters Summary - Only show actual applied filters */}
            {(jobFilters.search || jobFilters.status !== 'all') && (
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center text-sm text-blue-800">
                  <span className="font-semibold">Active filters:</span>
                  <div className="flex flex-wrap gap-2 ml-3">
                    {jobFilters.search && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-200 text-blue-800 border border-blue-300">
                        <Search className="w-3 h-3 mr-1" />
                        Search: "{jobFilters.search}"
                      </span>
                    )}
                    {jobFilters.status !== 'all' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-200 text-green-800 border border-green-300">
                        <Filter className="w-3 h-3 mr-1" />
                        Status: {jobFilters.status}
                      </span>
                    )}
                  </div>
                </div>
                {/* Show typing indicator when user is typing but search hasn't been applied yet */}
                {searchInput && searchInput !== jobFilters.search && (
                  <div className="mt-2 text-xs text-blue-600">
                    <span className="animate-pulse">⌨️ Typing: "{searchInput}" - Search will update in a moment...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Reorder Status Indicator */}
        {(reorderLoading || isRollingBack || reorderError) && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            {reorderLoading && !isRollingBack && (
              <div className="flex items-center justify-center space-x-3 text-blue-600">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="font-medium">Reordering jobs...</span>
                <div className="text-sm text-gray-500">Please wait while we update the job order</div>
              </div>
            )}
            {isRollingBack && (
              <div className="flex items-center justify-center space-x-3 text-orange-600">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Rolling back changes due to server error...</span>
              </div>
            )}
            {reorderError && !reorderLoading && (
              <div className="flex items-center justify-center space-x-3 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                <div>
                  <span className="font-medium">Failed to reorder jobs</span>
                  <div className="text-sm text-gray-500">{reorderError}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Jobs Display */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Show loading state when searching */}
          {loading && (
            <div className="p-6 border-b border-gray-200 bg-blue-50">
              <div className="flex items-center justify-center space-x-3 text-blue-600">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="font-medium">
                  {jobFilters.page > 1 ? `Loading page ${jobFilters.page}...` : 'Searching jobs...'}
                </span>
              </div>
            </div>
          )}

          {localJobs.length > 0 ? (
            viewMode === 'list' ? (
              /* Enhanced Sortable List View for Reordering */
              <div className="p-8">
                <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
                  <div className="flex items-center text-blue-800">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
                      <List className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Reorder Mode Active - All Jobs Loaded</h3>
                      <p className="text-sm mt-1">
                        Showing all {localJobs.length} jobs. Drag and drop to reorder them. Changes are saved automatically.
                      </p>
                    </div>
                  </div>
                </div>
                
                <SortableJobList
                  jobs={localJobs}
                  onReorder={handleJobReorder}
                  className="space-y-3"
                />
              </div>
            ) : (
            /* Enhanced Grid View */
            <div className="grid grid-cols-1 gap-6 p-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {localJobs.map((job) => (
              <div
                key={job.id}
                className={`group bg-white rounded-2xl shadow-sm border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden ${
                  job.status === 'active' 
                    ? 'border-l-4 border-l-green-500 hover:border-green-400' 
                    : 'border-l-4 border-l-gray-400 hover:border-gray-300'
                }`}
              >
                {/* Card Header */}
                <div className={`px-6 py-4 ${
                  job.status === 'active' 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50' 
                    : 'bg-gradient-to-r from-gray-50 to-slate-50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                        job.status === 'active' 
                          ? 'bg-green-500' 
                          : 'bg-gray-500'
                      }`}>
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          job.status === 'active'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {job.status === 'active' ? '● Active' : '○ Archived'}
                        </span>
                      </div>
                    </div>

                    {/* Enhanced Actions Menu */}
                    <div className="relative job-menu">
                      <button
                        onClick={() => toggleJobMenu(job.id)}
                        className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        aria-label="Job actions"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {jobMenuOpen === job.id && (
                        <div className="absolute right-0 top-12 w-52 bg-white rounded-xl shadow-xl border border-gray-200 z-10 overflow-hidden">
                          <div className="py-2">
                            <button
                              onClick={() => handleEditJob(job)}
                              className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                            >
                              <Edit className="h-4 w-4 mr-3" />
                              Edit Job Details
                            </button>
                            <button
                              onClick={() => handleArchiveToggle(job)}
                              className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                              disabled={updateJobHook.loading}
                            >
                              {job.status === 'active' ? (
                                <>
                                  <Archive className="h-4 w-4 mr-3" />
                                  Archive Job
                                </>
                              ) : (
                                <>
                                  <ArchiveRestore className="h-4 w-4 mr-3" />
                                  Restore Job
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <button
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="text-left w-full group/title"
                  >
                    <h3 className="font-bold text-lg text-gray-900 group-hover/title:text-blue-600 transition-colors line-clamp-2 mb-3">
                      {job.title}
                    </h3>
                  </button>
                  
                  {job.location && (
                    <div className="flex items-center text-gray-600 mb-3">
                      <div className="w-4 h-4 mr-2 text-blue-500">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2C7.79 2 6 3.79 6 6c0 3.5 4 8 4 8s4-4.5 4-8c0-2.21-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                        </svg>
                      </div>
                      <span className="text-sm font-medium">{job.location}</span>
                    </div>
                  )}
                  
                  {job.salaryRange && (
                    <div className="flex items-center text-gray-600 mb-4">
                      <div className="w-4 h-4 mr-2 text-green-500">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm1-9h-1V6h-1v1H8v1h1v1H8v1h1v1h1v-1h1v-1h-1V9h1V8z"/>
                        </svg>
                      </div>
                      <span className="text-sm font-semibold text-green-600">
                        ${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                      >
                        {tag}
                      </span>
                    ))}
                    {job.tags.length > 2 && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                        +{job.tags.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Card Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <div className="flex items-center">
                      <span className="font-medium">Order #{job.order}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/>
                      </svg>
                      <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Building2 className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {jobFilters.search || jobFilters.status !== 'all' ? 'No matching jobs found' : 'No jobs created yet'}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {jobFilters.search || jobFilters.status !== 'all'
                  ? 'Try adjusting your search terms or filter criteria to find the jobs you\'re looking for.'
                  : 'Get started by creating your first job posting and begin building your talent pipeline.'}
              </p>
              {(!jobFilters.search && jobFilters.status === 'all') && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Job
                </button>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Pagination - Hidden in reorder mode */}
        {totalJobs > 0 && viewMode === 'grid' && (
          <div className="border-t border-gray-200 bg-white rounded-b-2xl">
            <Pagination
              currentPage={jobFilters.page}
              totalPages={totalPages}
              pageSize={jobFilters.pageSize}
              totalItems={totalJobs}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[5, 10, 20, 50]}
            />
          </div>
        )}
      </div>
      </div>

      {/* Create Job Modal */}
      <JobFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleJobCreated}
      />

      {/* Edit Job Modal */}
      <JobFormModal
        isOpen={!!editingJob}
        onClose={() => setEditingJob(null)}
        job={editingJob || undefined}
        onSuccess={handleJobUpdated}
      />
    </div>
  );
}

export default JobsPage;