import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle2, Stethoscope, FileText, X, Bot, CalendarClock, MessageSquare, PhoneCall } from 'lucide-react';
import { fetchCandidates } from '../lib/airtable';

const statusColors: Record<string, string> = {
  'Placed': 'bg-healthcare-emerald/10 text-healthcare-emerald border-healthcare-emerald/20',
  'Interviewing': 'bg-healthcare-blue/10 text-healthcare-blue border-healthcare-blue/20',
  'Submitted': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  'New Applicant': 'bg-slate-100 text-slate-600 border-slate-200',
};

const getAttachmentUrl = (fields: any): string | null => {
  if (!fields) return null;
  for (const value of Object.values(fields)) {
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null && 'url' in value[0]) {
      return value[0].url; // Return the first file attachment found anywhere in the record
    }
  }
  return null;
};

export const CandidatesView: React.FC = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleDeleteCandidate = async (candidateId: string) => {
    try {
      const apiKey = import.meta.env.VITE_AIRTABLE_PAT || import.meta.env.VITE_AIRTABLE_ACCESS_TOKEN || import.meta.env.VITE_AIRTABLE_API_KEY;
      const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
      
      console.log(`Firing DELETE request for candidate: ${candidateId}`);
      console.log(`Endpoint: https://api.airtable.com/v0/${baseId}/Clinicians%20%26%20Candidates/${candidateId}`);
      
      const response = await fetch(`https://api.airtable.com/v0/${baseId}/Clinicians%20%26%20Candidates/${candidateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      console.log("Delete Response Status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Server Error Payload:", errorData);
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      setCandidates(prev => prev.filter(c => c.id !== candidateId));
      setSelectedCandidate(null);
    } catch (error: any) {
      console.error("Delete Catch Block Error:", error);
      alert("Delete Failed: " + (error.response?.data?.error?.message || error.message || String(error)));
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCandidates();
        const mappedData = data.map((record: any) => ({
          id: record.id,
          name: record['Applicant Name'] || 'Unknown Candidate',
          specialty: record['Specialty'] || 'General',
          rate: record['Desired Rate'] || record['Desired Hourly Rate'] || record['Rate'] || 'Not provided',
          states: record['State(s) Licensed'] ? (Array.isArray(record['State(s) Licensed']) ? record['State(s) Licensed'] : [record['State(s) Licensed']]) : [],
          status: record['Candidate Status'] || 'New Applicant',
          email: record['Email'] || record['Email Address'] || '',
          phone: record['Phone Number'] || record['Phone'] || '',
          resume: record['Resume'] || record['CV'] || [],
          rawFields: record
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

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Candidate Roster</h1>
          <p className="text-slate-500">Manage clinicians and AI outreach.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-slate-500 font-medium">Loading live candidates from Airtable...</div>
        ) : candidates.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-500 font-medium">No candidates found. Check your Airtable table and fields.</div>
        ) : (
        candidates.map(candidate => (
          <motion.div
            key={candidate.id}
            whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}
            onClick={() => {
              console.log("Candidate Record Fields:", candidate.rawFields);
              setSelectedCandidate(candidate);
            }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm cursor-pointer transition-all duration-300 flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <UserCircle2 className="text-slate-300" size={48} />
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[candidate.status] || 'bg-slate-100'}`}>
                {candidate.status}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{candidate.name}</h3>
            <div className="flex items-center gap-1 text-slate-500 text-sm mb-4">
              <Stethoscope size={14} />
              {candidate.specialty}
            </div>
            
            <div className="mt-auto space-y-3">
              <div className="flex flex-wrap gap-1">
                {candidate.states.map((state: string) => (
                  <span key={state} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md font-medium border border-slate-200">
                    {state}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-slate-400 text-sm">Desired Rate</span>
                <div className="font-bold text-slate-800 flex items-center">
                  {candidate.rate}
                </div>
              </div>
            </div>
          </motion.div>
        )))}
      </div>

      {/* Slide-out Modal for Candidate Details */}
      <AnimatePresence>
        {selectedCandidate && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCandidate(null)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full md:w-[600px] bg-white shadow-2xl z-50 border-l border-slate-200 overflow-y-auto"
            >
              <div className="p-8">
                <button 
                  onClick={() => setSelectedCandidate(null)}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                >
                  <X size={20} />
                </button>
                
                <div className="flex items-center gap-4 mb-6">
                  <UserCircle2 className="text-slate-300" size={64} />
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border inline-block mb-2 ${statusColors[selectedCandidate.status]}`}>
                      {selectedCandidate.status}
                    </span>
                    <h2 className="text-3xl font-bold text-slate-900">{selectedCandidate.name}</h2>
                  </div>
                </div>

                {/* AI Action Bar */}
                <div className="bg-gradient-to-r from-healthcare-teal/10 to-healthcare-blue/10 rounded-2xl p-6 border border-healthcare-teal/20 mb-8">
                  <div className="flex items-center gap-2 mb-4 text-healthcare-teal font-bold">
                    <Bot size={20} />
                    <span>AI Action Center</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button className="bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold py-3 px-4 rounded-xl shadow-sm transition-all border border-slate-200 flex flex-col items-center gap-2">
                      <CalendarClock size={18} className="text-healthcare-blue" />
                      Schedule Booking
                    </button>
                    <button className="bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold py-3 px-4 rounded-xl shadow-sm transition-all border border-slate-200 flex flex-col items-center gap-2">
                      <MessageSquare size={18} className="text-healthcare-teal" />
                      Send Follow-Up
                    </button>
                    <button className="bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold py-3 px-4 rounded-xl shadow-sm transition-all border border-slate-200 flex flex-col items-center gap-2">
                      <PhoneCall size={18} className="text-amber-500" />
                      Cold Call Script
                    </button>
                  </div>
                </div>

                <div className="space-y-8">
                  <section>
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Contact Info</h3>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100 shrink-0"><PhoneCall size={16} className="text-slate-600"/></div>
                        <div className="text-slate-700 font-medium">{selectedCandidate.phone || 'Not provided'}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100 shrink-0"><MessageSquare size={16} className="text-slate-600"/></div>
                        <div className="text-slate-700 font-medium">{selectedCandidate.email || 'Not provided'}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100 shrink-0"><FileText size={16} className="text-slate-600"/></div>
                        <div className="text-slate-700 font-medium">
                          {selectedCandidate.states.length > 0 ? selectedCandidate.states.join(', ') : 'Not provided'}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Professional Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">Specialty</span>
                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                          <Stethoscope size={16} className="text-healthcare-teal"/>
                          {selectedCandidate.specialty}
                        </div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">Desired Rate</span>
                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                          {selectedCandidate.rate}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Application Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(selectedCandidate.rawFields)
                        .filter(([key, value]) => {
                          // Filter out keys already displayed at the top
                          const excluded = ['id', 'Applicant Name', 'Specialty', 'Desired Rate', 'Desired Hourly Rate', 'Rate', 'State(s) Licensed', 'Candidate Status', 'Email', 'Email Address', 'Phone Number', 'Phone'];
                          if (excluded.includes(key)) return false;
                          
                          // Filter out attachments (we handle those in the Resume section)
                          if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null && 'url' in value[0]) return false;
                          
                          return true;
                        })
                        .map(([key, value]) => {
                          const displayValue = Array.isArray(value) ? value.join(', ') : typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
                          return (
                            <div key={key} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-center">
                              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">{key}</span>
                              <div className="font-semibold text-slate-800 text-sm break-words">{displayValue}</div>
                            </div>
                          );
                        })}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Resume / CV</h3>
                    {getAttachmentUrl(selectedCandidate.rawFields) ? (
                      <a href={getAttachmentUrl(selectedCandidate.rawFields)!} target="_blank" rel="noreferrer" className="w-full bg-slate-50 border-2 border-dashed border-healthcare-teal hover:bg-healthcare-teal/5 text-healthcare-teal font-medium py-6 px-4 rounded-xl flex flex-col items-center justify-center gap-3 transition-all cursor-pointer">
                        <FileText size={32} className="text-healthcare-teal" />
                        <span>View Resume Document</span>
                      </a>
                    ) : (
                      <button disabled className="w-full bg-slate-50 border-2 border-dashed border-slate-200 text-slate-400 font-medium py-6 px-4 rounded-xl flex flex-col items-center justify-center gap-3 cursor-not-allowed">
                        <FileText size={32} className="text-slate-300" />
                        <span>No Documents Attached</span>
                      </button>
                    )}
                  </section>
                  
                  <div className="pt-6 border-t border-slate-100 mt-8 mb-8">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Delete button clicked! Firing API instantly...");
                        handleDeleteCandidate(selectedCandidate.id);
                      }}
                      className="w-full bg-transparent border border-red-600 text-red-500 hover:bg-red-900/10 font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      Delete Candidate
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
