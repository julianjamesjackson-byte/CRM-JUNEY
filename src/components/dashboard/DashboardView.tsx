import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, CalendarCheck, Award, Activity } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color: 'teal' | 'blue' | 'cyan' | 'emerald';
}

const colorMap = {
  teal: 'bg-healthcare-teal/10 text-healthcare-teal',
  blue: 'bg-healthcare-blue/10 text-healthcare-blue',
  cyan: 'bg-healthcare-cyan/10 text-healthcare-cyan',
  emerald: 'bg-healthcare-emerald/10 text-healthcare-emerald'
};

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, trend, color }) => (
  <motion.div 
    whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}
    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm transition-all duration-300"
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
);

export const DashboardView: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Command Center</h1>
        <p className="text-slate-500">Overview of your staffing operations and pipeline.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Open Job Orders" 
          value="42" 
          icon={<Building2 size={24} />} 
          color="teal" 
          trend="+3 this week"
        />
        <KPICard 
          title="Candidates Submitted" 
          value="128" 
          icon={<Users size={24} />} 
          color="blue"
          trend="+12 this week"
        />
        <KPICard 
          title="Interviews" 
          value="35" 
          icon={<CalendarCheck size={24} />} 
          color="cyan" 
        />
        <KPICard 
          title="Placements" 
          value="18" 
          icon={<Award size={24} />} 
          color="emerald"
          trend="85% fill rate"
        />
      </div>
      
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="text-slate-400" size={20} />
          <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
        </div>
        <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50">
          <p className="text-slate-400 font-medium">Activity feed will load from Airtable...</p>
        </div>
      </div>
    </div>
  );
};
