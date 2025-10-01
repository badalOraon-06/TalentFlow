import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Building2, Users, ClipboardList, Loader2, BarChart3 } from 'lucide-react';
import { initializeDatabase } from './lib/database';
import { useCandidates, useUpdateCandidate } from './hooks/useApiDirect';
import { Dashboard, JobsPage, JobDetail, CandidateProfile, AssessmentsPage, AssessmentTakingPage, AssessmentCompletedPage, AssessmentResponsesPage, LoginPage, SignupPage } from './pages';
import { KanbanBoard } from './components/DragAndDrop';
import { VirtualizedCandidateList } from './components/VirtualizedList';
import { UserMenu } from './components/UserMenu';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import { useIsAuthenticated } from './store/authStore';
import type { Candidate, CandidateStage } from './types';
import './App.css';

// Component that can use navigation hooks
function CandidatesSection({ 
  optimisticCandidates, 
  viewMode, 
  setViewMode,
  handleStageChange 
}: {
  optimisticCandidates: Candidate[];
  viewMode: 'list' | 'kanban';
  setViewMode: (mode: 'list' | 'kanban') => void;
  handleStageChange: (candidateId: string, newStage: CandidateStage) => void;
}) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  return (
    <div className="space-y-8">
      {/* Enhanced Content Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {viewMode === 'list' ? (
          <div className="p-8">
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center mr-3">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Candidate List View</h3>
                  <p className="text-gray-600 text-sm">Browse and search through all candidates with detailed information</p>
                </div>
              </div>
            </div>
            
            <VirtualizedCandidateList
              candidates={optimisticCandidates}
              onCandidateClick={(candidate) => navigate(`/candidates/${candidate.id}`)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedFilters={selectedFilters}
              onFilterChange={setSelectedFilters}
            />
          </div>
        ) : (
          <div className="p-8">
            <div className="mb-6">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <ClipboardList className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Kanban Board View</h3>
                  <p className="text-gray-600 text-sm">Manage your candidate pipeline with intuitive drag and drop</p>
                </div>
              </div>
            </div>
            
            <KanbanBoard 
              candidates={optimisticCandidates || []} 
              onStageChange={handleStageChange}
            />
          </div>
        )}
      </div>

      {/* Enhanced Feature Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mr-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">✅ Implemented Features</h3>
              <p className="text-gray-600 text-sm">Complete candidate management system</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>Virtualized list (1000+ candidates)</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>Real-time search & filtering</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>Candidate profiles with timeline</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>Kanban board with drag & drop</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>Notes system with @mentions</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>Deep linking & navigation</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>Full data persistence</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>Stage change tracking</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl flex items-center justify-center mr-4">
              <ClipboardList className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">🚀 Ready to Demo</h3>
              <p className="text-gray-600 text-sm">Explore the full candidate experience</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Click any candidate to view:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
                <div className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                  Complete timeline
                </div>
                <div className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                  Notes with @mentions
                </div>
                <div className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                  Contact information
                </div>
                <div className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                  Stage history
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl text-sm font-semibold shadow-lg">
                <span className="mr-2">🎯</span>
                All requirements implemented!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Protected Header Component
function AppHeader() {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return null; // Don't show header on login/signup pages
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">TalentFlow</span>
            </Link>
          </div>
          <nav className="flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
            <Link to="/jobs" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
              <Building2 className="h-4 w-4 mr-2" />
              Jobs
            </Link>
            <Link to="/candidates" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Candidates
            </Link>
            <Link to="/assessments" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
              <ClipboardList className="h-4 w-4 mr-2" />
              Assessments
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}

// Protected Main Content Component
function AppMain() {
  const isAuthenticated = useIsAuthenticated();

  return (
    <main className={isAuthenticated ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" : ""}>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          } 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/jobs" 
          element={
            <ProtectedRoute>
              <JobsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/jobs/:jobId" 
          element={
            <ProtectedRoute>
              <JobDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/candidates" 
          element={
            <ProtectedRoute>
              <CandidatesPlaceholder />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/candidates/:candidateId" 
          element={
            <ProtectedRoute>
              <CandidateProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/assessments" 
          element={
            <ProtectedRoute>
              <AssessmentsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/assessments/take/:jobId/:candidateId" 
          element={
            <ProtectedRoute>
              <AssessmentTakingPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/assessments/completed/:candidateId" 
          element={
            <ProtectedRoute>
              <AssessmentCompletedPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/assessments/responses/:jobId" 
          element={
            <ProtectedRoute>
              <AssessmentResponsesPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </main>
  );
}

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    async function initializeApp() {
      try {
        console.log('🚀 Initializing TalentFlow...');
        
        // Initialize IndexedDB with seed data
        const dbReady = await initializeDatabase();
        if (!dbReady) {
          throw new Error('Failed to initialize database');
        }
        
        console.log('✅ TalentFlow initialized successfully!');
      } catch (error) {
        console.error('❌ Failed to initialize app:', error);
        setInitError(error instanceof Error ? error.message : 'Initialization failed');
      } finally {
        setIsInitializing(false);
      }
    }

    initializeApp();
  }, []);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Initializing TalentFlow</h2>
          <p className="text-gray-600">Setting up your hiring platform...</p>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Initialization Error:</strong>
            <span className="block sm:inline"> {initError}</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <AppMain />
      </div>
    </Router>
  );
}

function CandidatesPlaceholder() {
  const { data: candidatesData, loading, error } = useCandidates({ page: 1, pageSize: 1000 });
  const { updateCandidate } = useUpdateCandidate();
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [optimisticCandidates, setOptimisticCandidates] = useState<Candidate[]>([]);

  // Update optimistic state when data changes
  useEffect(() => {
    if (candidatesData?.candidates) {
      setOptimisticCandidates(candidatesData.candidates);
    }
  }, [candidatesData]);

  // Handle stage change from kanban board with optimistic updates
  const handleStageChange = async (candidateId: string, newStage: CandidateStage) => {
    // Optimistic update - update UI immediately
    setOptimisticCandidates(prev => 
      prev.map(candidate => 
        candidate.id === candidateId 
          ? { ...candidate, stage: newStage, updatedAt: new Date() }
          : candidate
      )
    );

    try {
      console.log('🔄 Updating candidate stage:', { candidateId, newStage });
      await updateCandidate(candidateId, { stage: newStage });
      console.log('✅ Stage updated successfully');
    } catch (error) {
      console.error('❌ Failed to update candidate stage:', error);
      
      // Rollback optimistic update on error
      setOptimisticCandidates(prev => 
        prev.map(candidate => 
          candidate.id === candidateId 
            ? { ...candidate, stage: candidatesData?.candidates.find(c => c.id === candidateId)?.stage || candidate.stage }
            : candidate
        )
      );
      
      // Show error message (you could add a toast notification here)
      alert('Failed to update candidate stage. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header skeleton */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl animate-pulse"></div>
                <div>
                  <div className="h-8 bg-white/20 rounded w-64 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-white/10 rounded w-48 animate-pulse"></div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-10 bg-white/20 rounded-xl w-48 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              <span className="ml-3 text-lg font-medium text-gray-700">Loading candidates...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading Candidates</h3>
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline ml-1">{error}</span>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-xl font-semibold shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
              >
                Retry Loading
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stage statistics
  const stageStats = optimisticCandidates.reduce((acc, candidate) => {
    acc[candidate.stage] = (acc[candidate.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with Gradient Background */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Candidate Management</h1>
                <div className="flex items-center space-x-6 mt-2">
                  <div className="flex items-center text-green-100">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-sm font-medium">{optimisticCandidates.length} Total Candidates</span>
                  </div>
                  <div className="flex items-center text-green-100">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                    <span className="text-sm font-medium">{stageStats.applied || 0} Applied</span>
                  </div>
                  <div className="flex items-center text-green-100">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                    <span className="text-sm font-medium">{stageStats.screen || 0} In Screening</span>
                  </div>
                  <div className="flex items-center text-green-100">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                    <span className="text-sm font-medium">{stageStats.tech || 0} Technical</span>
                  </div>
                  <div className="flex items-center text-green-100">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
                    <span className="text-sm font-medium">{(stageStats.offer || 0) + (stageStats.hired || 0)} Hired/Offer</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Enhanced View Toggle */}
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  List View
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'kanban'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Kanban Board
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CandidatesSection
          optimisticCandidates={optimisticCandidates}
          viewMode={viewMode}
          setViewMode={setViewMode}
          handleStageChange={handleStageChange}
        />
      </div>
    </div>
  );
}

export default App;
