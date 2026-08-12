import { useState } from 'react';
import Sidebar from './Sidebar';
import { FaBars } from 'react-icons/fa';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed md:static z-50 transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <main className="flex-1 min-h-screen overflow-y-auto w-full">
        {/* Mobile header */}
        <div className="flex items-center gap-3 p-4 md:hidden sticky top-0 z-30 bg-slate-900/80 backdrop-blur-sm border-b border-white/10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition"
          >
            <FaBars className="text-white/60" />
          </button>
          <h1 className="text-lg font-semibold text-indigo-400">Career<span className="text-white">Lens</span></h1>
        </div>
        
        {/* Page content */}
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}