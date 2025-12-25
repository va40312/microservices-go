import React from 'react';
import { LayoutDashboard, TrendingUp, Database } from 'lucide-react';

export const Sidebar: React.FC<{ activeTab: string; setTab: (t: string) => void }> = ({ activeTab, setTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'feed', label: 'Trend Feed', icon: Database },
  ];

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 border-r border-white/5 bg-[#09090b] flex flex-col z-50">
      <div className="p-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <TrendingUp className="text-white w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white">
            TrendPulse
          </h1>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`
              w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${activeTab === item.id 
                ? 'bg-zinc-800 text-white shadow-sm border border-white/5' 
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent'}
            `}
          >
            <item.icon size={18} className={activeTab === item.id ? "text-indigo-400" : "text-zinc-600 group-hover:text-zinc-400"} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5 text-center">
        <p className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase">Version 1.0.4 Beta</p>
      </div>
    </aside>
  );
};