import type { Job, Candidate, Assessment, CandidateTimelineEvent, CandidateStage, Question, AssessmentSection, AssessmentResponse } from '../types';

// Sample data arrays
const jobTitles = [
  'Senior Frontend Developer', 'Backend Engineer', 'Full Stack Developer', 'DevOps Engineer',
  'Product Manager', 'UX/UI Designer', 'Data Scientist', 'Machine Learning Engineer',
  'Mobile App Developer', 'QA Engineer', 'Technical Lead', 'Software Architect',
  'Cloud Engineer', 'Cybersecurity Specialist', 'Database Administrator', 'Site Reliability Engineer',
  'Business Analyst', 'Scrum Master', 'Solution Architect', 'Infrastructure Engineer',
  'AI Research Scientist', 'Blockchain Developer', 'Game Developer', 'Embedded Systems Engineer'
];

const techTags = [
  'React', 'TypeScript', 'Node.js', 'Python', 'Java', 'Go', 'Rust', 'C++',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB',
  'GraphQL', 'REST', 'Microservices', 'CI/CD', 'Git', 'Agile', 'Scrum'
];

const locations = [
  'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Boston, MA',
  'Chicago, IL', 'Denver, CO', 'Los Angeles, CA', 'Remote', 'Hybrid'
];

const firstNames = [
  'Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn',
  'Blake', 'Cameron', 'Drew', 'Ellis', 'Finley', 'Hayden', 'Jamie', 'Kennedy',
  'Logan', 'Marley', 'Nico', 'Oakley', 'Parker', 'Reese', 'Sage', 'Tatum',
  'Adrian', 'Brooke', 'Charlie', 'Dana', 'Emery', 'Frances', 'Gray', 'Hunter'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker'
];

const stages: CandidateStage[] = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

// Utility functions
function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// Job generation
export function generateJobs(count: number): Job[] {
  const jobs: Job[] = [];
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < count; i++) {
    const title = randomElement(jobTitles);
    const createdAt = randomDate(threeMonthsAgo, now);
    
    const job: Job = {
      id: `job-${i + 1}`,
      title,
      slug: generateSlug(title),
      status: Math.random() > 0.2 ? 'active' : 'archived', // 80% active, 20% archived
      tags: randomElements(techTags, Math.floor(Math.random() * 4) + 2), // 2-5 tags
      order: i + 1,
      description: `We are looking for an experienced ${title} to join our growing team. You will work on cutting-edge projects and collaborate with a talented group of engineers.`,
      requirements: [
        `5+ years of experience in software development`,
        `Strong problem-solving skills`,
        `Experience with ${randomElements(techTags, 3).join(', ')}`,
        `Bachelor's degree in Computer Science or related field`
      ],
      location: randomElement(locations),
      salaryRange: {
        min: 80000 + Math.floor(Math.random() * 100000),
        max: 120000 + Math.floor(Math.random() * 180000),
        currency: 'USD'
      },
      createdAt,
      updatedAt: createdAt
    };

    jobs.push(job);
  }

  return jobs;
}

// Candidate generation
export function generateCandidates(count: number, jobs: Job[]): Candidate[] {
  const candidates: Candidate[] = [];
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < count; i++) {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    const appliedAt = randomDate(sixMonthsAgo, now);
    
    const candidate: Candidate = {
      id: `candidate-${i + 1}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      stage: randomElement(stages),
      jobId: randomElement(jobs).id,
      resumeUrl: `https://example.com/resumes/${firstName}-${lastName}.pdf`,
      notes: [],
      appliedAt,
      updatedAt: appliedAt
    };

    candidates.push(candidate);
  }

  return candidates;
}

// Assessment generation
export function generateAssessments(jobs: Job[]): Assessment[] {
  const assessments: Assessment[] = [];
  
  // Create assessments for ALL jobs to ensure we have at least 25 assessments (exceeding the minimum of 3)
  jobs.forEach((job, index) => {
    const sections = generateAssessmentSections(job);
    
    const assessment: Assessment = {
      id: `assessment-${index + 1}`,
      jobId: job.id,
      title: `${job.title} Assessment`,
      description: `Technical assessment for the ${job.title} position. Please answer all questions to the best of your ability.`,
      sections,
      createdAt: job.createdAt,
      updatedAt: job.createdAt
    };

    assessments.push(assessment);
  });

  return assessments;
}

