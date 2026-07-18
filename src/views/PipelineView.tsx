import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Stethoscope, GripVertical, Loader2 } from 'lucide-react';
import { updateRecord, fetchCandidates } from '../lib/airtable';

const COLUMNS = [
  { id: 'New Applicant', title: 'New Applicant', theme: 'border-slate-300 bg-slate-100 text-slate-700' },
  { id: 'Credential Review', title: 'Credential Review', theme: 'border-amber-300 bg-amber-500/10 text-amber-700' },
  { id: 'Interviewing', title: 'Interviewing', theme: 'border-healthcare-blue/30 bg-healthcare-blue/10 text-healthcare-blue' },
  { id: 'Approved', title: 'Approved', theme: 'border-emerald-300 bg-emerald-500/10 text-emerald-700' },
  { id: 'Placed', title: 'Placed', theme: 'border-healthcare-emerald/30 bg-healthcare-emerald/10 text-healthcare-emerald' },
];

export const PipelineView: React.FC = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCandidates();
        const mappedData = data.map((record: any) => ({
          id: record.id,
          name: record['Applicant Name'] || 'Unknown Candidate',
          specialty: record['Specialty'] || 'General',
          rate: record['Desired Hourly Rate'] || record['Rate'] || 0,
          states: record['State(s) Licensed'] ? (Array.isArray(record['State(s) Licensed']) ? record['State(s) Licensed'] : [record['State(s) Licensed']]) : [],
          status: record['Candidate Status'] || 'New Applicant'
        }));
        setCandidates(mappedData);
      } catch (error) {
        console.error("Failed to load candidates", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

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
      const apiKey = import.meta.env.VITE_AIRTABLE_ACCESS_TOKEN || import.meta.env.VITE_AIRTABLE_API_KEY;
      const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
      
      const response = await fetch(`https://api.airtable.com/v0/${baseId}/Clinicians%20%26%20Candidates/${draggableId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            "Candidate Status": newStatus
          },
          typecast: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }
      
      console.log(`Successfully updated ${draggableId} to status ${newStatus}`);
    } catch (error: any) {
      console.error("Failed to sync status update to Airtable", error);
      // Revert optimistic update on failure
      setCandidates((prev) => 
        prev.map(c => c.id === draggableId ? { ...c, status: oldStatus } : c)
      );
      alert("Airtable Sync Error: " + (error.response?.data?.error?.message || error.message || String(error)));
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
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-slate-500 font-medium gap-3">
            <Loader2 className="animate-spin text-healthcare-teal" size={24} />
            Loading live pipeline from Airtable...
          </div>
        ) : candidates.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-slate-500 font-medium">
            No candidates found in the pipeline.
          </div>
        ) : (
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
                                    {candidate.states.map((state: string) => (
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
        )}
      </div>
    </div>
  );
};
