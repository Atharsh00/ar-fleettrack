import React from 'react';
import { useFleet } from '../context/FleetContext';
import { DateFilterPreset } from '../types';
import { Calendar, Filter } from 'lucide-react';

export const DateFilter: React.FC = () => {
  const { dateFilter, setDateFilter } = useFleet();

  const handlePresetChange = (preset: DateFilterPreset) => {
    if (preset === 'custom') {
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
      setDateFilter({
        preset: 'custom',
        startDate: dateFilter.startDate || thirtyDaysAgo,
        endDate: dateFilter.endDate || today,
      });
    } else {
      setDateFilter({
        preset,
        startDate: undefined,
        endDate: undefined,
      });
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter({
      ...dateFilter,
      preset: 'custom',
      startDate: e.target.value,
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter({
      ...dateFilter,
      preset: 'custom',
      endDate: e.target.value,
    });
  };

  return (
    <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-300">
          <Filter className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Date Range Filter:</span>
        </div>

        {/* Preset Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handlePresetChange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              dateFilter.preset === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Time
          </button>
          <button
            type="button"
            onClick={() => handlePresetChange('this_month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              dateFilter.preset === 'this_month'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            This Month
          </button>
          <button
            type="button"
            onClick={() => handlePresetChange('last_month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              dateFilter.preset === 'last_month'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Last Month
          </button>
          <button
            type="button"
            onClick={() => handlePresetChange('custom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              dateFilter.preset === 'custom'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Custom Range
          </button>

          {/* Custom Date Pickers */}
          {dateFilter.preset === 'custom' && (
            <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-700 rounded-lg px-2.5 py-1 ml-1 animate-fadeIn">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={dateFilter.startDate || ''}
                onChange={handleStartDateChange}
                className="bg-transparent text-xs text-slate-200 focus:outline-none [color-scheme:dark]"
              />
              <span className="text-slate-500 text-xs">to</span>
              <input
                type="date"
                value={dateFilter.endDate || ''}
                onChange={handleEndDateChange}
                className="bg-transparent text-xs text-slate-200 focus:outline-none [color-scheme:dark]"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
