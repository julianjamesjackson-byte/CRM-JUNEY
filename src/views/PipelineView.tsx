import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Stethoscope, GripVertical } from 'lucide-react';
import { updateRecord } from '../lib/airtable';

// We'll use the same mock data shape as before, but with state management
const INITIAL_CANDIDATES = [
  { id: '1', name: 'Sarah Jenkins, RN', specialty: 'ICU / Critical Care', states: ['CA', 'TX'], status: 'Submitted' },
  { id: '2', name: 'Dr. Michael Chen', specialty: 'Emergency Medicine', states: ['NY'], status: 'Interviewing' },
  { id: '3', name: 'Elena Rodriguez, LPN', specialty: 'Pediatrics', states: ['FL', 'GA'], status: 'New Applicant' },
  { id: '4', name: 'James Wilson, RT', specialty: 'Respiratory Therapy', states: ['WA', 'OR', 'CA'], status: 'Placed' },
  { id: '5', name: 'Anita Patel, RN', specialty: 'Med-Surg', states: ['IL', 'OH'], status: 'New Applicant' },
];

const COLUMNS = [
  { id: 'New Applicant', title: 'New Applicant', theme: 'border-slate-300 bg-slate-100 text-slate-700' },
  { id: 'Submitted', title: 'Submitted', theme: 'border-amber-300 bg-amber-500/10 text-amber-700' },
  { id: 'Interviewing', title: 'Interviewing', theme: 'border-healthcare-blue/30 bg-healthcare-blue/10 text-healthcare-blue' },
  { id: 'Placed', title: 'Placed', theme: 'border-healthcare-emerald/30 bg-healthcare-emerald/10 text-healthcare-emerald' },
];

export const PipelineView: React.FC = () => {
  const [candidates, setCandidates] = useState(INITIAL_CANDIDATES);
  const [isUpdating, setIsUpdating] = useState(false);

  // In a real scenario, you'd fetch from Airtable here:
  // useEffect(() => {
  //   fetchCandidates().then(setCandidates);
  // }, []);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    const oldStatus = source.droppableId;

    // Optimistic UI update
    setCandidates((prev) => 
      prev.map(c => c.id === draggableId ? { ...c, status: newStatus } : c)
    );

    setIsUpdating(true);
    try {
      // Trigger PATCH to Airtable
      await updateRecord('Clinicians & Candidates', draggableId, { Status: newStatus });
      console.log(`Successfully updated ${draggableId} to status ${newStatus}`);
    } catch (error) {
      console.error("Failed to sync status update to Airtable", error);
      // Revert optimistic update on failure
      setCandidates((prev) => 
        prev.map(c => c.id === draggableId ? { ...c, status: oldStatus } : c)
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const getCandidatesByStatus = (status: string) => {
    return candidates.filter(c => c.status === status);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto h-full flex flex-col animate-in fade-in duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Placement Pipeline</h1>
          <p className="text-slate-500">Drag and drop candidates to manage their placement journey.</p>
        </div>
        {isUpdating && (
          <div className="text-sm font-medium text-healthcare-teal flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-healthcare-teal animate-pulse" />
            Syncing to Airtable...
          </div>
        )}
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 h-full min-w-max">
            {COLUMNS.map(column => (
              <div key={column.id} className="w-[320px] flex flex-col bg-slate-100/50 rounded-2xl border border-slate-200 p-4">
                <div className={`px-4 py-2 rounded-xl border mb-4 font-bold text-sm uppercase tracking-wider ${column.theme}`}>
                  {column.title} <span className="opacity-70 ml-1">({getCandidatesByStatus(column.id).length})</span>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 min-h-[200px] rounded-xl transition-colors duration-200 ${
                        snapshot.isDraggingOver ? 'bg-slate-200/50' : ''
                      }`}
                    >
                      {getCandidatesByStatus(column.id).map((candidate, index) => (
                        <Draggable key={candidate.id} draggableId={candidate.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white rounded-xl p-4 mb-3 border transition-all duration-200 ${
                                snapshot.isDragging 
                                  ? 'border-healthcare-teal shadow-xl shadow-healthcare-teal/10 scale-[1.02] z-50' 
                                  : 'border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'
                              }`}
                              style={provided.draggableProps.style}
                            >
                              <div className="flex items-start gap-2">
                                <GripVertical className="text-slate-300 mt-0.5 cursor-grab shrink-0" size={16} />
                                <div className="flex-1">
                                  <h4 className="font-bold text-slate-800 text-sm mb-1">{candidate.name}</h4>
                                  <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-3">
                                    <Stethoscope size={12} />
                                    <span className="truncate">{candidate.specialty}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {candidate.states.map(state => (
                                      <span key={state} className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-medium border border-slate-200">
                                        {state}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};
