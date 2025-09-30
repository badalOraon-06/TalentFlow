import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAssessments } from '../hooks/useApiDirect';
import type { Assessment, AssessmentResponse } from '../types';
import { Button } from '../components/Button';
import { AssessmentPreview } from '../components/AssessmentPreview';

export function AssessmentTakingPage() {
  const { jobId, candidateId } = useParams<{ jobId: string; candidateId: string }>();
  const navigate = useNavigate();
  const { data: assessments, loading } = useAssessments(jobId);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (assessments && assessments.length > 0) {
      setAssessment(assessments[0]);
    }
  }, [assessments]);

  const handleSubmit = async (finalResponses: Record<string, any>) => {
    if (!assessment || !candidateId) return;

    try {
      setIsSubmitting(true);
      
      await saveAssessmentResponse({
        candidateId,
        assessmentId: assessment.id,
        answers: finalResponses,
        completedAt: new Date(),
        submittedAt: new Date()
      });

      // Redirect to confirmation page or candidate profile
      navigate(`/candidates/${candidateId}`, {
        state: { message: 'Assessment submitted successfully!' }
      });
    } catch (error) {
      console.error('Failed to submit assessment:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveAssessmentResponse = async (responseData: Omit<AssessmentResponse, 'id'>) => {
    // This would normally use the API, but for now we'll use direct database access
    const response = await fetch('/api/assessments/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(responseData)
    });

    if (!response.ok) {
      throw new Error('Failed to save response');
    }

    return response.json();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Assessment</h2>
              <p className="text-gray-600">Please wait while we prepare your assessment...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-12">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="h-12 w-12 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Assessment Not Available</h3>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                The assessment for this job position is currently not available or may have been removed.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white border-none px-8 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-opacity-30 backdrop-blur-sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Exit Assessment
                </Button>
                <div>
                  <h1 className="text-3xl font-bold mb-2">Assessment in Progress</h1>
                  <p className="text-green-100 text-lg">{assessment.title}</p>
                </div>
              </div>
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            
            {/* Progress Info */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold">{assessment.sections?.length || 0}</div>
                <div className="text-green-100 text-sm">Sections</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold">
                  {assessment.sections?.reduce((total, section) => total + section.questions.length, 0) || 0}
                </div>
                <div className="text-green-100 text-sm">Questions</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold">~30</div>
                <div className="text-green-100 text-sm">Minutes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Assessment Content */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          <AssessmentPreview
            assessment={assessment}
            onSubmit={handleSubmit}
            isReadOnly={false}
            candidateMode={true}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Enhanced Footer */}
        <div className="mt-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Important Instructions</h3>
              <div className="text-sm text-gray-600 space-y-2 max-w-2xl mx-auto">
                <p>📝 Please review your answers carefully before submitting.</p>
                <p>⚠️ Once submitted, you will not be able to make changes to your responses.</p>
                <p>💾 Your progress is automatically saved as you complete each section.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component for assessment completion confirmation
export function AssessmentCompletedPage() {
  const navigate = useNavigate();
  const { candidateId } = useParams<{ candidateId: string }>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6 flex items-center justify-center">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-12 text-center">
          {/* Success Animation */}
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <CheckCircle className="h-16 w-16 text-white" />
            </div>
            {/* Celebration Particles */}
            <div className="absolute -top-4 -left-4 w-4 h-4 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="absolute -top-2 -right-6 w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
            <div className="absolute -bottom-2 -left-6 w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute -bottom-4 -right-4 w-4 h-4 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.7s'}}></div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🎉 Assessment Completed!</h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Congratulations! You have successfully completed the assessment. Your responses have been submitted and are being reviewed.
          </p>
          
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm font-semibold text-green-800">Submitted</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">👀</div>
              <div className="text-sm font-semibold text-blue-800">Under Review</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">📧</div>
              <div className="text-sm font-semibold text-purple-800">Updates Coming</div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">What happens next?</h3>
              <div className="text-left text-sm text-gray-600 space-y-2">
                <p>📋 Our team will review your assessment responses</p>
                <p>📞 You'll be contacted regarding the next steps in the hiring process</p>
                <p>📧 Check your email for updates and further instructions</p>
                <p>⏰ Response timeline: typically within 3-5 business days</p>
              </div>
            </div>
            
            <Button
              onClick={() => navigate(candidateId ? `/candidates/${candidateId}` : '/candidates')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 text-lg"
            >
              Return to Your Profile
            </Button>
            
            <p className="text-sm text-gray-500 mt-4">
              Thank you for your time and effort in completing this assessment!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}