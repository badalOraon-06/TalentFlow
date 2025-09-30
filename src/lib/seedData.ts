import type { Job, Candidate, Assessment, CandidateTimelineEvent, CandidateStage, Question, AssessmentSection } from '../types';

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