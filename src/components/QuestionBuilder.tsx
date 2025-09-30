import { useState } from 'react';
import { Plus, Trash2, GripVertical, Edit3 } from 'lucide-react';
import type { Question, QuestionType } from '../types';
import { Button } from './Button';

interface QuestionBuilderProps {
  question: Question;
  onUpdate: (question: Question) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function QuestionBuilder({ question, onUpdate, onDelete, onDuplicate }: QuestionBuilderProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
          <span className="text-sm font-medium text-gray-500">
            {getQuestionTypeLabel(question.type)}
          </span>
          {question.required && (
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Required</span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit3 className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDuplicate}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {isEditing ? (
        <QuestionEditor
          question={question}
          onUpdate={onUpdate}
          onCancel={() => setIsEditing(false)}
          onSave={() => setIsEditing(false)}
        />
      ) : (
        <QuestionPreview question={question} />
      )}
    </div>
  );
}

interface QuestionEditorProps {
  question: Question;
  onUpdate: (question: Question) => void;
  onCancel: () => void;
  onSave: () => void;
}

function QuestionEditor({ question, onUpdate, onCancel, onSave }: QuestionEditorProps) {
  const handleFieldUpdate = (field: string, value: any) => {
    onUpdate({
      ...question,
      [field]: value
    });
  };

  return (
    <div className="space-y-4">
      {/* Basic fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question Title *
        </label>
        <input
          type="text"
          value={question.title}
          onChange={(e) => handleFieldUpdate('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your question..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (optional)
        </label>
        <textarea
          value={question.description || ''}
          onChange={(e) => handleFieldUpdate('description', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          placeholder="Additional context or instructions..."
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id={`required-${question.id}`}
          checked={question.required}
          onChange={(e) => handleFieldUpdate('required', e.target.checked)}
          className="mr-2"
        />
        <label htmlFor={`required-${question.id}`} className="text-sm text-gray-700">
          This question is required
        </label>
      </div>

      {/* Type-specific fields */}
      <QuestionTypeSpecificFields
        question={question}
        onUpdate={onUpdate}
      />

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}

interface QuestionTypeSpecificFieldsProps {
  question: Question;
  onUpdate: (question: Question) => void;
}

function QuestionTypeSpecificFields({ question, onUpdate }: QuestionTypeSpecificFieldsProps) {
  const handleFieldUpdate = (field: string, value: any) => {
    onUpdate({
      ...question,
      [field]: value
    });
  };

  switch (question.type) {
    case 'single-choice':
    case 'multi-choice':
      const choiceQuestion = question as any;
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Options
          </label>
          <div className="space-y-2">
            {choiceQuestion.options?.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...(choiceQuestion.options || [])];
                    newOptions[index] = e.target.value;
                    handleFieldUpdate('options', newOptions);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Option ${index + 1}`}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newOptions = choiceQuestion.options.filter((_: any, i: number) => i !== index);
                    handleFieldUpdate('options', newOptions);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newOptions = [...(choiceQuestion.options || []), ''];
                handleFieldUpdate('options', newOptions);
              }}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Option
            </Button>
          </div>
          
          {question.type === 'multi-choice' && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Selections (optional)
              </label>
              <input
                type="number"
                value={(question as any).maxSelections || ''}
                onChange={(e) => handleFieldUpdate('maxSelections', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max={choiceQuestion.options?.length || 1}
              />
            </div>
          )}
        </div>
      );

    case 'short-text':
    case 'long-text':
      const textQuestion = question as any;
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Length (optional)
            </label>
            <input
              type="number"
              value={textQuestion.maxLength || ''}
              onChange={(e) => handleFieldUpdate('maxLength', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Placeholder Text (optional)
            </label>
            <input
              type="text"
              value={textQuestion.placeholder || ''}
              onChange={(e) => handleFieldUpdate('placeholder', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter placeholder text..."
            />
          </div>
        </div>
      );

    case 'numeric':
      const numericQuestion = question as any;
      return (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Value
            </label>
            <input
              type="number"
              value={numericQuestion.min || ''}
              onChange={(e) => handleFieldUpdate('min', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Value
            </label>
            <input
              type="number"
              value={numericQuestion.max || ''}
              onChange={(e) => handleFieldUpdate('max', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Step
            </label>
            <input
              type="number"
              value={numericQuestion.step || ''}
              onChange={(e) => handleFieldUpdate('step', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit (optional)
            </label>
            <input
              type="text"
              value={numericQuestion.unit || ''}
              onChange={(e) => handleFieldUpdate('unit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., years, MB, %"
            />
          </div>
        </div>
      );

    case 'file-upload':
      const fileQuestion = question as any;
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Accepted File Types (comma-separated)
            </label>
            <input
              type="text"
              value={fileQuestion.acceptedTypes?.join(', ') || ''}
              onChange={(e) => handleFieldUpdate('acceptedTypes', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder=".pdf, .docx, .zip"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum File Size (MB)
            </label>
            <input
              type="number"
              value={fileQuestion.maxSize || ''}
              onChange={(e) => handleFieldUpdate('maxSize', e.target.value ? parseInt(e.target.value) : 10)}
              className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="100"
            />
          </div>
        </div>
      );

    default:
      return null;
  }
}

function QuestionPreview({ question }: { question: Question }) {
  return (
    <div className="space-y-2">
      <h4 className="font-medium text-gray-900">{question.title}</h4>
      {question.description && (
        <p className="text-sm text-gray-600">{question.description}</p>
      )}
      
      <div className="mt-3 p-3 bg-gray-50 rounded-md">
        <QuestionPreviewContent question={question} />
      </div>
    </div>
  );
}

function QuestionPreviewContent({ question }: { question: Question }) {
  switch (question.type) {
    case 'single-choice':
      const singleChoice = question as any;
      return (
        <div className="space-y-2">
          {singleChoice.options?.map((option: string, index: number) => (
            <label key={index} className="flex items-center space-x-2">
              <input type="radio" name={`preview-${question.id}`} disabled />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
      );

    case 'multi-choice':
      const multiChoice = question as any;
      return (
        <div className="space-y-2">
          {multiChoice.options?.map((option: string, index: number) => (
            <label key={index} className="flex items-center space-x-2">
              <input type="checkbox" disabled />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
      );

    case 'short-text':
      const shortText = question as any;
      return (
        <input
          type="text"
          placeholder={shortText.placeholder || 'Enter your answer...'}
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
        />
      );

    case 'long-text':
      const longText = question as any;
      return (
        <textarea
          placeholder={longText.placeholder || 'Enter your answer...'}
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
          rows={3}
        />
      );

    case 'numeric':
      const numeric = question as any;
      return (
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min={numeric.min}
            max={numeric.max}
            step={numeric.step}
            disabled
            className="w-32 px-3 py-2 border border-gray-300 rounded-md bg-white"
          />
          {numeric.unit && <span className="text-sm text-gray-500">{numeric.unit}</span>}
        </div>
      );

    case 'file-upload':
      const fileUpload = question as any;
      return (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
          <p className="text-sm text-gray-500">
            Drop files here or click to upload
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Accepted: {fileUpload.acceptedTypes?.join(', ') || 'Any file'}
            {fileUpload.maxSize && ` (Max: ${fileUpload.maxSize}MB)`}
          </p>
        </div>
      );

    default:
      return <div className="text-sm text-gray-500">Unknown question type</div>;
  }
}

function getQuestionTypeLabel(type: QuestionType): string {
  switch (type) {
    case 'single-choice': return 'Single Choice';
    case 'multi-choice': return 'Multiple Choice';
    case 'short-text': return 'Short Text';
    case 'long-text': return 'Long Text';
    case 'numeric': return 'Numeric';
    case 'file-upload': return 'File Upload';
    default: return 'Unknown';
  }
}

// Component for creating new questions
interface NewQuestionButtonProps {
  onAddQuestion: (type: QuestionType) => void;
}

export function NewQuestionButton({ onAddQuestion }: NewQuestionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const questionTypes: { type: QuestionType; label: string; description: string }[] = [
    { type: 'single-choice', label: 'Single Choice', description: 'Choose one option from a list' },
    { type: 'multi-choice', label: 'Multiple Choice', description: 'Choose multiple options from a list' },
    { type: 'short-text', label: 'Short Text', description: 'Brief text input (one line)' },
    { type: 'long-text', label: 'Long Text', description: 'Extended text input (paragraph)' },
    { type: 'numeric', label: 'Numeric', description: 'Number input with optional range' },
    { type: 'file-upload', label: 'File Upload', description: 'Upload documents or files' },
  ];

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Question
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="p-2">
            <div className="text-sm font-medium text-gray-700 mb-2">Question Type</div>
            <div className="space-y-1">
              {questionTypes.map((type) => (
                <button
                  key={type.type}
                  onClick={() => {
                    onAddQuestion(type.type);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-sm">{type.label}</div>
                  <div className="text-xs text-gray-500">{type.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}