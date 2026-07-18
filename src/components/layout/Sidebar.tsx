import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, KanbanSquare, Handshake } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: (string | undefined | null | false)[]) => twMerge(clsx(inputs));

const navItems = [
  { path: '/', label: 'Command Center', icon: <LayoutDashboard size={20} /> },
  { path: '/facilities', label: 'Facility Hub', icon: <Building2 size={20} /> },
  { path: '/candidates', label: 'Candidate Roster', icon: <Users size={20} /> },
  { path: '/pipeline', label: 'Placement Pipeline', icon: <KanbanSquare size={20} /> },
  { path: '/partners', label: 'Recruiting Partners', icon: <Handshake size={20} /> },
];

export const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3 text-healthcare-teal">
          <div className="bg-healthcare-teal/10 p-2 rounded-xl">
            <Building2 size={24} className="text-healthcare-teal" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">HealthStaff<span className="text-healthcare-teal">AI</span></span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
              isActive 
                ? "bg-healthcare-teal text-white shadow-md shadow-healthcare-teal/20" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-healthcare-teal/20 flex items-center justify-center text-healthcare-teal font-bold">
            JD
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-900">Jane Doe</span>
            <span className="text-xs text-slate-500">Administrator</span>
          </div>
        </div>
      </div>
    </div>
  );
};
