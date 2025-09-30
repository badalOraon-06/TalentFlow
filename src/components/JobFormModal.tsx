import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, Input, Textarea, Button } from '../components';
import { useCreateJob, useUpdateJob } from '../hooks/useApiDirect';
import type { Job } from '../types';

// Simplified validation schema to match current API
const jobSchema = z.object({
  title: z.string().min(1, 'Job title is required').max(100, 'Title must be 100 characters or less'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  location: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  tags: z.array(z.string()).min(1, 'At least one tag is required').max(10, 'Maximum 10 tags allowed'),
  status: z.enum(['active', 'archived'])
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
  const isEditing = !!job;

  const createJobHook = useCreateJob();
  const updateJobHook = useUpdateJob();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
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
      tags: job.tags || [],
      status: job.status
    } : {
      title: '',
      slug: '',
      location: '',
      description: '',
      tags: [],
      status: 'active'
    }
  });

  const watchedTags = watch('tags');

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

  const onSubmit = async (data: JobFormData) => {
    try {
      const jobData = {
        title: data.title,
        description: data.description,
        tags: data.tags,
        location: data.location
      };

      let result;
      if (isEditing && job) {
        result = await updateJobHook.updateJob(job.id, jobData);
      } else {
        result = await createJobHook.createJob(jobData);
      }

      onSuccess?.(result);
      onClose();
      reset();
    } catch (error) {
      console.error('Failed to save job:', error);
    }
  };

  const handleClose = () => {
    reset();
    setTagInput('');
    onClose();
  };

  const isLoading = createJobHook.loading || updateJobHook.loading;
  const error = createJobHook.error || updateJobHook.error;

  const footer = (
    <div className="flex justify-end space-x-3">
      <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
        Cancel
      </Button>
      <Button
        type="submit"
        form="job-form"
        loading={isLoading}
        disabled={isLoading}
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
      <form id="job-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="flex-1 input"
                maxLength={20}
              />
              <Button type="button" variant="secondary" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            {watchedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {watchedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            {errors.tags && (
              <p className="text-sm text-red-600">{errors.tags.message}</p>
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
      </form>
    </Modal>
  );
}

export default JobFormModal;