import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, Stethoscope, FileText, X, Phone, Mail } from 'lucide-react';

// Mock data until Airtable connection is live
const MOCK_FACILITIES = [
  { id: '1', name: 'Cedar Sinai Medical', type: 'Hospital', openings: 12, status: 'Active Client', location: 'Los Angeles, CA' },
  { id: '2', name: 'Oakville Urgent Care', type: 'Clinic', openings: 3, status: 'Lead', location: 'Austin, TX' },
  { id: '3', name: 'St. Jude Childrens', type: 'Hospital', openings: 8, status: 'Negotiating', location: 'Memphis, TN' },
  { id: '4', name: 'Mercy Health System', type: 'Health System', openings: 24, status: 'Active Client', location: 'St. Louis, MO' },
];

const statusColors: Record<string, string> = {
  'Active Client': 'bg-healthcare-emerald/10 text-healthcare-emerald border-healthcare-emerald/20',
  'Lead': 'bg-healthcare-blue/10 text-healthcare-blue border-healthcare-blue/20',
  'Negotiating': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
};

export const FacilitiesView: React.FC = () => {
  const [selectedFacility, setSelectedFacility] = useState<any | null>(null);

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Facility Hub</h1>
          <p className="text-slate-500">Manage clients, hospitals, and job openings.</p>
        </div>
        <button className="bg-healthcare-teal hover:bg-healthcare-teal/90 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-healthcare-teal/20">
          + Add Facility
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_FACILITIES.map(facility => (
          <motion.div
            key={facility.id}
            whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}
            onClick={() => setSelectedFacility(facility)}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm cursor-pointer transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="bg-slate-50 p-3 rounded-xl">
                <Building2 className="text-slate-700" size={24} />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[facility.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                {facility.status}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">{facility.name}</h3>
            <div className="flex items-center gap-1 text-slate-500 text-sm mb-4">
              <MapPin size={14} />
              {facility.location}
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-slate-600 text-sm">
                <Stethoscope size={16} />
                <span>{facility.type}</span>
              </div>
              <div className="font-semibold text-healthcare-teal">
                {facility.openings} Openings
              </div>
            </div>
          </motion.div>
        ))}
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
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[600px] bg-white shadow-2xl z-50 border-l border-slate-200 overflow-y-auto"
            >
              <div className="p-8">
                <button 
                  onClick={() => setSelectedFacility(null)}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                >
                  <X size={20} />
                </button>
                
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border inline-block mb-4 ${statusColors[selectedFacility.status] || 'bg-slate-100'}`}>
                  {selectedFacility.status}
                </span>
                
                <h2 className="text-3xl font-bold text-slate-900 mb-2">{selectedFacility.name}</h2>
                <p className="text-slate-500 flex items-center gap-2 mb-8">
                  <MapPin size={16} /> {selectedFacility.location}
                </p>

                <div className="space-y-8">
                  <section>
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Contact Info</h3>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm"><Phone size={16} className="text-slate-600"/></div>
                        <input type="text" className="bg-transparent border-none focus:ring-0 text-slate-700 w-full font-medium" defaultValue="(555) 123-4567" />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm"><Mail size={16} className="text-slate-600"/></div>
                        <input type="email" className="bg-transparent border-none focus:ring-0 text-slate-700 w-full font-medium" defaultValue="director@facility.com" />
                      </div>
                    </div>
                  </section>
                  
                  <section>
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">CRM Follow-Up Log</h3>
                    <textarea 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-healthcare-teal/50 transition-shadow text-slate-700"
                      placeholder="Add follow-up notes here. Changes will auto-save to Airtable..."
                    ></textarea>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Documents</h3>
                    <div className="flex gap-4">
                      <button className="flex-1 bg-white border border-slate-200 hover:border-healthcare-teal/50 hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all">
                        <FileText size={18} className="text-healthcare-teal" />
                        Generate Agreement
                      </button>
                      <button className="flex-1 bg-white border border-slate-200 hover:border-healthcare-blue/50 hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all">
                        <FileText size={18} className="text-healthcare-blue" />
                        Generate Invoice
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
