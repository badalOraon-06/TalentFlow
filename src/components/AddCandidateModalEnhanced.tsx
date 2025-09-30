import { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Briefcase, Loader2, MapPin, GraduationCap, 
  Building, DollarSign, Link, Github, ExternalLink,
  Clock, Home, Plus, X, CheckCircle2, AlertCircle, 
  Calendar, Sparkles, Target, TrendingUp
} from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useJobs, useCreateCandidate } from '../hooks/useApiDirect';
import type { Job, ExperienceLevel } from '../types';

interface AddCandidateModalEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: 'entry', label: 'Entry Level (0-1 years)' },
  { value: 'junior', label: 'Junior (1-3 years)' },
  { value: 'mid', label: 'Mid Level (3-5 years)' },
  { value: 'senior', label: 'Senior (5-8 years)' },
  { value: 'lead', label: 'Lead (8+ years)' },
  { value: 'executive', label: 'Executive (10+ years)' },
];

const WORK_TYPES = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR'];

export function AddCandidateModalEnhanced({ isOpen, onClose, onSuccess }: AddCandidateModalEnhancedProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    email: '',
    phone: '',
    jobId: '',
    location: '',
    
    // Professional Information
    summary: '',
    experienceLevel: '' as ExperienceLevel | '',
    yearsOfExperience: '',
    skills: [] as string[],
    
    // Professional Links
    linkedinUrl: '',
    portfolioUrl: '',
    githubUrl: '',
    
    // Education
    education: {
      degree: '',
      institution: '',
      field: '',
      graduationYear: '',
      gpa: ''
    },
    
    // Work Experience
    workExperience: {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      current: false
    },
    
    // Compensation & Availability
    salaryExpectation: {
      min: '',
      max: '',
      currency: 'USD',
      negotiable: true
    },
    noticePeriod: '',
    availableStartDate: '',
    preferredWorkType: '' as 'remote' | 'hybrid' | 'onsite' | '',
    willingToRelocate: false,
    hasWorkPermit: true,
  });
  
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { data: jobsData, loading: jobsLoading } = useJobs({ status: 'active' });
  const { createCandidate, loading: creating, error: createError } = useCreateCandidate();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        jobId: '',
        location: '',
        summary: '',
        experienceLevel: '' as ExperienceLevel | '',
        yearsOfExperience: '',
        skills: [],
        linkedinUrl: '',
        portfolioUrl: '',
        githubUrl: '',
        education: {
          degree: '',
          institution: '',
          field: '',
          graduationYear: '',
          gpa: ''
        },
        workExperience: {
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          description: '',
          current: false
        },
        salaryExpectation: {
          min: '',
          max: '',
          currency: 'USD',
          negotiable: true
        },
        noticePeriod: '',
        availableStartDate: '',
        preferredWorkType: '' as 'remote' | 'hybrid' | 'onsite' | '',
        willingToRelocate: false,
        hasWorkPermit: true,
      });
      setSkillInput('');
      setErrors({});
      setActiveTab('basic');
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.jobId) {
      newErrors.jobId = 'Please select a job position';
    }

    if (formData.phone && formData.phone.trim() && !/^[\+]?[0-9\s\-\(\)]{7,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.yearsOfExperience && (isNaN(Number(formData.yearsOfExperience)) || Number(formData.yearsOfExperience) < 0)) {
      newErrors.yearsOfExperience = 'Please enter a valid number of years';
    }

    if (formData.linkedinUrl && !/^https?:\/\/.+/.test(formData.linkedinUrl)) {
      newErrors.linkedinUrl = 'Please enter a valid URL (starting with http:// or https://)';
    }

    if (formData.portfolioUrl && !/^https?:\/\/.+/.test(formData.portfolioUrl)) {
      newErrors.portfolioUrl = 'Please enter a valid URL (starting with http:// or https://)';
    }

    if (formData.githubUrl && !/^https?:\/\/.+/.test(formData.githubUrl)) {
      newErrors.githubUrl = 'Please enter a valid URL (starting with http:// or https://)';
    }

    if (formData.salaryExpectation.min && isNaN(Number(formData.salaryExpectation.min))) {
      newErrors.salaryMin = 'Please enter a valid minimum salary';
    }

    if (formData.salaryExpectation.max && isNaN(Number(formData.salaryExpectation.max))) {
      newErrors.salaryMax = 'Please enter a valid maximum salary';
    }

    if (formData.salaryExpectation.min && formData.salaryExpectation.max && 
        Number(formData.salaryExpectation.min) > Number(formData.salaryExpectation.max)) {
      newErrors.salaryMax = 'Maximum salary must be greater than minimum salary';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Prepare candidate data with proper type conversion
      const candidateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        jobId: formData.jobId,
        location: formData.location.trim() || undefined,
        summary: formData.summary.trim() || undefined,
        experienceLevel: formData.experienceLevel || undefined,
        yearsOfExperience: formData.yearsOfExperience ? Number(formData.yearsOfExperience) : undefined,
        skills: formData.skills.length > 0 ? formData.skills : undefined,
        linkedinUrl: formData.linkedinUrl.trim() || undefined,
        portfolioUrl: formData.portfolioUrl.trim() || undefined,
        githubUrl: formData.githubUrl.trim() || undefined,
        
        // Education (only if filled)
        education: (formData.education.degree || formData.education.institution) ? [{
          degree: formData.education.degree,
          institution: formData.education.institution,
          field: formData.education.field,
          graduationYear: formData.education.graduationYear ? Number(formData.education.graduationYear) : undefined,
          gpa: formData.education.gpa || undefined
        }] : undefined,
        
        // Work Experience (only if filled)
        workExperience: (formData.workExperience.company || formData.workExperience.position) ? [{
          company: formData.workExperience.company,
          position: formData.workExperience.position,
          startDate: formData.workExperience.startDate,
          endDate: formData.workExperience.current ? undefined : formData.workExperience.endDate,
          description: formData.workExperience.description || undefined,
          current: formData.workExperience.current
        }] : undefined,
        
        // Salary Expectation (only if min or max is filled)
        salaryExpectation: (formData.salaryExpectation.min || formData.salaryExpectation.max) ? {
          min: formData.salaryExpectation.min ? Number(formData.salaryExpectation.min) : 0,
          max: formData.salaryExpectation.max ? Number(formData.salaryExpectation.max) : 0,
          currency: formData.salaryExpectation.currency,
          negotiable: formData.salaryExpectation.negotiable
        } : undefined,
        
        noticePeriod: formData.noticePeriod || undefined,
        availableStartDate: formData.availableStartDate ? new Date(formData.availableStartDate) : undefined,
        preferredWorkType: formData.preferredWorkType || undefined,
        willingToRelocate: formData.willingToRelocate,
        hasWorkPermit: formData.hasWorkPermit,
      };

      await createCandidate(candidateData);

      // Success - close modal and notify parent
      onClose();
      onSuccess();
    } catch (err) {
      // Error is already handled by the hook
      console.error('Failed to create candidate:', err);
    }
  };

  // Skills management functions
  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleInputChange = (field: string, value: any) => {
    const fieldParts = field.split('.');
    
    if (fieldParts.length === 1) {
      // Simple field
      setFormData(prev => ({ ...prev, [field]: value }));
    } else {
      // Nested field (e.g., 'education.degree' or 'salaryExpectation.min')
      setFormData(prev => {
        const newData = { ...prev };
        const parentKey = fieldParts[0] as keyof typeof prev;
        const childKey = fieldParts[1];
        
        if (typeof newData[parentKey] === 'object' && newData[parentKey] !== null) {
          (newData[parentKey] as any)[childKey] = value;
        }
        
        return newData;
      });
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User, color: 'from-blue-500 to-indigo-600' },
    { id: 'professional', label: 'Professional', icon: Briefcase, color: 'from-emerald-500 to-teal-600' },
    { id: 'education', label: 'Education & Experience', icon: GraduationCap, color: 'from-purple-500 to-violet-600' },
    { id: 'compensation', label: 'Compensation & Availability', icon: DollarSign, color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Candidate" size="lg">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Enhanced Tab Navigation */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 -mx-6 -mt-6 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-blue-500" />
              Candidate Information
            </h3>
            <div className="text-sm text-gray-500">
              Step {tabs.findIndex(tab => tab.id === activeTab) + 1} of {tabs.length}
            </div>
          </div>
          
          <nav className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isCompleted = tabs.findIndex(t => t.id === activeTab) > index;
              
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative flex-1 flex items-center justify-center py-3 px-4 rounded-md font-medium text-sm transition-all duration-200
                    ${isActive 
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-[1.02]` 
                      : isCompleted
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center space-x-2">
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </div>
                  
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-sm" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content with Enhanced Styling */}
        <div className="space-y-8 max-h-[32rem] overflow-y-auto px-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
             style={{ scrollbarWidth: 'thin' }}>
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800">Basic Information</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`
                        w-full px-4 py-3 pl-10 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                        outline-none transition-all duration-200 text-gray-900 placeholder-gray-400
                        ${errors.name 
                          ? 'border-red-300 bg-red-50 focus:ring-red-200' 
                          : 'border-gray-200 bg-white hover:border-gray-300 focus:bg-blue-50/30'
                        }
                      `}
                      placeholder="Enter candidate's full name"
                      disabled={creating}
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.name && (
                    <div className="mt-2 flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <p className="text-sm text-red-600">{errors.name}</p>
                    </div>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`
                        w-full px-4 py-3 pl-10 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                        outline-none transition-all duration-200 text-gray-900 placeholder-gray-400
                        ${errors.email 
                          ? 'border-red-300 bg-red-50 focus:ring-red-200' 
                          : 'border-gray-200 bg-white hover:border-gray-300 focus:bg-blue-50/30'
                        }
                      `}
                      placeholder="candidate@example.com"
                      disabled={creating}
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.email && (
                    <div className="mt-2 flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <p className="text-sm text-red-600">{errors.email}</p>
                    </div>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`
                        w-full px-4 py-3 pl-10 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                        outline-none transition-all duration-200 text-gray-900 placeholder-gray-400
                        ${errors.phone 
                          ? 'border-red-300 bg-red-50 focus:ring-red-200' 
                          : 'border-gray-200 bg-white hover:border-gray-300 focus:bg-blue-50/30'
                        }
                      `}
                      placeholder="+1 (555) 123-4567"
                      disabled={creating}
                    />
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.phone && (
                    <div className="mt-2 flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <p className="text-sm text-red-600">{errors.phone}</p>
                    </div>
                  )}
                </div>

                {/* Location Field */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <input
                      id="location"
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white hover:border-gray-300 focus:bg-blue-50/30"
                      placeholder="City, State/Country"
                      disabled={creating}
                    />
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Job Selection */}
                <div>
                  <label htmlFor="jobId" className="block text-sm font-medium text-gray-700 mb-2">
                    Position Applying For *
                  </label>
                  {jobsLoading ? (
                    <div className="flex items-center justify-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                      <span className="ml-2 text-gray-600">Loading positions...</span>
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        id="jobId"
                        value={formData.jobId}
                        onChange={(e) => handleInputChange('jobId', e.target.value)}
                        className={`
                          w-full px-4 py-3 pl-10 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                          outline-none transition-all duration-200 text-gray-900
                          ${errors.jobId 
                            ? 'border-red-300 bg-red-50 focus:ring-red-200' 
                            : 'border-gray-200 bg-white hover:border-gray-300 focus:bg-blue-50/30'
                          }
                        `}
                        disabled={creating}
                      >
                        <option value="">Select a position...</option>
                        {jobsData?.jobs.map((job: Job) => (
                          <option key={job.id} value={job.id}>
                            {job.title} {job.location && `- ${job.location}`}
                          </option>
                        ))}
                      </select>
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  )}
                  {errors.jobId && (
                    <div className="mt-2 flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <p className="text-sm text-red-600">{errors.jobId}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Professional Information Tab */}
          {activeTab === 'professional' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800">Professional Information</h4>
              </div>

              {/* Professional Summary */}
              <div>
                <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-3">
                  Professional Summary
                </label>
                <div className="relative">
                  <textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) => handleInputChange('summary', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white hover:border-gray-300 focus:bg-emerald-50/30 resize-none"
                    placeholder="Brief overview of skills, experience, and career objectives..."
                    disabled={creating}
                  />
                  <div className="absolute top-3 right-3">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Experience Level */}
                <div>
                  <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-3">
                    Experience Level
                  </label>
                  <div className="relative">
                    <select
                      id="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                      className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 text-gray-900 bg-white hover:border-gray-300 focus:bg-emerald-50/30 appearance-none"
                      disabled={creating}
                    >
                      <option value="">Select experience level...</option>
                      {EXPERIENCE_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                    <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Years of Experience */}
                <div>
                  <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 mb-3">
                    Years of Experience
                  </label>
                  <div className="relative">
                    <input
                      id="yearsOfExperience"
                      type="number"
                      min="0"
                      max="50"
                      value={formData.yearsOfExperience}
                      onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                      className={`
                        w-full px-4 py-3 pl-10 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 
                        outline-none transition-all duration-200 text-gray-900 placeholder-gray-400
                        ${errors.yearsOfExperience 
                          ? 'border-red-300 bg-red-50 focus:ring-red-200' 
                          : 'border-gray-200 bg-white hover:border-gray-300 focus:bg-emerald-50/30'
                        }
                      `}
                      placeholder="0"
                      disabled={creating}
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.yearsOfExperience && (
                    <div className="mt-2 flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <p className="text-sm text-red-600">{errors.yearsOfExperience}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Skills & Technologies
                </label>
                <div className="space-y-3">
                  <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-white hover:border-gray-300 transition-colors">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={handleSkillKeyPress}
                      className="flex-1 px-4 py-3 focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-400"
                      placeholder="Enter a skill (e.g., JavaScript, Project Management)"
                      disabled={creating}
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 font-medium"
                      disabled={creating}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {formData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      {formData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-white border border-emerald-200 text-emerald-800 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <Sparkles className="h-3 w-3 mr-1" />
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 rounded-full p-0.5 transition-colors"
                            disabled={creating}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Links */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                  <Link className="h-4 w-4 text-emerald-600" />
                  <h4 className="text-md font-medium text-gray-700">Professional Links</h4>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {/* LinkedIn */}
                  <div>
                    <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn Profile
                    </label>
                    <div className="relative">
                      <input
                        id="linkedinUrl"
                        type="url"
                        value={formData.linkedinUrl}
                        onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                        className={`
                          w-full px-4 py-3 pl-10 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 
                          outline-none transition-all duration-200 text-gray-900 placeholder-gray-400
                          ${errors.linkedinUrl 
                            ? 'border-red-300 bg-red-50 focus:ring-red-200' 
                            : 'border-gray-200 bg-white hover:border-gray-300 focus:bg-emerald-50/30'
                          }
                        `}
                        placeholder="https://linkedin.com/in/username"
                        disabled={creating}
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">in</span>
                      </div>
                    </div>
                    {errors.linkedinUrl && (
                      <div className="mt-2 flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <p className="text-sm text-red-600">{errors.linkedinUrl}</p>
                      </div>
                    )}
                  </div>

                  {/* Portfolio */}
                  <div>
                    <label htmlFor="portfolioUrl" className="block text-sm font-medium text-gray-700 mb-2">
                      Portfolio Website
                    </label>
                    <div className="relative">
                      <input
                        id="portfolioUrl"
                        type="url"
                        value={formData.portfolioUrl}
                        onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
                        className={`
                          w-full px-4 py-3 pl-10 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 
                          outline-none transition-all duration-200 text-gray-900 placeholder-gray-400
                          ${errors.portfolioUrl 
                            ? 'border-red-300 bg-red-50 focus:ring-red-200' 
                            : 'border-gray-200 bg-white hover:border-gray-300 focus:bg-emerald-50/30'
                          }
                        `}
                        placeholder="https://portfolio.example.com"
                        disabled={creating}
                      />
                      <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.portfolioUrl && (
                      <div className="mt-2 flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <p className="text-sm text-red-600">{errors.portfolioUrl}</p>
                      </div>
                    )}
                  </div>

                  {/* GitHub */}
                  <div>
                    <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 mb-2">
                      GitHub Profile
                    </label>
                    <div className="relative">
                      <input
                        id="githubUrl"
                        type="url"
                        value={formData.githubUrl}
                        onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                        className={`
                          w-full px-4 py-3 pl-10 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 
                          outline-none transition-all duration-200 text-gray-900 placeholder-gray-400
                          ${errors.githubUrl 
                            ? 'border-red-300 bg-red-50 focus:ring-red-200' 
                            : 'border-gray-200 bg-white hover:border-gray-300 focus:bg-emerald-50/30'
                          }
                        `}
                        placeholder="https://github.com/username"
                        disabled={creating}
                      />
                      <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.githubUrl && (
                      <div className="mt-2 flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <p className="text-sm text-red-600">{errors.githubUrl}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Education & Experience Tab */}
          {activeTab === 'education' && (
            <div className="space-y-6">
              {/* Education */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-700 border-b pb-2">
                  <GraduationCap className="h-4 w-4 inline mr-2" />
                  Education
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="degree" className="block text-sm font-medium text-gray-700 mb-2">
                      Degree
                    </label>
                    <input
                      id="degree"
                      type="text"
                      value={formData.education.degree}
                      onChange={(e) => handleInputChange('education.degree', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="Bachelor of Science"
                      disabled={creating}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="field" className="block text-sm font-medium text-gray-700 mb-2">
                      Field of Study
                    </label>
                    <input
                      id="field"
                      type="text"
                      value={formData.education.field}
                      onChange={(e) => handleInputChange('education.field', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="Computer Science"
                      disabled={creating}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-2">
                    Institution
                  </label>
                  <input
                    id="institution"
                    type="text"
                    value={formData.education.institution}
                    onChange={(e) => handleInputChange('education.institution', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    placeholder="University Name"
                    disabled={creating}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700 mb-2">
                      Graduation Year
                    </label>
                    <input
                      id="graduationYear"
                      type="number"
                      min="1950"
                      max="2030"
                      value={formData.education.graduationYear}
                      onChange={(e) => handleInputChange('education.graduationYear', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="2023"
                      disabled={creating}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="gpa" className="block text-sm font-medium text-gray-700 mb-2">
                      GPA (Optional)
                    </label>
                    <input
                      id="gpa"
                      type="text"
                      value={formData.education.gpa}
                      onChange={(e) => handleInputChange('education.gpa', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="3.8/4.0"
                      disabled={creating}
                    />
                  </div>
                </div>
              </div>

              {/* Work Experience */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-700 border-b pb-2">
                  <Building className="h-4 w-4 inline mr-2" />
                  Most Recent Work Experience
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <input
                      id="company"
                      type="text"
                      value={formData.workExperience.company}
                      onChange={(e) => handleInputChange('workExperience.company', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="Company Name"
                      disabled={creating}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                      Position
                    </label>
                    <input
                      id="position"
                      type="text"
                      value={formData.workExperience.position}
                      onChange={(e) => handleInputChange('workExperience.position', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="Job Title"
                      disabled={creating}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      id="startDate"
                      type="month"
                      value={formData.workExperience.startDate}
                      onChange={(e) => handleInputChange('workExperience.startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      disabled={creating}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      id="endDate"
                      type="month"
                      value={formData.workExperience.endDate}
                      onChange={(e) => handleInputChange('workExperience.endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      disabled={formData.workExperience.current || creating}
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="current"
                    type="checkbox"
                    checked={formData.workExperience.current}
                    onChange={(e) => handleInputChange('workExperience.current', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={creating}
                  />
                  <label htmlFor="current" className="ml-2 text-sm text-gray-700">
                    Currently working here
                  </label>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.workExperience.description}
                    onChange={(e) => handleInputChange('workExperience.description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    placeholder="Brief description of responsibilities and achievements..."
                    disabled={creating}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Compensation & Availability Tab */}
          {activeTab === 'compensation' && (
            <div className="space-y-6">
              {/* Salary Expectation */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-700 border-b pb-2">
                  <DollarSign className="h-4 w-4 inline mr-2" />
                  Salary Expectation
                </h4>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="salaryMin" className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum
                    </label>
                    <input
                      id="salaryMin"
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.salaryExpectation.min}
                      onChange={(e) => handleInputChange('salaryExpectation.min', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                        errors.salaryMin ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="50000"
                      disabled={creating}
                    />
                    {errors.salaryMin && (
                      <p className="mt-1 text-sm text-red-600">{errors.salaryMin}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="salaryMax" className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum
                    </label>
                    <input
                      id="salaryMax"
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.salaryExpectation.max}
                      onChange={(e) => handleInputChange('salaryExpectation.max', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                        errors.salaryMax ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="70000"
                      disabled={creating}
                    />
                    {errors.salaryMax && (
                      <p className="mt-1 text-sm text-red-600">{errors.salaryMax}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      id="currency"
                      value={formData.salaryExpectation.currency}
                      onChange={(e) => handleInputChange('salaryExpectation.currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      disabled={creating}
                    >
                      {CURRENCIES.map((currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="negotiable"
                    type="checkbox"
                    checked={formData.salaryExpectation.negotiable}
                    onChange={(e) => handleInputChange('salaryExpectation.negotiable', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={creating}
                  />
                  <label htmlFor="negotiable" className="ml-2 text-sm text-gray-700">
                    Salary is negotiable
                  </label>
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-700 border-b pb-2">
                  <Clock className="h-4 w-4 inline mr-2" />
                  Availability
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="noticePeriod" className="block text-sm font-medium text-gray-700 mb-2">
                      Notice Period
                    </label>
                    <select
                      id="noticePeriod"
                      value={formData.noticePeriod}
                      onChange={(e) => handleInputChange('noticePeriod', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      disabled={creating}
                    >
                      <option value="">Select notice period...</option>
                      <option value="immediate">Immediate</option>
                      <option value="1 week">1 Week</option>
                      <option value="2 weeks">2 Weeks</option>
                      <option value="1 month">1 Month</option>
                      <option value="2 months">2 Months</option>
                      <option value="3 months">3 Months</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="availableStartDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Available Start Date
                    </label>
                    <input
                      id="availableStartDate"
                      type="date"
                      value={formData.availableStartDate}
                      onChange={(e) => handleInputChange('availableStartDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      disabled={creating}
                    />
                  </div>
                </div>
              </div>

              {/* Work Preferences */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-700 border-b pb-2">
                  <Home className="h-4 w-4 inline mr-2" />
                  Work Preferences
                </h4>
                
                <div>
                  <label htmlFor="preferredWorkType" className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Work Type
                  </label>
                  <select
                    id="preferredWorkType"
                    value={formData.preferredWorkType}
                    onChange={(e) => handleInputChange('preferredWorkType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    disabled={creating}
                  >
                    <option value="">Select work type...</option>
                    {WORK_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      id="willingToRelocate"
                      type="checkbox"
                      checked={formData.willingToRelocate}
                      onChange={(e) => handleInputChange('willingToRelocate', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={creating}
                    />
                    <label htmlFor="willingToRelocate" className="ml-2 text-sm text-gray-700">
                      Willing to relocate
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="hasWorkPermit"
                      type="checkbox"
                      checked={formData.hasWorkPermit}
                      onChange={(e) => handleInputChange('hasWorkPermit', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={creating}
                    />
                    <label htmlFor="hasWorkPermit" className="ml-2 text-sm text-gray-700">
                      Has work authorization
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Error Message */}
        {createError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800 mb-1">Error Creating Candidate</h4>
              <p className="text-sm text-red-700">{createError}</p>
            </div>
          </div>
        )}

        {/* Enhanced Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 bg-gray-50 -mx-6 px-6 py-4 rounded-b-xl">
          {/* Progress Indicators */}
          <div className="flex space-x-2">
            {tabs.map((tab, index) => {
              const isActive = activeTab === tab.id;
              const isCompleted = tabs.findIndex(t => t.id === activeTab) > index;
              
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-3 h-3 rounded-full transition-all duration-200 transform hover:scale-110
                    ${isActive 
                      ? `bg-gradient-to-r ${tab.color} shadow-lg` 
                      : isCompleted 
                        ? 'bg-green-500' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }
                  `}
                  disabled={creating}
                  title={tab.label}
                />
              );
            })}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={creating}
              className="px-6 py-2.5 text-gray-700 bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={creating || jobsLoading}
              className="min-w-[140px] px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Add Candidate
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}