function generateAssessmentSections(job: Job): AssessmentSection[] {
  const sections: AssessmentSection[] = [];

  // Technical Skills section
  const techQuestions = generateTechnicalQuestions(job.tags);
  sections.push({
    id: `section-tech-${job.id}`,
    title: 'Technical Skills',
    description: 'Questions about your technical expertise and experience.',
    order: 1,
    questions: techQuestions
  });

  // Experience section
  const expQuestions = generateExperienceQuestions();
  sections.push({
    id: `section-exp-${job.id}`,
    title: 'Professional Experience',
    description: 'Questions about your work experience and background.',
    order: 2,
    questions: expQuestions
  });

  // Problem Solving section - always include for comprehensive assessment
  const problemQuestions = generateProblemSolvingQuestions();
  sections.push({
    id: `section-problem-${job.id}`,
    title: 'Problem Solving',
    description: 'Scenario-based questions to assess your problem-solving abilities.',
    order: 3,
    questions: problemQuestions
  });

  return sections;
}

function generateTechnicalQuestions(tags: string[]): Question[] {
  const questions: Question[] = [];
  let order = 1;

  // Single choice question about primary tech stack
  questions.push({
    id: `tech-q${order++}`,
    type: 'single-choice',
    title: `What is your experience level with ${randomElement(tags)}?`,
    description: 'Please select the option that best describes your experience.',
    required: true,
    order: order - 1,
    options: ['Beginner (< 1 year)', 'Intermediate (1-3 years)', 'Advanced (3-5 years)', 'Expert (5+ years)']
  });

  // Multi-choice question about technologies
  questions.push({
    id: `tech-q${order++}`,
    type: 'multi-choice',
    title: 'Which of the following technologies have you worked with?',
    description: 'Select all that apply.',
    required: true,
    order: order - 1,
    options: randomElements(techTags, 8),
    maxSelections: 5
  });

  // Short text question about favorite tool
  questions.push({
    id: `tech-q${order++}`,
    type: 'short-text',
    title: 'What is your favorite development tool or framework and why?',
    description: 'Please provide a brief explanation.',
    required: false,
    order: order - 1,
    maxLength: 200,
    placeholder: 'e.g., VS Code because...'
  });

  // Additional question about testing
  questions.push({
    id: `tech-q${order++}`,
    type: 'single-choice',
    title: 'What is your preferred approach to testing?',
    description: 'Choose the testing strategy you use most often.',
    required: true,
    order: order - 1,
    options: ['Unit Testing', 'Integration Testing', 'E2E Testing', 'Manual Testing', 'Mix of All']
  });

  // Question about version control
  questions.push({
    id: `tech-q${order++}`,
    type: 'short-text',
    title: 'Describe your experience with Git branching strategies.',
    description: 'Which branching strategy do you prefer and why?',
    required: true,
    order: order - 1,
    maxLength: 300,
    placeholder: 'e.g., GitFlow, GitHub Flow, etc.'
  });

  // Architecture question
  questions.push({
    id: `tech-q${order++}`,
    type: 'multi-choice',
    title: 'Which architectural patterns have you implemented?',
    description: 'Select all that apply.',
    required: false,
    order: order - 1,
    options: ['MVC', 'MVP', 'MVVM', 'Microservices', 'Monolithic', 'Event-Driven', 'Layered Architecture'],
    maxSelections: 4
  });

  return questions;
}

