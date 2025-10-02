# 🚀 TalentFlow - Mini Hiring Platform

> A modern Applicant Tracking System (ATS) built with React, TypeScript, and cutting-edge web technologies.

**Live Demo**: [https://talent-flow-rho.vercel.app/](https://talent-flow-rho.vercel.app/)  
**Repository**: [GitHub - TalentFlow](https://github.com/badalOraon-06/TalentFlow)

---

## 📖 Overview

TalentFlow is a front-end only hiring platform that enables HR teams to manage jobs, candidates, and assessments. Built as a technical assignment demonstrating modern React development practices with offline-first architecture using IndexedDB and simulated API calls via Mock Service Worker (MSW).

---

## ✨ Features Implemented

### 1. Jobs Board

- ✅ List with pagination & filtering (title, status, tags)
- ✅ Create/Edit jobs with validation (required title, unique slug)
- ✅ Archive/Unarchive functionality
- ✅ Drag-and-drop reordering with optimistic updates & rollback on failure
- ✅ Deep linking: `/jobs/:jobId`

### 2. Candidates

- ✅ Virtualized list with 1000+ candidates
- ✅ Client-side search (name, email)
- ✅ Server-like stage filtering
- ✅ Kanban board with drag-and-drop stage transitions
- ✅ Candidate profile: `/candidates/:id` with timeline
- ✅ Notes with @mentions (display only)

### 3. Assessments

- ✅ Assessment builder per job with multiple question types:
  - Single-choice, Multi-choice, Short text, Long text, Numeric (with range), File upload stub
- ✅ Live preview pane
- ✅ Validation rules (required, max length, numeric range)
- ✅ Conditional questions based on previous answers
- ✅ Response persistence to IndexedDB

### 4. Data & API Simulation

- ✅ MSW for REST API simulation
- ✅ All required endpoints implemented
- ✅ Artificial latency (200-1200ms)
- ✅ 5-10% error rate on write operations
- ✅ IndexedDB persistence via Dexie.js

### 5. Seed Data

- ✅ 25 jobs (mixed active/archived)
- ✅ 1,000 candidates across jobs and stages
- ✅ 3+ assessments with 10+ questions each

---

## 🛠️ Tech Stack

| Category              | Technologies                        |
| --------------------- | ----------------------------------- |
| **Framework**         | React 19.1.1, TypeScript 5.8.3      |
| **Build Tool**        | Vite 7.1.7                          |
| **Styling**           | Tailwind CSS 4.1.13                 |
| **State Management**  | Zustand 5.0.8                       |
| **Forms**             | React Hook Form 7.63.0 + Zod 4.1.11 |
| **Database**          | Dexie.js 4.2.0 (IndexedDB wrapper)  |
| **API Mocking**       | MSW 2.11.3                          |
| **Routing**           | React Router DOM 7.9.3              |
| **Drag & Drop**       | @dnd-kit 6.3.1 + 10.0.0             |
| **Virtual Scrolling** | @tanstack/react-virtual 3.13.12     |
| **Icons**             | Lucide React 0.544.0                |

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js v18+
- npm v9+

### Installation

```bash
# Clone the repository
git clone https://github.com/badalOraon-06/TalentFlow.git
cd TalentFlow/talentflow

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit: **http://localhost:5173**

### Available Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Initial Setup

On first load, the app automatically seeds:

- 25 jobs (active/archived mix)
- 1,000 candidates
- 3 assessments with 10+ questions

Data persists in IndexedDB (`talentflow-db`). To reset, open DevTools → Application → IndexedDB → Delete database.

---

## 🏗️ Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │   Pages    │  │ Components │  │   Hooks    │  │   Routes   │ │
│  │            │  │            │  │            │  │            │ │
│  │ Dashboard  │  │  Modals    │  │ useApi     │  │ React      │ │
│  │ JobsPage   │  │  Forms     │  │ useReorder │  │ Router     │ │
│  │ Candidates │  │  Kanban    │  │ Custom     │  │ v7.9.3     │ │
│  │ Assessments│  │  Virtual   │  │ Logic      │  │            │ │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │
└───────────────────────────┬──────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│                      STATE MANAGEMENT LAYER                       │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐     │
│  │   authStore    │  │   appStore     │  │ notifyStore    │     │
│  │                │  │                │  │                │     │
│  │ • User session │  │ • Global state │  │ • Toasts       │     │
│  │ • Login/Logout │  │ • UI state     │  │ • Alerts       │     │
│  │ • Persistence  │  │ • Theme        │  │ • Notifications│     │
│  └────────────────┘  └────────────────┘  └────────────────┘     │
│                         Zustand v5.0.8                            │
└───────────────────────────┬──────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│                      API SIMULATION LAYER                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Mock Service Worker (MSW v2.11.3)           │   │
│  │                                                           │   │
│  │  Request Handlers:                                        │   │
│  │  • GET  /jobs?search=&status=&page=&sort=                │   │
│  │  • POST /jobs → Create with validation                   │   │
│  │  • PATCH /jobs/:id → Update job                          │   │
│  │  • PATCH /jobs/:id/reorder → Reorder with 500 errors    │   │
│  │  • GET  /candidates?search=&stage=&page=                 │   │
│  │  • POST /candidates → Create candidate                   │   │
│  │  • PATCH /candidates/:id → Stage transitions             │   │
│  │  • GET  /candidates/:id/timeline → History               │   │
│  │  • GET  /assessments/:jobId → Fetch assessment           │   │
│  │  • PUT  /assessments/:jobId → Update assessment          │   │
│  │  • POST /assessments/:jobId/submit → Submit responses    │   │
│  │                                                           │   │
│  │  Features:                                                │   │
│  │  ✓ Artificial latency: 200-1200ms random                │   │
│  │  ✓ Error simulation: 5-10% failure rate on writes       │   │
│  │  ✓ Network tab visibility (realistic debugging)         │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────┬──────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│                    PERSISTENCE LAYER (IndexedDB)                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Dexie.js v4.2.0 Schema                  │   │
│  │                                                           │   │
│  │  Tables:                                                  │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │   │
│  │  │    jobs     │  │  candidates  │  │  assessments   │ │   │
│  │  │             │  │              │  │                │ │   │
│  │  │ • id (PK)   │  │ • id (PK)    │  │ • id (PK)      │ │   │
│  │  │ • title     │  │ • name       │  │ • jobId        │ │   │
│  │  │ • slug      │  │ • email      │  │ • sections     │ │   │
│  │  │ • status    │  │ • stage      │  │ • questions    │ │   │
│  │  │ • tags[]    │  │ • jobId      │  │ • validations  │ │   │
│  │  │ • order     │  │ • createdAt  │  │                │ │   │
│  │  └─────────────┘  └──────────────┘  └────────────────┘ │   │
│  │                                                           │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │   │
│  │  │  responses  │  │   timeline   │  │     notes      │ │   │
│  │  │             │  │              │  │                │ │   │
│  │  │ • id (PK)   │  │ • id (PK)    │  │ • id (PK)      │ │   │
│  │  │ • assessId  │  │ • candidateId│  │ • candidateId  │ │   │
│  │  │ • candidateId│ │ • action     │  │ • content      │ │   │
│  │  │ • answers   │  │ • timestamp  │  │ • mentions[]   │ │   │
│  │  │ • submittedAt│ │ • from/to    │  │ • createdAt    │ │   │
│  │  └─────────────┘  └──────────────┘  └────────────────┘ │   │
│  │                                                           │   │
│  │  Indexes: email, stage, jobId, timestamp, assessmentId   │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Data Flow with Optimistic Updates

```
┌──────────────┐
│ User Action  │  Example: Drag candidate to "Hired" stage
└──────┬───────┘
       │
       ↓
┌──────────────────────────────────────────────────────┐
│ 1. OPTIMISTIC UPDATE (Instant - 0ms)                 │
│    • UI updates immediately                           │
│    • Candidate moves to "Hired" column               │
│    • Previous state saved for rollback               │
└──────┬───────────────────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────────────────┐
│ 2. API CALL (MSW Intercepted)                        │
│    • PATCH /candidates/:id { stage: "hired" }        │
│    • Artificial latency: 200-1200ms                  │
│    • 5-10% chance of failure                         │
└──────┬───────────────────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────────────────┐
│ 3. PERSISTENCE (IndexedDB Write)                     │
│    • Update candidate record in IndexedDB            │
│    • Add timeline entry: "Moved to Hired"            │
│    • Update related aggregations                     │
└──────┬───────────────────────────────────────────────┘
       │
       ↓
       ├─── SUCCESS ───────────────┐
       │                            │
       ↓                            ↓
┌──────────────────┐    ┌──────────────────────┐
│ 4a. SUCCESS      │    │ 4b. ERROR (Rollback) │
│ • Confirm update │    │ • Revert UI change   │
│ • Show toast     │    │ • Show error message │
│ • Update store   │    │ • Restore old state  │
└──────────────────┘    └──────────────────────┘
```

### Component Architecture

```
App.tsx (Root)
│
├─── Router (React Router v7)
│    │
│    ├─── Public Routes
│    │    ├─── LoginPage
│    │    └─── SignupPage
│    │
│    └─── Protected Routes (ProtectedRoute wrapper)
│         │
│         ├─── Dashboard
│         │    └─── Stats, Charts, Recent Activity
│         │
│         ├─── JobsPage
│         │    ├─── JobList (with pagination)
│         │    ├─── JobFormModal (Create/Edit)
│         │    ├─── SearchAndFilter
│         │    └─── DragAndDrop (Reordering)
│         │
│         ├─── JobDetail/:jobId
│         │    ├─── Job Info
│         │    ├─── Candidates for Job
│         │    └─── Assessment Link
│         │
│         ├─── CandidatesPage
│         │    ├─── VirtualizedList (1000+ items)
│         │    ├─── SearchBar (client-side)
│         │    ├─── StageFilter (server-side)
│         │    └─── DragAndDrop (Kanban Board)
│         │
│         ├─── CandidateProfile/:id
│         │    ├─── Personal Info
│         │    ├─── Timeline (status changes)
│         │    ├─── NotesComponent (@mentions)
│         │    └─── Assessment Results
│         │
│         └─── AssessmentsPage
│              ├─── AssessmentList
│              ├─── AssessmentBuilder
│              │    ├─── SectionBuilder
│              │    ├─── QuestionBuilder (6 types)
│              │    └─── ValidationRules
│              ├─── AssessmentPreview (Live)
│              └─── AssessmentTakingPage (Candidate view)
│
└─── Global Components
     ├─── Modal (reusable)
     ├─── Button (variants)
     ├─── Badge (status indicators)
     ├─── SimpleToast (notifications)
     ├─── UserMenu
     ├─── MobileNav
     └─── MSWHealthCheck
```

### Key Design Patterns

#### 1. **Offline-First Architecture**
- All data persisted to IndexedDB via Dexie.js
- App works completely offline
- No network dependency for core functionality
- Data survives page refreshes and browser restarts

#### 2. **Optimistic Updates**
- UI updates immediately before API confirmation
- Provides instant feedback (0ms perceived latency)
- Automatic rollback on API failures
- Used in: job reordering, candidate stage changes, note creation

#### 3. **Component Composition**
- Small, focused components with single responsibility
- Reusable UI elements (Button, Modal, Badge)
- Container/Presenter pattern separation
- Props for configuration, callbacks for actions

#### 4. **Custom Hooks Pattern**
```typescript
// Business logic extracted to reusable hooks
useApiDirect()      // API calls with error handling
useJobReorder()     // Drag-drop logic with optimistic updates
useVirtualScroll()  // Virtual scrolling configuration
useDebounce()       // Search input debouncing
```

#### 5. **Error Boundaries**
- Graceful error handling at component level
- User-friendly error messages
- Retry mechanisms for failed operations
- Fallback UI for broken components

---

## 📁 Project Structure

```
talentflow/
├── public/                              # Static assets served directly
│   ├── mockServiceWorker.js            # MSW service worker (auto-generated)
│   └── vite.svg                        # App favicon
│
├── src/                                 # Source code
│   │
│   ├── components/                      # Reusable UI components
│   │   ├── AssessmentBuilder.tsx       # Main assessment creation interface
│   │   │                               # • Section management
│   │   │                               # • Question type selection
│   │   │                               # • Preview integration
│   │   ├── AssessmentPreview.tsx       # Live preview pane (mirrors builder)
│   │   ├── Badge.tsx                   # Status badges (Active, Archived, etc.)
│   │   ├── Button.tsx                  # Reusable button with variants
│   │   ├── DragAndDrop.tsx             # Kanban board for candidates
│   │   │                               # • Stage columns
│   │   │                               # • Drag sensors (@dnd-kit)
│   │   │                               # • Optimistic updates
│   │   ├── Forms.tsx                   # Form components (Input, Textarea, Select)
│   │   ├── JobFormModal.tsx            # Job create/edit modal
│   │   │                               # • React Hook Form integration
│   │   │                               # • Zod validation
│   │   ├── LoginForm.tsx               # Authentication form
│   │   ├── Modal.tsx                   # Generic modal wrapper (reusable)
│   │   ├── MobileNav.tsx               # Mobile navigation drawer
│   │   ├── MSWHealthCheck.tsx          # MSW status monitor + auto-recovery
│   │   ├── NotesComponent.tsx          # Notes with @mentions rendering
│   │   ├── Pagination.tsx              # Server-like pagination component
│   │   ├── ProtectedRoute.tsx          # Auth guard for protected pages
│   │   ├── QuestionBuilder.tsx         # Individual question editor
│   │   │                               # • 6 question types
│   │   │                               # • Validation rules UI
│   │   ├── SectionBuilder.tsx          # Assessment section editor
│   │   ├── SignupForm.tsx              # User registration form
│   │   ├── SimpleNotificationBell.tsx  # Notification icon with count
│   │   ├── SimpleToast.tsx             # Toast notification system
│   │   ├── UserMenu.tsx                # User dropdown menu
│   │   ├── VirtualizedList.tsx         # Virtual scrolling list wrapper
│   │   │                               # • @tanstack/react-virtual
│   │   │                               # • Handles 1000+ items
│   │   └── index.ts                    # Component exports
│   │
│   ├── hooks/                          # Custom React hooks
│   │   ├── useApiDirect.ts             # Direct API calls with error handling
│   │   │                               # • Fetch wrapper
│   │   │                               # • Error states
│   │   │                               # • Loading states
│   │   └── useJobReorder.ts            # Job reordering logic
│   │                                   # • Optimistic updates
│   │                                   # • Rollback on failure
│   │
│   ├── lib/                            # Utility libraries and helpers
│   │   ├── database.ts                 # Dexie.js IndexedDB setup
│   │   │                               # • Schema definition
│   │   │                               # • Table relationships
│   │   │                               # • Indexes
│   │   ├── seedData.ts                 # Initial data generation
│   │   │                               # • 25 jobs
│   │   │                               # • 1000 candidates
│   │   │                               # • 3+ assessments
│   │   └── mswRecovery.ts              # MSW error recovery utility
│   │
│   ├── mocks/                          # Mock Service Worker configuration
│   │   ├── browser.ts                  # MSW browser setup
│   │   ├── handlers.ts                 # API request handlers (main)
│   │   │                               # • All REST endpoints
│   │   │                               # • Latency simulation
│   │   │                               # • Error injection
│   │   └── handlers-simple.ts          # Simplified handlers (alternative)
│   │
│   ├── pages/                          # Route page components
│   │   ├── AssessmentResponsesPage.tsx # View all responses for assessment
│   │   ├── AssessmentsPage.tsx         # Assessment list and management
│   │   ├── AssessmentTakingPage.tsx    # Candidate takes assessment
│   │   │                               # • Form runtime
│   │   │                               # • Validation
│   │   │                               # • Conditional questions
│   │   ├── CandidateProfile.tsx        # Detailed candidate view
│   │   │                               # • Personal info
│   │   │                               # • Timeline
│   │   │                               # • Notes
│   │   ├── CandidatesPage.tsx          # Candidate list + Kanban
│   │   │                               # • Virtual scrolling
│   │   │                               # • Search & filter
│   │   │                               # • Drag-and-drop
│   │   ├── Dashboard.tsx               # Main dashboard
│   │   │                               # • Stats cards
│   │   │                               # • Charts
│   │   │                               # • Recent activity
│   │   ├── JobDetail.tsx               # Single job details page
│   │   ├── JobsPage.tsx                # Jobs list with filtering
│   │   │                               # • Pagination
│   │   │                               # • Search
│   │   │                               # • Status filter
│   │   │                               # • Drag reorder
│   │   ├── LoginPage.tsx               # Login page
│   │   ├── SignupPage.tsx              # Registration page
│   │   └── index.ts                    # Page exports
│   │
│   ├── store/                          # Zustand state management
│   │   ├── appStore.ts                 # Global application state
│   │   │                               # • UI state
│   │   │                               # • Theme
│   │   ├── authStore.ts                # Authentication state
│   │   │                               # • User session
│   │   │                               # • Login/logout
│   │   │                               # • LocalStorage persistence
│   │   └── simpleNotificationStore.ts  # Notification state
│   │                                   # • Toast messages
│   │                                   # • Alerts
│   │
│   ├── types/                          # TypeScript type definitions
│   │   ├── index.ts                    # Main types (Job, Candidate, etc.)
│   │   ├── notification.ts             # Notification types
│   │   └── simpleNotification.ts       # Simple notification types
│   │
│   ├── App.tsx                         # Root component
│   │                                   # • Router setup
│   │                                   # • Protected routes
│   │                                   # • Layout structure
│   ├── App.css                         # Global styles (minimal)
│   ├── main.tsx                        # Application entry point
│   │                                   # • React render
│   │                                   # • MSW initialization
│   │                                   # • Database setup
│   └── index.css                       # Tailwind CSS imports
│
├── .gitignore                          # Git ignore rules
├── eslint.config.js                    # ESLint configuration
├── index.html                          # HTML entry point
├── package.json                        # Dependencies and scripts
├── postcss.config.js                   # PostCSS configuration
├── README.md                           # This file
├── tailwind.config.js                  # Tailwind CSS configuration
├── tsconfig.json                       # TypeScript base config
├── tsconfig.app.json                   # App-specific TS config
├── tsconfig.node.json                  # Node-specific TS config
├── vercel.json                         # Vercel deployment config
└── vite.config.ts                      # Vite build configuration
```

### Key Files Explained

| File/Folder | Purpose | Key Features |
|-------------|---------|--------------|
| `src/lib/database.ts` | Dexie.js schema & config | • 6 tables defined<br>• Indexes on frequently queried fields<br>• Type-safe database operations |
| `src/lib/seedData.ts` | Data generation | • 25 jobs with realistic data<br>• 1000 candidates distributed across stages<br>• 3+ assessments with 10+ questions each |
| `src/mocks/handlers.ts` | MSW request handlers | • All REST API endpoints<br>• Latency: 200-1200ms random<br>• 5-10% error rate on writes |
| `src/hooks/useApiDirect.ts` | API call wrapper | • Error handling<br>• Loading states<br>• Response parsing |
| `src/hooks/useJobReorder.ts` | Reorder logic | • Optimistic updates<br>• Automatic rollback on 500 errors<br>• Position recalculation |
| `src/components/DragAndDrop.tsx` | Kanban board | • @dnd-kit sensors<br>• Stage columns<br>• Candidate cards<br>• Drop handlers |
| `src/components/VirtualizedList.tsx` | Virtual scrolling | • @tanstack/react-virtual<br>• Renders only visible items<br>• Smooth 60 FPS scrolling |
| `src/store/authStore.ts` | Auth state | • Zustand store<br>• LocalStorage persistence<br>• Session management |
| `vercel.json` | Deployment config | • SPA routing config<br>• Rewrites for client-side routes<br>• Cache headers |

### Component Relationships

```
┌─────────────────────────────────────────────────┐
│                    App.tsx                      │
│  • MSW initialization                           │
│  • Database seeding                             │
│  • Router configuration                         │
└────────────────────┬────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
    ┌─────▼──────┐      ┌──────▼────────┐
    │   Public   │      │  Protected    │
    │   Routes   │      │   Routes      │
    └─────┬──────┘      └──────┬────────┘
          │                    │
    ┌─────▼──────┐      ┌──────▼────────────────────────┐
    │ LoginPage  │      │ Dashboard  JobsPage  Candidates│
    │ SignupPage │      │ Assessments  Profile           │
    └────────────┘      └───────────────────────────────┘
                                │
                        ┌───────┴──────────────┐
                        │                      │
                ┌───────▼────────┐    ┌───────▼───────┐
                │   Components   │    │    Hooks      │
                │ • Modal        │    │ • useApi      │
                │ • Forms        │    │ • useReorder  │
                │ • DragAndDrop  │    └───────────────┘
                │ • Virtual List │
                └────────────────┘
```

---

## 💡 Technical Decisions

### 1. **Why Zustand over Redux?**

- Lighter (~1KB vs 12KB)
- Simpler API, less boilerplate
- No Provider wrapping needed
- Built-in persistence

### 2. **Why Dexie.js for IndexedDB?**

- Promise-based API (vs IndexedDB callbacks)
- Automatic indexing
- TypeScript support
- Query optimization

### 3. **Why MSW over axios-mock-adapter?**

- Works at network level (more realistic)
- Visible in DevTools Network tab
- Works in both browser and tests
- Easy to switch to real API

### 4. **Why @dnd-kit over react-beautiful-dnd?**

- Better accessibility
- Smaller bundle
- More flexible
- Active maintenance (rbd deprecated)

### 5. **Why Virtual Scrolling?**

- Renders only visible items (~20 instead of 1000+)
- 50x faster initial render
- Smooth 60 FPS scrolling
- Memory efficient

### 6. **Optimistic Updates**

- Instant UI feedback
- Better UX (feels faster)
- Graceful error handling with rollback

---

## 🐛 Known Issues & Limitations

### Current Limitations

1. **No Real Backend**

   - Data stored locally in IndexedDB only
   - Not synced across devices/browsers
   - By design per assignment requirements

2. **MSW Service Worker**

   - Occasionally fails to register on first load
   - **Workaround**: Refresh page once
   - **Mitigation**: Added MSWHealthCheck component

3. **File Upload**

   - UI stub only, files not actually stored
   - Future enhancement

4. **@Mentions**

   - Display-only, no autocomplete
   - Future enhancement

5. **Search**
   - Client-side, case-sensitive
   - Could improve with fuzzy matching

### Browser Compatibility

| Browser     | Status           |
| ----------- | ---------------- |
| Chrome 87+  | ✅ Full Support  |
| Firefox 78+ | ✅ Full Support  |
| Safari 14+  | ✅ Full Support  |
| Edge 87+    | ✅ Full Support  |
| IE 11       | ❌ Not Supported |

---

## ⚡ Performance Optimizations

| Optimization       | Impact                    | Result      |
| ------------------ | ------------------------- | ----------- |
| Virtual Scrolling  | Renders 20 items vs 1000+ | 50x faster  |
| Code Splitting     | Smaller initial bundle    | Faster FCP  |
| Optimistic Updates | 0ms perceived latency     | Better UX   |
| Memoization        | Prevents re-renders       | Smoother UI |
| IndexedDB Indexing | Sub-10ms queries          | Fast reads  |

**Metrics:**

- First Contentful Paint: ~0.8s
- Lighthouse Score: 95/100
- Bundle Size: 737 KB (uncompressed)

---

## 📊 Assignment Requirements Checklist

### Core Features ✅

| Feature                            | Status |
| ---------------------------------- | ------ |
| Jobs pagination & filtering        | ✅     |
| Job create/edit with validation    | ✅     |
| Archive/Unarchive                  | ✅     |
| Drag-drop reordering + rollback    | ✅     |
| Deep linking `/jobs/:jobId`        | ✅     |
| Virtualized candidate list (1000+) | ✅     |
| Client search + server filter      | ✅     |
| Candidate profile + timeline       | ✅     |
| Kanban drag-drop                   | ✅     |
| Notes with @mentions               | ✅     |
| Assessment builder (6 types)       | ✅     |
| Live preview pane                  | ✅     |
| Validation + conditional logic     | ✅     |

### Data & API ✅

| Endpoint                         | Status |
| -------------------------------- | ------ |
| GET /jobs (search, filter, page) | ✅     |
| POST /jobs                       | ✅     |
| PATCH /jobs/:id                  | ✅     |
| PATCH /jobs/:id/reorder          | ✅     |
| GET /candidates                  | ✅     |
| POST /candidates                 | ✅     |
| PATCH /candidates/:id            | ✅     |
| GET /candidates/:id/timeline     | ✅     |
| GET/PUT /assessments/:jobId      | ✅     |
| POST /assessments/:jobId/submit  | ✅     |
| Latency 200-1200ms               | ✅     |
| 5-10% error rate                 | ✅     |
| IndexedDB persistence            | ✅     |

### Deliverables ✅

| Item                         | Status                                                       |
| ---------------------------- | ------------------------------------------------------------ |
| Deployed App                 | ✅ [Live Demo](https://talent-flow-rho.vercel.app/)          |
| GitHub Repo                  | ✅ [Repository](https://github.com/badalOraon-06/TalentFlow) |
| README - Setup               | ✅                                                           |
| README - Architecture        | ✅                                                           |
| README - Issues              | ✅                                                           |
| README - Technical Decisions | ✅                                                           |

---

## 🚀 Deployment

### Deployed on Vercel

**Live URL**: [https://talent-flow-rho.vercel.app/](https://talent-flow-rho.vercel.app/)

### Deployment Process

1. **Build**: `npm run build`
2. **Deploy**: Push to GitHub → Vercel auto-deploys
3. **Config**: `vercel.json` handles routing for SPA

### Local Production Build

```bash
npm run build
npm run preview  # Test at localhost:4173
```

---

## 👤 Author

**Badal Oraon**

- GitHub: [@badalOraon-06](https://github.com/badalOraon-06)
- Email: btech10738.22@bitmesra.ac.in
- LinkedIn: [Badal Oraon](https://www.linkedin.com/in/badal-oraon-776b40293/)

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file

---

## 🙏 Acknowledgments

- React 19 for latest features
- MSW for realistic API mocking
- Dexie.js for IndexedDB simplification
- Open-source community

---

**Built with ❤️ by Badal Oraon**

_Last Updated: October 3, 2025_
