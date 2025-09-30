import { useState } from 'react';
import { CheckCircle, AlertCircle, Upload } from 'lucide-react';
import type { Assessment, Question, AssessmentSection } from '../types';
import { Button } from './Button';

interface AssessmentPreviewProps {
  assessment: Assessment;
  onSubmit?: (responses: Record<string, any>) => Promise<void>;
  isReadOnly?: boolean;
  candidateMode?: boolean;
  isSubmitting?: boolean;
}

export function AssessmentPreview({ 
  assessment, 
  onSubmit, 
  isReadOnly = true, 
  candidateMode = false,
  isSubmitting: externalIsSubmitting = false
}: AssessmentPreviewProps) {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const actualIsSubmitting = externalIsSubmitting || isSubmitting;

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Clear validation error when user responds
    if (validationErrors[questionId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateResponses = (): boolean => {
    const errors: Record<string, string> = {};
    
    assessment.sections.forEach(section => {
      section.questions.forEach(question => {
        if (question.required) {
          const response = responses[question.id];
          
          if (!response || (Array.isArray(response) && response.length === 0) || response === '') {
            errors[question.id] = 'This question is required';
          }
        }
        
        // Type-specific validation
        if (responses[question.id] !== undefined && responses[question.id] !== '') {
          const error = validateQuestionResponse(question, responses[question.id]);
          if (error) {
            errors[question.id] = error;
          }
        }
      });
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!onSubmit || isReadOnly) return;
    
    if (!validateResponses()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit(responses);
    } catch (error) {
      console.error('Failed to submit assessment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Assessment Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">{assessment.title}</h1>
        {assessment.description && (
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">{assessment.description}</p>
        )}
        
        {candidateMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Instructions:</p>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li>Please answer all required questions marked with *</li>
                  <li>You can save your progress and return later</li>
                  <li>Review your answers before final submission</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Assessment Sections */}
      <div className="space-y-8">
        {assessment.sections.map((section, sectionIndex) => (
          <AssessmentSectionPreview
            key={section.id}
            section={section}
            sectionIndex={sectionIndex}
            responses={responses}
            validationErrors={validationErrors}
            onResponseChange={handleResponseChange}
            isReadOnly={isReadOnly}
          />
        ))}
      </div>

      {/* Submit Button for Candidate Mode */}
      {candidateMode && onSubmit && !isReadOnly && (
        <div className="border-t pt-8">
          <div className="text-center space-y-4">
            <div className="text-sm text-gray-600">
              {getCompletionStats(assessment, responses)}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={actualIsSubmitting}
              size="lg"
            >
              {actualIsSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Submit Assessment
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface AssessmentSectionPreviewProps {
  section: AssessmentSection;
  sectionIndex: number;
  responses: Record<string, any>;
  validationErrors: Record<string, string>;
  onResponseChange: (questionId: string, value: any) => void;
  isReadOnly: boolean;
}

function AssessmentSectionPreview({
  section,
  sectionIndex,
  responses,
  validationErrors,
  onResponseChange,
  isReadOnly
}: AssessmentSectionPreviewProps) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {sectionIndex + 1}. {section.title}
        </h2>
        {section.description && (
          <p className="text-gray-600 mt-2">{section.description}</p>
        )}
      </div>

      <div className="space-y-6">
        {section.questions.map((question, questionIndex) => (
          <QuestionPreview
            key={question.id}
            question={question}
            questionNumber={`${sectionIndex + 1}.${questionIndex + 1}`}
            value={responses[question.id]}
            error={validationErrors[question.id]}
            onChange={(value) => onResponseChange(question.id, value)}
            isReadOnly={isReadOnly}
          />
        ))}
      </div>
    </div>
  );
}

interface QuestionPreviewProps {
  question: Question;
  questionNumber: string;
  value: any;
  error?: string;
  onChange: (value: any) => void;
  isReadOnly: boolean;
}

function QuestionPreview({
  question,
  questionNumber,
  value,
  error,
  onChange,
  isReadOnly
}: QuestionPreviewProps) {
  const inputClassName = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    error ? 'border-red-300' : 'border-gray-300'
  } ${isReadOnly ? 'bg-gray-50' : 'bg-white'}`;

  return (
    <div className="space-y-3">
      {/* Question Header */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          {questionNumber}. {question.title}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </h3>
        {question.description && (
          <p className="text-sm text-gray-600 mt-1">{question.description}</p>
        )}
      </div>

      {/* Question Input */}
      <div>
        <QuestionInput
          question={question}
          value={value}
          onChange={onChange}
          isReadOnly={isReadOnly}
          className={inputClassName}
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
}

interface QuestionInputProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  isReadOnly: boolean;
  className: string;
}

function QuestionInput({ question, value, onChange, isReadOnly, className }: QuestionInputProps) {
  switch (question.type) {
    case 'single-choice': {
      const singleChoice = question as any;
      return (
        <div className="space-y-2">
          {singleChoice.options?.map((option: string, index: number) => (
            <label key={index} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name={question.id}
                value={option}
                checked={value === option}
                onChange={(e) => onChange(e.target.value)}
                disabled={isReadOnly}
                className="h-4 w-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      );
    }

    case 'multi-choice': {
      const multiChoice = question as any;
      const selectedValues = Array.isArray(value) ? value : [];
      
      return (
        <div className="space-y-2">
          {multiChoice.options?.map((option: string, index: number) => (
            <label key={index} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedValues.includes(option)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange([...selectedValues, option]);
                  } else {
                    onChange(selectedValues.filter((v: string) => v !== option));
                  }
                }}
                disabled={isReadOnly}
                className="h-4 w-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">{option}</span>
            </label>
          ))}
          {multiChoice.maxSelections && (
            <p className="text-xs text-gray-500">
              Maximum {multiChoice.maxSelections} selections allowed
            </p>
          )}
        </div>
      );
    }

    case 'short-text': {
      const shortText = question as any;
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={shortText.placeholder || 'Enter your answer...'}
          maxLength={shortText.maxLength}
          disabled={isReadOnly}
          className={className}
        />
      );
    }

    case 'long-text': {
      const longText = question as any;
      return (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={longText.placeholder || 'Enter your detailed answer...'}
          maxLength={longText.maxLength}
          disabled={isReadOnly}
          rows={4}
          className={className}
        />
      );
    }

    case 'numeric': {
      const numeric = question as any;
      return (
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : '')}
            min={numeric.min}
            max={numeric.max}
            step={numeric.step}
            disabled={isReadOnly}
            className={className.replace('w-full', 'w-32')}
          />
          {numeric.unit && (
            <span className="text-sm text-gray-500">{numeric.unit}</span>
          )}
        </div>
      );
    }

    case 'file-upload': {
      const fileUpload = question as any;
      return (
        <div className="space-y-2">
          <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
            isReadOnly ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-gray-400'
          }`}>
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              {isReadOnly ? 'File upload disabled in preview' : 'Drop files here or click to upload'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Accepted: {fileUpload.acceptedTypes?.join(', ') || 'Any file'}
              {fileUpload.maxSize && ` (Max: ${fileUpload.maxSize}MB)`}
            </p>
          </div>
          {!isReadOnly && (
            <input
              type="file"
              accept={fileUpload.acceptedTypes?.join(',')}
              onChange={(e) => onChange(e.target.files?.[0])}
              disabled={isReadOnly}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          )}
        </div>
      );
    }

    default:
      return <div className="text-sm text-gray-500">Unknown question type</div>;
  }
}

function validateQuestionResponse(question: Question, response: any): string | null {
  switch (question.type) {
    case 'multi-choice': {
      const multiChoice = question as any;
      if (multiChoice.maxSelections && Array.isArray(response) && response.length > multiChoice.maxSelections) {
        return `Maximum ${multiChoice.maxSelections} selections allowed`;
      }
      break;
    }
    
    case 'short-text':
    case 'long-text': {
      const textQuestion = question as any;
      if (textQuestion.maxLength && typeof response === 'string' && response.length > textQuestion.maxLength) {
        return `Maximum ${textQuestion.maxLength} characters allowed`;
      }
      break;
    }
    
    case 'numeric': {
      const numeric = question as any;
      const num = parseFloat(response);
      if (isNaN(num)) {
        return 'Please enter a valid number';
      }
      if (numeric.min !== undefined && num < numeric.min) {
        return `Value must be at least ${numeric.min}`;
      }
      if (numeric.max !== undefined && num > numeric.max) {
        return `Value must be at most ${numeric.max}`;
      }
      break;
    }
  }
  
  return null;
}

function getCompletionStats(assessment: Assessment, responses: Record<string, any>): string {
  const allQuestions = assessment.sections.flatMap(section => section.questions);
  const requiredQuestions = allQuestions.filter(q => q.required);
  const answeredRequired = requiredQuestions.filter(q => {
    const response = responses[q.id];
    return response !== undefined && response !== '' && (!Array.isArray(response) || response.length > 0);
  });
  
  const totalAnswered = allQuestions.filter(q => {
    const response = responses[q.id];
    return response !== undefined && response !== '' && (!Array.isArray(response) || response.length > 0);
  });
  
  return `${answeredRequired.length}/${requiredQuestions.length} required questions answered • ${totalAnswered.length}/${allQuestions.length} total questions answered`;
}