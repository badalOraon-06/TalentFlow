import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  DollarSign, 
  Users, 
  Calendar,
  Loader2,
  Edit3,
  Eye,
  EyeOff,
  ClipboardList,
  Plus,
  Clock,
  Building2,
  Globe,
  BookOpen,
  Award,
  Target,
  Share2,
  Copy,
  CheckCircle,
  BarChart3,
  TrendingUp,
  UserPlus,
  FileText
} from 'lucide-react';
import { useJobs, useUpdateJob } from '../hooks/useApiDirect';
import { useAssessments } from '../hooks/useApiDirect';
import { JobFormModal } from '../components';
import { Badge } from '../components/Badge';
import { useSimpleToast } from '../components/SimpleToast';
import type { Job } from '../types';

export function JobDetail() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Use the jobs hook to get data
  const { data: jobsData, refetch } = useJobs({ page: 1, pageSize: 100 });
  
  // Use the assessments hook to get assessment data
  const { data: assessments } = useAssessments(jobId);
  
  // Use the update job hook for archive functionality
  const updateJobHook = useUpdateJob();
  const { showToast } = useSimpleToast();

  useEffect(() => {
    if (!jobId) {
      setError('No job ID provided');
      setLoading(false);
      return;
    }

    if (jobsData?.jobs) {
      const foundJob = jobsData.jobs.find(j => j.id === jobId);
      if (foundJob) {
        setJob(foundJob);
      } else {
        setError('Job not found');
      }
      setLoading(false);
    }
  }, [jobId, jobsData]);

  const handleArchiveToggle = async () => {
    if (!job) return;

    console.log('🔄 JobDetail Archive Toggle: Starting for job:', { id: job.id, title: job.title, currentStatus: job.status });

    try {
      const newStatus = job.status === 'active' ? 'archived' : 'active';
      console.log('🔄 JobDetail Archive Toggle: New status will be:', newStatus);
      
      // Update the job status optimistically
      setJob(prev => prev ? { ...prev, status: newStatus } : null);
      
      console.log('🔄 JobDetail Archive Toggle: Calling updateJob API...');
      const updatedJob = await updateJobHook.updateJob(job.id, { status: newStatus });
      console.log('✅ JobDetail Archive Toggle: API call successful, updated job:', updatedJob);
      
      // Refetch to sync with database
      console.log('🔄 JobDetail Archive Toggle: Refreshing data...');
      await refetch();
      
      console.log('✅ JobDetail Archive Toggle: Showing success toast');
      showToast(`Job "${job.title}" ${newStatus === 'archived' ? 'archived' : 'restored'} successfully`, 'success');
    } catch (error) {
      console.error('❌ JobDetail Archive Toggle: Failed to toggle job status:', error);
      // Revert optimistic update
      setJob(prev => prev ? { ...prev, status: prev.status === 'archived' ? 'active' : 'archived' } : null);
      showToast('Failed to update job status', 'error');
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    refetch();
  };

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="card p-6">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error || 'Job not found'}</span>
          </div>
          <Link to="/jobs" className="btn btn-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const formatSalary = (salaryRange?: { min: number; max: number; currency: string }) => {
    if (!salaryRange) return 'Salary not specified';
    
    const formatNumber = (num: number) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
      return num.toString();
    };
    return `${salaryRange.currency}${formatNumber(salaryRange.min)} - ${salaryRange.currency}${formatNumber(salaryRange.max)}`;
  };

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800'
  };

  return (
    <>
      {/* Enhanced Header with Breadcrumb */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Link to="/jobs" className="hover:text-blue-600 transition-colors">Jobs</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{job.title}</span>
          </nav>
          
          <button 
            onClick={() => navigate('/jobs')}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Hero Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8">
          {/* Company Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-lg">TalentFlow Corp</h2>
                  <p className="text-blue-100 text-sm">Technology • 500-1000 employees</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="flex items-center px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
                  title="Share Job"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Job Title & Meta */}
          <div className="px-8 py-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                  <Badge 
                    variant={job.status === 'active' ? 'success' : 'secondary'}
                    className={`${statusColors[job.status]} px-3 py-1 text-sm font-medium`}
                  >
                    {job.status === 'active' ? (
                      <><CheckCircle className="w-3 h-3 mr-1" /> Active</>
                    ) : (
                      'Archived'
                    )}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  {job.location && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{job.location}</p>
                        <p className="text-xs text-gray-500">Location</p>
                      </div>
                    </div>
                  )}
                  {job.salaryRange && (
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{formatSalary(job.salaryRange)}</p>
                        <p className="text-xs text-gray-500">Salary Range</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-2 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Full-time</p>
                      <p className="text-xs text-gray-500">Job Type</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Globe className="h-5 w-5 mr-2 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Remote OK</p>
                      <p className="text-xs text-gray-500">Work Style</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                  {job.updatedAt !== job.createdAt && (
                    <div className="flex items-center">
                      <span>•</span>
                      <span className="ml-1">Updated {new Date(job.updatedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <span>•</span>
                    <Users className="h-4 w-4 ml-1 mr-1" />
                    <span>12 applicants</span>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Actions */}
              <div className="flex items-center gap-3 ml-6">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                  title="Edit Job"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Job
                </button>
                
                <button
                  onClick={() => {
                    console.log('🎯 JobDetail Archive Button: Clicked for job:', { id: job.id, title: job.title, status: job.status });
                    console.log('🎯 JobDetail Archive Button: updateJobHook.loading:', updateJobHook.loading);
                    if (!updateJobHook.loading) {
                      handleArchiveToggle();
                    } else {
                      console.log('⚠️ JobDetail Archive Button: Blocked due to loading state');
                    }
                  }}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors shadow-sm ${
                    updateJobHook.loading 
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : job.status === 'archived' 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  title={job.status === 'archived' ? 'Unarchive Job' : 'Archive Job'}
                  disabled={updateJobHook.loading}
                >
                  {updateJobHook.loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {job.status === 'archived' ? 'Unarchiving...' : 'Archiving...'}
                    </>
                  ) : job.status === 'archived' ? (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Unarchive
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Archive
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Description */}
            {job.description && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center mb-6">
                  <BookOpen className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900">Job Description</h3>
                </div>
                <div className="prose prose-gray max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-6">
                    {job.description}
                  </div>
                </div>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center mb-6">
                  <Target className="h-6 w-6 text-green-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900">Requirements</h3>
                </div>
                <div className="space-y-3">
                  {job.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 leading-relaxed">{requirement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills & Tags */}
            {job.tags && job.tags.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center mb-6">
                  <Award className="h-6 w-6 text-purple-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900">Required Skills</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {job.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Application Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <BarChart3 className="h-6 w-6 text-indigo-600 mr-3" />
                <h3 className="text-lg font-bold text-gray-900">Application Statistics</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Total Applications</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">12</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <ClipboardList className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">In Review</span>
                  </div>
                  <span className="text-lg font-bold text-yellow-600">8</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <UserPlus className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Interviews</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">3</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Hired</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">1</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                  <span>25% increase from last week</span>
                </div>
              </div>
            </div>

            {/* Job Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <FileText className="h-6 w-6 text-gray-600 mr-3" />
                <h3 className="text-lg font-bold text-gray-900">Job Details</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Job ID</span>
                  <span className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">{job.id}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">URL Slug</span>
                  <span className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">{job.slug}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Status</span>
                  <Badge variant={job.status === 'active' ? 'success' : 'secondary'}>
                    {job.status}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Priority Order</span>
                  <span className="text-sm font-bold text-gray-900">#{job.order}</span>
                </div>
                
                {job.salaryRange && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-500">Salary Range</span>
                    <span className="text-sm font-bold text-green-600">{formatSalary(job.salaryRange)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Assessment Section - preserved from original */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <ClipboardList className="h-6 w-6 text-purple-600 mr-3" />
                <h3 className="text-lg font-bold text-gray-900">Assessment</h3>
              </div>
              {assessments && assessments.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{assessments[0].title}</p>
                      <p className="text-xs text-gray-500">
                        {assessments[0].sections.length} sections, {' '}
                        {assessments[0].sections.reduce((total, section) => total + section.questions.length, 0)} questions
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      <ClipboardList className="h-4 w-4" />
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link 
                      to={`/assessments?jobId=${job.id}`}
                      className="flex-1 btn btn-secondary text-xs"
                    >
                      Edit Assessment
                    </Link>
                    <Link 
                      to={`/assessments/responses/${job.id}`}
                      className="flex-1 btn btn-outline text-xs"
                    >
                      View Responses
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <ClipboardList className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-3">No assessment created yet</p>
                  <Link 
                    to={`/assessments?jobId=${job.id}`}
                    className="btn btn-primary text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Create Assessment
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <Plus className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
              </div>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-sm">
                  <Users className="h-4 w-4 mr-2" />
                  View All Applications
                </button>
                
                <button className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Job Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <JobFormModal
          isOpen={showEditModal}
          job={job}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}