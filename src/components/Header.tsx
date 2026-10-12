import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { PlusCircle, Building, Settings } from 'lucide-react';
import { ProfileModal } from './modals/ProfileModal';
import { ARLogo } from './ARLogo';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { profiles, activeProfileId, activeProfile, setActiveProfileId } = useFleet();
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & App Title */}
          <div className="flex items-center gap-3.5 cursor-pointer group" onClick={() => setActiveTab('overview')}>
            <ARLogo className="w-11 h-11 transition-transform group-hover:scale-105 duration-200" />
            <div>
              <div className="flex items-center gap-2">
                <div className="flex items-baseline tracking-tight">
                  <span className="text-2xl font-black font-sans tracking-wider text-amber-400 mr-2 drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)] uppercase">
                    AR
                  </span>
                  <span className="text-lg font-black tracking-tight text-white uppercase group-hover:text-amber-400 transition-colors">
                    FLEETTRACK
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Fleet OS
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Multi-Entity Expense & Revenue Management System (₹ INR)</p>
            </div>
          </div>

          {/* Center / Right: Global Profile Switcher & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Profile Switcher */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-xl p-1 shadow-sm">
              <div className="flex items-center gap-1.5 px-2 text-slate-400 text-xs font-semibold">
                <Building className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden md:inline">Entity Profile:</span>
              </div>

              <select
                value={activeProfileId}
                onChange={(e) => setActiveProfileId(e.target.value)}
                className="bg-slate-900 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg border border-slate-700/80 focus:outline-none focus:border-amber-500 max-w-[160px] sm:max-w-[200px] truncate"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                title="Manage Entity Profiles"
                className="p-1.5 ml-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Add Entry CTA */}
            <button
              type="button"
              onClick={() => setActiveTab('data_entry')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md transition-all ${
                activeTab === 'data_entry'
                  ? 'bg-slate-800 text-amber-400 border border-amber-500/40'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ New Entry</span>
            </button>
          </div>
        </div>
      </div>

      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
    </header>
  );
};
