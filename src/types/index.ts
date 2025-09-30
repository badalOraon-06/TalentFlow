// Job related types
export interface Job {
  id: string;
  title: string;
  slug: string;
  status: 'active' | 'archived';
  tags: string[];
  order: number;
  description?: string;
  requirements?: string[];
  location?: string;
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface JobCreateInput {
  title: string;
  description?: string;
  requirements?: string[];
  location?: string;
  tags: string[];
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface JobUpdateInput extends Partial<JobCreateInput> {
  status?: 'active' | 'archived';
}

export interface JobFilters {
  search?: string;
  status?: 'active' | 'archived' | 'all';
  tags?: string[];
}

export interface JobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Candidate related types
export type CandidateStage = 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected';

export type ExperienceLevel = 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'executive';

export type EducationLevel = 'high-school' | 'bachelors' | 'masters' | 'phd' | 'other';

export interface SalaryExpectation {
  min: number;
  max: number;
  currency: string;
  negotiable: boolean;
}

export interface Education {
  degree: string;
  institution: string;
  field: string;
  graduationYear?: number;
  gpa?: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
  current: boolean;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  stage: CandidateStage;
  jobId: string;
  resumeUrl?: string;
  notes: Note[];
  
  // Enhanced profile information
  location?: string;
  summary?: string;
  experienceLevel?: ExperienceLevel;
  yearsOfExperience?: number;
  skills?: string[];
  education?: Education[];
  workExperience?: WorkExperience[];
  
  // Professional links
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  
  // Compensation
  salaryExpectation?: SalaryExpectation;
  
  // Availability
  noticePeriod?: string;
  availableStartDate?: Date;
  
  // Additional information
  preferredWorkType?: 'remote' | 'hybrid' | 'onsite';
  willingToRelocate?: boolean;
  hasWorkPermit?: boolean;
  
  appliedAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  content: string;
  author: string;
  createdAt: Date;
  mentions: string[];
}

export interface CandidateCreateInput {
  name: string;
  email: string;
  phone?: string;
  jobId: string;
  resumeUrl?: string;
  
  // Enhanced profile information
  location?: string;
  summary?: string;
  experienceLevel?: ExperienceLevel;
  yearsOfExperience?: number;
  skills?: string[];
  education?: Education[];
  workExperience?: WorkExperience[];
  
  // Professional links
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  
  // Compensation
  salaryExpectation?: SalaryExpectation;
  
  // Availability
  noticePeriod?: string;
  availableStartDate?: Date;
  
  // Additional information
  preferredWorkType?: 'remote' | 'hybrid' | 'onsite';
  willingToRelocate?: boolean;
  hasWorkPermit?: boolean;
}

export interface CandidateUpdateInput {
  name?: string;
  email?: string;
  phone?: string;
  stage?: CandidateStage;
  notes?: Note[];
  
  // Enhanced profile information
  location?: string;
  summary?: string;
  experienceLevel?: ExperienceLevel;
  yearsOfExperience?: number;
  skills?: string[];
  education?: Education[];
  workExperience?: WorkExperience[];
  
  // Professional links
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  
  // Compensation
  salaryExpectation?: SalaryExpectation;
  
  // Availability
  noticePeriod?: string;
  availableStartDate?: Date;
  
  // Additional information
  preferredWorkType?: 'remote' | 'hybrid' | 'onsite';
  willingToRelocate?: boolean;
  hasWorkPermit?: boolean;
}

export interface CandidateFilters {
  search?: string;
  stage?: CandidateStage;
  jobId?: string;
}

export interface CandidatesResponse {
  candidates: Candidate[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CandidateTimelineEvent {
  id: string;
  candidateId: string;
  type: 'stage_change' | 'note_added' | 'assessment_completed';
  data: {
    from?: CandidateStage;
    to?: CandidateStage;
    note?: Note;
    assessmentId?: string;
  };
  createdAt: Date;
}

// Assessment related types
export type QuestionType = 'single-choice' | 'multi-choice' | 'short-text' | 'long-text' | 'numeric' | 'file-upload';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  order: number;
}

export interface SingleChoiceQuestion extends BaseQuestion {
  type: 'single-choice';
  options: string[];
}

export interface MultiChoiceQuestion extends BaseQuestion {
  type: 'multi-choice';
  options: string[];
  maxSelections?: number;
}

export interface ShortTextQuestion extends BaseQuestion {
  type: 'short-text';
  maxLength?: number;
  placeholder?: string;
}

export interface LongTextQuestion extends BaseQuestion {
  type: 'long-text';
  maxLength?: number;
  placeholder?: string;
}

export interface NumericQuestion extends BaseQuestion {
  type: 'numeric';
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface FileUploadQuestion extends BaseQuestion {
  type: 'file-upload';
  acceptedTypes: string[];
  maxSize: number; // in MB
}

export type Question = 
  | SingleChoiceQuestion 
  | MultiChoiceQuestion 
  | ShortTextQuestion 
  | LongTextQuestion 
  | NumericQuestion 
  | FileUploadQuestion;

export interface AssessmentSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  questions: Question[];
}

export interface Assessment {
  id: string;
  jobId: string;
  title: string;
  description?: string;
  sections: AssessmentSection[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ConditionalRule {
  questionId: string;
  condition: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string | number | string[];
  showQuestionIds: string[];
}

export interface AssessmentResponse {
  id: string;
  candidateId: string;
  assessmentId: string;
  answers: Record<string, any>;
  completedAt?: Date;
  submittedAt?: Date;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Pagination types
export interface PaginationParams {
  page: number;
  pageSize: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface ModalState {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'view';
  data?: any;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];