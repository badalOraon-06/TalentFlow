import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Plus, ArrowLeft, FileText, Building2, Target, BarChart3, Users, Award } from 'lucide-react';
import { useJobs } from '../hooks/useApiDirect';
import { useAssessments, useSaveAssessment, useDatabaseStats } from '../hooks/useApiDirect';
import type { Job, Assessment } from '../types';
import { Button, AssessmentBuilder } from '../components';
import { useSimpleToast } from '../components/SimpleToast';

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

  // Get database stats
  const { data: dbStats } = useDatabaseStats();

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
      <div className="flex items-center justify-center min-h-[50vh] px-3">
        <div className="text-gray-500 text-sm sm:text-base">Loading jobs...</div>
      </div>
    );
  }

  if (jobsError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] px-3">
        <div className="text-center">
          <div className="text-red-600 text-sm sm:text-base">Error loading jobs: {jobsError}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-blue-600 hover:underline text-sm sm:text-base"
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-3 sm:p-4 md:p-6">
        {/* Enhanced Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-white shadow-2xl relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 opacity-50"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/20 rounded-2xl sm:rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-lg flex-shrink-0">
                  <Target className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white drop-shadow-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 drop-shadow-lg">Assessment Management</h1>
                  <p className="text-blue-100 text-xs sm:text-sm md:text-base lg:text-xl font-medium drop-shadow hidden sm:block">
                    Create and manage job-specific assessments to evaluate candidates
                  </p>
                </div>
              </div>
              
              {/* Enhanced Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                <div className="group bg-white/15 hover:bg-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 backdrop-blur-md border border-white/20 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500/20 rounded-lg sm:rounded-xl flex items-center justify-center border border-emerald-400/30 flex-shrink-0">
                      <Building2 className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-200 group-hover:text-emerald-100 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">{dbStats?.jobs || jobsData?.jobs?.length || 0}</div>
                      <div className="text-emerald-100 text-xs sm:text-sm font-semibold uppercase tracking-wider">Active Jobs</div>
                    </div>
                  </div>
                </div>
                
                <div className="group bg-white/15 hover:bg-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 backdrop-blur-md border border-white/20 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-500/20 rounded-lg sm:rounded-xl flex items-center justify-center border border-amber-400/30 flex-shrink-0">
                      <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-amber-200 group-hover:text-amber-100 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">{dbStats?.assessments || 0}</div>
                      <div className="text-amber-100 text-xs sm:text-sm font-semibold uppercase tracking-wider">Assessments</div>
                    </div>
                  </div>
                </div>
                
                <div className="group bg-white/15 hover:bg-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 backdrop-blur-md border border-white/20 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-rose-500/20 rounded-lg sm:rounded-xl flex items-center justify-center border border-rose-400/30 flex-shrink-0">
                      <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 text-rose-200 group-hover:text-rose-100 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">{dbStats?.responses || 0}</div>
                      <div className="text-rose-100 text-xs sm:text-sm font-semibold uppercase tracking-wider">Responses</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Job Selection Grid */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 p-4 sm:p-6 md:p-8">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Select a Job Position</h2>
            <p className="text-gray-600 text-xs sm:text-sm md:text-base">Choose a job to create or manage its assessment questions</p>
          </div>
          
          <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {jobsData?.jobs?.map((job) => (
              <JobCard 
                key={job.id} 
                job={job} 
                onSelect={() => handleJobSelect(job.id)}
              />
            ))}
          </div>

          {(!jobsData?.jobs || jobsData.jobs.length === 0) && (
            <div className="text-center py-10 sm:py-16 md:py-20">
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-lg border-4 border-white">
                <Users className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-indigo-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">No Active Jobs Found</h3>
              <p className="text-gray-600 mb-8 sm:mb-10 max-w-lg mx-auto text-sm sm:text-base md:text-lg leading-relaxed px-4">
                To create assessments, you first need active job postings. Create a job position to get started with candidate evaluation.
              </p>
              <div className="space-y-4 sm:space-y-6">
                <Link to="/jobs">
                  <Button className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 text-sm sm:text-base md:text-lg font-semibold">
                    <Plus className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                    Create Your First Job
                  </Button>
                </Link>
                <p className="text-xs sm:text-sm text-gray-500 font-medium px-4">
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-3 sm:p-4 md:p-6">
      {/* Enhanced Header */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-white shadow-2xl relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 opacity-50"></div>
          
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 md:gap-6 w-full lg:w-auto">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleBackToJobSelection}
                className="bg-white/20 border-white/40 text-white hover:bg-white/30 backdrop-blur-md px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl shadow-lg border-2 transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                <span className="font-semibold">Back to Jobs</span>
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 drop-shadow-lg">Assessment Builder</h1>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-white/20 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-white" />
                  </div>
                  <p className="text-blue-100 text-xs sm:text-sm md:text-base lg:text-xl font-medium drop-shadow">
                    <span className="hidden sm:inline">Building assessment for: </span>
                    <span className="font-bold text-white bg-white/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg">{selectedJob.title}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-2xl md:rounded-3xl items-center justify-center backdrop-blur-sm border border-white/30 shadow-lg flex-shrink-0">
              <Award className="h-8 w-8 md:h-10 md:w-10 text-white drop-shadow-lg" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 p-4 sm:p-6 md:p-8">
        {assessmentsLoading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <FileText className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-purple-600 animate-pulse" />
              </div>
              <div className="text-gray-600 text-sm sm:text-base md:text-lg">Loading assessment...</div>
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
      className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-gray-100 hover:border-gradient-to-r hover:from-purple-300 hover:to-blue-300 group relative overflow-hidden"
      onClick={onSelect}
    >
      {/* Subtle background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300 flex-shrink-0">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-base sm:text-lg md:text-xl group-hover:text-purple-600 transition-colors duration-300 truncate">{job.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">Job ID: {job.id.slice(0, 8)}</p>
              </div>
            </div>
            
            {job.tags && job.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4">
                {job.tags.slice(0, 3).map((tag) => (
                  <span 
                    key={tag}
                    className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-200 group-hover:from-purple-200 group-hover:to-blue-200 transition-colors duration-300"
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
        
        <div className="flex items-center justify-between pt-4 sm:pt-5 md:pt-6 border-t border-gray-100 group-hover:border-purple-200 transition-colors duration-300">
          <div className="flex items-center text-gray-600 group-hover:text-purple-600 transition-colors duration-300">
            <Target className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
            <span className="text-xs sm:text-sm font-semibold">Create Assessment</span>
          </div>
          <div className="text-purple-600 group-hover:text-purple-700">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  const { showToast } = useSimpleToast();

  const handleSaveAssessment = async (assessmentData: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Validate required fields
    if (!assessmentData.title || !assessmentData.jobId) {
      showToast('Please provide a title for the assessment.', 'error');
      return;
    }

    try {
      await saveAssessment(job.id, assessmentData);
      showToast(`Assessment for "${job.title}" saved successfully!`, 'success');
      // Optionally refresh the assessments data here
    } catch (error) {
      console.error('Failed to save assessment:', error);
      showToast('Failed to save assessment. Please try again.', 'error');
      throw error; // Let the AssessmentBuilder handle the error display
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <AssessmentBuilder
        job={job}
        assessment={assessment}
        onSave={handleSaveAssessment}
      />
    </div>
  );
}