import React, { useState } from 'react';
import { FleetProvider } from './context/FleetContext';
import { Header } from './components/Header';
import { DateFilter } from './components/DateFilter';
import { SummaryCards } from './components/SummaryCards';
import { OverviewTab } from './components/tabs/OverviewTab';
import { TruckPerformanceTab } from './components/tabs/TruckPerformanceTab';
import { CompanyAccountsTab } from './components/tabs/CompanyAccountsTab';
import { DriverLedgerTab } from './components/tabs/DriverLedgerTab';
import { TdsLedgerTab } from './components/tabs/TdsLedgerTab';
import { UniversalLedgerTab } from './components/tabs/UniversalLedgerTab';
import { DataEntryTab } from './components/tabs/DataEntryTab';
import { MastersTab } from './components/tabs/MastersTab';
import {
  LayoutDashboard,
  Truck,
  Building2,
  Users,
  Receipt,
  Layers,
  PlusCircle,
  ShieldCheck,
} from 'lucide-react';

export const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  const navItems = [
    { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'truck_performance', label: 'Truck Performance', icon: Truck },
    { id: 'company_accounts', label: 'Company Receivables', icon: Building2 },
    { id: 'driver_ledger', label: 'Driver Ledger', icon: Users },
    { id: 'tds_ledger', label: 'TDS Deduction Ledger', icon: Receipt },
    { id: 'universal_ledger', label: 'Universal Data Ledger', icon: Layers },
    { id: 'data_entry', label: 'Data Entry Portal', icon: PlusCircle },
    { id: 'masters', label: 'Master Management', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Global Sticky Date Filter */}
      <DateFilter />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top 4 KPI Summary Cards */}
        <SummaryCards />

        {/* Tab Navigation Bar - Fixed Visible Responsive Grid (All 8 tabs visible without scrolling) */}
        <nav aria-label="Main Navigation" className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col xl:flex-row items-center justify-center gap-1.5 xl:gap-2 px-2.5 py-2.5 rounded-xl text-xs font-bold text-center transition-all duration-200 border ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 ring-1 ring-amber-400'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-slate-950' : 'text-amber-500'}`} />
                <span className="leading-tight text-[11px] xl:text-xs truncate w-full">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Tab View Content */}
        <div className="animate-fadeIn">
          {activeTab === 'overview' && <OverviewTab onNavigateTab={(tab) => setActiveTab(tab)} />}
          {activeTab === 'truck_performance' && <TruckPerformanceTab />}
          {activeTab === 'company_accounts' && <CompanyAccountsTab />}
          {activeTab === 'driver_ledger' && <DriverLedgerTab />}
          {activeTab === 'tds_ledger' && <TdsLedgerTab />}
          {activeTab === 'universal_ledger' && <UniversalLedgerTab />}
          {activeTab === 'data_entry' && <DataEntryTab />}
          {activeTab === 'masters' && <MastersTab />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AR FleetTrack &copy; 2026 Fleet Operations Engine</span>
          <span className="font-mono text-[11px] text-slate-400">
            Multi-Entity Scoping &bull; TDS Deduction Ledger &bull; Universal Edit/Delete &bull; 15% Net Commission
          </span>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <FleetProvider>
      <MainLayout />
    </FleetProvider>
  );
};

export default App;
