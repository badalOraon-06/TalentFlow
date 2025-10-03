import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, Input, Textarea, Button } from '../components';
import { useCreateJob, useUpdateJob } from '../hooks/useApiDirect';
import { useSimpleToast } from './SimpleToast';
import type { Job } from '../types';

// Complete validation schema with all job fields
const jobSchema = z.object({
  title: z.string().min(1, 'Job title is required').max(100, 'Title must be 100 characters or less'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  location: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  requirements: z.array(z.string()).optional(),
  tags: z.array(z.string()).min(1, 'At least one tag is required').max(10, 'Maximum 10 tags allowed'),
  jobType: z.enum(['full-time', 'part-time', 'contract', 'freelance', 'internship']).optional(),
  workType: z.enum(['remote', 'hybrid', 'onsite']).optional(),
  salaryMin: z.number().min(0, 'Minimum salary must be positive').optional(),
  salaryMax: z.number().min(0, 'Maximum salary must be positive').optional(),
  salaryCurrency: z.string().optional(),
  status: z.enum(['active', 'archived'])
}).refine((data) => {
  // Ensure max salary is greater than min if both are provided
  if (data.salaryMin && data.salaryMax) {
    return data.salaryMax >= data.salaryMin;
  }
  return true;
}, {
  message: 'Maximum salary must be greater than or equal to minimum salary',
  path: ['salaryMax']
});

type JobFormData = z.infer<typeof jobSchema>;

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  job?: Job; // If provided, we're editing; otherwise creating
  onSuccess?: (job: Job) => void;
}

