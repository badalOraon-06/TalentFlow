import { useState } from 'react';
import { Plus, Trash2, GripVertical, Edit3, ChevronDown, ChevronUp, Copy, Layers } from 'lucide-react';
import type { AssessmentSection, Question, QuestionType } from '../types';
import { Button } from './Button';
import { QuestionBuilder, NewQuestionButton } from './QuestionBuilder';

interface SectionBuilderProps {
  section: AssessmentSection;
  onUpdate: (section: AssessmentSection) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function SectionBuilder({ section, onUpdate, onDelete, onDuplicate }: SectionBuilderProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingHeader, setIsEditingHeader] = useState(false);

  const handleSectionUpdate = (field: string, value: any) => {
    onUpdate({
      ...section,
      [field]: value
    });
  };

  const handleQuestionAdd = (type: QuestionType) => {
    const newQuestion: Question = createNewQuestion(type, section.questions.length + 1);
    onUpdate({
      ...section,
      questions: [...section.questions, newQuestion]
    });
  };

  const handleQuestionUpdate = (questionIndex: number, updatedQuestion: Question) => {
    const newQuestions = [...section.questions];
    newQuestions[questionIndex] = updatedQuestion;
    onUpdate({
      ...section,
      questions: newQuestions
    });
  };

  const handleQuestionDelete = (questionIndex: number) => {
    const newQuestions = section.questions.filter((_, index) => index !== questionIndex);
    onUpdate({
      ...section,
      questions: newQuestions
    });
  };

  const handleQuestionDuplicate = (questionIndex: number) => {
    const questionToDuplicate = section.questions[questionIndex];
    const duplicatedQuestion: Question = {
      ...questionToDuplicate,
      id: crypto.randomUUID(),
      title: `${questionToDuplicate.title} (Copy)`,
      order: section.questions.length + 1
    };
    onUpdate({
      ...section,
      questions: [...section.questions, duplicatedQuestion]
    });
  };

  return (
    <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Enhanced Section Header */}
      <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-blue-50 border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-3 text-left hover:bg-white/50 rounded-lg px-3 py-2 transition-all duration-200"
            >
              <div className="p-1 bg-blue-100 rounded-md">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-blue-600" />
                ) : (
                  <ChevronUp className="h-4 w-4 text-blue-600" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg flex items-center">
                  <Layers className="h-4 w-4 text-blue-600 mr-2" />
                  {section.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {section.questions.length} question{section.questions.length !== 1 ? 's' : ''} 
                  {section.description && ' • ' + section.description.slice(0, 50) + (section.description.length > 50 ? '...' : '')}
                </p>
              </div>
            </button>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingHeader(!isEditingHeader)}
              className="bg-white hover:bg-blue-50 border-blue-200 text-blue-700 shadow-sm transition-all duration-200"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDuplicate}
              className="bg-white hover:bg-green-50 border-green-200 text-green-700 shadow-sm transition-all duration-200"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="bg-white hover:bg-red-50 border-red-200 text-red-600 shadow-sm transition-all duration-200"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>

        {/* Section Header Editor */}
        {isEditingHeader && (
          <div className="mt-4 space-y-3 p-4 bg-white rounded-md border">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section Title
              </label>
              <input
                type="text"
                value={section.title}
                onChange={(e) => handleSectionUpdate('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter section title..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                value={section.description || ''}
                onChange={(e) => handleSectionUpdate('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Describe this section..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingHeader(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => setIsEditingHeader(false)}
              >
                Save
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Section Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {section.description && !isEditingHeader && (
            <p className="text-sm text-gray-600">{section.description}</p>
          )}

          {/* Questions */}
          <div className="space-y-3">
            {section.questions.map((question, index) => (
              <QuestionBuilder
                key={question.id}
                question={question}
                onUpdate={(updatedQuestion) => handleQuestionUpdate(index, updatedQuestion)}
                onDelete={() => handleQuestionDelete(index)}
                onDuplicate={() => handleQuestionDuplicate(index)}
              />
            ))}
          </div>

          {/* Add Question Button */}
          <div className="flex justify-center pt-2">
            <NewQuestionButton onAddQuestion={handleQuestionAdd} />
          </div>

          {section.questions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No questions in this section yet.</p>
              <p className="text-xs mt-1">Click "Add Question" to get started.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper function to create a new question
function createNewQuestion(type: QuestionType, order: number): Question {
  const baseQuestion = {
    id: crypto.randomUUID(),
    type,
    title: `New ${getQuestionTypeLabel(type)} Question`,
    description: '',
    required: false,
    order
  };

  switch (type) {
    case 'single-choice':
      return {
        ...baseQuestion,
        type: 'single-choice',
        options: ['Option 1', 'Option 2']
      };

    case 'multi-choice':
      return {
        ...baseQuestion,
        type: 'multi-choice',
        options: ['Option 1', 'Option 2', 'Option 3'],
        maxSelections: undefined
      };

    case 'short-text':
      return {
        ...baseQuestion,
        type: 'short-text',
        maxLength: undefined,
        placeholder: 'Enter your answer...'
      };

    case 'long-text':
      return {
        ...baseQuestion,
        type: 'long-text',
        maxLength: undefined,
        placeholder: 'Enter your detailed answer...'
      };

    case 'numeric':
      return {
        ...baseQuestion,
        type: 'numeric',
        min: undefined,
        max: undefined,
        step: undefined,
        unit: undefined
      };

    case 'file-upload':
      return {
        ...baseQuestion,
        type: 'file-upload',
        acceptedTypes: ['.pdf', '.docx'],
        maxSize: 10
      };

    default:
      return baseQuestion as Question;
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

// Component for creating new sections
interface NewSectionButtonProps {
  onAddSection: () => void;
}

export function NewSectionButton({ onAddSection }: NewSectionButtonProps) {
  return (
    <div className="p-6">
      <Button
        variant="outline"
        onClick={onAddSection}
        className="w-full py-4 text-base bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-dashed border-blue-300 hover:border-blue-400 text-blue-700 hover:text-blue-800 transition-all duration-200 transform hover:scale-[1.02]"
      >
        <Plus className="h-5 w-5 mr-3" />
        Add New Section
      </Button>
    </div>
  );
}