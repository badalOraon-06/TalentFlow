import { useState, useEffect } from 'react';
import { Building2, ClipboardList, Users, Grid3X3, List, UserCheck, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCandidates, useUpdateCandidate } from '../hooks/useApiDirect';
import type { Candidate, CandidateStage } from '../types';
import { KanbanBoard } from '../components/DragAndDrop';
import { VirtualizedCandidateList } from '../components/VirtualizedList';
import { useSimpleToast } from '../components/SimpleToast';

// CandidatesSection component
function CandidatesSection({ 
  optimisticCandidates, 
  viewMode, 
  handleStageChange 
}: {
  optimisticCandidates: Candidate[];
  viewMode: 'list' | 'kanban';
  handleStageChange: (candidateId: string, newStage: CandidateStage) => void;
}) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Enhanced Content Card */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {viewMode === 'list' ? (
          <div className="p-4 sm:p-6 md:p-8">
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-lg sm:rounded-xl flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Candidate List View</h3>
                  <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">Browse and search through all candidates with detailed information</p>
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
          <div className="p-4 sm:p-6 md:p-8">
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center mb-4 sm:mb-6 md:mb-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg flex-shrink-0">
                  <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Kanban Board View</h3>
                  <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">Manage your candidate pipeline with intuitive drag and drop</p>
                </div>
              </div>
            </div>
            
            <KanbanBoard 
              candidates={optimisticCandidates || []} 
              onStageChange={handleStageChange}
              onCandidateClick={(candidate) => navigate(`/candidates/${candidate.id}`)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

//Main CandidatesPage component
export function CandidatesPage() {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const { showToast } = useSimpleToast();
  const { data: candidatesData, loading, error, refetch } = useCandidates({ page: 1, pageSize: 1000 });
  const { updateCandidate } = useUpdateCandidate();

  // Simplified state management without useOptimistic for better compatibility
  const [localCandidates, setLocalCandidates] = useState<Candidate[]>([]);
  
  // Update local candidates when data changes - use candidatesData directly to avoid infinite loop
  useEffect(() => {
    if (candidatesData?.candidates) {
      console.log('🎯 CandidatesPage updating candidates:', candidatesData.candidates.length);
      setLocalCandidates(candidatesData.candidates);
    }
  }, [candidatesData]);

  const handleStageChange = async (candidateId: string, newStage: CandidateStage) => {
    console.log('📝 Starting stage change:', { candidateId, newStage });
    
    // Find the candidate for better messaging
    const candidate = localCandidates.find(c => c.id === candidateId);
    const candidateName = candidate?.name || 'Candidate';
    
    // Optimistically update the local state immediately
    setLocalCandidates(prevCandidates => 
      prevCandidates.map(candidate =>
        candidate.id === candidateId
          ? { ...candidate, stage: newStage }
          : candidate
      )
    );

    try {
      console.log('💾 Updating database...');
      await updateCandidate(candidateId, { stage: newStage });
      console.log('✅ Database update successful');
      
      // Show success toast notification
      const stageNames: Record<CandidateStage, string> = {
        applied: 'Applied',
        screen: 'Screening',
        tech: 'Technical Interview',
        offer: 'Offer',
        hired: 'Hired',
        rejected: 'Rejected'
      };
      
      showToast(`${candidateName} moved to ${stageNames[newStage]} stage`, 'success');
      
      // No need to refetch - optimistic updates handle the UI
      // The data will stay in sync since we're using optimistic updates
    } catch (error) {
      console.error('❌ Failed to update candidate stage:', error);
      
      // Show error toast notification
      showToast(`Failed to update ${candidateName}'s stage. Please try again.`, 'error');
      
      // Refetch on error to get fresh data and revert optimistic update
      await refetch();
    }
  };

  // Calculate stage statistics
  const stageStats = {
    applied: localCandidates.filter((c: Candidate) => c.stage === 'applied').length,
    screen: localCandidates.filter((c: Candidate) => c.stage === 'screen').length,
    tech: localCandidates.filter((c: Candidate) => c.stage === 'tech').length,
    offer: localCandidates.filter((c: Candidate) => c.stage === 'offer').length,
    hired: localCandidates.filter((c: Candidate) => c.stage === 'hired').length,
    rejected: localCandidates.filter((c: Candidate) => c.stage === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm sm:text-base text-gray-600">Loading candidates...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header Section with Gradient */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-white shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-0">
              <div className="flex-1">
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg flex-shrink-0">
                    <Users className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">Candidates Pipeline</h1>
                    <p className="text-blue-100 text-xs sm:text-sm md:text-base lg:text-lg hidden sm:block">Manage and track your candidate pipeline with powerful tools</p>
                  </div>
                </div>
                
                {/* Enhanced Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-4 md:mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-white/20">
                    <div className="text-xl sm:text-2xl font-bold">{stageStats.applied}</div>
                    <div className="text-xs sm:text-sm text-blue-100 flex items-center justify-center mt-1">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Applied
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-white/20">
                    <div className="text-xl sm:text-2xl font-bold">{stageStats.screen}</div>
                    <div className="text-xs sm:text-sm text-blue-100 flex items-center justify-center mt-1">
                      <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden sm:inline">Screening</span>
                      <span className="sm:hidden">Screen</span>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-white/20">
                    <div className="text-xl sm:text-2xl font-bold">{stageStats.tech}</div>
                    <div className="text-xs sm:text-sm text-blue-100 flex items-center justify-center mt-1">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden sm:inline">Technical</span>
                      <span className="sm:hidden">Tech</span>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-white/20">
                    <div className="text-xl sm:text-2xl font-bold">{stageStats.offer}</div>
                    <div className="text-xs sm:text-sm text-blue-100 flex items-center justify-center mt-1">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Offer
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-white/20">
                    <div className="text-xl sm:text-2xl font-bold">{stageStats.hired}</div>
                    <div className="text-xs sm:text-sm text-blue-100 flex items-center justify-center mt-1">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Hired
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-white/20">
                    <div className="text-xl sm:text-2xl font-bold">{stageStats.rejected}</div>
                    <div className="text-xs sm:text-sm text-blue-100 flex items-center justify-center mt-1">
                      <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Rejected
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced View Toggle */}
              <div className="flex flex-col items-stretch lg:items-end w-full lg:w-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-1.5 sm:p-2 border border-white/20 shadow-lg">
                  <div className="flex bg-white/10 rounded-lg sm:rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex items-center justify-center flex-1 lg:flex-none px-4 sm:px-6 py-2 sm:py-2.5 md:py-3 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                        viewMode === 'list'
                          ? 'bg-white text-blue-600 shadow-lg'
                          : 'text-white hover:bg-white/20'
                      }`}
                    >
                      <List className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                      <span className="hidden sm:inline">List View</span>
                      <span className="sm:hidden">List</span>
                    </button>
                    <button
                      onClick={() => setViewMode('kanban')}
                      className={`flex items-center justify-center flex-1 lg:flex-none px-4 sm:px-6 py-2 sm:py-2.5 md:py-3 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                        viewMode === 'kanban'
                          ? 'bg-white text-blue-600 shadow-lg'
                          : 'text-white hover:bg-white/20'
                      }`}
                    >
                      <Grid3X3 className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                      <span className="hidden sm:inline">Kanban View</span>
                      <span className="sm:hidden">Kanban</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Candidates Section */}
        <CandidatesSection
          optimisticCandidates={localCandidates}
          viewMode={viewMode}
          handleStageChange={handleStageChange}
        />
      </div>
    </div>
  );
}