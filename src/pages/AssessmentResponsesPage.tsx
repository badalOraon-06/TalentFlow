import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Calendar, 
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Eye
} from 'lucide-react';
import { useAssessments } from '../hooks/useApiDirect';
import type { Assessment, AssessmentResponse, Candidate } from '../types';
import { Button } from '../components/Button';

export function AssessmentResponsesPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const { data: assessments } = useAssessments(jobId);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<AssessmentResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (assessments && assessments.length > 0) {
      setAssessment(assessments[0]);
      fetchResponses(assessments[0].id);
    }
  }, [assessments]);

  const fetchResponses = async (assessmentId: string) => {
    try {
      setLoading(true);
      // Mock API call - in real app this would be a proper API endpoint
      const response = await fetch(`/api/assessments/${assessmentId}/responses`);
      const data = await response.json();
      
      if (data.success) {
        setResponses(data.responses || []);
        setCandidates(data.candidates || []);
      }
    } catch (error) {
      console.error('Failed to fetch responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompletionStatus = (response: AssessmentResponse) => {
    if (response.submittedAt) {
      return { status: 'submitted', label: 'Submitted', icon: CheckCircle, color: 'text-green-600' };
    }
    if (response.completedAt) {
      return { status: 'completed', label: 'Completed', icon: CheckCircle, color: 'text-blue-600' };
    }
    return { status: 'in-progress', label: 'In Progress', icon: Clock, color: 'text-yellow-600' };
  };

  const getCandidateInfo = (candidateId: string) => {
    return candidates.find(c => c.id === candidateId) || { 
      id: candidateId, 
      name: 'Unknown Candidate', 
      email: 'unknown@example.com' 
    };
  };

  const downloadResponses = () => {
    // Create CSV export of responses
    const csvContent = generateCSVExport();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessment-responses-${assessment?.title || 'assessment'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSVExport = () => {
    if (!assessment || !responses.length) return '';

    const headers = [
      'Candidate ID',
      'Candidate Name', 
      'Email',
      'Status',
      'Submitted At',
      ...assessment.sections.flatMap(section => 
        section.questions.map(q => `${section.title} - ${q.title}`)
      )
    ];

    const rows = responses.map(response => {
      const candidate = getCandidateInfo(response.candidateId);
      const status = getCompletionStatus(response);
      
      return [
        candidate.id,
        candidate.name,
        candidate.email || '',
        status.label,
        response.submittedAt ? new Date(response.submittedAt).toLocaleString() : '',
        ...assessment.sections.flatMap(section =>
          section.questions.map(q => {
            const answer = response.answers[q.id];
            if (Array.isArray(answer)) return answer.join('; ');
            return String(answer || '');
          })
        )
      ];
    });

    return [headers, ...rows].map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading responses...</div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No Assessment Found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create an assessment for this job to start collecting responses.
          </p>
          <div className="mt-6">
            <Link to={`/assessments?jobId=${jobId}`}>
              <Button>Create Assessment</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to={`/jobs/${jobId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Job
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Assessment Responses</h1>
              <p className="text-gray-600">{assessment.title}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={downloadResponses}
              disabled={responses.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Responses</p>
              <p className="text-xl font-semibold text-gray-900">{responses.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Submitted</p>
              <p className="text-xl font-semibold text-gray-900">
                {responses.filter(r => r.submittedAt).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-xl font-semibold text-gray-900">
                {responses.filter(r => !r.submittedAt).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <User className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Avg. Completion</p>
              <p className="text-xl font-semibold text-gray-900">
                {responses.length > 0 
                  ? Math.round((responses.filter(r => r.submittedAt).length / responses.length) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Responses List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* List Panel */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">Candidate Responses</h2>
          </div>
          
          <div className="divide-y">
            {responses.length === 0 ? (
              <div className="p-8 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No responses yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Responses will appear here as candidates complete the assessment.
                </p>
              </div>
            ) : (
              responses.map((response) => {
                const candidate = getCandidateInfo(response.candidateId);
                const status = getCompletionStatus(response);
                const StatusIcon = status.icon;
                
                return (
                  <div
                    key={response.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedResponse?.id === response.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                    onClick={() => setSelectedResponse(response)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{candidate.name}</p>
                          <p className="text-xs text-gray-500">{candidate.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={`h-4 w-4 ${status.color}`} />
                        <span className={`text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                    
                    {response.submittedAt && (
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        Submitted {new Date(response.submittedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">Response Details</h2>
          </div>
          
          <div className="p-4">
            {selectedResponse ? (
              <ResponseDetailView 
                response={selectedResponse}
                assessment={assessment}
                candidate={getCandidateInfo(selectedResponse.candidateId)}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Eye className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-sm">Select a response to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ResponseDetailViewProps {
  response: AssessmentResponse;
  assessment: Assessment;
  candidate: any;
}

function ResponseDetailView({ response, assessment, candidate }: ResponseDetailViewProps) {
  return (
    <div className="space-y-6">
      {/* Candidate Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{candidate.name}</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Email: {candidate.email}</p>
          <p>Status: {response.submittedAt ? 'Submitted' : 'In Progress'}</p>
          {response.submittedAt && (
            <p>Submitted: {new Date(response.submittedAt).toLocaleString()}</p>
          )}
        </div>
      </div>

      {/* Responses */}
      <div className="space-y-4">
        {assessment.sections.map((section) => (
          <div key={section.id} className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-medium text-gray-900 mb-3">{section.title}</h4>
            <div className="space-y-3">
              {section.questions.map((question) => {
                const answer = response.answers[question.id];
                return (
                  <div key={question.id} className="bg-gray-50 p-3 rounded">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {question.title}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </p>
                    <div className="text-sm text-gray-700">
                      {answer ? (
                        Array.isArray(answer) ? (
                          <ul className="list-disc list-inside">
                            {answer.map((item, index) => (
                              <li key={index}>{String(item)}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>{String(answer)}</p>
                        )
                      ) : (
                        <p className="text-gray-400 italic">No answer provided</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}