import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Input } from './Forms';
import { Button } from './Button';
import { Badge } from './Badge';
import type { Job, Candidate } from '../types';

// Debounced search hook
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

// Search component with debouncing
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export function SearchBar({ 
  value, 
  onChange, 
  placeholder = 'Search...', 
  debounceMs = 300,
  className = '' 
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(value);
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  useEffect(() => {
    onChange(debouncedSearchTerm);
  }, [debouncedSearchTerm, onChange]);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  return (
    <div className={`relative ${className}`}>
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        leftIcon={<Search className="w-4 h-4" />}
        rightIcon={
          searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )
        }
      />
    </div>
  );
}

// Filter types
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
  type: 'checkbox' | 'radio' | 'select';
}

// Multi-filter component
interface MultiFilterProps {
  filterGroups: FilterGroup[];
  selectedFilters: Record<string, string[]>;
  onFiltersChange: (filters: Record<string, string[]>) => void;
  className?: string;
}

export function MultiFilter({ 
  filterGroups, 
  selectedFilters, 
  onFiltersChange, 
  className = '' 
}: MultiFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const totalSelectedCount = Object.values(selectedFilters).flat().length;

  const handleFilterChange = (groupId: string, value: string, selected: boolean) => {
    const currentGroupFilters = selectedFilters[groupId] || [];
    
    let newGroupFilters: string[];
    const group = filterGroups.find(g => g.id === groupId);
    
    if (group?.type === 'radio') {
      newGroupFilters = selected ? [value] : [];
    } else {
      if (selected) {
        newGroupFilters = [...currentGroupFilters, value];
      } else {
        newGroupFilters = currentGroupFilters.filter(f => f !== value);
      }
    }

    onFiltersChange({
      ...selectedFilters,
      [groupId]: newGroupFilters
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        leftIcon={<Filter className="w-4 h-4" />}
        rightIcon={<ChevronDown className="w-4 h-4" />}
        onClick={() => setIsOpen(!isOpen)}
      >
        Filters {totalSelectedCount > 0 && `(${totalSelectedCount})`}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Filter Panel */}
          <div className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-80 z-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              {totalSelectedCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                >
                  Clear all
                </Button>
              )}
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filterGroups.map((group) => (
                <FilterGroupComponent
                  key={group.id}
                  group={group}
                  selectedValues={selectedFilters[group.id] || []}
                  onFilterChange={(value, selected) => 
                    handleFilterChange(group.id, value, selected)
                  }
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Individual filter group component
interface FilterGroupComponentProps {
  group: FilterGroup;
  selectedValues: string[];
  onFilterChange: (value: string, selected: boolean) => void;
}

function FilterGroupComponent({ group, selectedValues, onFilterChange }: FilterGroupComponentProps) {
  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-2">{group.label}</h4>
      <div className="space-y-2">
        {group.options.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          
          return (
            <label
              key={option.value}
              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
            >
              <input
                type={group.type === 'radio' ? 'radio' : 'checkbox'}
                name={group.type === 'radio' ? group.id : undefined}
                checked={isSelected}
                onChange={(e) => onFilterChange(option.value, e.target.checked)}
                className="form-checkbox rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 flex-1">{option.label}</span>
              {option.count !== undefined && (
                <span className="text-xs text-gray-500">({option.count})</span>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}

// Active filters display
interface ActiveFiltersProps {
  filterGroups: FilterGroup[];
  selectedFilters: Record<string, string[]>;
  onFiltersChange: (filters: Record<string, string[]>) => void;
  className?: string;
}

export function ActiveFilters({ 
  filterGroups, 
  selectedFilters, 
  onFiltersChange, 
  className = '' 
}: ActiveFiltersProps) {
  const activeFilterTags = useMemo(() => {
    const tags: Array<{
      groupId: string;
      value: string;
      label: string;
      groupLabel: string;
    }> = [];

    Object.entries(selectedFilters).forEach(([groupId, values]) => {
      const group = filterGroups.find(g => g.id === groupId);
      if (!group) return;

      values.forEach(value => {
        const option = group.options.find(o => o.value === value);
        if (option) {
          tags.push({
            groupId,
            value,
            label: option.label,
            groupLabel: group.label,
          });
        }
      });
    });

    return tags;
  }, [filterGroups, selectedFilters]);

  const removeFilter = (groupId: string, value: string) => {
    const currentGroupFilters = selectedFilters[groupId] || [];
    const newGroupFilters = currentGroupFilters.filter(f => f !== value);
    
    onFiltersChange({
      ...selectedFilters,
      [groupId]: newGroupFilters
    });
  };

  if (activeFilterTags.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {activeFilterTags.map((tag, index) => (
        <Badge
          key={`${tag.groupId}-${tag.value}-${index}`}
          variant="primary"
          size="sm"
          removable
          onRemove={() => removeFilter(tag.groupId, tag.value)}
        >
          {tag.groupLabel}: {tag.label}
        </Badge>
      ))}
    </div>
  );
}

// Combined search and filter component
interface SearchAndFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterGroups: FilterGroup[];
  selectedFilters: Record<string, string[]>;
  onFiltersChange: (filters: Record<string, string[]>) => void;
  resultCount?: number;
  totalCount?: number;
  className?: string;
}

export function SearchAndFilter({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filterGroups,
  selectedFilters,
  onFiltersChange,
  resultCount,
  totalCount,
  className = '',
}: SearchAndFilterProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
          />
        </div>
        <MultiFilter
          filterGroups={filterGroups}
          selectedFilters={selectedFilters}
          onFiltersChange={onFiltersChange}
        />
      </div>

      {/* Active Filters */}
      <ActiveFilters
        filterGroups={filterGroups}
        selectedFilters={selectedFilters}
        onFiltersChange={onFiltersChange}
      />

      {/* Results Count */}
      {(resultCount !== undefined && totalCount !== undefined) && (
        <div className="text-sm text-gray-600">
          {resultCount} of {totalCount} results
          {searchValue && (
            <span className="ml-2">
              for "<strong>{searchValue}</strong>"
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Predefined filter configurations for Jobs and Candidates
export function getJobFilters(jobs: Job[]): FilterGroup[] {
  // Calculate counts for each filter option
  const statusCounts = jobs.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const tagCounts = jobs.reduce((acc, job) => {
    job.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const locationCounts = jobs.reduce((acc, job) => {
    if (job.location) {
      acc[job.location] = (acc[job.location] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return [
    {
      id: 'status',
      label: 'Status',
      type: 'checkbox',
      options: [
        { value: 'active', label: 'Active', count: statusCounts['active'] || 0 },
        { value: 'archived', label: 'Archived', count: statusCounts['archived'] || 0 },
      ],
    },
    {
      id: 'tags',
      label: 'Technologies',
      type: 'checkbox',
      options: Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a) // Sort by count descending
        .slice(0, 15) // Limit to top 15
        .map(([tag, count]) => ({ value: tag, label: tag, count })),
    },
    {
      id: 'location',
      label: 'Location',
      type: 'checkbox',
      options: Object.entries(locationCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([location, count]) => ({ value: location, label: location, count })),
    },
  ];
}

export function getCandidateFilters(candidates: Candidate[]): FilterGroup[] {
  const stageCounts = candidates.reduce((acc, candidate) => {
    acc[candidate.stage] = (acc[candidate.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const jobCounts = candidates.reduce((acc, candidate) => {
    acc[candidate.jobId] = (acc[candidate.jobId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return [
    {
      id: 'stage',
      label: 'Stage',
      type: 'checkbox',
      options: [
        { value: 'applied', label: 'Applied', count: stageCounts['applied'] || 0 },
        { value: 'screen', label: 'Screening', count: stageCounts['screen'] || 0 },
        { value: 'tech', label: 'Technical', count: stageCounts['tech'] || 0 },
        { value: 'offer', label: 'Offer', count: stageCounts['offer'] || 0 },
        { value: 'hired', label: 'Hired', count: stageCounts['hired'] || 0 },
        { value: 'rejected', label: 'Rejected', count: stageCounts['rejected'] || 0 },
      ],
    },
    {
      id: 'jobId',
      label: 'Job',
      type: 'checkbox',
      options: Object.entries(jobCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10) // Limit to top 10 jobs
        .map(([jobId, count]) => ({ value: jobId, label: jobId, count })),
    },
  ];
}