import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';

export const Layout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 flex flex-col md:flex-row">
      {/* Mobile Top Navigation */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 shrink-0 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
            <img src="/logo.jpeg" alt="Argyle" className="w-full h-full object-contain" />
          </div>
          <span className="font-serif font-bold text-lg dark:text-white">Argyle CRM</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-neutral-800 transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Overlay for mobile sidebar */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - responsive container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:transform-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar 
          isCollapsed={isCollapsed} 
          toggleCollapse={() => setIsCollapsed(!isCollapsed)} 
          closeMobile={() => setIsMobileMenuOpen(false)}
        />
      </div>
      
      <main className={`flex-1 p-4 overflow-y-auto h-[calc(100vh-65px)] md:h-screen transition-all duration-300 w-full`}>
        <Outlet />
      </main>
    </div>
  );
};