function generateExperienceQuestions(): Question[] {
  const questions: Question[] = [];
  let order = 1;

  // Numeric question about years of experience
  questions.push({
    id: `exp-q${order++}`,
    type: 'numeric',
    title: 'How many years of professional software development experience do you have?',
    required: true,
    order: order - 1,
    min: 0,
    max: 50,
    step: 0.5,
    unit: 'years'
  });

  // Long text question about biggest achievement
  questions.push({
    id: `exp-q${order++}`,
    type: 'long-text',
    title: 'Describe your most significant professional achievement in software development.',
    description: 'Include details about the project, your role, technologies used, and the impact.',
    required: true,
    order: order - 1,
    maxLength: 1000,
    placeholder: 'Describe your achievement here...'
  });

  // File upload for portfolio
  questions.push({
    id: `exp-q${order++}`,
    type: 'file-upload',
    title: 'Upload your portfolio or code samples (optional)',
    description: 'You can upload a PDF portfolio or ZIP file containing code samples.',
    required: false,
    order: order - 1,
    acceptedTypes: ['.pdf', '.zip', '.tar.gz'],
    maxSize: 10 // 10 MB
  });

  // Work methodology question
  questions.push({
    id: `exp-q${order++}`,
    type: 'single-choice',
    title: 'Which development methodology do you prefer working in?',
    description: 'Select the methodology you are most comfortable with.',
    required: true,
    order: order - 1,
    options: ['Agile/Scrum', 'Kanban', 'Waterfall', 'DevOps', 'Hybrid Approach']
  });

  // Team size experience
  questions.push({
    id: `exp-q${order++}`,
    type: 'numeric',
    title: 'What is the largest team size you have worked in?',
    description: 'Number of developers/engineers in the team.',
    required: true,
    order: order - 1,
    min: 1,
    max: 100,
    step: 1,
    unit: 'people'
  });

  // Leadership experience
  questions.push({
    id: `exp-q${order++}`,
    type: 'short-text',
    title: 'Do you have any experience mentoring junior developers or leading projects?',
    description: 'Briefly describe your leadership or mentoring experience.',
    required: false,
    order: order - 1,
    maxLength: 250,
    placeholder: 'Describe your leadership experience...'
  });

  return questions;
}

function generateProblemSolvingQuestions(): Question[] {
  const questions: Question[] = [];
  let order = 1;

  // Scenario-based single choice
  questions.push({
    id: `problem-q${order++}`,
    type: 'single-choice',
    title: 'You discover a critical bug in production. What is your first step?',
    required: true,
    order: order - 1,
    options: [
      'Immediately create a hotfix and deploy',
      'Investigate and understand the impact first',
      'Rollback to the previous version',
      'Notify the team and stakeholders'
    ]
  });

  // Long text for problem-solving approach
  questions.push({
    id: `problem-q${order++}`,
    type: 'long-text',
    title: 'Describe how you would approach optimizing a slow-performing database query.',
    description: 'Walk through your thought process and the steps you would take.',
    required: true,
    order: order - 1,
    maxLength: 500,
    placeholder: 'First, I would...'
  });

  // Debugging scenario
  questions.push({
    id: `problem-q${order++}`,
    type: 'multi-choice',
    title: 'When debugging a complex issue, which tools and techniques do you typically use?',
    description: 'Select all that apply.',
    required: true,
    order: order - 1,
    options: ['Debugger/Breakpoints', 'Logging', 'Unit Tests', 'Code Review', 'Rubber Duck Debugging', 'Stack Overflow', 'Documentation'],
    maxSelections: 5
  });

  // System design question
  questions.push({
    id: `problem-q${order++}`,
    type: 'long-text',
    title: 'How would you design a system to handle 1 million concurrent users?',
    description: 'Consider scalability, performance, and reliability aspects.',
    required: false,
    order: order - 1,
    maxLength: 800,
    placeholder: 'I would start by...'
  });

  return questions;
}

