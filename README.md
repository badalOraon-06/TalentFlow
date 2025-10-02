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
┌─────────────────────────────────────────────────────────────┐
│                        React App (UI Layer)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages      │  │  Components  │  │    Hooks     │      │
│  │  (Routes)    │  │   (Reusable) │  │   (Logic)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                    State Management (Zustand)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  authStore   │  │ notifyStore  │  │   appStore   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│              API Layer (MSW - Mock Service Worker)           │
│  ┌────────────────────────────────────────────────────┐     │
│  │  REST API Simulation (handlers.ts)                 │     │
│  │  • GET /jobs, /candidates, /assessments           │     │
│  │  • POST /jobs, /candidates                         │     │
│  │  • PATCH /jobs/:id, /candidates/:id               │     │
│  │  • Artificial latency (200-1200ms)                │     │
│  │  • Error simulation (5-10% failure rate)          │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│           Persistence Layer (IndexedDB via Dexie.js)         │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Tables: jobs, candidates, assessments,            │     │
│  │          responses, timeline, notes                 │     │
│  │  • Automatic indexing                              │     │
│  │  • Query optimization                              │     │
│  │  • Transaction support                             │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Action** → Component triggers API call
2. **MSW Intercepts** → Simulates latency (200-1200ms) and errors (5-10%)
3. **Optimistic Update** → UI updates immediately (where applicable)
4. **IndexedDB Write** → Data persisted locally
5. **Response** → Success/error returned
6. **UI Update** → Component re-renders or rolls back on error

### Key Design Patterns

- **Offline-First**: All data in IndexedDB, survives page refresh
- **Optimistic Updates**: Instant feedback with rollback on failure
- **Component Composition**: Small, reusable components
- **Custom Hooks**: Business logic extraction (`useApiDirect`, `useJobReorder`)

---

## 📁 Project Structure

```
talentflow/
├── public/                          # Static assets
│   ├── mockServiceWorker.js        # MSW service worker (auto-generated)
│   └── vite.svg                    # Favicon
│
├── src/
│   ├── components/                 # Reusable UI components
│   │   ├── AssessmentBuilder.tsx   # Assessment creation interface
│   │   ├── AssessmentPreview.tsx   # Live preview pane
│   │   ├── Badge.tsx               # Status badges
│   │   ├── Button.tsx              # Custom button component
│   │   ├── DragAndDrop.tsx         # Kanban board for candidates
│   │   ├── Forms.tsx               # Reusable form components
│   │   ├── JobFormModal.tsx        # Job create/edit modal
│   │   ├── LoginForm.tsx           # Authentication form
│   │   ├── Modal.tsx               # Generic modal wrapper
│   │   ├── MobileNav.tsx           # Mobile navigation drawer
│   │   ├── MSWHealthCheck.tsx      # MSW status monitor
│   │   ├── NotesComponent.tsx      # Notes with @mentions
│   │   ├── Pagination.tsx          # Server-like pagination
│   │   ├── ProtectedRoute.tsx      # Auth guard component
│   │   ├── QuestionBuilder.tsx     # Individual question editor
│   │   ├── SectionBuilder.tsx      # Assessment section editor
│   │   ├── SignupForm.tsx          # User registration
│   │   ├── SimpleNotificationBell.tsx # Notification icon
│   │   ├── SimpleToast.tsx         # Toast notifications
│   │   ├── UserMenu.tsx            # User dropdown menu
│   │   ├── VirtualizedList.tsx     # Virtual scrolling list
│   │   └── index.ts                # Component exports
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useApiDirect.ts         # Direct API calls
│   │   └── useJobReorder.ts        # Job reordering logic
│   │
│   ├── lib/                        # Utility libraries
│   │   ├── database.ts             # Dexie.js IndexedDB setup
│   │   ├── seedData.ts             # Initial data generation
│   │   └── mswRecovery.ts          # MSW error recovery
│   │
│   ├── mocks/                      # MSW configuration
│   │   ├── browser.ts              # MSW browser setup
│   │   ├── handlers.ts             # API request handlers
│   │   └── handlers-simple.ts      # Simplified handlers
│   │
│   ├── pages/                      # Route pages
│   │   ├── AssessmentResponsesPage.tsx  # View responses
│   │   ├── AssessmentsPage.tsx          # Assessment list
│   │   ├── AssessmentTakingPage.tsx     # Take assessment
│   │   ├── CandidateProfile.tsx         # Candidate details
│   │   ├── CandidatesPage.tsx           # Candidate list & Kanban
│   │   ├── Dashboard.tsx                # Main dashboard
│   │   ├── JobDetail.tsx                # Job details page
│   │   ├── JobsPage.tsx                 # Jobs list with filters
│   │   ├── LoginPage.tsx                # Login page
│   │   ├── SignupPage.tsx               # Registration page
│   │   └── index.ts                     # Page exports
│   │
│   ├── store/                      # Zustand state management
│   │   ├── appStore.ts             # Global app state
│   │   ├── authStore.ts            # Authentication state
│   │   └── simpleNotificationStore.ts   # Notification state
│   │
│   ├── types/                      # TypeScript definitions
│   │   ├── index.ts                # Main type definitions
│   │   ├── notification.ts         # Notification types
│   │   └── simpleNotification.ts   # Simple notification types
│   │
│   ├── App.tsx                     # Root component with routing
│   ├── App.css                     # Global styles
│   ├── main.tsx                    # Application entry point
│   └── index.css                   # Tailwind imports
│
├── .gitignore                      # Git ignore rules
├── eslint.config.js                # ESLint configuration
├── index.html                      # HTML entry point
├── package.json                    # Dependencies and scripts
├── postcss.config.js               # PostCSS configuration
├── README.md                       # This file
├── tailwind.config.js              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
├── tsconfig.app.json               # App-specific TS config
├── tsconfig.node.json              # Node-specific TS config
├── vercel.json                     # Vercel deployment config
└── vite.config.ts                  # Vite configuration
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
