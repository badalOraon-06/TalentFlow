import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { Building2, Users, ClipboardList, Loader2, BarChart3 } from 'lucide-react';
import { initializeDatabase } from './lib/database';
import { ProtectedRoute, PublicRoute } from './components';
import { SimpleToastProvider } from './components/SimpleToast';
import { SimpleNotificationBell } from './components/SimpleNotificationBell';
import { MSWHealthCheck } from './components/MSWHealthCheck';
import { UserMenu } from './components/UserMenu';
import { useAuth } from './store/authStore';
import { JobsPage, JobDetail, LoginPage, SignupPage, AssessmentsPage, AssessmentTakingPage, AssessmentCompletedPage, AssessmentResponsesPage, Dashboard, CandidatesPage, CandidateProfile } from './pages';

// AppContent component that uses useLocation inside Router context
function AppContent() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Check if current route is an auth page
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Hidden on auth pages */}
      {!isAuthPage && (
        <header className="bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Logo Section */}
              <div className="flex items-center group">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <Building2 className="h-7 w-7 text-white" />
                </div>
                <div className="ml-4">
                  <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                    TalentFlow
                  </span>
                  <div className="text-xs font-medium text-gray-500 tracking-wide">
                    Hiring Excellence Platform
                  </div>
                </div>
              </div>
              
              {/* Navigation */}
              {isAuthenticated && (
                <nav className="flex items-center space-x-2">
                  <Link 
                    to="/dashboard" 
                    className="group flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 hover:shadow-lg hover:scale-105"
                  >
                    <BarChart3 className="h-5 w-5 mr-2.5 group-hover:scale-110 transition-transform duration-300" />
                    <span>Dashboard</span>
                  </Link>
                  <Link 
                    to="/jobs" 
                    className="group flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 hover:shadow-lg hover:scale-105"
                  >
                    <Building2 className="h-5 w-5 mr-2.5 group-hover:scale-110 transition-transform duration-300" />
                    <span>Jobs</span>
                  </Link>
                  <Link 
                    to="/candidates" 
                    className="group flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-violet-600 hover:to-purple-600 transition-all duration-300 hover:shadow-lg hover:scale-105"
                  >
                    <Users className="h-5 w-5 mr-2.5 group-hover:scale-110 transition-transform duration-300" />
                    <span>Candidates</span>
                  </Link>
                  <Link 
                    to="/assessments" 
                    className="group flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-orange-600 hover:to-red-600 transition-all duration-300 hover:shadow-lg hover:scale-105"
                  >
                    <ClipboardList className="h-5 w-5 mr-2.5 group-hover:scale-110 transition-transform duration-300" />
                    <span>Assessments</span>
                  </Link>
                </nav>
              )}

              {/* Action Section */}
              <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                  <>
                    <SimpleNotificationBell />
                    <UserMenu />
                  </>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link
                      to="/login"
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={isAuthPage ? '' : 'pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          } />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/jobs" element={
            <ProtectedRoute>
              <JobsPage />
            </ProtectedRoute>
          } />
          <Route path="/jobs/:id" element={
            <ProtectedRoute>
              <JobDetail />
            </ProtectedRoute>
          } />
          <Route path="/candidates" element={
            <ProtectedRoute>
              <CandidatesPage />
            </ProtectedRoute>
          } />
          <Route path="/candidates/:id" element={
            <ProtectedRoute>
              <CandidateProfile />
            </ProtectedRoute>
          } />
          <Route path="/assessments" element={
            <ProtectedRoute>
              <AssessmentsPage />
            </ProtectedRoute>
          } />
          <Route path="/assessments/take/:jobId/:candidateId" element={
            <ProtectedRoute>
              <AssessmentTakingPage />
            </ProtectedRoute>
          } />
          <Route path="/assessments/completed/:candidateId" element={
            <ProtectedRoute>
              <AssessmentCompletedPage />
            </ProtectedRoute>
          } />
          <Route path="/assessments/responses/:jobId" element={
            <ProtectedRoute>
              <AssessmentResponsesPage />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const [initError, setInitError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        await initializeDatabase();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown error occurred');
      }
    };
    initApp();
  }, []);

  if (!isInitialized && !initError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Initializing TalentFlow...</p>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-900 mb-2">Initialization Failed</h3>
            <p className="text-red-700 mb-4">{initError}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SimpleToastProvider>
      <Router>
        <AppContent />
        <MSWHealthCheck />
      </Router>
    </SimpleToastProvider>
  );
}

export default App;