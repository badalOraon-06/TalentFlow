import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Plus, ArrowLeft, FileText, Building2 } from 'lucide-react';
import { useJobs } from '../hooks/useApiDirect';
import { useAssessments, useSaveAssessment } from '../hooks/useApiDirect';
import type { Job, Assessment } from '../types';
import { Button, AssessmentBuilder } from '../components';

export function AssessmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedJobId = searchParams.get('jobId');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Fetch jobs for selection
  const { data: jobsData, loading: jobsLoading, error: jobsError } = useJobs({
    page: 1,
    pageSize: 100,
    search: '',
    status: 'active'
  });

  // Debug logging
  useEffect(() => {
    console.log('🔍 AssessmentsPage Debug:', {
      jobsLoading,
      jobsError,
      jobsData,
      jobsCount: jobsData?.jobs?.length,
      selectedJobId
    });
  }, [jobsLoading, jobsError, jobsData, selectedJobId]);

  // Fetch assessments for selected job
  const { data: assessments, loading: assessmentsLoading } = useAssessments(selectedJobId || undefined);

  // Update selected job when jobId changes
  useEffect(() => {
    if (selectedJobId && jobsData?.jobs) {
      const job = jobsData.jobs.find(j => j.id === selectedJobId);
      setSelectedJob(job || null);
    } else {
      setSelectedJob(null);
    }
  }, [selectedJobId, jobsData]);

  const handleJobSelect = (jobId: string) => {
    setSearchParams({ jobId });
  };

  const handleBackToJobSelection = () => {
    setSearchParams({});
  };

  if (jobsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading jobs...</div>
      </div>
    );
  }

  if (jobsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600">Error loading jobs: {jobsError}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-blue-600 hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Job selection view
  if (!selectedJobId || !selectedJob) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Assessment Management</h1>
                <p className="text-purple-100 mt-2 text-lg">
                  Create and manage job-specific assessments to evaluate candidates
                </p>
              </div>
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold">{jobsData?.jobs?.length || 0}</div>
                <div className="text-purple-100 text-sm">Active Jobs</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold">-</div>
                <div className="text-purple-100 text-sm">Assessments Created</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold">-</div>
                <div className="text-purple-100 text-sm">Responses Collected</div>
              </div>
            </div>
          </div>
        </div>

        {/* Job Selection Grid */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Select a Job Position</h2>
            <p className="text-gray-600">Choose a job to create or manage its assessment questions</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobsData?.jobs?.map((job) => (
              <JobCard 
                key={job.id} 
                job={job} 
                onSelect={() => handleJobSelect(job.id)}
              />
            ))}
          </div>

          {(!jobsData?.jobs || jobsData.jobs.length === 0) && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Jobs Found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                To create assessments, you first need active job postings. Create a job position to get started.
              </p>
              <div className="space-y-4">
                <Link to="/jobs">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Job
                  </Button>
                </Link>
                <p className="text-sm text-gray-500">
                  After creating a job, return here to build its assessment
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Assessment builder view for selected job
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleBackToJobSelection}
                className="bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-opacity-30 backdrop-blur-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Button>
              <div>
                <h1 className="text-3xl font-bold mb-2">Assessment Builder</h1>
                <p className="text-purple-100 text-lg">
                  Building assessment for: <span className="font-bold text-white">{selectedJob.title}</span>
                </p>
              </div>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
        {assessmentsLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-purple-600 animate-pulse" />
              </div>
              <div className="text-gray-600 text-lg">Loading assessment...</div>
            </div>
          </div>
        ) : (
          <AssessmentBuilderView 
            job={selectedJob}
            assessment={assessments?.[0] || null}
          />
        )}
      </div>
    </div>
  );
}

interface JobCardProps {
  job: Job;
  onSelect: () => void;
}

function JobCard({ job, onSelect }: JobCardProps) {
  return (
    <div 
      className="bg-white rounded-2xl p-6 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-gray-100 hover:border-purple-300 group"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg group-hover:text-purple-600 transition-colors">{job.title}</h3>
              <p className="text-sm text-gray-500">Job ID: {job.id.slice(0, 8)}</p>
            </div>
          </div>
          
          {job.tags && job.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {job.tags.slice(0, 3).map((tag) => (
                <span 
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-200"
                >
                  {tag}
                </span>
              ))}
              {job.tags.length > 3 && (
                <span className="text-xs text-gray-500 font-medium">+{job.tags.length - 3} more</span>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center text-gray-600">
          <FileText className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">Create Assessment</span>
        </div>
        <div className="text-purple-600 group-hover:text-purple-700">
          <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

interface AssessmentBuilderViewProps {
  job: Job;
  assessment: Assessment | null;
}

function AssessmentBuilderView({ job, assessment }: AssessmentBuilderViewProps) {
  const { saveAssessment } = useSaveAssessment();

  const handleSaveAssessment = async (assessmentData: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await saveAssessment(job.id, assessmentData);
      // Optionally refresh the assessments data here
    } catch (error) {
      console.error('Failed to save assessment:', error);
      throw error; // Let the AssessmentBuilder handle the error display
    }
  };

  return (
    <div className="space-y-6">
      <AssessmentBuilder
        job={job}
        assessment={assessment}
        onSave={handleSaveAssessment}
      />
    </div>
  );
}