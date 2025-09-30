import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useMemo, useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from './Forms';
import { Button } from './Button';
import { Badge, StatusBadge } from './Badge';
import type { Job, Candidate } from '../types';

// Virtualized Job List Component
interface VirtualizedJobListProps {
  jobs: Job[];
  loading?: boolean;
  onJobClick?: (job: Job) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedFilters?: string[];
  onFilterChange?: (filters: string[]) => void;
  className?: string;
}

export function VirtualizedJobList({
  jobs,
  loading = false,
  onJobClick,
  searchQuery = '',
  onSearchChange,
  selectedFilters = [],
  onFilterChange,
  className = '',
}: VirtualizedJobListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  // Filter jobs based on search and filters
  const filteredJobs = useMemo(() => {
    let filtered = jobs;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        job.requirements?.some((req: string) => req.toLowerCase().includes(query)) ||
        job.tags.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }
    
    if (selectedFilters.length > 0) {
      filtered = filtered.filter(job =>
        selectedFilters.includes(job.status) ||
        job.tags.some((tag: string) => selectedFilters.includes(tag))
      );
    }
    
    return filtered;
  }, [jobs, searchQuery, selectedFilters]);

  const virtualizer = useVirtualizer({
    count: filteredJobs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Estimated height of each job item
    overscan: 5,
  });

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <JobItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search jobs by title, company, location, or skills..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />}>
          Filters ({selectedFilters.length})
        </Button>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {filteredJobs.length} of {jobs.length} jobs
        {searchQuery && (
          <span className="ml-2">
            for "<strong>{searchQuery}</strong>"
          </span>
        )}
      </div>

      {/* Virtualized List */}
      <div
        ref={parentRef}
        className="h-[600px] overflow-auto border border-gray-200 rounded-lg"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const job = filteredJobs[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <JobItem 
                  job={job} 
                  onClick={() => onJobClick?.(job)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Job Item Component
interface JobItemProps {
  job: Job;
  onClick?: () => void;
}

function JobItem({ job, onClick }: JobItemProps) {
  return (
    <div
      className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {job.title}
            </h3>
            <StatusBadge status={job.status === 'active' ? 'active' : 'archived'} />
          </div>
          
          <div className="text-sm text-gray-600 mb-2">
            {job.location && (
              <>
                <span>{job.location}</span>
                <span className="mx-2">•</span>
              </>
            )}
            <span>Order: {job.order}</span>
          </div>
          
          <div className="flex flex-wrap gap-1 mb-2">
            {job.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="secondary" size="xs">
                {tag}
              </Badge>
            ))}
            {job.tags.length > 4 && (
              <Badge variant="default" size="xs">
                +{job.tags.length - 4} more
              </Badge>
            )}
          </div>
          
          {job.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {job.description}
            </p>
          )}
        </div>
        
        <div className="flex flex-col items-end text-sm text-gray-500">
          {job.salaryRange && (
            <div className="font-medium text-gray-900">
              ${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()}
            </div>
          )}
          <div>Posted {new Date(job.createdAt).toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  );
}

