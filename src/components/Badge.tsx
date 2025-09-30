import type { HTMLAttributes } from 'react';
import { X } from 'lucide-react';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  removable?: boolean;
  onRemove?: () => void;
  children: React.ReactNode;
}

export function Badge({ 
  variant = 'default', 
  size = 'sm', 
  removable = false, 
  onRemove, 
  children, 
  className = '', 
  ...props 
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center font-medium rounded-full transition-colors';
  
  const variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-600',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-cyan-100 text-cyan-800',
  };
  
  const sizeClasses: Record<BadgeSize, string> = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1 text-sm',
  };

  const iconSize: Record<BadgeSize, string> = {
    xs: 'w-3 h-3',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
      {removable && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
        >
          <X className={iconSize[size]} />
        </button>
      )}
    </span>
  );
}

// Status Badge for Job/Candidate Status
type StatusValue = 'active' | 'draft' | 'closed' | 'archived' | 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';

interface StatusBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  status: StatusValue;
}

export function StatusBadge({ status, ...props }: StatusBadgeProps) {
  const statusConfig: Record<StatusValue, { variant: BadgeVariant; label: string }> = {
    // Job statuses
    active: { variant: 'success', label: 'Active' },
    draft: { variant: 'secondary', label: 'Draft' },
    closed: { variant: 'error', label: 'Closed' },
    archived: { variant: 'default', label: 'Archived' },
    
    // Candidate statuses
    applied: { variant: 'info', label: 'Applied' },
    screening: { variant: 'warning', label: 'Screening' },
    interview: { variant: 'primary', label: 'Interview' },
    offer: { variant: 'success', label: 'Offer' },
    hired: { variant: 'success', label: 'Hired' },
    rejected: { variant: 'error', label: 'Rejected' },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} {...props}>
      {config.label}
    </Badge>
  );
}

// Priority Badge for Jobs
type PriorityValue = 'low' | 'medium' | 'high' | 'urgent';

interface PriorityBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  priority: PriorityValue;
}

export function PriorityBadge({ priority, ...props }: PriorityBadgeProps) {
  const priorityConfig: Record<PriorityValue, { variant: BadgeVariant; label: string }> = {
    low: { variant: 'default', label: 'Low' },
    medium: { variant: 'warning', label: 'Medium' },
    high: { variant: 'error', label: 'High' },
    urgent: { variant: 'error', label: 'Urgent' },
  };

  const config = priorityConfig[priority];

  return (
    <Badge variant={config.variant} {...props}>
      {config.label}
    </Badge>
  );
}

// Skill Badge for removable tags
interface SkillBadgeProps extends Omit<BadgeProps, 'children'> {
  skill: string;
}

export function SkillBadge({ skill, ...props }: SkillBadgeProps) {
  return (
    <Badge variant="primary" size="sm" {...props}>
      {skill}
    </Badge>
  );
}

// Count Badge (for notifications, etc.)
interface CountBadgeProps extends Omit<BadgeProps, 'children'> {
  count: number;
  max?: number;
}

export function CountBadge({ count, max = 99, className = '', ...props }: CountBadgeProps) {
  const displayCount = count > max ? `${max}+` : count.toString();
  
  return (
    <Badge 
      variant="error" 
      size="xs" 
      className={`px-1.5 min-w-[1.25rem] justify-center ${className}`}
      {...props}
    >
      {displayCount}
    </Badge>
  );
}