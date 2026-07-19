import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, Stethoscope, FileText, X, Phone, Mail, Loader2, Check, Trash2, UserCircle2, Briefcase, Target, CreditCard, ClipboardList } from 'lucide-react';
import { fetchFacilities, updateRecord, deleteRecord } from '../lib/airtable';

const statusColors: Record<string, string> = {
  'Active Client': 'bg-healthcare-emerald/10 text-healthcare-emerald border-healthcare-emerald/20',
  'Lead': 'bg-healthcare-blue/10 text-healthcare-blue border-healthcare-blue/20',
  'Negotiating': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
};

const renderField = (field: any) => Array.isArray(field) ? field.join(', ') : (field || 'N/A');

export const FacilitiesView: React.FC = () => {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  

  // Note Saving State
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSaveSuccess, setNoteSaveSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchFacilities();
        const mappedData = data.map((record: any) => {
          const fields = record.fields || record;
          return {
            id: record.id,
            rawRecord: fields,
            ...fields,
            name: fields['Facility / Organization Name'] || 'Unnamed Facility',
            type: fields['Facility Type'] || 'Hospital',
            openings: fields['Number of Openings'] || 0,
            status: fields['Lead Status'] || fields.status || 'Lead',
            location: fields['Address'] || 'Location not specified',
            phone: fields['Primary Contact Phone'] || '',
            email: fields['Primary Contact Email'] || '',
            notes: fields['Additional Notes'] || '',
            agreements: fields['Client Agreements'] || [],
            invoices: fields['Invoices'] || []
          };
        });
        setFacilities(mappedData);
      } catch (error) {
        console.error("Failed to load facilities", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleNoteBlur = async (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (!selectedFacility) return;
    const newNote = e.target.value;
    const currentNote = selectedFacility['CRM Follow-Up Log'] || selectedFacility.notes || '';
    if (newNote === currentNote) return; // No changes

    setIsSavingNote(true);
    setNoteSaveSuccess(false);
    try {
      await updateRecord('Facilities & Clients', selectedFacility.id, {
        'CRM Follow-Up Log': newNote
      });
      
      // Update local state
      const updatedFacility = { ...selectedFacility, 'CRM Follow-Up Log': newNote, notes: newNote };
      setSelectedFacility(updatedFacility);
      setFacilities(prev => prev.map(f => f.id === updatedFacility.id ? updatedFacility : f));
      
      setNoteSaveSuccess(true);
      setTimeout(() => setNoteSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save note", error);
    } finally {
      setIsSavingNote(false);
    }
  };



  const handleDeleteFacility = async () => {
    if (!selectedFacility) return;
    if (!window.confirm('Are you sure you want to delete this facility? This action cannot be undone.')) return;
    
    setIsDeleting(true);
    try {
      await deleteRecord('Facilities & Clients', selectedFacility.id);
      setFacilities(prev => prev.filter(f => f.id !== selectedFacility.id));
      setSelectedFacility(null);
    } catch (error) {
      console.error("Failed to delete facility", error);
      alert("Failed to delete facility. Check console for details.");
    } finally {
      setIsDeleting(false);
    }
  };

  const renderDocumentList = (docs: any[], defaultText: string, iconColorClass: string) => {
    if (!docs || docs.length === 0) {
      return (
        <button className="flex-1 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all">
          <FileText size={18} className={iconColorClass} />
          {defaultText}
        </button>
      );
    }
    
    return (
      <div className="flex-1 flex flex-col gap-2">
        {docs.map((doc: any, i: number) => (
          <a 
            key={i} 
            href={doc.url} 
            target="_blank" 
            rel="noreferrer"
            className="bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-2 px-3 rounded-lg flex items-center gap-2 transition-all text-sm truncate"
          >
            <FileText size={14} className={iconColorClass} />
            <span className="truncate">{doc.filename}</span>
          </a>
        ))}
      </div>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Facility Hub</h1>
          <p className="text-slate-500">Manage clients, hospitals, and job openings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-slate-500 font-medium flex justify-center items-center gap-3">
            <Loader2 className="animate-spin text-healthcare-teal" /> Loading live data from Airtable...
          </div>
        ) : facilities.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-500 font-medium">No facilities found.</div>
        ) : (
        facilities.map(facility => (
          <motion.div
            key={facility.id}
            whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}
            onClick={() => setSelectedFacility(facility)}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm cursor-pointer transition-all duration-300 flex flex-col h-full"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="bg-slate-50 p-3 rounded-xl">
                <Building2 className="text-slate-700" size={24} />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[facility.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                {facility.status}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1 line-clamp-1">{facility.name}</h3>
            <div className="flex items-center gap-1 text-slate-500 text-sm mb-6 line-clamp-1">
              <MapPin size={14} className="shrink-0" />
              <span className="truncate">{facility.location}</span>
            </div>
            
            <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-slate-600 text-sm truncate pr-2">
                <Stethoscope size={16} className="shrink-0" />
                <span className="truncate">{facility.type}</span>
              </div>
              <div className="font-semibold text-healthcare-teal shrink-0">
                {facility.openings} Openings
              </div>
            </div>
          </motion.div>
        )))}
      </div>

      {/* Slide-out Modal for Facility Details */}
      <AnimatePresence>
        {selectedFacility && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFacility(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[600px] max-w-full bg-white shadow-2xl z-50 border-l border-slate-200 overflow-y-auto"
            >
              <div className="p-8">
                <button 
                  onClick={() => setSelectedFacility(null)}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                >
                  <X size={20} />
                </button>
                
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border inline-block mb-4 ${statusColors[selectedFacility['Lead Status'] || selectedFacility.status] || 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                  {selectedFacility['Lead Status'] || selectedFacility.status}
                </span>
                
                <h2 className="text-3xl font-bold text-slate-900 mb-2 pr-12">{selectedFacility['Facility / Organization Name'] || selectedFacility.name || 'Unnamed Facility'}</h2>
                <p className="text-slate-500 flex items-start gap-2 mb-8">
                  <MapPin size={16} className="mt-0.5 shrink-0" /> 
                  <span>{selectedFacility['Address'] || selectedFacility.location || 'No Address Listed'}</span>
                </p>

                <div className="space-y-8">
                  {/* Section 1: Primary Contact Info */}
                  <section>
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                      <UserCircle2 size={18} className="text-healthcare-blue" />
                      Primary Contact Info
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Name</span>
                        <span className="text-sm font-medium text-slate-800">{renderField(selectedFacility['Primary Contact Name'])}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Title</span>
                        <span className="text-sm font-medium text-slate-800">{renderField(selectedFacility['Primary Contact Title'])}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone</span>
                        <span className="text-sm font-medium text-slate-800">{renderField(selectedFacility['Primary Contact Phone'])}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</span>
                        <span className="text-sm font-medium text-slate-800 truncate">{renderField(selectedFacility['Primary Contact Email'])}</span>
                      </div>
                    </div>
                  </section>

                  {/* Section 2: Current Job Request details */}
                  <section>
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                      <Briefcase size={18} className="text-purple-500" />
                      Current Job Request details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2">
                        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Position</span>
                        <span className="text-sm font-medium text-slate-800">{renderField(selectedFacility['Position Title'])}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Department</span>
                        <span className="text-sm font-medium text-slate-800">{renderField(selectedFacility['Department'])}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Openings</span>
                        <span className="text-sm font-medium text-slate-800">{renderField(selectedFacility['Number of Openings'])}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Employment Type</span>
                        <span className="text-sm font-medium text-slate-800">{renderField(selectedFacility['Employment Type'])}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Urgency</span>
                        <span className="text-sm font-medium text-slate-800">{renderField(selectedFacility['Urgency'])}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2">
                        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Shift & Hours</span>
                        <span className="text-sm font-medium text-slate-800">{renderField(selectedFacility['Shift'])} - {renderField(selectedFacility['Schedule / Hours'])}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2">
                        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Bill Rate</span>
                        <span className="text-sm font-medium text-slate-800">{renderField(selectedFacility['Compensation / Bill Rate'])}</span>
                      </div>
                    </div>
                  </section>

                  {/* Section 3: Clinical & System Requirements */}
                  <section>
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                      <ClipboardList size={18} className="text-healthcare-emerald" />
                      Clinical & System Requirements
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">EHR/EMR System</span>
                        <span className="text-sm font-medium text-slate-800">{renderField(selectedFacility['EHR/EMR System'])}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Required Licenses</span>
                        <span className="text-sm font-medium text-slate-800">{renderField(selectedFacility['Required Licenses'])}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Required Certifications</span>
                        <span className="text-sm font-medium text-slate-800">{renderField(selectedFacility['Required Certifications'])}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Minimum Experience</span>
                        <span className="text-sm font-medium text-slate-800">{renderField(selectedFacility['Minimum Experience'])}</span>
                      </div>
                    </div>
                  </section>

                  {/* Section 4: Billing & Admin */}
                  <section>
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                      <CreditCard size={18} className="text-orange-500" />
                      Billing & Admin
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2">
                        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Billing Contact</span>
                        <span className="text-sm font-medium text-slate-800">{renderField(selectedFacility['Billing Contact Name'])}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2">
                        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Billing Email</span>
                        <span className="text-sm font-medium text-slate-800">{renderField(selectedFacility['Billing Contact Email'])}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2">
                        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Assigned Recruiter</span>
                        <span className="text-sm font-medium text-slate-800">{renderField(selectedFacility['Assigned Recruiter'])}</span>
                      </div>
                    </div>
                  </section>

                  {/* Existing Interactive Elements */}
                  <section>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
                      <h3 className="text-lg font-bold text-slate-800">CRM Follow-Up Log</h3>
                      {isSavingNote && <span className="text-xs text-slate-500 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Saving...</span>}
                      {noteSaveSuccess && <span className="text-xs text-healthcare-emerald flex items-center gap-1"><Check size={12} /> Saved</span>}
                    </div>
                    <textarea 
                      defaultValue={selectedFacility['CRM Follow-Up Log'] || selectedFacility.notes || ''}
                      onBlur={handleNoteBlur}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-healthcare-teal/50 transition-shadow text-slate-700"
                      placeholder="Add follow-up notes here. Click outside to auto-save to Airtable..."
                    ></textarea>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Documents</h3>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      {renderDocumentList(selectedFacility.agreements, "Generate Agreement", "text-healthcare-teal")}
                      {renderDocumentList(selectedFacility.invoices, "Generate Invoice", "text-healthcare-blue")}
                    </div>
                  </section>
                  
                  <div className="pt-8 mt-8 border-t border-slate-100 flex justify-end">
                    <button 
                      onClick={handleDeleteFacility}
                      disabled={isDeleting}
                      className="border-2 border-red-500/20 text-red-600 hover:bg-red-50 hover:border-red-500 font-medium py-2.5 px-6 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                      {isDeleting ? 'Deleting...' : 'Delete Facility'}
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
