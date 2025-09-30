import { forwardRef } from 'react';
import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';

// Base Input Component
interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helpText?: string;
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, size = 'md', leftIcon, rightIcon, className = '', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 text-sm px-2',
      md: 'h-10 px-3',
      lg: 'h-12 text-lg px-4',
    };

    const inputClasses = `
      input ${sizeClasses[size]} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} 
      ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''} ${className}
    `.trim();

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="text-gray-400 h-4 w-4">{leftIcon}</div>
            </div>
          )}
          
          <input
            ref={ref}
            className={inputClasses}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <div className="text-gray-400 h-4 w-4">{rightIcon}</div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
          )}
        </div>
        
        {(error || helpText) && (
          <div className="text-sm">
            {error ? (
              <p className="text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {error}
              </p>
            ) : (
              <p className="text-gray-500">{helpText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea Component
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helpText, resize = 'vertical', className = '', ...props }, ref) => {
    const resizeClasses = {
      none: 'resize-none',
      both: 'resize',
      horizontal: 'resize-x',
      vertical: 'resize-y',
    };

    const textareaClasses = `
      input min-h-20 py-2 ${resizeClasses[resize]}
      ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''} ${className}
    `.trim();

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <textarea
            ref={ref}
            className={textareaClasses}
            {...props}
          />
          
          {error && (
            <div className="absolute top-2 right-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
          )}
        </div>
        
        {(error || helpText) && (
          <div className="text-sm">
            {error ? (
              <p className="text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {error}
              </p>
            ) : (
              <p className="text-gray-500">{helpText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// Select Component
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helpText?: string;
  size?: 'sm' | 'md' | 'lg';
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helpText, size = 'md', options, placeholder, className = '', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 text-sm px-2',
      md: 'h-10 px-3',
      lg: 'h-12 text-lg px-4',
    };

    const selectClasses = `
      input ${sizeClasses[size]} pr-8
      ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''} ${className}
    `.trim();

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <select
            ref={ref}
            className={selectClasses}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          {error && (
            <div className="absolute inset-y-0 right-8 flex items-center pointer-events-none">
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
          )}
        </div>
        
        {(error || helpText) && (
          <div className="text-sm">
            {error ? (
              <p className="text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {error}
              </p>
            ) : (
              <p className="text-gray-500">{helpText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// Multi-Select Component
interface MultiSelectProps {
  label?: string;
  error?: string;
  helpText?: string;
  options: SelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxSelections?: number;
}

export function MultiSelect({
  label,
  error,
  helpText,
  options,
  value,
  onChange,
  placeholder = 'Select options...',
  maxSelections,
}: MultiSelectProps) {
  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else if (!maxSelections || value.length < maxSelections) {
      onChange([...value, optionValue]);
    }
  };

  const selectedOptions = options.filter(option => value.includes(option.value));

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        <div className={`input min-h-10 py-1 ${error ? 'border-red-300' : ''}`}>
          {value.length === 0 ? (
            <span className="text-gray-500">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {selectedOptions.map((option) => (
                <span
                  key={option.value}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {option.label}
                  <button
                    type="button"
                    onClick={() => toggleOption(option.value)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((option) => {
            const isSelected = value.includes(option.value);
            const isDisabled = Boolean(option.disabled || (maxSelections && !isSelected && value.length >= maxSelections));
            
            return (
              <button
                key={option.value}
                type="button"
                disabled={isDisabled}
                onClick={() => toggleOption(option.value)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
                  ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
                `}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  {option.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      {maxSelections && (
        <p className="text-xs text-gray-500">
          {value.length}/{maxSelections} selected
        </p>
      )}
      
      {(error || helpText) && (
        <div className="text-sm">
          {error ? (
            <p className="text-red-600 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {error}
            </p>
          ) : (
            <p className="text-gray-500">{helpText}</p>
          )}
        </div>
      )}
    </div>
  );
}