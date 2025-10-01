import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Plus, ArrowLeft, FileText, Building2, Target, BarChart3, Users, Award } from 'lucide-react';
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
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 opacity-50"></div>
            
            <div className="relative">
              <div className="flex items-center space-x-6 mb-8">
                <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-lg">
                  <Target className="h-10 w-10 text-white drop-shadow-lg" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">Assessment Management</h1>
                  <p className="text-blue-100 text-xl font-medium drop-shadow">
                    Create and manage job-specific assessments to evaluate candidates
                  </p>
                </div>
              </div>
              
              {/* Enhanced Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group bg-white/15 hover:bg-white/20 rounded-2xl p-6 backdrop-blur-md border border-white/20 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-400/30">
                      <Building2 className="h-7 w-7 text-emerald-200 group-hover:text-emerald-100 transition-colors" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white drop-shadow-lg">{jobsData?.jobs?.length || 0}</div>
                      <div className="text-emerald-100 text-sm font-semibold uppercase tracking-wider">Active Jobs</div>
                    </div>
                  </div>
                </div>
                
                <div className="group bg-white/15 hover:bg-white/20 rounded-2xl p-6 backdrop-blur-md border border-white/20 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-400/30">
                      <FileText className="h-7 w-7 text-amber-200 group-hover:text-amber-100 transition-colors" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white drop-shadow-lg">0</div>
                      <div className="text-amber-100 text-sm font-semibold uppercase tracking-wider">Assessments Created</div>
                    </div>
                  </div>
                </div>
                
                <div className="group bg-white/15 hover:bg-white/20 rounded-2xl p-6 backdrop-blur-md border border-white/20 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-rose-500/20 rounded-xl flex items-center justify-center border border-rose-400/30">
                      <BarChart3 className="h-7 w-7 text-rose-200 group-hover:text-rose-100 transition-colors" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white drop-shadow-lg">0</div>
                      <div className="text-rose-100 text-sm font-semibold uppercase tracking-wider">Responses Collected</div>
                    </div>
                  </div>
                </div>
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
            <div className="text-center py-20">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg border-4 border-white">
                <Users className="h-16 w-16 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Active Jobs Found</h3>
              <p className="text-gray-600 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
                To create assessments, you first need active job postings. Create a job position to get started with candidate evaluation.
              </p>
              <div className="space-y-6">
                <Link to="/jobs">
                  <Button className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 text-white px-10 py-4 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 text-lg font-semibold">
                    <Plus className="h-6 w-6 mr-3" />
                    Create Your First Job
                  </Button>
                </Link>
                <p className="text-sm text-gray-500 font-medium">
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
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 opacity-50"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleBackToJobSelection}
                className="bg-white/20 border-white/40 text-white hover:bg-white/30 backdrop-blur-md px-6 py-3 rounded-xl shadow-lg border-2 transition-all duration-300 transform hover:scale-105"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span className="font-semibold">Back to Jobs</span>
              </Button>
              <div>
                <h1 className="text-4xl font-bold mb-3 drop-shadow-lg">Assessment Builder</h1>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-blue-100 text-xl font-medium drop-shadow">
                    Building assessment for: <span className="font-bold text-white bg-white/20 px-3 py-1 rounded-lg">{selectedJob.title}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-lg">
              <Award className="h-10 w-10 text-white drop-shadow-lg" />
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
      className="bg-white rounded-2xl p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-gray-100 hover:border-gradient-to-r hover:from-purple-300 hover:to-blue-300 group relative overflow-hidden"
      onClick={onSelect}
    >
      {/* Subtle background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-xl group-hover:text-purple-600 transition-colors duration-300">{job.title}</h3>
                <p className="text-sm text-gray-500 font-medium">Job ID: {job.id.slice(0, 8)}</p>
              </div>
            </div>
            
            {job.tags && job.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {job.tags.slice(0, 3).map((tag) => (
                  <span 
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-200 group-hover:from-purple-200 group-hover:to-blue-200 transition-colors duration-300"
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
        
        <div className="flex items-center justify-between pt-6 border-t border-gray-100 group-hover:border-purple-200 transition-colors duration-300">
          <div className="flex items-center text-gray-600 group-hover:text-purple-600 transition-colors duration-300">
            <Target className="h-5 w-5 mr-3" />
            <span className="text-sm font-semibold">Create Assessment</span>
          </div>
          <div className="text-purple-600 group-hover:text-purple-700">
            <svg className="w-6 h-6 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
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