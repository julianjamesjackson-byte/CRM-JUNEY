import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, CalendarCheck, Award, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchFacilities, fetchCandidates } from '../../lib/airtable';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color: 'teal' | 'blue' | 'cyan' | 'emerald';
  to: string;
}

const colorMap = {
  teal: 'bg-healthcare-teal/10 text-healthcare-teal',
  blue: 'bg-healthcare-blue/10 text-healthcare-blue',
  cyan: 'bg-healthcare-cyan/10 text-healthcare-cyan',
  emerald: 'bg-healthcare-emerald/10 text-healthcare-emerald'
};

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, trend, color, to }) => (
  <Link to={to} className="block">
    <motion.div 
      whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}
      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm transition-all duration-300 h-full"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 font-medium text-sm mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
          {trend && <p className="text-healthcare-emerald text-xs font-semibold mt-2">{trend}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  </Link>
);

const isWithinLast7Days = (dateString: string | undefined, fallbackTime: string | undefined) => {
  const targetDateStr = dateString || fallbackTime;
  if (!targetDateStr) return false;
  
  const targetDate = new Date(targetDateStr);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return targetDate >= sevenDaysAgo;
};

const getRelativeTime = (dateString: string | undefined, fallbackTime: string | undefined) => {
  const targetDateStr = dateString || fallbackTime;
  if (!targetDateStr) return 'Recently';
  
  const date = new Date(targetDateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffHours < 24) return diffHours <= 1 ? 'Just now' : `${diffHours} hours ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
};

export const DashboardView: React.FC = () => {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [facs, cands] = await Promise.all([fetchFacilities(), fetchCandidates()]);
        setFacilities(facs);
        setCandidates(cands);
      } catch (error) {
        console.error("Error loading dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // 1. Open Job Orders Math
  const openJobOrders = facilities.reduce((sum, fac) => {
    const openings = parseInt(fac['Number of Openings'] || 0, 10);
    return sum + (isNaN(openings) ? 1 : openings); 
  }, 0);

  const openJobOrdersThisWeek = facilities.filter(fac => 
    isWithinLast7Days(fac['Date Submitted'], fac._createdTime || fac.createdTime)
  ).reduce((sum, fac) => {
    const openings = parseInt(fac['Number of Openings'] || 0, 10);
    return sum + (isNaN(openings) ? 1 : openings);
  }, 0);

  // 2. Candidates Submitted
  const submittedCandidates = candidates.filter(c => c['Candidate Status'] === 'Submitted');
  const submittedThisWeek = submittedCandidates.filter(c => isWithinLast7Days(c['Application Date'], c._createdTime || c.createdTime)).length;

  // 3. Interviews
  const interviewingCandidates = candidates.filter(c => c['Candidate Status'] === 'Interviewing');
  const interviewingThisWeek = interviewingCandidates.filter(c => isWithinLast7Days(c['Application Date'], c._createdTime || c.createdTime)).length;

  // 4. Placements
  const placedCandidates = candidates.filter(c => c['Candidate Status'] === 'Placed');
  const placedThisWeek = placedCandidates.filter(c => isWithinLast7Days(c['Application Date'], c._createdTime || c.createdTime)).length;

  // Recent Activity Feed (Top 5 Candidates)
  const recentCandidates = [...candidates].sort((a, b) => {
    const dateA = new Date(a['Application Date'] || a._createdTime || a.createdTime || 0).getTime();
    const dateB = new Date(b['Application Date'] || b._createdTime || b.createdTime || 0).getTime();
    return dateB - dateA;
  }).slice(0, 5);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Command Center</h1>
        <p className="text-slate-500">Overview of your staffing operations and pipeline.</p>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center text-slate-500">
          Loading metrics...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard 
              title="Open Job Orders" 
              value={openJobOrders} 
              icon={<Building2 size={24} />} 
              color="teal" 
              trend={`+${openJobOrdersThisWeek} this week`}
              to="/facilities"
            />
            <KPICard 
              title="Candidates Submitted" 
              value={submittedCandidates.length} 
              icon={<Users size={24} />} 
              color="blue"
              trend={`+${submittedThisWeek} this week`}
              to="/pipeline"
            />
            <KPICard 
              title="Interviews" 
              value={interviewingCandidates.length} 
              icon={<CalendarCheck size={24} />} 
              color="cyan" 
              trend={`+${interviewingThisWeek} this week`}
              to="/pipeline"
            />
            <KPICard 
              title="Placements" 
              value={placedCandidates.length} 
              icon={<Award size={24} />} 
              color="emerald"
              trend={`+${placedThisWeek} this week`}
              to="/pipeline"
            />
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="text-slate-400" size={20} />
              <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
            </div>
            
            {recentCandidates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50">
                <p className="text-slate-400 font-medium">No recent candidate activity found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentCandidates.map((candidate, index) => (
                  <div key={candidate.id || index} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className="bg-healthcare-teal/10 p-2 rounded-lg shrink-0 mt-0.5">
                      <Users size={16} className="text-healthcare-teal" />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-900 font-medium text-sm">
                        New Candidate Added: <span className="font-bold">{candidate['Applicant Name'] || 'Unknown'}</span> - {candidate['Specialty'] || 'General'}
                      </p>
                      <p className="text-slate-500 text-xs mt-1">
                        {getRelativeTime(candidate['Application Date'], candidate._createdTime || candidate.createdTime)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
