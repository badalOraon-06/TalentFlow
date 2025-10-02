import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  DragOverlay,
} from '@dnd-kit/core';
import type {
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { GripVertical, GripHorizontal } from 'lucide-react';
import type { Job, Candidate, CandidateStage } from '../types';
import { Badge, StatusBadge } from './Badge';

// Sortable Job List for reordering
interface SortableJobListProps {
  jobs: Job[];
  onReorder: (jobs: Job[]) => void;
  className?: string;
}

export function SortableJobList({ jobs, onReorder, className = '' }: SortableJobListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = jobs.findIndex((job) => job.id === active.id);
      const newIndex = jobs.findIndex((job) => job.id === over?.id);

      console.log(`🎯 DragEnd: Moving job from index ${oldIndex} to ${newIndex}`);
      console.log(`📋 DragEnd: Job IDs - from: ${active.id}, to: ${over?.id}`);

      const reorderedJobs = arrayMove(jobs, oldIndex, newIndex);
      
      // Update order property for each job based on their new position
      const updatedJobs = reorderedJobs.map((job, index) => ({
        ...job,
        order: index + 1, // Start from 1, not 0
        updatedAt: new Date()
      }));
      
      console.log(`📋 DragEnd: Updated orders:`, updatedJobs.map(j => ({ id: j.id, order: j.order })));
      
      onReorder(updatedJobs);
    }
  };

  return (
    <div className={className}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={jobs.map(job => job.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {jobs.map((job) => (
              <SortableJobItem key={job.id} job={job} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

// Sortable Job Item
interface SortableJobItemProps {
  job: Job;
}

function SortableJobItem({ job }: SortableJobItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white border border-gray-200 rounded-lg p-4 shadow-sm
        ${isDragging ? 'shadow-lg ring-2 ring-blue-500 z-50' : 'hover:shadow-md'}
        transition-shadow cursor-default
      `}
    >
      <div className="flex items-center gap-3">
        <button
          {...attributes}
          {...listeners}
          className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing p-1"
        >
          <GripVertical className="w-5 h-5" />
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{job.title}</h3>
            <StatusBadge status={job.status === 'active' ? 'active' : 'archived'} size="xs" />
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Order: {job.order}</span>
            {job.location && (
              <>
                <span>•</span>
                <span>{job.location}</span>
              </>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {job.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" size="xs">
                {tag}
              </Badge>
            ))}
            {job.tags.length > 3 && (
              <Badge variant="default" size="xs">
                +{job.tags.length - 3} more
              </Badge>
            )}
          </div>
        </div>
        
        {job.salaryRange && (
          <div className="text-sm text-gray-500 text-right">
            <div className="font-medium">
              ${job.salaryRange.min.toLocaleString()}-${job.salaryRange.max.toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Kanban Board for Candidate Management
interface KanbanBoardProps {
  candidates: Candidate[];
  onStageChange: (candidateId: string, newStage: CandidateStage) => void;
  onCandidateClick?: (candidate: Candidate) => void;
  className?: string;
}

const STAGES: { id: CandidateStage; title: string; color: string; bgColor: string; iconColor: string }[] = [
  { 
    id: 'applied', 
    title: 'Applied', 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    bgColor: 'from-blue-50 to-indigo-50',
    iconColor: 'text-blue-600'
  },
  { 
    id: 'screen', 
    title: 'Screening', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
    bgColor: 'from-yellow-50 to-orange-50',
    iconColor: 'text-yellow-600'
  },
  { 
    id: 'tech', 
    title: 'Technical', 
    color: 'bg-purple-100 text-purple-800 border-purple-200', 
    bgColor: 'from-purple-50 to-pink-50',
    iconColor: 'text-purple-600'
  },
  { 
    id: 'offer', 
    title: 'Offer', 
    color: 'bg-green-100 text-green-800 border-green-200', 
    bgColor: 'from-green-50 to-emerald-50',
    iconColor: 'text-green-600'
  },
  { 
    id: 'hired', 
    title: 'Hired', 
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200', 
    bgColor: 'from-emerald-50 to-teal-50',
    iconColor: 'text-emerald-600'
  },
  { 
    id: 'rejected', 
    title: 'Rejected', 
    color: 'bg-red-100 text-red-800 border-red-200', 
    bgColor: 'from-red-50 to-pink-50',
    iconColor: 'text-red-600'
  },
];

export function KanbanBoard({ candidates, onStageChange, onCandidateClick, className = '' }: KanbanBoardProps) {
  const [activeCandidate, setActiveCandidate] = React.useState<Candidate | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Small distance to distinguish from clicks
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const candidate = candidates.find(c => c.id === event.active.id);
    setActiveCandidate(candidate || null);
    setIsDragging(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Reset active candidate and drag state
    setActiveCandidate(null);
    setIsDragging(false);
    
    if (!over) {
      return;
    }

    const activeCandidate = candidates.find(c => c.id === active.id);
    if (!activeCandidate) {
      return;
    }

    // Validate that the over.id is a valid stage
    const validStages: CandidateStage[] = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];
    const newStage = over.id as string;
    
    if (!validStages.includes(newStage as CandidateStage)) {
      return;
    }
    
    const typedNewStage = newStage as CandidateStage;
    
    if (activeCandidate.stage !== typedNewStage) {
      try {
        onStageChange(activeCandidate.id, typedNewStage);
      } catch (error) {
        console.error('❌ Failed to change stage:', error);
      }
    }
  };

  // Group candidates by stage
  const candidatesByStage = STAGES.reduce((acc, stage) => {
    acc[stage.id] = candidates.filter(candidate => candidate.stage === stage.id);
    return acc;
  }, {} as Record<CandidateStage, Candidate[]>);

  return (
    <div className={`${className} bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-3xl shadow-lg`}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Kanban Board Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
            <span className="mr-3 text-3xl">📋</span>
            Candidate Pipeline
          </h2>
          <p className="text-gray-600 font-medium">Drag candidates between stages to update their status. Changes are automatically saved.</p>
        </div>
        
        {/* 3x2 Grid Layout */}
                {/* 1 x 6 Kanban Board Layout */}
        <div className="flex gap-3 overflow-x-auto pb-4" style={{ scrollbarWidth: 'thin' }}>
          {STAGES.map((stage) => (
            <DroppableColumn
              key={stage.id}
              stage={stage}
              candidates={candidatesByStage[stage.id] || []}
              isDragging={isDragging}
              activeCandidate={activeCandidate}
              onCandidateClick={onCandidateClick}
            />
          ))}
        </div>
        
        {/* Enhanced Drag Overlay */}
        <DragOverlay dropAnimation={{
          duration: 300,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}>
          {activeCandidate ? (
            <DragOverlayCard candidate={activeCandidate} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// Droppable Column (Droppable area for each stage)
interface DroppableColumnProps {
  stage: { id: CandidateStage; title: string; color: string; bgColor: string; iconColor: string };
  candidates: Candidate[];
  isDragging: boolean;
  activeCandidate: Candidate | null;
  onCandidateClick?: (candidate: Candidate) => void;
}

function DroppableColumn({ stage, candidates, isDragging, activeCandidate, onCandidateClick }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  // Show enhanced visuals when dragging any card
  const showDropHint = isDragging && activeCandidate && activeCandidate.stage !== stage.id;

  return (
    <div className="w-64 min-w-64 flex-shrink-0 min-h-[500px] flex flex-col bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
      {/* Enhanced Column Header */}
      <div className={`p-4 bg-gradient-to-r ${stage.bgColor} border-b-2 ${stage.color.split(' ')[2]} transition-all duration-300 ${
        isOver ? 'ring-4 ring-blue-400 ring-offset-2 transform scale-105 shadow-xl' : 'shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-md border-2 border-gray-100`}>
              <div className={`w-5 h-5 rounded-full ${stage.iconColor.replace('text-', 'bg-')} shadow-sm`}></div>
            </div>
            <h3 className="font-bold text-gray-900 text-lg">{stage.title}</h3>
          </div>
          <div className={`px-4 py-2 rounded-xl text-sm font-bold ${stage.color} border-2 shadow-sm bg-white`}>
            {candidates.length}
          </div>
        </div>
      </div>
      
      {/* Enhanced Column Content */}
      <div 
        ref={setNodeRef}
        className={`
          flex-1 min-h-[400px] max-h-[600px] p-4
          transition-all duration-300 ease-in-out overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100
          ${
            isOver 
              ? 'bg-gradient-to-b from-blue-50 to-blue-100 shadow-2xl transform scale-105' 
              : showDropHint
              ? 'bg-gradient-to-b from-green-50 to-green-100 shadow-lg'
              : 'bg-gradient-to-b from-gray-50 to-white hover:from-gray-100'
          }
        `}
      >
        <div className="space-y-4">
          {candidates.map((candidate) => (
            <DraggableCard key={candidate.id} candidate={candidate} onClick={() => onCandidateClick?.(candidate)} />
          ))}
          {candidates.length === 0 && (
            <div className={`
              text-center py-16 text-sm transition-all duration-300 rounded-2xl border-2 border-dashed
              ${
                isOver 
                  ? 'text-blue-700 font-bold text-base border-blue-400 bg-gradient-to-b from-blue-100 to-blue-200 shadow-lg' 
                  : showDropHint
                  ? 'text-green-700 font-semibold border-green-400 bg-gradient-to-b from-green-100 to-green-200 shadow-md'
                  : 'text-gray-400 border-gray-300 bg-gradient-to-b from-gray-50 to-gray-100'
              }
            `}>
              <div className="space-y-4">
                <div className="text-4xl">
                  {isOver 
                    ? '🎯' 
                    : showDropHint 
                    ? '✨' 
                    : '📋'
                  }
                </div>
                <div className="font-semibold text-lg">
                  {isOver 
                    ? 'Drop candidate here!' 
                    : showDropHint 
                    ? 'Available drop zone' 
                    : 'No candidates yet'
                  }
                </div>
                {!isOver && !showDropHint && (
                  <div className="text-sm text-gray-500 font-normal">
                    Drag candidates here to get started
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Drag Overlay Card (Special card shown during dragging)
interface DragOverlayCardProps {
  candidate: Candidate;
}

function DragOverlayCard({ candidate }: DragOverlayCardProps) {
  return (
    <div className="
      bg-gradient-to-br from-white to-blue-50 rounded-2xl p-4 border-2 border-blue-300 shadow-2xl ring-4 ring-blue-400 ring-opacity-50
      transform rotate-2 scale-110 opacity-95 cursor-grabbing backdrop-blur-sm
      transition-all duration-200 ease-out
    ">
      <div className="space-y-3">
        {/* Enhanced Candidate Info */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <span className="text-sm font-bold text-white">
              {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">
              {candidate.name}
            </p>
            <p className="text-xs text-gray-600 truncate font-medium">
              {candidate.email}
            </p>
          </div>
        </div>
        
        {/* Enhanced Badges */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-300">
            Job #{candidate.jobId.slice(0, 8)}
          </span>
          {candidate.notes.length > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-300">
              {candidate.notes.length} notes
            </span>
          )}
        </div>
        
        {/* Enhanced Application Date */}
        <div className="flex items-center justify-center">
          <span className="text-xs text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-full border">
            📅 Applied {new Date(candidate.appliedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}

// Draggable Card (Draggable candidate card)
interface DraggableCardProps {
  candidate: Candidate;
  onClick?: () => void;
}

function DraggableCard({ candidate, onClick }: DraggableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ 
    id: candidate.id,
    data: { candidate }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        bg-white rounded-2xl p-4 border-2 border-gray-200 cursor-pointer group
        ${
          isDragging 
            ? 'opacity-40 shadow-2xl ring-4 ring-blue-400 scale-105 z-50 border-blue-300' 
            : 'hover:shadow-xl hover:scale-[1.03] hover:border-gray-300 hover:-translate-y-1'
        }
        transition-all duration-300 ease-out
      `}
    >
      <div className="space-y-3">
        {/* Enhanced Candidate Info */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200">
            <span className="text-sm font-bold text-white">
              {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate group-hover:text-gray-700 transition-colors">
              {candidate.name}
            </p>
            <p className="text-xs text-gray-600 truncate font-medium">
              {candidate.email}
            </p>
          </div>
        </div>
        
        {/* Enhanced Job ID and Notes */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-100 to-blue-100 text-gray-700 border border-gray-300">
            Job #{candidate.jobId.slice(0, 8)}
          </span>
          <div className="flex items-center space-x-2">
            {candidate.notes.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-300">
                📝 {candidate.notes.length}
              </span>
            )}
          </div>
        </div>
        
        {/* Enhanced Application Date with Phone */}
        <div className="space-y-2">
          {candidate.phone && (
            <div className="flex items-center text-xs text-gray-600">
              <span className="w-4 h-4 mr-2">📞</span>
              <span className="font-medium">{candidate.phone}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">
              📅 {new Date(candidate.appliedAt).toLocaleDateString()}
            </span>
            <span className="text-gray-400 text-xs">
              🔄 {new Date(candidate.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        {/* Drag indicator */}
        <div className="flex justify-center">
          <div className="w-6 h-1 bg-gray-300 rounded-full opacity-50"></div>
        </div>
      </div>
    </div>
  );
}

// Simple Sortable List (generic component for other use cases)
interface SortableListItem {
  id: string;
  content: React.ReactNode;
}

interface SimpleSortableListProps {
  items: SortableListItem[];
  onReorder: (items: SortableListItem[]) => void;
  direction?: 'vertical' | 'horizontal';
  className?: string;
}

export function SimpleSortableList({ 
  items, 
  onReorder, 
  direction = 'vertical', 
  className = '' 
}: SimpleSortableListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over?.id);

      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };

  const strategy = direction === 'vertical' 
    ? verticalListSortingStrategy 
    : horizontalListSortingStrategy;

  return (
    <div className={className}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map(item => item.id)} strategy={strategy}>
          <div className={`flex ${direction === 'vertical' ? 'flex-col space-y-2' : 'flex-row space-x-2'}`}>
            {items.map((item) => (
              <SimpleSortableItem key={item.id} item={item} direction={direction} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

// Simple Sortable Item
interface SimpleSortableItemProps {
  item: SortableListItem;
  direction: 'vertical' | 'horizontal';
}

function SimpleSortableItem({ item, direction }: SimpleSortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const GripIcon = direction === 'vertical' ? GripVertical : GripHorizontal;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white border border-gray-200 rounded-lg p-3 shadow-sm
        ${isDragging ? 'shadow-lg ring-2 ring-blue-500 z-50' : 'hover:shadow-md'}
        transition-shadow cursor-default flex items-center gap-2
      `}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing p-1"
      >
        <GripIcon className="w-4 h-4" />
      </button>
      
      <div className="flex-1">
        {item.content}
      </div>
    </div>
  );
}