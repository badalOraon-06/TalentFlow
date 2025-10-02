import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  Clock,
  ChevronRight,
  MapPin,
  Briefcase,
  GraduationCap,
  DollarSign,
  Link as LinkIcon,
  Github,
  ExternalLink,
  Target,
  Home,
  Globe,
  Award,
  Building
} from 'lucide-react';
import { useCandidate, useUpdateCandidate } from '../hooks/useApiDirect';
import { dbOperations } from '../lib/database';
import { Button, NotesComponent } from '../components';
import type { CandidateTimelineEvent, CandidateStage, Note } from '../types';

export function CandidateProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const candidateId = id; // Use id from route params
  const { data: candidate, loading, error, refetch } = useCandidate(candidateId);
  const { updateCandidate } = useUpdateCandidate();
  const [timeline, setTimeline] = useState<CandidateTimelineEvent[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  // Refresh data function
  const refreshData = async () => {
    if (candidateId) {
      await refetch();
      await fetchTimeline();
    }
  };

  // Fetch timeline data
  const fetchTimeline = async () => {
    if (!candidateId) return;

    try {
      setTimelineLoading(true);
      const events = await dbOperations.getCandidateTimeline(candidateId);
      setTimeline(events);
    } catch (err) {
      console.error('Failed to fetch timeline:', err);
    } finally {
      setTimelineLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [candidateId]);

  // Handle adding notes
  const handleAddNote = async (content: string, mentions: string[]) => {
    if (!candidate) return;

    const newNote: Note = {
      id: crypto.randomUUID(),
      content,
      author: 'Current User', // In a real app, this would come from auth
      createdAt: new Date(),
      mentions
    };

    const updatedNotes = [...(candidate.notes || []), newNote];
    
    try {
      await updateCandidate(candidate.id, { notes: updatedNotes });
      
      // Add timeline event
      await dbOperations.addTimelineEvent({
        candidateId: candidate.id,
        type: 'note_added',
        data: { note: newNote }
      });
      
      await refreshData();
    } catch (error) {
      console.error('Failed to add note:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card p-6">
          <div className="animate-pulse">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-64"></div>
              </div>
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {error ? 'Error Loading Candidate' : 'Candidate Not Found'}
            </h2>
            <p className="text-gray-600 mb-4">
              {error || 'The candidate you are looking for does not exist.'}
            </p>
            <Button onClick={() => navigate('/candidates')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Candidates
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Enhanced Header with navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/candidates')}
              className="!px-3 !py-2 text-gray-600 hover:text-gray-900 border-gray-200 hover:border-gray-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Candidates
            </Button>
            <div className="h-6 w-px bg-gray-200"></div>
            <nav className="flex items-center space-x-2 text-sm">
              <Link to="/candidates" className="text-gray-500 hover:text-blue-600 transition-colors font-medium">
                Candidates
              </Link>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900 font-semibold">{candidate.name}</span>
            </nav>
          </div>
        </div>
      </div>

      {/* Enhanced main candidate info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Background */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 sm:px-8 py-6">
          <div className="flex items-start justify-between">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg">
                  {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2">
                  <CandidateStageBadge stage={candidate.stage} />
                </div>
              </div>
              <div className="space-y-3 flex-1">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{candidate.name}</h1>
                  <p className="text-base sm:text-lg text-gray-600">Candidate Profile</p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-gray-700">
                  <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-lg px-3 py-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <a href={`mailto:${candidate.email}`} className="hover:text-blue-600 transition-colors font-medium text-sm sm:text-base">
                      {candidate.email}
                    </a>
                  </div>
                  {candidate.phone && (
                    <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-lg px-3 py-2">
                      <Phone className="h-4 w-4 text-green-600" />
                      <a href={`tel:${candidate.phone}`} className="hover:text-green-600 transition-colors font-medium text-sm sm:text-base">
                        {candidate.phone}
                      </a>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Applied on {new Date(candidate.appliedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick info grid */}
        <div className="px-4 sm:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Applied Date</p>
                  <p className="text-sm text-gray-600">
                    {new Date(candidate.appliedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Last Updated</p>
                  <p className="text-sm text-gray-600">
                    {new Date(candidate.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            {candidate.resumeUrl && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Resume</p>
                    <a 
                      href={candidate.resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      View Resume →
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Candidate Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Professional Information */}
        <div className="card p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Briefcase className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Professional Information</h2>
          </div>
          
          <div className="space-y-4">
            {candidate.location && (
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Location</p>
                  <p className="text-sm text-gray-900">{candidate.location}</p>
                </div>
              </div>
            )}
            
            {candidate.summary && (
              <div className="flex items-start space-x-3">
                <FileText className="h-4 w-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Professional Summary</p>
                  <p className="text-sm text-gray-900 leading-relaxed">{candidate.summary}</p>
                </div>
              </div>
            )}
            
            {candidate.experienceLevel && (
              <div className="flex items-start space-x-3">
                <Target className="h-4 w-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Experience Level</p>
                  <p className="text-sm text-gray-900 capitalize">{candidate.experienceLevel}</p>
                </div>
              </div>
            )}
            
            {candidate.yearsOfExperience && (
              <div className="flex items-start space-x-3">
                <Award className="h-4 w-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Years of Experience</p>
                  <p className="text-sm text-gray-900">{candidate.yearsOfExperience} years</p>
                </div>
              </div>
            )}
            
            {candidate.skills && candidate.skills.length > 0 && (
              <div className="flex items-start space-x-3">
                <Globe className="h-4 w-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact & Links */}
        <div className="card p-6">
          <div className="flex items-center space-x-2 mb-4">
            <LinkIcon className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Contact & Links</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Mail className="h-4 w-4 text-gray-400 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-700">Email</p>
                <a href={`mailto:${candidate.email}`} className="text-sm text-blue-600 hover:text-blue-800">
                  {candidate.email}
                </a>
              </div>
            </div>
            
            {candidate.phone && (
              <div className="flex items-start space-x-3">
                <Phone className="h-4 w-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone</p>
                  <a href={`tel:${candidate.phone}`} className="text-sm text-blue-600 hover:text-blue-800">
                    {candidate.phone}
                  </a>
                </div>
              </div>
            )}
            
            {candidate.linkedinUrl && (
              <div className="flex items-start space-x-3">
                <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center mt-1">
                  <span className="text-white text-xs font-bold">in</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">LinkedIn</p>
                  <a 
                    href={candidate.linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View Profile
                  </a>
                </div>
              </div>
            )}
            
            {candidate.githubUrl && (
              <div className="flex items-start space-x-3">
                <Github className="h-4 w-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-700">GitHub</p>
                  <a 
                    href={candidate.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View Repository
                  </a>
                </div>
              </div>
            )}
            
            {candidate.portfolioUrl && (
              <div className="flex items-start space-x-3">
                <ExternalLink className="h-4 w-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Portfolio</p>
                  <a 
                    href={candidate.portfolioUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View Portfolio
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Education & Experience */}
      {((candidate.education && candidate.education.length > 0) || (candidate.workExperience && candidate.workExperience.length > 0)) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 bg-purple-100 rounded-lg">
              <GraduationCap className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Education & Experience</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Education */}
            {candidate.education && candidate.education.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                  <div className="p-1.5 bg-blue-100 rounded-lg mr-3">
                    <GraduationCap className="h-4 w-4 text-blue-600" />
                  </div>
                  Education
                </h3>
                <div className="space-y-6">
                  {candidate.education.map((edu, index) => (
                    <div key={index} className="relative">
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
                        <div className="flex items-start space-x-4">
                          <div className="p-2 bg-blue-500 rounded-lg">
                            <GraduationCap className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-lg">{edu.degree}</h4>
                            <p className="text-blue-700 font-medium mt-1">{edu.institution}</p>
                            {edu.field && (
                              <p className="text-gray-600 mt-2">
                                <span className="font-medium">Field:</span> {edu.field}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 mt-3">
                              {edu.graduationYear && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/80 text-gray-700 border border-gray-200">
                                  📅 {edu.graduationYear}
                                </span>
                              )}
                              {edu.gpa && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/80 text-gray-700 border border-gray-200">
                                  🎯 GPA: {edu.gpa}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Work Experience */}
            {candidate.workExperience && candidate.workExperience.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                  <div className="p-1.5 bg-green-100 rounded-lg mr-3">
                    <Building className="h-4 w-4 text-green-600" />
                  </div>
                  Work Experience
                </h3>
                <div className="space-y-6">
                  {candidate.workExperience.map((work, index) => (
                    <div key={index} className="relative">
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-100">
                        <div className="flex items-start space-x-4">
                          <div className="p-2 bg-green-500 rounded-lg">
                            <Building className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-lg">{work.position}</h4>
                            <p className="text-green-700 font-medium mt-1">{work.company}</p>
                            <div className="flex items-center space-x-4 mt-3">
                              {work.startDate && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/80 text-gray-700 border border-gray-200">
                                  📅 {work.startDate}
                                </span>
                              )}
                              {work.endDate && !work.current && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/80 text-gray-700 border border-gray-200">
                                  ➡️ {work.endDate}
                                </span>
                              )}
                              {work.current && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                  ✨ Current Position
                                </span>
                              )}
                            </div>
                            {work.description && (
                              <p className="text-gray-700 mt-4 leading-relaxed">{work.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compensation & Availability */}
      {(candidate.salaryExpectation || candidate.noticePeriod || candidate.availableStartDate || candidate.preferredWorkType) && (
        <div className="card p-6">
          <div className="flex items-center space-x-2 mb-4">
            <DollarSign className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-gray-900">Compensation & Availability</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {candidate.salaryExpectation && (
              <div className="flex items-start space-x-3">
                <DollarSign className="h-4 w-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Salary Expectation</p>
                  <p className="text-sm text-gray-900">
                    {candidate.salaryExpectation.min && candidate.salaryExpectation.max
                      ? `${candidate.salaryExpectation.currency} ${candidate.salaryExpectation.min.toLocaleString()} - ${candidate.salaryExpectation.max.toLocaleString()}`
                      : candidate.salaryExpectation.min
                        ? `${candidate.salaryExpectation.currency} ${candidate.salaryExpectation.min.toLocaleString()}+`
                        : candidate.salaryExpectation.max
                          ? `Up to ${candidate.salaryExpectation.currency} ${candidate.salaryExpectation.max.toLocaleString()}`
                          : 'Not specified'
                    }
                  </p>
                  {candidate.salaryExpectation.negotiable && (
                    <p className="text-xs text-green-600">Negotiable</p>
                  )}
                </div>
              </div>
            )}
            
            {candidate.noticePeriod && (
              <div className="flex items-start space-x-3">
                <Clock className="h-4 w-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Notice Period</p>
                  <p className="text-sm text-gray-900">{candidate.noticePeriod}</p>
                </div>
              </div>
            )}
            
            {candidate.availableStartDate && (
              <div className="flex items-start space-x-3">
                <Calendar className="h-4 w-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Available From</p>
                  <p className="text-sm text-gray-900">
                    {new Date(candidate.availableStartDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
            
            {candidate.preferredWorkType && (
              <div className="flex items-start space-x-3">
                <Home className="h-4 w-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Work Preference</p>
                  <p className="text-sm text-gray-900 capitalize">{candidate.preferredWorkType}</p>
                </div>
              </div>
            )}
          </div>
          
          {(candidate.willingToRelocate !== undefined || candidate.hasWorkPermit !== undefined) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-6 text-sm">
                {candidate.willingToRelocate !== undefined && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">Willing to relocate:</span>
                    <span className={`font-medium ${candidate.willingToRelocate ? 'text-green-600' : 'text-red-600'}`}>
                      {candidate.willingToRelocate ? 'Yes' : 'No'}
                    </span>
                  </div>
                )}
                {candidate.hasWorkPermit !== undefined && (
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">Work permit:</span>
                    <span className={`font-medium ${candidate.hasWorkPermit ? 'text-green-600' : 'text-red-600'}`}>
                      {candidate.hasWorkPermit ? 'Yes' : 'No'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Notes section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <NotesComponent 
          notes={candidate.notes || []}
          onAddNote={handleAddNote}
        />
      </div>

      {/* Enhanced Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Clock className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Activity Timeline</h2>
        </div>
        {timelineLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse flex space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EnhancedTimelineView events={timeline} />
        )}
      </div>

    </div>
  );
}

// Enhanced stage badge component
function CandidateStageBadge({ stage }: { stage: CandidateStage }) {
  const stageConfig = {
    applied: { 
      color: 'bg-blue-100 text-blue-800 border border-blue-200', 
      label: 'Applied',
      icon: '📝'
    },
    screen: { 
      color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', 
      label: 'Screening',
      icon: '🔍'
    },
    tech: { 
      color: 'bg-purple-100 text-purple-800 border border-purple-200', 
      label: 'Technical',
      icon: '💻'
    },
    offer: { 
      color: 'bg-green-100 text-green-800 border border-green-200', 
      label: 'Offer',
      icon: '📄'
    },
    hired: { 
      color: 'bg-emerald-100 text-emerald-800 border border-emerald-200', 
      label: 'Hired',
      icon: '🎉'
    },
    rejected: { 
      color: 'bg-red-100 text-red-800 border border-red-200', 
      label: 'Rejected',
      icon: '❌'
    }
  };

  const config = stageConfig[stage] || { 
    color: 'bg-gray-100 text-gray-800 border border-gray-200', 
    label: stage || 'Unknown',
    icon: '❓'
  };
  
  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-semibold ${config.color} shadow-sm`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </div>
  );
}

// Enhanced Timeline component
function EnhancedTimelineView({ events }: { events: CandidateTimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Clock className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg font-medium">No timeline events yet</p>
        <p className="text-gray-400 text-sm mt-1">Activity will appear here as it happens</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {events.map((event, index) => (
        <EnhancedTimelineEvent key={event.id} event={event} isLast={index === events.length - 1} />
      ))}
    </div>
  );
}

function EnhancedTimelineEvent({ event, isLast }: { event: CandidateTimelineEvent; isLast: boolean }) {
  const getEventData = () => {
    switch (event.type) {
      case 'stage_change':
        return {
          description: event.data.from && event.data.to 
            ? `Stage changed from ${event.data.from} to ${event.data.to}`
            : `Stage set to ${event.data.to}`,
          icon: '🔄',
          bgColor: 'bg-blue-500',
          borderColor: 'border-blue-200'
        };
      case 'note_added':
        return {
          description: `Note added: ${event.data.note?.content?.substring(0, 100)}${event.data.note?.content && event.data.note.content.length > 100 ? '...' : ''}`,
          icon: '💬',
          bgColor: 'bg-green-500',
          borderColor: 'border-green-200'
        };
      case 'assessment_completed':
        return {
          description: 'Assessment completed',
          icon: '📝',
          bgColor: 'bg-purple-500',
          borderColor: 'border-purple-200'
        };
      default:
        return {
          description: 'Activity recorded',
          icon: '📋',
          bgColor: 'bg-gray-500',
          borderColor: 'border-gray-200'
        };
    }
  };

  const eventData = getEventData();

  return (
    <div className="flex items-start space-x-4">
      <div className="flex flex-col items-center">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${eventData.bgColor} text-white shadow-lg`}>
          <span className="text-lg">{eventData.icon}</span>
        </div>
        {!isLast && (
          <div className="w-px h-8 bg-gradient-to-b from-gray-300 to-gray-100 mt-2"></div>
        )}
      </div>
      <div className={`flex-1 bg-gray-50 rounded-lg p-4 border ${eventData.borderColor}`}>
        <p className="font-medium text-gray-900 mb-2">{eventData.description}</p>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>
            {new Date(event.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