export function JobFormModal({ isOpen, onClose, job, onSuccess }: JobFormModalProps) {
  const [tagInput, setTagInput] = useState('');
  const [requirementInput, setRequirementInput] = useState('');
  const isEditing = !!job;
  const { showToast } = useSimpleToast();

  const createJobHook = useCreateJob();
  const updateJobHook = useUpdateJob();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    getValues
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: job ? {
      title: job.title,
      slug: job.slug,
      location: job.location || '',
      description: job.description || '',
      requirements: job.requirements || [],
      tags: job.tags || [],
      jobType: job.jobType,
      workType: job.workType,
      salaryMin: job.salaryRange?.min,
      salaryMax: job.salaryRange?.max,
      salaryCurrency: job.salaryRange?.currency || 'USD',
      status: job.status
    } : {
      title: '',
      slug: '',
      location: '',
      description: '',
      requirements: [],
      tags: [],
      jobType: undefined,
      workType: undefined,
      salaryMin: undefined,
      salaryMax: undefined,
      salaryCurrency: 'USD',
      status: 'active'
    }
  });

  const watchedTags = watch('tags');
  const watchedRequirements = watch('requirements');

  // Reset form when job prop changes or modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('🔄 JobFormModal: Resetting form with job data:', job);
      if (job) {
        // Editing mode - populate with job data
        reset({
          title: job.title,
          slug: job.slug,
          location: job.location || '',
          description: job.description || '',
          requirements: job.requirements || [],
          tags: job.tags || [],
          jobType: job.jobType,
          workType: job.workType,
          salaryMin: job.salaryRange?.min,
          salaryMax: job.salaryRange?.max,
          salaryCurrency: job.salaryRange?.currency || 'USD',
          status: job.status
        });
      } else {
        // Create mode - clear form
        reset({
          title: '',
          slug: '',
          location: '',
          description: '',
          requirements: [],
          tags: [],
          jobType: undefined,
          workType: undefined,
          salaryMin: undefined,
          salaryMax: undefined,
          salaryCurrency: 'USD',
          status: 'active'
        });
      }
      setTagInput('');
      setRequirementInput('');
    }
  }, [isOpen, job, reset]);

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Update slug when title changes (only if not editing or slug is empty)
  const handleTitleChange = (title: string) => {
    if (!isEditing || !getValues('slug')) {
      setValue('slug', generateSlug(title));
    }
  };

  // Handle tag input
  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !watchedTags.includes(tag) && watchedTags.length < 10) {
      setValue('tags', [...watchedTags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Handle requirement input
  const handleAddRequirement = () => {
    const requirement = requirementInput.trim();
    if (requirement && !watchedRequirements?.includes(requirement)) {
      setValue('requirements', [...(watchedRequirements || []), requirement]);
      setRequirementInput('');
    }
  };

  const handleRemoveRequirement = (requirementToRemove: string) => {
    setValue('requirements', (watchedRequirements || []).filter(req => req !== requirementToRemove));
  };

  const handleRequirementKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddRequirement();
    }
  };

  const onSubmit = async (data: JobFormData) => {
    try {
      const jobData: any = {
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        tags: data.tags,
        location: data.location,
        jobType: data.jobType,
        workType: data.workType
      };

      // Add salary range if provided
      if (data.salaryMin || data.salaryMax) {
        jobData.salaryRange = {
          min: data.salaryMin || 0,
          max: data.salaryMax || 0,
          currency: data.salaryCurrency || 'USD'
        };
      }

      let result;
      if (isEditing && job) {
        result = await updateJobHook.updateJob(job.id, jobData);
        showToast(`Job "${result.title}" updated successfully`, 'success');
      } else {
        result = await createJobHook.createJob(jobData);
        showToast(`Job "${result.title}" created successfully`, 'success');
      }

      onSuccess?.(result);
      onClose();
      reset();
    } catch (error) {
      console.error('Failed to save job:', error);
      showToast('Failed to save job. Please try again.', 'error');
    }
  };

  const handleClose = () => {
    reset();
    setTagInput('');
    setRequirementInput('');
    onClose();
  };

  const isLoading = createJobHook.loading || updateJobHook.loading;
  const error = createJobHook.error || updateJobHook.error;

  const footer = (
    <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
      <Button variant="secondary" onClick={handleClose} disabled={isLoading} className="w-full sm:w-auto">
        Cancel
      </Button>
      <Button
        type="submit"
        form="job-form"
        loading={isLoading}
        disabled={isLoading}
        className="w-full sm:w-auto"
      >
        {isEditing ? 'Update Job' : 'Create Job'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Job' : 'Create New Job'}
      size="lg"
      footer={footer}
      closeOnBackdrop={!isLoading}
      closeOnEsc={!isLoading}
    >
      <form id="job-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded text-sm sm:text-base">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Job Title */}
          <div>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Job Title"
                  placeholder="e.g. Senior React Developer"
                  error={errors.title?.message}
                  required
                  onChange={(e) => {
                    field.onChange(e);
                    handleTitleChange(e.target.value);
                  }}
                />
              )}
            />
          </div>

          {/* Slug */}
          <div>
            <Controller
              name="slug"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="URL Slug"
                  placeholder="senior-react-developer"
                  error={errors.slug?.message}
                  helpText="Used in URLs. Only lowercase letters, numbers, and hyphens."
                  required
                />
              )}
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Location"
                placeholder="e.g. San Francisco, CA / Remote"
                error={errors.location?.message}
              />
            )}
          />
        </div>

        {/* Job Type and Work Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <Controller
              name="jobType"
              control={control}
              render={({ field }) => (
                <div className="space-y-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    Job Type
                  </label>
                  <select
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value || undefined)}
                    className="input"
                  >
                    <option value="">Select job type</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                    <option value="internship">Internship</option>
                  </select>
                  {errors.jobType && (
                    <p className="text-xs sm:text-sm text-red-600">{errors.jobType.message}</p>
                  )}
                </div>
              )}
            />
          </div>

          <div>
            <Controller
              name="workType"
              control={control}
              render={({ field }) => (
                <div className="space-y-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    Work Type
                  </label>
                  <select
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value || undefined)}
                    className="input"
                  >
                    <option value="">Select work type</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">Onsite</option>
                  </select>
                  {errors.workType && (
                    <p className="text-xs sm:text-sm text-red-600">{errors.workType.message}</p>
                  )}
                </div>
              )}
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  {...field}
                  className="input"
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
                {errors.status && (
                  <p className="text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>
            )}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Skills & Tags <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a skill or tag..."
                className="flex-1 input text-sm sm:text-base"
                maxLength={20}
              />
              <Button type="button" variant="secondary" onClick={handleAddTag} className="px-3 sm:px-4">
                Add
              </Button>
            </div>
            {watchedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {watchedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800 text-sm sm:text-base"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            {errors.tags && (
              <p className="text-xs sm:text-sm text-red-600">{errors.tags.message}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                label="Job Description"
                placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                rows={4}
                error={errors.description?.message}
              />
            )}
          />
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Requirements
          </label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={requirementInput}
                onChange={(e) => setRequirementInput(e.target.value)}
                onKeyPress={handleRequirementKeyPress}
                placeholder="Add a requirement..."
                className="flex-1 input text-sm sm:text-base"
              />
              <Button type="button" variant="secondary" onClick={handleAddRequirement} className="px-3 sm:px-4">
                Add
              </Button>
            </div>
            {watchedRequirements && watchedRequirements.length > 0 && (
              <div className="space-y-2">
                {watchedRequirements.map((requirement, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <span className="flex-1 text-xs sm:text-sm text-gray-700">{requirement}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(requirement)}
                      className="text-red-500 hover:text-red-700 text-lg font-bold leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {errors.requirements && (
              <p className="text-xs sm:text-sm text-red-600">{errors.requirements.message}</p>
            )}
          </div>
        </div>

        {/* Salary Range */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Salary Range
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <Controller
                name="salaryMin"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    label="Minimum"
                    placeholder="50000"
                    error={errors.salaryMin?.message}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    value={field.value || ''}
                  />
                )}
              />
            </div>
            <div>
              <Controller
                name="salaryMax"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    label="Maximum"
                    placeholder="100000"
                    error={errors.salaryMax?.message}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    value={field.value || ''}
                  />
                )}
              />
            </div>
            <div>
              <Controller
                name="salaryCurrency"
                control={control}
                render={({ field }) => (
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">
                      Currency
                    </label>
                    <select
                      {...field}
                      className="input"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="CAD">CAD ($)</option>
                      <option value="AUD">AUD ($)</option>
                    </select>
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default JobFormModal;