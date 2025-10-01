import { useState } from 'react';
import { Plus, Trash2, GripVertical, Edit3, Copy, Check, X, AlertCircle, FileText, Hash, CheckSquare, Upload, Type, AlignLeft } from 'lucide-react';
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

  const getQuestionTypeIcon = (type: QuestionType) => {
    switch (type) {
      case 'single-choice': return <CheckSquare className="h-4 w-4" />;
      case 'multi-choice': return <CheckSquare className="h-4 w-4" />;
      case 'short-text': return <Type className="h-4 w-4" />;
      case 'long-text': return <AlignLeft className="h-4 w-4" />;
      case 'numeric': return <Hash className="h-4 w-4" />;
      case 'file-upload': return <Upload className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white border-2 border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group relative">
      {/* Drag indicator */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-50 via-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow duration-200">
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg text-white shadow-md">
                  {getQuestionTypeIcon(question.type)}
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-700 block">
                    {getQuestionTypeLabel(question.type)}
                  </span>
                  <span className="text-xs text-gray-500">Question {question.order || 1}</span>
                </div>
              </div>
            </div>
            
            {question.required && (
              <div className="flex items-center space-x-1 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                <AlertCircle className="h-3 w-3 text-red-500" />
                <span className="text-xs font-semibold text-red-700">Required</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white hover:bg-blue-50 border-blue-200 text-blue-600 hover:text-blue-700 shadow-sm transition-all duration-200"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDuplicate}
              className="bg-white hover:bg-green-50 border-green-200 text-green-600 hover:text-green-700 shadow-sm transition-all duration-200"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="bg-white hover:bg-red-50 border-red-200 text-red-600 hover:text-red-700 shadow-sm transition-all duration-200"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
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
    <div className="space-y-6">
      {/* Enhanced Form Layout */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-xl border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <Edit3 className="h-5 w-5 mr-3 text-blue-600" />
          Edit Question Details
        </h3>
        
        <div className="grid grid-cols-1 gap-6">
          {/* Question Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Type className="h-4 w-4 mr-2 text-gray-500" />
              Question Title *
            </label>
            <input
              type="text"
              value={question.title}
              onChange={(e) => handleFieldUpdate('title', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-blue-300 text-gray-800 font-medium"
              placeholder="Enter a clear and concise question..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <AlignLeft className="h-4 w-4 mr-2 text-gray-500" />
              Description & Instructions (optional)
            </label>
            <textarea
              value={question.description || ''}
              onChange={(e) => handleFieldUpdate('description', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-blue-300 resize-none"
              rows={3}
              placeholder="Provide additional context, instructions, or clarifications for candidates..."
            />
          </div>

          {/* Required Toggle */}
          <div className="flex items-center p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-red-300 transition-colors duration-200">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="checkbox"
                  id={`required-${question.id}`}
                  checked={question.required}
                  onChange={(e) => handleFieldUpdate('required', e.target.checked)}
                  className="sr-only"
                />
                <label
                  htmlFor={`required-${question.id}`}
                  className={`flex items-center justify-center w-6 h-6 rounded-md border-2 cursor-pointer transition-all duration-200 ${
                    question.required
                      ? 'bg-red-500 border-red-500 text-white'
                      : 'bg-white border-gray-300 hover:border-red-400'
                  }`}
                >
                  {question.required && <Check className="h-3 w-3" />}
                </label>
              </div>
              <div>
                <label htmlFor={`required-${question.id}`} className="text-sm font-semibold text-gray-700 cursor-pointer">
                  This question is required
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Candidates must answer this question to proceed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Type-specific fields */}
      <QuestionTypeSpecificFields
        question={question}
        onUpdate={onUpdate}
      />

      {/* Enhanced Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t-2 border-gray-100">
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="bg-gray-50 hover:bg-gray-100 border-gray-300 text-gray-700 px-6 py-2 transition-all duration-200"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button 
          onClick={onSave}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <Check className="h-4 w-4 mr-2" />
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
        <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 p-6 rounded-xl border border-green-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <CheckSquare className="h-5 w-5 mr-3 text-green-600" />
            Choice Options
          </h4>
          
          <div className="space-y-4">
            {choiceQuestion.options?.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-3 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-green-300 transition-colors duration-200">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...(choiceQuestion.options || [])];
                    newOptions[index] = e.target.value;
                    handleFieldUpdate('options', newOptions);
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder={`Option ${index + 1}`}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newOptions = choiceQuestion.options.filter((_: any, i: number) => i !== index);
                    handleFieldUpdate('options', newOptions);
                  }}
                  className="bg-red-50 hover:bg-red-100 border-red-200 text-red-600 hover:text-red-700 shadow-sm"
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
              className="w-full mt-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-2 border-green-200 hover:border-green-300 text-green-700 font-semibold py-3"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Option
            </Button>
          </div>
          
          {question.type === 'multi-choice' && (
            <div className="mt-6 p-4 bg-white rounded-xl border-2 border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Hash className="h-4 w-4 mr-2 text-gray-500" />
                Maximum Selections (optional)
              </label>
              <input
                type="number"
                value={(question as any).maxSelections || ''}
                onChange={(e) => handleFieldUpdate('maxSelections', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-32 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                min="1"
                max={choiceQuestion.options?.length || 1}
                placeholder="All"
              />
              <p className="text-xs text-gray-500 mt-2">Leave empty to allow unlimited selections</p>
            </div>
          )}
        </div>
      );

    case 'short-text':
    case 'long-text':
      const textQuestion = question as any;
      return (
        <div className="bg-gradient-to-r from-purple-50 via-violet-50 to-indigo-50 p-6 rounded-xl border border-purple-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            {question.type === 'short-text' ? <Type className="h-5 w-5 mr-3 text-purple-600" /> : <AlignLeft className="h-5 w-5 mr-3 text-purple-600" />}
            Text Input Settings
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-white rounded-xl border-2 border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Hash className="h-4 w-4 mr-2 text-gray-500" />
                Maximum Length (characters)
              </label>
              <input
                type="number"
                value={textQuestion.maxLength || ''}
                onChange={(e) => handleFieldUpdate('maxLength', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                min="1"
                placeholder="No limit"
              />
              <p className="text-xs text-gray-500 mt-2">Leave empty for no character limit</p>
            </div>
            
            <div className="p-4 bg-white rounded-xl border-2 border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Type className="h-4 w-4 mr-2 text-gray-500" />
                Placeholder Text
              </label>
              <input
                type="text"
                value={textQuestion.placeholder || ''}
                onChange={(e) => handleFieldUpdate('placeholder', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter placeholder text..."
              />
              <p className="text-xs text-gray-500 mt-2">Hint text shown to candidates</p>
            </div>
          </div>
        </div>
      );

    case 'numeric':
      const numericQuestion = question as any;
      return (
        <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 p-6 rounded-xl border border-orange-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <Hash className="h-5 w-5 mr-3 text-orange-600" />
            Numeric Input Settings
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-white rounded-xl border-2 border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Minimum Value
              </label>
              <input
                type="number"
                value={numericQuestion.min || ''}
                onChange={(e) => handleFieldUpdate('min', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                placeholder="No minimum"
              />
            </div>
            
            <div className="p-4 bg-white rounded-xl border-2 border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Maximum Value
              </label>
              <input
                type="number"
                value={numericQuestion.max || ''}
                onChange={(e) => handleFieldUpdate('max', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                placeholder="No maximum"
              />
            </div>
            
            <div className="p-4 bg-white rounded-xl border-2 border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Step / Increment
              </label>
              <input
                type="number"
                value={numericQuestion.step || ''}
                onChange={(e) => handleFieldUpdate('step', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                step="0.1"
                placeholder="1"
              />
              <p className="text-xs text-gray-500 mt-2">Allowed increment between values</p>
            </div>
            
            <div className="p-4 bg-white rounded-xl border-2 border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Unit (optional)
              </label>
              <input
                type="text"
                value={numericQuestion.unit || ''}
                onChange={(e) => handleFieldUpdate('unit', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                placeholder="e.g., years, MB, %"
              />
              <p className="text-xs text-gray-500 mt-2">Unit displayed next to the input</p>
            </div>
          </div>
        </div>
      );

    case 'file-upload':
      const fileQuestion = question as any;
      return (
        <div className="bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 p-6 rounded-xl border border-teal-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <Upload className="h-5 w-5 mr-3 text-teal-600" />
            File Upload Settings
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-white rounded-xl border-2 border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-gray-500" />
                Accepted File Types
              </label>
              <input
                type="text"
                value={fileQuestion.acceptedTypes?.join(', ') || ''}
                onChange={(e) => handleFieldUpdate('acceptedTypes', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                placeholder=".pdf, .docx, .zip"
              />
              <p className="text-xs text-gray-500 mt-2">Separate multiple types with commas</p>
            </div>
            
            <div className="p-4 bg-white rounded-xl border-2 border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Hash className="h-4 w-4 mr-2 text-gray-500" />
                Maximum File Size (MB)
              </label>
              <input
                type="number"
                value={fileQuestion.maxSize || ''}
                onChange={(e) => handleFieldUpdate('maxSize', e.target.value ? parseInt(e.target.value) : 10)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                min="1"
                max="100"
                placeholder="10"
              />
              <p className="text-xs text-gray-500 mt-2">Maximum size per file in megabytes</p>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}

function QuestionPreview({ question }: { question: Question }) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-gray-900 leading-relaxed">{question.title}</h4>
        {question.description && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <p className="text-sm text-blue-800 leading-relaxed">{question.description}</p>
          </div>
        )}
      </div>
      
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl border-2 border-gray-200">
        <div className="mb-3 flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Preview</span>
        </div>
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
        <div className="space-y-3">
          {singleChoice.options?.map((option: string, index: number) => (
            <label key={index} className="flex items-center space-x-3 p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors duration-200 cursor-pointer group">
              <div className="w-5 h-5 border-2 border-gray-300 rounded-full group-hover:border-blue-400 transition-colors duration-200 flex items-center justify-center">
                <div className="w-2 h-2 bg-transparent rounded-full group-hover:bg-blue-400 transition-colors duration-200"></div>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors duration-200">{option}</span>
            </label>
          ))}
        </div>
      );

    case 'multi-choice':
      const multiChoice = question as any;
      return (
        <div className="space-y-3">
          {multiChoice.options?.map((option: string, index: number) => (
            <label key={index} className="flex items-center space-x-3 p-3 rounded-lg border-2 border-gray-200 hover:border-green-300 transition-colors duration-200 cursor-pointer group">
              <div className="w-5 h-5 border-2 border-gray-300 rounded-md group-hover:border-green-400 transition-colors duration-200 flex items-center justify-center">
                <Check className="w-3 h-3 text-transparent group-hover:text-green-400 transition-colors duration-200" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-green-700 transition-colors duration-200">{option}</span>
            </label>
          ))}
          {(multiChoice.maxSelections) && (
            <p className="text-xs text-gray-500 mt-3 px-3">Maximum {multiChoice.maxSelections} selections allowed</p>
          )}
        </div>
      );

    case 'short-text':
      const shortText = question as any;
      return (
        <input
          type="text"
          placeholder={shortText.placeholder || 'Enter your answer...'}
          disabled
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 font-medium"
        />
      );

    case 'long-text':
      const longText = question as any;
      return (
        <textarea
          placeholder={longText.placeholder || 'Enter your detailed answer...'}
          disabled
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 font-medium resize-none"
          rows={4}
        />
      );

    case 'numeric':
      const numeric = question as any;
      return (
        <div className="flex items-center space-x-3">
          <input
            type="number"
            min={numeric.min}
            max={numeric.max}
            step={numeric.step}
            disabled
            className="w-40 px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 font-medium"
            placeholder="Enter number"
          />
          {numeric.unit && (
            <div className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold text-sm">
              {numeric.unit}
            </div>
          )}
          {(numeric.min !== undefined || numeric.max !== undefined) && (
            <div className="text-xs text-gray-500">
              {numeric.min !== undefined && numeric.max !== undefined
                ? `Range: ${numeric.min} - ${numeric.max}`
                : numeric.min !== undefined
                ? `Min: ${numeric.min}`
                : `Max: ${numeric.max}`}
            </div>
          )}
        </div>
      );

    case 'file-upload':
      const fileUpload = question as any;
      return (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gradient-to-br from-gray-50 to-blue-50 hover:border-blue-400 transition-colors duration-200">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Drop files here or click to upload
          </p>
          <div className="space-y-1">
            <p className="text-xs text-gray-500">
              Accepted: {fileUpload.acceptedTypes?.join(', ') || 'Any file type'}
            </p>
            {fileUpload.maxSize && (
              <p className="text-xs text-gray-500">
                Maximum size: {fileUpload.maxSize}MB per file
              </p>
            )}
          </div>
        </div>
      );

    default:
      return (
        <div className="p-4 bg-gray-100 rounded-lg text-center">
          <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <div className="text-sm text-gray-500">Unknown question type</div>
        </div>
      );
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

  const questionTypes: { type: QuestionType; label: string; description: string; icon: any; color: string }[] = [
    { type: 'single-choice', label: 'Single Choice', description: 'Choose one option from a list', icon: CheckSquare, color: 'bg-blue-500' },
    { type: 'multi-choice', label: 'Multiple Choice', description: 'Choose multiple options from a list', icon: CheckSquare, color: 'bg-green-500' },
    { type: 'short-text', label: 'Short Text', description: 'Brief text input (one line)', icon: Type, color: 'bg-purple-500' },
    { type: 'long-text', label: 'Long Text', description: 'Extended text input (paragraph)', icon: AlignLeft, color: 'bg-indigo-500' },
    { type: 'numeric', label: 'Numeric', description: 'Number input with optional range', icon: Hash, color: 'bg-orange-500' },
    { type: 'file-upload', label: 'File Upload', description: 'Upload documents or files', icon: Upload, color: 'bg-teal-500' },
  ];

  const handleQuestionTypeSelect = (type: QuestionType) => {
    console.log('Question type selected:', type); // Debug log
    onAddQuestion(type);
    setIsOpen(false);
  };

  if (isOpen) {
    return (
      <>
        {/* Backdrop overlay */}
        <div 
          className="fixed inset-0 z-40 bg-black/20" 
          onClick={() => setIsOpen(false)}
        />
        
        {/* Modal dialog */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-6">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-xl mb-4 shadow-lg">
                <h3 className="text-lg font-bold mb-1">Choose Question Type</h3>
                <p className="text-sm text-blue-100">Select the type of question you want to add</p>
              </div>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {questionTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={type.type}
                      onClick={() => handleQuestionTypeSelect(type.type)}
                      className="w-full text-left p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border-2 border-gray-100 hover:border-blue-200 group"
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 ${type.color} rounded-xl text-white shadow-md group-hover:shadow-lg transition-shadow duration-200`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">{type.label}</div>
                          <div className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors duration-200 mt-1">{type.description}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => {
          console.log('Add New Question button clicked'); // Debug log
          setIsOpen(true);
        }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-200 hover:border-blue-300 text-blue-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add New Question
      </Button>
    </div>
  );
}