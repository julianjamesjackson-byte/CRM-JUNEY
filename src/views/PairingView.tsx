import React, { useState, useEffect } from 'react';
import { Building2, Stethoscope, MapPin, UserCircle2, Link2, Loader2, CheckCircle2 } from 'lucide-react';
import { fetchFacilities, fetchCandidates, updateRecord } from '../lib/airtable';

export const PairingView: React.FC = () => {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pairingStatus, setPairingStatus] = useState<Record<string, 'idle' | 'pairing' | 'success'>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [facData, candData] = await Promise.all([fetchFacilities(), fetchCandidates()]);
        
        const mappedFac = facData.map((record: any) => ({
          id: record.id,
          name: record['Facility / Organization Name'] || record['Facility Name'] || record.name || 'Unnamed Facility',
          positionTitle: record['Position Title'] || 'General Nursing',
          specialtyRequired: record['Specialty'] || record['Specialty Required'] || record['Position Title'] || 'General',
          state: record['State'] || (record['Location'] || '').split(',').pop()?.trim() || 'Unknown',
          submittedCandidates: record['Submitted Candidates'] || [],
          rawRecord: record
        }));
        
        const mappedCand = candData.map((record: any) => ({
          id: record.id,
          name: record['Applicant Name'] || record['Name'] || record['Candidate Name'] || 'Unknown Candidate',
          specialty: record['Specialty'] || 'General',
          rate: record['Desired Hourly Rate'] || record['Rate'] || 0,
          states: record['State(s) Licensed'] ? (Array.isArray(record['State(s) Licensed']) ? record['State(s) Licensed'] : [record['State(s) Licensed']]) : [],
          matchedJobs: record['Matched Job Orders'] || [],
          rawRecord: record
        }));
        
        setFacilities(mappedFac);
        setCandidates(mappedCand);
      } catch (error) {
        console.error("Failed to load data for Smart Pairing", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handlePairing = async (candidate: any) => {
    if (!selectedFacility) return;
    
    setPairingStatus(prev => ({ ...prev, [candidate.id]: 'pairing' }));
    
    try {
      // Create new arrays by combining existing links with the new ID
      const newSubmittedCandidates = [...(selectedFacility.submittedCandidates || []), candidate.id];
      const newMatchedJobs = [...(candidate.matchedJobs || []), selectedFacility.id];
      
      // We must patch both tables
      await Promise.all([
        updateRecord('Facilities & Clients', selectedFacility.id, {
          'Submitted Candidates': newSubmittedCandidates
        }),
        updateRecord('Clinicians & Candidates', candidate.id, {
          'Matched Job Orders': newMatchedJobs
        })
      ]);
      
      // Update local state to reflect the link
      setFacilities(prev => prev.map(f => f.id === selectedFacility.id ? { ...f, submittedCandidates: newSubmittedCandidates } : f));
      setCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, matchedJobs: newMatchedJobs } : c));
      
      setPairingStatus(prev => ({ ...prev, [candidate.id]: 'success' }));
      setTimeout(() => {
        setPairingStatus(prev => ({ ...prev, [candidate.id]: 'idle' }));
      }, 3000);
      
    } catch (error) {
      console.error("Pairing failed", error);
      setPairingStatus(prev => ({ ...prev, [candidate.id]: 'idle' }));
      alert("Failed to pair candidate. Check Airtable field names for Linked Records.");
    }
  };

  // Smart Filtering Logic: Specialty matching Job's required specialty or title
  const filteredCandidates = selectedFacility ? candidates.filter(c => {
    // Avoid re-pairing if already matched
    if (selectedFacility.submittedCandidates?.includes(c.id)) return false;
    
    const candSpec = (c.specialty || '').toLowerCase();
    const reqSpec = (selectedFacility.specialtyRequired || '').toLowerCase();
    const jobTitle = (selectedFacility.positionTitle || '').toLowerCase();
    
    return candSpec.includes(reqSpec) || reqSpec.includes(candSpec) || jobTitle.includes(candSpec) || candSpec.includes(jobTitle);
  }) : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 font-medium gap-3">
        <Loader2 className="animate-spin text-healthcare-teal" size={24} />
        Loading Smart Pairing Engine...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto h-full flex flex-col animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Smart Pairing Engine</h1>
        <p className="text-slate-500">Intelligently match candidates with open job orders based on specialty.</p>
      </div>

      <div className="flex flex-1 gap-8 min-h-0">
        {/* Left Column: Job Orders */}
        <div className="w-1/3 flex flex-col bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-white">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="text-healthcare-teal" size={18} />
              Select Job Order
            </h2>
          </div>
          <div className="p-4 overflow-y-auto flex-1 space-y-3">
            {facilities.map(facility => (
              <div 
                key={facility.id}
                onClick={() => setSelectedFacility(facility)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedFacility?.id === facility.id ? 'bg-healthcare-teal/5 border-healthcare-teal ring-1 ring-healthcare-teal' : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}
              >
                <div className="font-bold text-slate-900 mb-1">{facility.name}</div>
                <div className="text-healthcare-teal font-semibold text-sm mb-2">{facility.positionTitle}</div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Stethoscope size={12}/> {facility.specialtyRequired}</span>
                  <span className="flex items-center gap-1"><MapPin size={12}/> {facility.state}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Matched Candidates */}
        <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <UserCircle2 className="text-healthcare-blue" size={20} />
                Smart Matches
              </h2>
              {selectedFacility ? (
                <p className="text-sm text-slate-500 mt-1">Showing candidates specialized in <span className="font-semibold text-slate-700">{selectedFacility.specialtyRequired}</span></p>
              ) : (
                <p className="text-sm text-slate-500 mt-1">Select a job order to see smart matches.</p>
              )}
            </div>
            {selectedFacility && (
              <div className="bg-healthcare-blue/10 text-healthcare-blue px-3 py-1 rounded-full text-sm font-semibold">
                {filteredCandidates.length} Matches Found
              </div>
            )}
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
            {!selectedFacility ? (
              <div className="h-full flex items-center justify-center text-slate-400 font-medium">
                Please select a Job Order from the left panel.
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 font-medium">
                No new matches found for this specialty.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCandidates.map(candidate => (
                  <div key={candidate.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg mb-1">{candidate.name}</h3>
                      <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-4">
                        <Stethoscope size={14} />
                        {candidate.specialty}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {candidate.states.map((state: string) => (
                          <span key={state} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md font-medium border border-slate-100">
                            {state}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handlePairing(candidate)}
                      disabled={pairingStatus[candidate.id] === 'pairing' || pairingStatus[candidate.id] === 'success'}
                      className={`w-full py-2.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                        pairingStatus[candidate.id] === 'success' 
                          ? 'bg-healthcare-emerald text-white shadow-sm shadow-healthcare-emerald/20' 
                          : pairingStatus[candidate.id] === 'pairing'
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-healthcare-teal hover:bg-healthcare-teal/90 text-white shadow-sm shadow-healthcare-teal/20'
                      }`}
                    >
                      {pairingStatus[candidate.id] === 'success' ? (
                        <><CheckCircle2 size={18} /> Paired Successfully</>
                      ) : pairingStatus[candidate.id] === 'pairing' ? (
                        <><Loader2 className="animate-spin" size={18} /> Pairing...</>
                      ) : (
                        <><Link2 size={18} /> Pair Candidate</>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
