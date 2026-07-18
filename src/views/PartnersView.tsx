import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Handshake, Mail, X, Loader2, FileText, UserCircle2, Building2, Globe, Briefcase, Target, Scale } from 'lucide-react';
import { fetchPartners, fetchCandidates, updateRecord } from '../lib/airtable';

const statusColors: Record<string, string> = {
  'Active Partner': 'bg-healthcare-emerald/10 text-healthcare-emerald border-healthcare-emerald/20',
  'Onboarding': 'bg-healthcare-blue/10 text-healthcare-blue border-healthcare-blue/20',
  'Prospect': 'bg-slate-100 text-slate-600 border-slate-200',
  'Inactive': 'bg-red-100 text-red-600 border-red-200'
};

const renderField = (field: any) => Array.isArray(field) ? field.join(', ') : (field || 'N/A');

export const PartnersView: React.FC = () => {
  const [partners, setPartners] = useState<any[]>([]);
  const [candidatesMap, setCandidatesMap] = useState<Record<string, string>>({});
  const [selectedPartner, setSelectedPartner] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Edit states for the drawer
  const [followUpLog, setFollowUpLog] = useState('');
  const [expectedVolume, setExpectedVolume] = useState<number | string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [partnersData, candidatesData] = await Promise.all([
          fetchPartners(),
          fetchCandidates()
        ]);
        
        // Map candidates so we can quickly resolve their IDs to Names
        const candMap: Record<string, string> = {};
        candidatesData.forEach((cand: any) => {
          candMap[cand.id] = cand['Applicant Name'] || cand['Name'] || cand['Candidate Name'] || 'Unknown Candidate';
        });
        setCandidatesMap(candMap);

        const mappedPartners = partnersData.map((record: any) => {
          const fields = record.fields || record;
          return {
            id: record.id,
            rawRecord: fields,
            ...fields
          };
        });
        
        console.log("🔍 RAW PARTNER DATA:", mappedPartners[0]);
        
        setPartners(mappedPartners);
      } catch (error) {
        console.error("Failed to load partners data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const openPartnerDrawer = (partner: any) => {
    setSelectedPartner(partner);
    setFollowUpLog(partner['CRM Follow-Up Log'] || partner['Notes'] || '');
    setExpectedVolume(partner['Expected Monthly Submission Volume'] || partner['Expected Volume'] || 0);
  };

  const closeDrawer = () => {
    setSelectedPartner(null);
  };

  const handleDelete = async (partnerId: string) => {
    if (!window.confirm("Are you sure you want to delete this partner? This action cannot be undone.")) return;
    
    try {
      const apiKey = import.meta.env.VITE_AIRTABLE_ACCESS_TOKEN || import.meta.env.VITE_AIRTABLE_API_KEY;
      const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
      
      const response = await fetch(`https://api.airtable.com/v0/${baseId}/Recruiting%20Partners/${partnerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }
      
      setPartners(prev => prev.filter(p => p.id !== partnerId));
      closeDrawer();
    } catch (error: any) {
      console.error("Delete failed", error);
      alert("Delete Failed: " + (error.response?.data?.error?.message || error.message || String(error)));
    }
  };

  const handleUpdate = async (fieldToUpdate: string, value: any) => {
    if (!selectedPartner) return;
    setIsSaving(true);
    try {
      const airtableFieldMap: Record<string, string> = {
        'expectedVolume': 'Expected Monthly Submission Volume',
        'followUpLog': 'CRM Follow-Up Log'
      };
      
      const airtableField = airtableFieldMap[fieldToUpdate] || fieldToUpdate;
      
      await updateRecord('Recruiting Partners', selectedPartner.id, {
        [airtableField]: value
      });
      
      // Update local state
      setPartners(prev => prev.map(p => {
        if (p.id === selectedPartner.id) {
          return { ...p, [fieldToUpdate]: value };
        }
        return p;
      }));
      
      setSelectedPartner((prev: any) => ({ ...prev, [fieldToUpdate]: value }));
      
    } catch (error) {
      console.error(`Failed to update ${fieldToUpdate}`, error);
      alert(`Failed to save ${fieldToUpdate}. Check exact Airtable column names.`);
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Recruiting Partners Hub</h1>
          <p className="text-slate-500">Manage agency relationships, expected volumes, and candidate submissions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full p-12 flex flex-col items-center justify-center text-slate-500 font-medium">
            <Loader2 className="animate-spin text-healthcare-teal mb-4" size={32} />
            Loading partners from Airtable...
          </div>
        ) : partners.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-500 font-medium bg-white rounded-2xl border border-slate-200">
            No recruiting partners found. Check your Airtable data.
          </div>
        ) : (
          partners.map(partner => (
            <motion.div
              key={partner.id}
              whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}
              onClick={() => openPartnerDrawer(partner)}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm cursor-pointer transition-all duration-300 flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-healthcare-teal/10 flex items-center justify-center text-healthcare-teal">
                  <Handshake size={24} />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[partner['Partnership Status'] || partner['Status'] || 'Prospect'] || 'bg-slate-100 text-slate-600'}`}>
                  {partner['Partnership Status'] || partner['Status'] || 'Prospect'}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-1">{partner['Recruiting Firm'] || partner['Firm Name'] || partner.name || 'Unnamed Firm'}</h3>
              
              <div className="mt-4 space-y-2 flex-1">
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <UserCircle2 size={16} className="text-slate-400" />
                  <span className="font-medium text-slate-700">{partner['Primary Contact'] || partner['Contact Name'] || partner.contactName || 'No Contact Listed'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <Mail size={16} className="text-slate-400" />
                  <span className="truncate">{partner['Email'] || partner['Contact Email'] || partner.email || 'No Email'}</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Submissions</span>
                <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-sm">
                  {(partner['Submitted Candidates'] || []).length} candidates
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Slide-out Drawer */}
      <AnimatePresence>
        {selectedPartner && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[500px] bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-healthcare-teal/10 rounded-lg text-healthcare-teal">
                    <Handshake size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedPartner['Recruiting Firm'] || selectedPartner['Firm Name'] || selectedPartner.name || 'Unnamed Firm'}</h2>
                </div>
                <button
                  onClick={closeDrawer}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* Section 1: Contact & Web */}
                <section>
                  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                    <Globe size={18} className="text-healthcare-blue" />
                    Contact & Web
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone</span>
                      <span className="text-sm font-medium text-slate-800">{renderField(selectedPartner['Phone'])}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Website</span>
                      <span className="text-sm font-medium text-slate-800 truncate">{renderField(selectedPartner['Website'])}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Recruiter Name</span>
                      <span className="text-sm font-medium text-slate-800">{renderField(selectedPartner['Recruiter Name'])}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Title</span>
                      <span className="text-sm font-medium text-slate-800">{renderField(selectedPartner['Title'])}</span>
                    </div>
                  </div>
                </section>

                {/* Section 2: Agency Capabilities */}
                <section>
                  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                    <Briefcase size={18} className="text-purple-500" />
                    Agency Capabilities
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Business Structure</span>
                      <span className="text-sm font-medium text-slate-800">{renderField(selectedPartner['Business Structure'])}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Years Recruiting</span>
                      <span className="text-sm font-medium text-slate-800">{renderField(selectedPartner['Years Recruiting'])}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">No. of Recruiters</span>
                      <span className="text-sm font-medium text-slate-800">{renderField(selectedPartner['Number of Recruiters'])}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">ATS / CRM</span>
                      <span className="text-sm font-medium text-slate-800">{renderField(selectedPartner['ATS / CRM'])}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2">
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Avg Placements Per Month</span>
                      <span className="text-sm font-medium text-slate-800">{renderField(selectedPartner['Average Placements Per Month'])}</span>
                    </div>
                  </div>
                </section>

                {/* Section 3: Specialties & Markets */}
                <section>
                  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                    <Target size={18} className="text-healthcare-emerald" />
                    Specialties & Markets
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Specialties</span>
                      <span className="text-sm font-medium text-slate-800">{renderField(selectedPartner['Recruiting Specialties'])}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Placement Types</span>
                      <span className="text-sm font-medium text-slate-800">{renderField(selectedPartner['Placement Types'])}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Primary Markets</span>
                      <span className="text-sm font-medium text-slate-800">{renderField(selectedPartner['Primary Geographic Markets'])}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Candidate Sources</span>
                      <span className="text-sm font-medium text-slate-800">{renderField(selectedPartner['Candidate Sources'])}</span>
                    </div>
                  </div>
                </section>

                {/* Section 4: Legal & Compliance */}
                <section>
                  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                    <Scale size={18} className="text-orange-500" />
                    Legal & Compliance
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2">
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Company Legal Name</span>
                      <span className="text-sm font-medium text-slate-800">{renderField(selectedPartner['Company Legal Name'])}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tax ID / EIN</span>
                      <span className="text-sm font-medium text-slate-800">{renderField(selectedPartner['Tax ID / EIN'])}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Compliance</span>
                      <span className="text-sm font-medium text-slate-800">{renderField(selectedPartner['Compliance Capabilities'])}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2">
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Partnership Status</span>
                      <span className="text-sm font-medium text-slate-800">{renderField(selectedPartner['Partnership Status'])}</span>
                    </div>
                  </div>
                </section>

                {/* Editable Fields Section */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                      <Building2 size={18} className="text-healthcare-blue" />
                      Partnership Details
                    </h3>
                    {isSaving && <span className="flex items-center gap-1 text-xs text-healthcare-teal font-medium"><Loader2 size={12} className="animate-spin"/> Saving...</span>}
                  </div>
                  
                  <div className="space-y-5 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Expected Monthly Submission Volume
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-healthcare-teal/20 focus:border-healthcare-teal bg-white transition-all"
                        value={expectedVolume}
                        onChange={(e) => setExpectedVolume(e.target.value)}
                        onBlur={() => {
                          const currentVol = selectedPartner['Expected Monthly Submission Volume'] || selectedPartner['Expected Volume'] || 0;
                          if (expectedVolume !== currentVol) {
                            handleUpdate('expectedVolume', Number(expectedVolume));
                          }
                        }}
                        placeholder="e.g. 15"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1 flex justify-between items-center">
                        <span>CRM Follow-Up Log</span>
                        <FileText size={14} className="text-slate-400"/>
                      </label>
                      <textarea
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-healthcare-teal/20 focus:border-healthcare-teal bg-white transition-all min-h-[120px] resize-y"
                        value={followUpLog}
                        onChange={(e) => setFollowUpLog(e.target.value)}
                        onBlur={() => {
                          const currentLog = selectedPartner['CRM Follow-Up Log'] || selectedPartner['Notes'] || '';
                          if (followUpLog !== currentLog) {
                            handleUpdate('followUpLog', followUpLog);
                          }
                        }}
                        placeholder="Log notes, meeting recaps, or next steps here... (Auto-saves on click away)"
                      />
                    </div>
                  </div>
                </section>

                {/* Linked Candidates Display */}
                <section>
                  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                    <UserCircle2 size={18} className="text-healthcare-emerald" />
                    Submitted Candidates
                  </h3>
                  
                  <div className="space-y-3">
                    {!selectedPartner['Submitted Candidates'] || selectedPartner['Submitted Candidates'].length === 0 ? (
                      <p className="text-slate-500 text-sm italic p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                        This partner hasn't submitted any candidates yet.
                      </p>
                    ) : (
                      selectedPartner['Submitted Candidates'].map((candId: string) => (
                        <div key={candId} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <UserCircle2 size={16} />
                          </div>
                          <span className="font-medium text-slate-800 text-sm">
                            {candidatesMap[candId] || 'Loading Candidate...'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </section>
                
                {/* Delete Partner Section */}
                <section className="pt-8 border-t border-slate-100 pb-12">
                  <button 
                    onClick={() => handleDelete(selectedPartner.id)}
                    className="w-full py-3 px-4 rounded-xl font-semibold border-2 border-red-500 text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Delete Partner
                  </button>
                </section>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
