import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, KanbanSquare, Handshake, Link2, Menu, Sun, Moon, LogOut, X } from 'lucide-react';
import { useAuth } from "@clerk/clerk-react";
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: (string | undefined | null | false)[]) => twMerge(clsx(inputs));

const navItems = [
  { path: '/', label: 'Command Center', icon: <LayoutDashboard size={20} /> },
  { path: '/facilities', label: 'Facility Hub', icon: <Building2 size={20} /> },
  { path: '/candidates', label: 'Candidate Roster', icon: <Users size={20} /> },
  { path: '/pipeline', label: 'Placement Pipeline', icon: <KanbanSquare size={20} /> },
  { path: '/pairing', label: 'Smart Pairing', icon: <Link2 size={20} /> },
  { path: '/partners', label: 'Recruiting Partners', icon: <Handshake size={20} /> },
];

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  closeMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleCollapse, closeMobile }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { signOut } = useAuth();
  
  useEffect(() => {
    // Check system preference or localStorage on initial load
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDarkMode(true);
    }
  };

  const isExpanded = !isCollapsed || isHovered;

  const handleToggle = () => {
    toggleCollapse();
    setIsHovered(false);
  };

  return (
    <div 
      className={cn(
        "bg-white dark:bg-neutral-900 border-r border-slate-200 dark:border-neutral-800 h-[100dvh] flex flex-col transition-all duration-300 z-50",
        isExpanded ? "w-64 shadow-2xl shadow-slate-900/10" : "w-20"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="px-4 py-4 md:px-5 md:py-5 border-b border-slate-100 flex items-center justify-between min-h-[88px] relative">
        {isExpanded ? (
          <div className="flex items-center justify-between w-full pr-1">
            <div className="flex items-center gap-2">
              <div className="shrink-0 flex items-center justify-center w-10 h-10">
                <img src="/logo.jpeg" alt="Argyle" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-2xl font-bold font-serif leading-none pb-0.5 text-black">
                  Argyle
                </span>
                <span className="text-[9.5px] uppercase tracking-widest font-medium mt-1 leading-none text-black whitespace-nowrap">
                  Medical Staffing
                </span>
              </div>
            </div>
            {/* Mobile close button */}
            <button 
              onClick={closeMobile}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-neutral-800 dark:text-slate-500"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            {/* Empty space to align the menu button nicely when collapsed, or we can just leave it to the button */}
          </div>
        )}
        
        {/* Desktop collapse button */}
        <button 
          onClick={handleToggle} 
          className={cn(
            "hidden md:block p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors shrink-0",
            !isExpanded && "absolute left-1/2 -translate-x-1/2"
          )}
        >
          <Menu size={24} />
        </button>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={!isExpanded ? item.label : undefined}
            onClick={() => closeMobile && closeMobile()}
            className={({ isActive }) => cn(
              "flex items-center gap-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 overflow-hidden",
              isActive 
                ? "bg-healthcare-teal text-white shadow-md shadow-healthcare-teal/20" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
              isExpanded ? "px-4" : "px-0 justify-center"
            )}
          >
            <div className="shrink-0">{item.icon}</div>
            {isExpanded && <span className="whitespace-nowrap">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-100 flex flex-col gap-2">
        <button 
          onClick={toggleDarkMode}
          className={cn(
            "flex items-center gap-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900",
            isExpanded ? "px-4" : "justify-center"
          )}
          title="Toggle Dark Mode"
        >
          <div className="shrink-0">{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</div>
          {isExpanded && <span className="whitespace-nowrap">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        
        <div className={cn("flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800", isExpanded ? "px-4" : "items-center")}>
          <div className="flex items-center gap-3 py-2">
            <div className="shrink-0 w-8 h-8 rounded-full bg-healthcare-teal flex items-center justify-center text-white font-bold">
              JD
            </div>
            {isExpanded && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-slate-900 dark:text-white whitespace-nowrap">Juney</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Administrator</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => signOut()}
            className={cn(
              "flex items-center gap-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400",
              isExpanded ? "px-3 w-full" : "justify-center w-10 h-10 px-0"
            )}
            title="Sign Out"
          >
            <div className="shrink-0"><LogOut size={18} /></div>
            {isExpanded && <span className="whitespace-nowrap">Sign Out</span>}
          </button>
        </div>
      </div>
    </div>
  );
};
