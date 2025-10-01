# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

# 🚀 TalentFlow

**A modern, feature-rich Applicant Tracking System (ATS) built with React, TypeScript, and cutting-edge web technologies.**

TalentFlow streamlines the recruitment process with an intuitive interface for managing job postings, candidates, assessments, and hiring workflows.

## ✨ Features

### 🎯 Core Functionality

- **Job Management**: Create, edit, and manage job postings with detailed requirements
- **Candidate Tracking**: Comprehensive candidate profiles with application history
- **Kanban Board**: Visual pipeline for tracking candidates through hiring stages
- **Assessment System**: Create and manage technical assessments and evaluations
- **Dashboard Analytics**: Real-time insights into recruitment metrics

### 🔧 Technical Features

- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-time Updates**: Live data synchronization across the application
- **Advanced Search & Filtering**: Find candidates and jobs quickly with smart filters
- **Drag & Drop Interface**: Intuitive candidate stage management
- **Virtual Scrolling**: High-performance lists for large datasets
- **Offline Capability**: Local data persistence with IndexedDB

### 🎨 UI/UX

- **Modern Interface**: Clean, professional design built with Tailwind CSS
- **Dark/Light Mode**: Adaptive theming for user preference
- **Accessibility**: WCAG compliant with keyboard navigation support
- **Loading States**: Smooth transitions and feedback for all user actions

## 🛠️ Tech Stack

### Frontend

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management

### Data & Storage

- **Dexie.js** - IndexedDB wrapper for offline storage
- **MSW (Mock Service Worker)** - API mocking for development
- **React Hook Form** - Performant form handling
- **Zod** - Schema validation

### UI Components & Interactions

- **Lucide React** - Beautiful icon library
- **@dnd-kit** - Accessible drag and drop
- **@tanstack/react-virtual** - Virtual scrolling for performance

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/badalOraon-06/TalentFlow.git
   cd TalentFlow
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to see the application.

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint for code quality
npm run lint
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AddCandidateModal.tsx
│   ├── AssessmentBuilder.tsx
│   ├── DragAndDrop.tsx
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useApi.ts
│   └── useApiDirect.ts
├── lib/                # Utility functions and database
│   ├── database.ts
│   └── seedData.ts
├── mocks/              # MSW mock handlers
├── pages/              # Page components
│   ├── JobsPage.tsx
│   ├── CandidateProfile.tsx
│   └── ...
├── store/              # Zustand store definitions
├── types/              # TypeScript type definitions
└── App.tsx             # Main application component
```

## 🔧 Configuration

### Environment Setup

The application runs entirely in the browser with no backend dependencies required for development. All data is stored locally using IndexedDB.

### Customization

- **Styling**: Modify `tailwind.config.js` for design system customization
- **Types**: Add new types in `src/types/index.ts`
- **API**: Update mock handlers in `src/mocks/` for different data scenarios

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The `dist/` folder contains the optimized production build ready for deployment.

### Deployment Options

- **Vercel**: Deploy directly from GitHub
- **Netlify**: Drag and drop the `dist/` folder
- **GitHub Pages**: Use GitHub Actions for automatic deployment
- **Any static hosting**: Upload the `dist/` folder contents

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern React ecosystem tools
- Inspired by best practices in recruitment technology
- Special thanks to the open-source community

---

**Made with ❤️ by [Badal Oraon](https://github.com/badalOraon-06)**

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
