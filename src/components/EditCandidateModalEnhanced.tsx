import { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Briefcase, Loader2, MapPin, GraduationCap, 
  Building, DollarSign, Link, Github, ExternalLink,
  Clock, Home, Plus, X, Edit
} from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge } from './Badge';
import { useJobs, useUpdateCandidate } from '../hooks/useApiDirect';
import type { Job, Candidate, CandidateStage, ExperienceLevel } from '../types';

interface EditCandidateModalEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  candidate: Candidate | null;
}

const STAGES: { id: CandidateStage; title: string; color: string }[] = [
  { id: 'applied', title: 'Applied', color: 'bg-blue-100 text-blue-800' },
  { id: 'screen', title: 'Screening', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'tech', title: 'Technical', color: 'bg-purple-100 text-purple-800' },
  { id: 'offer', title: 'Offer', color: 'bg-green-100 text-green-800' },
  { id: 'hired', title: 'Hired', color: 'bg-green-200 text-green-900' },
  { id: 'rejected', title: 'Rejected', color: 'bg-red-100 text-red-800' },
];

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

export function EditCandidateModalEnhanced({ isOpen, onClose, onSuccess, candidate }: EditCandidateModalEnhancedProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    email: '',
    phone: '',
    jobId: '',
    stage: 'applied' as CandidateStage,
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
  const { updateCandidate, loading: updating, error: updateError } = useUpdateCandidate();

  // Populate form when candidate changes
  useEffect(() => {
    if (candidate && isOpen) {
      const education = candidate.education?.[0] || {
        degree: '',
        institution: '',
        field: '',
        graduationYear: '',
        gpa: ''
      };
      
      const workExperience = candidate.workExperience?.[0] || {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: '',
        current: false
      };
      
      const salaryExpectation = candidate.salaryExpectation || {
        min: '',
        max: '',
        currency: 'USD',
        negotiable: true
      };

      setFormData({
        name: candidate.name || '',
        email: candidate.email || '',
        phone: candidate.phone || '',
        jobId: candidate.jobId || '',
        stage: candidate.stage || 'applied',
        location: candidate.location || '',
        summary: candidate.summary || '',
        experienceLevel: candidate.experienceLevel || '',
        yearsOfExperience: candidate.yearsOfExperience?.toString() || '',
        skills: candidate.skills || [],
        linkedinUrl: candidate.linkedinUrl || '',
        portfolioUrl: candidate.portfolioUrl || '',
        githubUrl: candidate.githubUrl || '',
        education: {
          degree: education.degree || '',
          institution: education.institution || '',
          field: education.field || '',
          graduationYear: education.graduationYear?.toString() || '',
          gpa: education.gpa || ''
        },
        workExperience: {
          company: workExperience.company || '',
          position: workExperience.position || '',
          startDate: workExperience.startDate || '',
          endDate: workExperience.endDate || '',
          description: workExperience.description || '',
          current: workExperience.current || false
        },
        salaryExpectation: {
          min: salaryExpectation.min?.toString() || '',
          max: salaryExpectation.max?.toString() || '',
          currency: salaryExpectation.currency || 'USD',
          negotiable: salaryExpectation.negotiable !== false
        },
        noticePeriod: candidate.noticePeriod || '',
        availableStartDate: candidate.availableStartDate ? 
          new Date(candidate.availableStartDate).toISOString().split('T')[0] : '',
        preferredWorkType: candidate.preferredWorkType || '',
        willingToRelocate: candidate.willingToRelocate || false,
        hasWorkPermit: candidate.hasWorkPermit !== false,
      });
      setErrors({});
    }
  }, [candidate, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('basic');
      setSkillInput('');
      setErrors({});
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

    if (!formData.stage) {
      newErrors.stage = 'Please select a stage';
    }

    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
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
    
    if (!candidate || !validateForm()) {
      return;
    }

    try {
      // Prepare candidate data with proper type conversion
      const candidateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        jobId: formData.jobId,
        stage: formData.stage,
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

      await updateCandidate(candidate.id, candidateData);

      // Success - close modal and notify parent
      onClose();
      onSuccess();
    } catch (err) {
      // Error is already handled by the hook
      console.error('Failed to update candidate:', err);
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

  if (!candidate) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Candidate" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Candidate Info Header */}
        <div className="bg-gray-50 rounded-lg p-4 border">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-700">
                {candidate.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{candidate.name}</h3>
              <p className="text-sm text-gray-500">Candidate ID: {candidate.id.slice(0, 8)}</p>
              <p className="text-xs text-gray-400">
                Applied {new Date(candidate.appliedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6 max-h-96 overflow-y-auto px-1">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-2" />
                  Full Name *
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter candidate's full name"
                  disabled={updating}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email Address *
                </label>
                <input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="candidate@example.com"
                  disabled={updating}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Phone Number
                </label>
                <input
                  id="edit-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                    errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="+1 (555) 123-4567"
                  disabled={updating}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Location Field */}
              <div>
                <label htmlFor="edit-location" className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  Location
                </label>
                <input
                  id="edit-location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="City, State/Country"
                  disabled={updating}
                />
              </div>

              {/* Job Selection */}
              <div>
                <label htmlFor="edit-jobId" className="block text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="h-4 w-4 inline mr-2" />
                  Position *
                </label>
                {jobsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading positions...</span>
                  </div>
                ) : (
                  <select
                    id="edit-jobId"
                    value={formData.jobId}
                    onChange={(e) => handleInputChange('jobId', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                      errors.jobId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={updating}
                  >
                    <option value="">Select a position...</option>
                    {jobsData?.jobs.map((job: Job) => (
                      <option key={job.id} value={job.id}>
                        {job.title} {job.location && `- ${job.location}`}
                      </option>
                    ))}
                  </select>
                )}
                {errors.jobId && (
                  <p className="mt-1 text-sm text-red-600">{errors.jobId}</p>
                )}
              </div>

              {/* Stage Selection */}
              <div>
                <label htmlFor="edit-stage" className="block text-sm font-medium text-gray-700 mb-2">
                  <Edit className="h-4 w-4 inline mr-2" />
                  Current Stage *
                </label>
                <div className="space-y-3">
                  {STAGES.map((stage) => (
                    <label key={stage.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="stage"
                        value={stage.id}
                        checked={formData.stage === stage.id}
                        onChange={(e) => handleInputChange('stage', e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                        disabled={updating}
                      />
                      <Badge 
                        variant={stage.id === formData.stage ? 'primary' : 'secondary'} 
                        size="sm"
                        className={stage.color}
                      >
                        {stage.title}
                      </Badge>
                    </label>
                  ))}
                </div>
                {errors.stage && (
                  <p className="mt-1 text-sm text-red-600">{errors.stage}</p>
                )}
              </div>
            </div>
          )}

          {/* Professional Information Tab */}
          {activeTab === 'professional' && (
            <div className="space-y-4">
              {/* Summary */}
              <div>
                <label htmlFor="edit-summary" className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Summary
                </label>
                <textarea
                  id="edit-summary"
                  value={formData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="Brief overview of skills, experience, and career objectives..."
                  disabled={updating}
                />
              </div>

              {/* Experience Level */}
              <div>
                <label htmlFor="edit-experienceLevel" className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <select
                  id="edit-experienceLevel"
                  value={formData.experienceLevel}
                  onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  disabled={updating}
                >
                  <option value="">Select experience level...</option>
                  {EXPERIENCE_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Years of Experience */}
              <div>
                <label htmlFor="edit-yearsOfExperience" className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  id="edit-yearsOfExperience"
                  type="number"
                  min="0"
                  max="50"
                  value={formData.yearsOfExperience}
                  onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                    errors.yearsOfExperience ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  disabled={updating}
                />
                {errors.yearsOfExperience && (
                  <p className="mt-1 text-sm text-red-600">{errors.yearsOfExperience}</p>
                )}
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills
                </label>
                <div className="space-y-2">
                  <div className="flex">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={handleSkillKeyPress}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="Enter a skill (e.g., JavaScript, Project Management)"
                      disabled={updating}
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
                      disabled={updating}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {formData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                            disabled={updating}
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
                <h4 className="text-md font-medium text-gray-700 border-b pb-2">Professional Links</h4>
                
                {/* LinkedIn */}
                <div>
                  <label htmlFor="edit-linkedinUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    <Link className="h-4 w-4 inline mr-2" />
                    LinkedIn Profile
                  </label>
                  <input
                    id="edit-linkedinUrl"
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                      errors.linkedinUrl ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="https://linkedin.com/in/username"
                    disabled={updating}
                  />
                  {errors.linkedinUrl && (
                    <p className="mt-1 text-sm text-red-600">{errors.linkedinUrl}</p>
                  )}
                </div>

                {/* Portfolio */}
                <div>
                  <label htmlFor="edit-portfolioUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    <ExternalLink className="h-4 w-4 inline mr-2" />
                    Portfolio Website
                  </label>
                  <input
                    id="edit-portfolioUrl"
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                      errors.portfolioUrl ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="https://portfolio.example.com"
                    disabled={updating}
                  />
                  {errors.portfolioUrl && (
                    <p className="mt-1 text-sm text-red-600">{errors.portfolioUrl}</p>
                  )}
                </div>

                {/* GitHub */}
                <div>
                  <label htmlFor="edit-githubUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    <Github className="h-4 w-4 inline mr-2" />
                    GitHub Profile
                  </label>
                  <input
                    id="edit-githubUrl"
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                      errors.githubUrl ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="https://github.com/username"
                    disabled={updating}
                  />
                  {errors.githubUrl && (
                    <p className="mt-1 text-sm text-red-600">{errors.githubUrl}</p>
                  )}
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
                    <label htmlFor="edit-degree" className="block text-sm font-medium text-gray-700 mb-2">
                      Degree
                    </label>
                    <input
                      id="edit-degree"
                      type="text"
                      value={formData.education.degree}
                      onChange={(e) => handleInputChange('education.degree', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="Bachelor of Science"
                      disabled={updating}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-field" className="block text-sm font-medium text-gray-700 mb-2">
                      Field of Study
                    </label>
                    <input
                      id="edit-field"
                      type="text"
                      value={formData.education.field}
                      onChange={(e) => handleInputChange('education.field', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="Computer Science"
                      disabled={updating}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="edit-institution" className="block text-sm font-medium text-gray-700 mb-2">
                    Institution
                  </label>
                  <input
                    id="edit-institution"
                    type="text"
                    value={formData.education.institution}
                    onChange={(e) => handleInputChange('education.institution', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    placeholder="University Name"
                    disabled={updating}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-graduationYear" className="block text-sm font-medium text-gray-700 mb-2">
                      Graduation Year
                    </label>
                    <input
                      id="edit-graduationYear"
                      type="number"
                      min="1950"
                      max="2030"
                      value={formData.education.graduationYear}
                      onChange={(e) => handleInputChange('education.graduationYear', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="2023"
                      disabled={updating}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-gpa" className="block text-sm font-medium text-gray-700 mb-2">
                      GPA (Optional)
                    </label>
                    <input
                      id="edit-gpa"
                      type="text"
                      value={formData.education.gpa}
                      onChange={(e) => handleInputChange('education.gpa', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="3.8/4.0"
                      disabled={updating}
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
                    <label htmlFor="edit-company" className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <input
                      id="edit-company"
                      type="text"
                      value={formData.workExperience.company}
                      onChange={(e) => handleInputChange('workExperience.company', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="Company Name"
                      disabled={updating}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-position" className="block text-sm font-medium text-gray-700 mb-2">
                      Position
                    </label>
                    <input
                      id="edit-position"
                      type="text"
                      value={formData.workExperience.position}
                      onChange={(e) => handleInputChange('workExperience.position', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="Job Title"
                      disabled={updating}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-startDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      id="edit-startDate"
                      type="month"
                      value={formData.workExperience.startDate}
                      onChange={(e) => handleInputChange('workExperience.startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      disabled={updating}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-endDate" className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      id="edit-endDate"
                      type="month"
                      value={formData.workExperience.endDate}
                      onChange={(e) => handleInputChange('workExperience.endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      disabled={formData.workExperience.current || updating}
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="edit-current"
                    type="checkbox"
                    checked={formData.workExperience.current}
                    onChange={(e) => handleInputChange('workExperience.current', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={updating}
                  />
                  <label htmlFor="edit-current" className="ml-2 text-sm text-gray-700">
                    Currently working here
                  </label>
                </div>

                <div>
                  <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description
                  </label>
                  <textarea
                    id="edit-description"
                    value={formData.workExperience.description}
                    onChange={(e) => handleInputChange('workExperience.description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    placeholder="Brief description of responsibilities and achievements..."
                    disabled={updating}
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
                    <label htmlFor="edit-salaryMin" className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum
                    </label>
                    <input
                      id="edit-salaryMin"
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.salaryExpectation.min}
                      onChange={(e) => handleInputChange('salaryExpectation.min', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                        errors.salaryMin ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="50000"
                      disabled={updating}
                    />
                    {errors.salaryMin && (
                      <p className="mt-1 text-sm text-red-600">{errors.salaryMin}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="edit-salaryMax" className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum
                    </label>
                    <input
                      id="edit-salaryMax"
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.salaryExpectation.max}
                      onChange={(e) => handleInputChange('salaryExpectation.max', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                        errors.salaryMax ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="70000"
                      disabled={updating}
                    />
                    {errors.salaryMax && (
                      <p className="mt-1 text-sm text-red-600">{errors.salaryMax}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="edit-currency" className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      id="edit-currency"
                      value={formData.salaryExpectation.currency}
                      onChange={(e) => handleInputChange('salaryExpectation.currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      disabled={updating}
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
                    id="edit-negotiable"
                    type="checkbox"
                    checked={formData.salaryExpectation.negotiable}
                    onChange={(e) => handleInputChange('salaryExpectation.negotiable', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={updating}
                  />
                  <label htmlFor="edit-negotiable" className="ml-2 text-sm text-gray-700">
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
                    <label htmlFor="edit-noticePeriod" className="block text-sm font-medium text-gray-700 mb-2">
                      Notice Period
                    </label>
                    <select
                      id="edit-noticePeriod"
                      value={formData.noticePeriod}
                      onChange={(e) => handleInputChange('noticePeriod', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      disabled={updating}
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
                    <label htmlFor="edit-availableStartDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Available Start Date
                    </label>
                    <input
                      id="edit-availableStartDate"
                      type="date"
                      value={formData.availableStartDate}
                      onChange={(e) => handleInputChange('availableStartDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      disabled={updating}
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
                  <label htmlFor="edit-preferredWorkType" className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Work Type
                  </label>
                  <select
                    id="edit-preferredWorkType"
                    value={formData.preferredWorkType}
                    onChange={(e) => handleInputChange('preferredWorkType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    disabled={updating}
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
                      id="edit-willingToRelocate"
                      type="checkbox"
                      checked={formData.willingToRelocate}
                      onChange={(e) => handleInputChange('willingToRelocate', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={updating}
                    />
                    <label htmlFor="edit-willingToRelocate" className="ml-2 text-sm text-gray-700">
                      Willing to relocate
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="edit-hasWorkPermit"
                      type="checkbox"
                      checked={formData.hasWorkPermit}
                      onChange={(e) => handleInputChange('hasWorkPermit', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={updating}
                    />
                    <label htmlFor="edit-hasWorkPermit" className="ml-2 text-sm text-gray-700">
                      Has work authorization
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {updateError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {updateError}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  activeTab === tab.id ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                disabled={updating}
              />
            ))}
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={updating || jobsLoading}
              className="min-w-[120px]"
            >
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}