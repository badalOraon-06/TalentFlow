import { useState, useEffect } from 'react';
import { Save, Eye, Play, Building2, AlertTriangle } from 'lucide-react';
import type { Assessment, AssessmentSection, Job } from '../types';
import { Button } from './Button';
import { SectionBuilder, NewSectionButton } from './SectionBuilder';
import { AssessmentPreview } from './AssessmentPreview';

interface AssessmentBuilderProps {
  job: Job;
  assessment: Assessment | null;
  onSave: (assessment: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  showPreview?: boolean;
}

export function AssessmentBuilder({ job, assessment, onSave, showPreview = true }: AssessmentBuilderProps) {
  const [currentAssessment, setCurrentAssessment] = useState<Partial<Assessment>>({
    jobId: job.id,
    title: `${job.title} Assessment`,
    description: `Technical assessment for the ${job.title} position. Please answer all questions to the best of your ability.`,
    sections: []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(showPreview);
  const [previewMode, setPreviewMode] = useState<'read-only' | 'interactive'>('interactive');

  // Load existing assessment
  useEffect(() => {
    if (assessment) {
      setCurrentAssessment(assessment);
      setHasUnsavedChanges(false);
    }
  }, [assessment]);

  // Track changes
  useEffect(() => {
    if (assessment) {
      const hasChanges = JSON.stringify(assessment) !== JSON.stringify(currentAssessment);
      setHasUnsavedChanges(hasChanges);
    } else {
      setHasUnsavedChanges((currentAssessment.sections?.length || 0) > 0);
    }
  }, [currentAssessment, assessment]);

  const handleAssessmentUpdate = (field: string, value: any) => {
    setCurrentAssessment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSectionAdd = () => {
    const newSection: AssessmentSection = {
      id: crypto.randomUUID(),
      title: `Section ${(currentAssessment.sections?.length || 0) + 1}`,
      description: '',
      order: (currentAssessment.sections?.length || 0) + 1,
      questions: []
    };

    setCurrentAssessment(prev => ({
      ...prev,
      sections: [...(prev.sections || []), newSection]
    }));
  };

  const handleSectionUpdate = (sectionIndex: number, updatedSection: AssessmentSection) => {
    setCurrentAssessment(prev => ({
      ...prev,
      sections: prev.sections?.map((section, index) => 
        index === sectionIndex ? updatedSection : section
      ) || []
    }));
  };

  const handleSectionDelete = (sectionIndex: number) => {
    setCurrentAssessment(prev => ({
      ...prev,
      sections: prev.sections?.filter((_, index) => index !== sectionIndex) || []
    }));
  };

  const handleSectionDuplicate = (sectionIndex: number) => {
    const sectionToDuplicate = currentAssessment.sections?.[sectionIndex];
    if (!sectionToDuplicate) return;

    const duplicatedSection: AssessmentSection = {
      ...sectionToDuplicate,
      id: crypto.randomUUID(),
      title: `${sectionToDuplicate.title} (Copy)`,
      order: (currentAssessment.sections?.length || 0) + 1,
      questions: sectionToDuplicate.questions.map(question => ({
        ...question,
        id: crypto.randomUUID()
      }))
    };

    setCurrentAssessment(prev => ({
      ...prev,
      sections: [...(prev.sections || []), duplicatedSection]
    }));
  };

  const handlePreviewSubmit = async (responses: Record<string, any>) => {
    console.log('🧪 Preview Test Submission:', responses);
    
    // Show success message for testing
    alert(`Assessment test completed!\n\nResponses received for ${Object.keys(responses).length} questions.\n\nThis is a preview - no data was actually saved.`);
  };

  const handleSave = async () => {
    if (!currentAssessment.title || !currentAssessment.jobId) {
      return;
    }

    try {
      setIsSaving(true);
      await onSave({
        jobId: currentAssessment.jobId,
        title: currentAssessment.title,
        description: currentAssessment.description || '',
        sections: currentAssessment.sections || []
      });
      setHasUnsavedChanges(false);
      
      // Success will be handled by parent component
    } catch (error) {
      console.error('Failed to save assessment:', error);
      // Error will be handled by parent component
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const totalQuestions = currentAssessment.sections?.reduce(
    (total, section) => total + section.questions.length, 
    0
  ) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm mb-4 sm:mb-6 md:mb-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
              <div className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Assessment Builder
                </h1>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 mt-0.5 sm:mt-1 truncate">
                  <span className="hidden sm:inline">Creating assessment for: </span>
                  <span className="font-semibold text-blue-600">{job.title}</span>
                </p>
              </div>
            </div>
            
            {/* Enhanced Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
              <Button 
                variant="outline" 
                onClick={() => setShowLivePreview(!showLivePreview)}
                className="bg-white hover:bg-gray-50 border-gray-300 shadow-sm transition-all duration-200 flex-1 lg:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm"
              >
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{showLivePreview ? 'Back to Editor' : 'Show Preview'}</span>
                <span className="sm:hidden">{showLivePreview ? 'Editor' : 'Preview'}</span>
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-200 transform hover:scale-105 flex-1 lg:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm"
              >
                <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent mr-1 sm:mr-2"></div>
                    <span className="hidden sm:inline">Saving...</span>
                    <span className="sm:hidden">Save...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Save Assessment</span>
                    <span className="sm:hidden">Save</span>
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Enhanced Status Indicator */}
          {hasUnsavedChanges && (
            <div className="mt-3 sm:mt-4 flex items-center px-3 sm:px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600 mr-2 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-amber-800 font-medium">You have unsaved changes</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
        {/* Builder Panel - Only show when preview is hidden */}
        {!showLivePreview && (
          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            {/* Enhanced Assessment Details Card */}
            <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold text-white flex items-center">
                  <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                  Assessment Details
                </h2>
              </div>
              
              <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                      Assessment Title
                    </label>
                    <input
                      type="text"
                      value={currentAssessment.title || ''}
                      onChange={(e) => handleAssessmentUpdate('title', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                      placeholder="Enter assessment title..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                    Description & Instructions
                  </label>
                  <textarea
                    value={currentAssessment.description || ''}
                    onChange={(e) => handleAssessmentUpdate('description', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    rows={4}
                    placeholder="Describe the assessment and provide instructions to candidates..."
                  />
                </div>

                {/* Enhanced Statistics Bar */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                    <div className="text-xs sm:text-sm font-medium text-gray-700">
                      Assessment Progress
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm">
                      <div className="flex items-center">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full mr-1.5 sm:mr-2"></div>
                        <span className="text-gray-600">{currentAssessment.sections?.length || 0} sections</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full mr-1.5 sm:mr-2"></div>
                        <span className="text-gray-600">{totalQuestions} questions</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-3 sm:space-y-4">
              {currentAssessment.sections?.map((section, index) => (
                <SectionBuilder
                  key={section.id}
                  section={section}
                  onUpdate={(updatedSection) => handleSectionUpdate(index, updatedSection)}
                  onDelete={() => handleSectionDelete(index)}
                  onDuplicate={() => handleSectionDuplicate(index)}
                />
              ))}

              <NewSectionButton onAddSection={handleSectionAdd} />

              {(!currentAssessment.sections || currentAssessment.sections.length === 0) && (
                <div className="text-center py-8 sm:py-10 md:py-12 bg-white rounded-lg border border-dashed border-gray-300 px-3">
                  <div className="text-gray-500">
                    <Play className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Start Building Your Assessment</h3>
                    <p className="text-xs sm:text-sm mb-3 sm:mb-4">
                      Create sections to organize your questions by topic or skill area.
                    </p>
                    <NewSectionButton onAddSection={handleSectionAdd} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Live Preview Panel - Only show when preview is enabled */}
        {showLivePreview && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-teal-600 px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <h2 className="text-base sm:text-lg md:text-xl font-semibold text-white flex items-center">
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                    Live Preview
                  </h2>
                  
                  {/* Enhanced Preview Mode Toggle */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs sm:text-sm text-green-100">Mode:</span>
                    <div className="flex items-center gap-1 bg-white/20 p-1 rounded-lg backdrop-blur-sm flex-1 sm:flex-none">
                      <button
                        onClick={() => setPreviewMode('read-only')}
                        className={`flex-1 sm:flex-none px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                          previewMode === 'read-only' 
                            ? 'bg-white text-green-600 shadow-md' 
                            : 'text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Eye className="h-3 w-3 mr-1 inline" />
                        <span className="hidden sm:inline">View Only</span>
                        <span className="sm:hidden">View</span>
                      </button>
                      <button
                        onClick={() => setPreviewMode('interactive')}
                        className={`flex-1 sm:flex-none px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                          previewMode === 'interactive' 
                            ? 'bg-white text-green-600 shadow-md' 
                            : 'text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Play className="h-3 w-3 mr-1 inline" />
                        <span className="hidden sm:inline">Test Mode</span>
                        <span className="sm:hidden">Test</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-3 sm:p-4 md:p-6">
                {currentAssessment.title && currentAssessment.sections && currentAssessment.sections.length > 0 ? (
                  <div>
                    {/* Mode indicator */}
                    {previewMode === 'interactive' && (
                      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                        <p className="text-xs sm:text-sm text-blue-800 flex items-start sm:items-center">
                          <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0 mt-0.5 sm:mt-0" />
                          <span>
                            <strong>Test Mode:</strong> You can fill out this assessment to test the candidate experience. 
                            Your responses will not be saved.
                          </span>
                        </p>
                      </div>
                    )}
                    
                    <div className="border-2 border-dashed border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 max-h-[600px] sm:max-h-[800px] overflow-y-auto bg-gray-50/50">
                      <AssessmentPreview
                        assessment={{
                          id: 'preview',
                          jobId: currentAssessment.jobId!,
                          title: currentAssessment.title,
                          description: currentAssessment.description || '',
                          sections: currentAssessment.sections,
                          createdAt: new Date(),
                          updatedAt: new Date()
                        }}
                        isReadOnly={previewMode === 'read-only'}
                        candidateMode={previewMode === 'interactive'}
                        onSubmit={previewMode === 'interactive' ? handlePreviewSubmit : undefined}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-10 md:py-12 text-gray-500 px-3">
                    <Eye className="mx-auto h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-gray-400 mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Preview Coming Soon</h3>
                    <p className="text-xs sm:text-sm mb-1">Preview will appear here as you build your assessment</p>
                    <p className="text-xs">Add a title and some questions to see the preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