// Job Item Skeleton for loading state
function JobItemSkeleton() {
  return (
    <div className="p-4 border border-gray-200 rounded-lg animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-5 bg-gray-300 rounded w-48"></div>
            <div className="h-5 bg-gray-300 rounded w-16"></div>
          </div>
          <div className="h-4 bg-gray-300 rounded w-64 mb-2"></div>
          <div className="flex gap-2">
            <div className="h-4 bg-gray-300 rounded w-12"></div>
            <div className="h-4 bg-gray-300 rounded w-12"></div>
            <div className="h-4 bg-gray-300 rounded w-12"></div>
          </div>
        </div>
        <div className="text-right">
          <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
          <div className="h-3 bg-gray-300 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
}

// Virtualized Candidate List Component
interface VirtualizedCandidateListProps {
  candidates: Candidate[];
  loading?: boolean;
  onCandidateClick?: (candidate: Candidate) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedFilters?: string[];
  onFilterChange?: (filters: string[]) => void;
  className?: string;
}

export function VirtualizedCandidateList({
  candidates,
  loading = false,
  onCandidateClick,
  searchQuery = '',
  onSearchChange,
  selectedFilters = [],
  onFilterChange,
  className = '',
}: VirtualizedCandidateListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Close filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters]);
  
  // Available stage filters
  const stageOptions = [
    { value: 'applied', label: 'Applied', color: 'bg-blue-100 text-blue-800' },
    { value: 'screen', label: 'Screening', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'tech', label: 'Technical', color: 'bg-purple-100 text-purple-800' },
    { value: 'offer', label: 'Offer', color: 'bg-green-100 text-green-800' },
    { value: 'hired', label: 'Hired', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' }
  ];
  
  // Toggle filter selection
  const toggleFilter = (filter: string) => {
    const newFilters = selectedFilters.includes(filter)
      ? selectedFilters.filter(f => f !== filter)
      : [...selectedFilters, filter];
    onFilterChange?.(newFilters);
  };
  
  // Clear all filters
  const clearFilters = () => {
    onFilterChange?.([]);
  };
  
  // Filter candidates based on search and filters
  const filteredCandidates = useMemo(() => {
    let filtered = candidates;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(query) ||
        candidate.email.toLowerCase().includes(query) ||
        candidate.phone?.toLowerCase().includes(query)
      );
    }
    
    if (selectedFilters.length > 0) {
      filtered = filtered.filter(candidate =>
        selectedFilters.includes(candidate.stage)
      );
    }
    
    return filtered;
  }, [candidates, searchQuery, selectedFilters]);

  const virtualizer = useVirtualizer({
    count: filteredCandidates.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimated height of each candidate item
    overscan: 10,
  });

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <CandidateItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search candidates by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="relative" ref={filterRef}>
          <Button 
            variant="outline" 
            leftIcon={<Filter className="w-4 h-4" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters ({selectedFilters.length})
          </Button>
          
          {/* Filter Dropdown */}
          {showFilters && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">Filter by Stage</h3>
                {selectedFilters.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="space-y-2">
                {stageOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFilters.includes(option.value)}
                      onChange={() => toggleFilter(option.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${option.color}`}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {selectedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedFilters.map((filter) => {
            const option = stageOptions.find(opt => opt.value === filter);
            return (
              <span
                key={filter}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {option?.label || filter}
                <button
                  onClick={() => toggleFilter(filter)}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {filteredCandidates.length} of {candidates.length} candidates
        {searchQuery && (
          <span className="ml-2">
            for "<strong>{searchQuery}</strong>"
          </span>
        )}
      </div>

      {/* Virtualized List */}
      <div
        ref={parentRef}
        className="h-[600px] overflow-auto border border-gray-200 rounded-lg"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const candidate = filteredCandidates[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <CandidateItem 
                  candidate={candidate} 
                  onClick={() => onCandidateClick?.(candidate)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Candidate Item Component
interface CandidateItemProps {
  candidate: Candidate;
  onClick?: () => void;
}

function CandidateItem({ candidate, onClick }: CandidateItemProps) {
  // Map CandidateStage to StatusValue
  const getStatusValue = (stage: string): 'active' | 'draft' | 'closed' | 'archived' | 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected' => {
    const stageMap = {
      'applied': 'applied' as const,
      'screen': 'screening' as const,
      'tech': 'interview' as const,
      'offer': 'offer' as const,
      'hired': 'hired' as const,
      'rejected': 'rejected' as const
    };
    return stageMap[stage as keyof typeof stageMap] || 'applied';
  };

  return (
    <div
      className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-sm font-medium text-blue-700">
              {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          
          {/* Candidate Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-semibold text-gray-900 truncate">
                {candidate.name}
              </h4>
              <StatusBadge status={getStatusValue(candidate.stage)} size="xs" />
            </div>
            
            <p className="text-sm text-gray-600 truncate">
              {candidate.email}
            </p>
            
            {candidate.phone && (
              <p className="text-xs text-gray-500 truncate">
                {candidate.phone}
              </p>
            )}
          </div>
        </div>
        
        {/* Stage Info */}
        <div className="flex flex-col items-end">
          <Badge variant="secondary" size="xs">
            Job: {candidate.jobId}
          </Badge>
          {candidate.notes.length > 0 && (
            <Badge variant="info" size="xs" className="mt-1">
              {candidate.notes.length} notes
            </Badge>
          )}
        </div>
        
        {/* Date */}
        <div className="text-xs text-gray-500 ml-4">
          {new Date(candidate.appliedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

// Candidate Item Skeleton
function CandidateItemSkeleton() {
  return (
    <div className="p-4 border border-gray-200 rounded-lg animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 rounded-full bg-gray-300"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-300 rounded w-32 mb-1"></div>
          <div className="h-3 bg-gray-300 rounded w-48 mb-1"></div>
          <div className="h-3 bg-gray-300 rounded w-24"></div>
        </div>
        <div className="flex gap-1">
          <div className="h-4 bg-gray-300 rounded w-12"></div>
          <div className="h-4 bg-gray-300 rounded w-12"></div>
        </div>
        <div className="h-3 bg-gray-300 rounded w-16"></div>
      </div>
    </div>
  );
}