// Timeline events generation
export function generateTimelineEvents(candidates: Candidate[]): CandidateTimelineEvent[] {
  const events: CandidateTimelineEvent[] = [];
  
  candidates.forEach(candidate => {
    // Initial application event
    events.push({
      id: `timeline-${candidate.id}-1`,
      candidateId: candidate.id,
      type: 'stage_change',
      data: { to: 'applied' },
      createdAt: candidate.appliedAt
    });

    // Generate additional stage changes based on current stage
    const stageProgression: CandidateStage[] = ['applied', 'screen', 'tech', 'offer'];
    const currentStageIndex = stageProgression.indexOf(candidate.stage);
    
    if (currentStageIndex > 0) {
      for (let i = 1; i <= currentStageIndex; i++) {
        const eventDate = new Date(candidate.appliedAt.getTime() + i * 7 * 24 * 60 * 60 * 1000); // 1 week intervals
        
        events.push({
          id: `timeline-${candidate.id}-${i + 1}`,
          candidateId: candidate.id,
          type: 'stage_change',
          data: { 
            from: stageProgression[i - 1], 
            to: stageProgression[i] 
          },
          createdAt: eventDate
        });
      }
    }

    // Add some random notes for active candidates
    if (['screen', 'tech', 'offer'].includes(candidate.stage) && Math.random() > 0.7) {
      const noteDate = new Date(candidate.appliedAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
      
      events.push({
        id: `timeline-${candidate.id}-note`,
        candidateId: candidate.id,
        type: 'note_added',
        data: {
          note: {
            id: `note-${candidate.id}`,
            content: 'Great technical skills demonstrated during the interview. Shows strong problem-solving abilities.',
            author: 'HR Team',
            createdAt: noteDate,
            mentions: []
          }
        },
        createdAt: noteDate
      });
    }
  });

  return events;
}

// Generate sample notifications
export function generateNotifications(candidates: Candidate[], jobs: Job[]): any[] {
  const notifications = [];
  const now = new Date();
  
  // Recent candidate applications (last 24 hours)
  for (let i = 0; i < Math.min(5, candidates.length); i++) {
    const candidate = candidates[i];
    const job = jobs.find(j => j.id === candidate.jobId);
    notifications.push({
      id: `notif-application-${candidate.id}`,
      userId: 'admin',
      title: 'New Application Received',
      message: `${candidate.name} applied for ${job?.title || 'a position'}`,
      type: 'application_received',
      category: 'candidate',
      data: {
        candidateId: candidate.id,
        jobId: candidate.jobId,
        candidateName: candidate.name,
        jobTitle: job?.title
      },
      isRead: Math.random() > 0.6, // 40% chance of being read
      createdAt: new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000), // Last 24 hours
      updatedAt: new Date()
    });
  }

  // Interview scheduled notifications
  for (let i = 0; i < Math.min(3, candidates.length); i++) {
    const candidate = candidates[i];
    const job = jobs.find(j => j.id === candidate.jobId);
    if (candidate.stage === 'screen' || candidate.stage === 'tech') {
      notifications.push({
        id: `notif-interview-${candidate.id}`,
        userId: 'admin',
        title: 'Interview Scheduled',
        message: `Interview scheduled with ${candidate.name} for ${job?.title || 'position'}`,
        type: 'interview_scheduled',
        category: 'interview',
        data: {
          candidateId: candidate.id,
          jobId: candidate.jobId,
          candidateName: candidate.name,
          jobTitle: job?.title,
          scheduledDate: new Date(now.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) // Next 7 days
        },
        isRead: Math.random() > 0.7, // 30% chance of being read
        createdAt: new Date(now.getTime() - Math.random() * 12 * 60 * 60 * 1000), // Last 12 hours
        updatedAt: new Date()
      });
    }
  }

  // Job posting notifications
  for (let i = 0; i < Math.min(2, jobs.length); i++) {
    const job = jobs[i];
    notifications.push({
      id: `notif-job-${job.id}`,
      userId: 'admin',
      title: 'New Job Posted',
      message: `${job.title} position has been published`,
      type: 'job_posted',
      category: 'job',
      data: {
        jobId: job.id,
        jobTitle: job.title,
        location: job.location
      },
      isRead: Math.random() > 0.5, // 50% chance of being read
      createdAt: new Date(now.getTime() - Math.random() * 48 * 60 * 60 * 1000), // Last 48 hours
      updatedAt: new Date()
    });
  }

  // Assessment completed notifications
  for (let i = 0; i < Math.min(4, candidates.length); i++) {
    const candidate = candidates[i];
    const job = jobs.find(j => j.id === candidate.jobId);
    if (candidate.stage === 'tech' || candidate.stage === 'offer') {
      notifications.push({
        id: `notif-assessment-${candidate.id}`,
        userId: 'admin',
        title: 'Assessment Completed',
        message: `${candidate.name} completed assessment for ${job?.title || 'position'}`,
        type: 'assessment_completed',
        category: 'assessment',
        data: {
          candidateId: candidate.id,
          jobId: candidate.jobId,
          candidateName: candidate.name,
          jobTitle: job?.title,
          score: Math.floor(Math.random() * 40) + 60 // Random score between 60-100
        },
        isRead: Math.random() > 0.4, // 60% chance of being read
        createdAt: new Date(now.getTime() - Math.random() * 36 * 60 * 60 * 1000), // Last 36 hours
        updatedAt: new Date()
      });
    }
  }

  // System notifications
  notifications.push({
    id: 'notif-system-update',
    userId: 'admin',
    title: 'System Update Available',
    message: 'A new system update is available with improved candidate tracking features',
    type: 'system_update',
    category: 'system',
    data: {
      version: '2.1.0',
      features: ['Enhanced candidate profiles', 'Improved notifications', 'Better analytics']
    },
    isRead: false,
    createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
    updatedAt: new Date()
  });

  notifications.push({
    id: 'notif-deadline-reminder',
    userId: 'admin',
    title: 'Application Deadline Reminder',
    message: 'Several job applications are closing soon',
    type: 'deadline_reminder',
    category: 'system',
    data: {
      jobsClosingSoon: jobs.slice(0, 3).map(job => ({
        id: job.id,
        title: job.title,
        deadline: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
      }))
    },
    isRead: false,
    createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
    updatedAt: new Date()
  });

  // Sort notifications by creation date (newest first)
  return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// Generate assessment responses for testing
export function generateAssessmentResponses(candidates: Candidate[], assessments: Assessment[]): AssessmentResponse[] {
  const responses: AssessmentResponse[] = [];
  
  // Generate responses for some candidates and assessments
  assessments.forEach(assessment => {
    // Randomly select 30-70% of candidates to have submitted responses
    const responseRate = 0.3 + Math.random() * 0.4;
    const candidatesWhoResponded = candidates
      .filter(() => Math.random() < responseRate)
      .slice(0, Math.floor(candidates.length * responseRate));
    
    candidatesWhoResponded.forEach(candidate => {
      const answers: Record<string, any> = {};
      
      // Generate sample answers for each question in the assessment
      assessment.sections?.forEach(section => {
        section.questions.forEach(question => {
          switch (question.type) {
            case 'single-choice':
              const singleOptions = (question as any).options || ['Option A', 'Option B', 'Option C'];
              answers[question.id] = singleOptions[Math.floor(Math.random() * singleOptions.length)];
              break;
            case 'multi-choice':
              const multiOptions = (question as any).options || ['Option A', 'Option B', 'Option C'];
              const selectedCount = Math.floor(Math.random() * Math.min(3, multiOptions.length)) + 1;
              answers[question.id] = multiOptions
                .sort(() => 0.5 - Math.random())
                .slice(0, selectedCount);
              break;
            case 'short-text':
              const shortResponses = [
                'Experienced in modern frameworks',
                'Strong problem-solving skills',
                'Team collaboration focus',
                'Continuous learning mindset',
                'Agile development experience'
              ];
              answers[question.id] = shortResponses[Math.floor(Math.random() * shortResponses.length)];
              break;
            case 'long-text':
              const longResponses = [
                'I have extensive experience working with modern web technologies including React, TypeScript, and Node.js. In my previous role, I led a team of developers in building scalable applications that served thousands of users.',
                'My approach to problem-solving involves breaking down complex issues into smaller components, researching best practices, and collaborating with team members to find optimal solutions.',
                'I believe in writing clean, maintainable code and following established coding standards. I have experience with test-driven development and continuous integration practices.',
                'Throughout my career, I have worked in agile environments, participating in sprint planning, daily standups, and retrospectives. I value clear communication and teamwork.'
              ];
              answers[question.id] = longResponses[Math.floor(Math.random() * longResponses.length)];
              break;
            case 'numeric':
              const numericValue = Math.floor(Math.random() * 10) + 1;
              answers[question.id] = numericValue;
              break;
            default:
              answers[question.id] = 'Sample response';
          }
        });
      });
      
      const now = new Date();
      const submittedTime = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Random time in last 30 days
      
      responses.push({
        id: `response-${candidate.id}-${assessment.id}`,
        candidateId: candidate.id,
        assessmentId: assessment.id,
        answers,
        completedAt: submittedTime,
        submittedAt: submittedTime
      });
    });
  });
  
  return responses;
}