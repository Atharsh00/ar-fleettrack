import React, { useState } from 'react';
import { useFleet } from '../../context/FleetContext';
import { Settings, Sliders, Truck, Users, Building2, CheckCircle2, Edit3, Trash2, Plus, Building } from 'lucide-react';
import { ProfileModal } from '../modals/ProfileModal';

export const RulesConfigTab: React.FC = () => {
  const {
    activeRules,
    updateRules,
    trucks,
    companies,
    drivers,
    updateTruck,
    deleteTruck,
    updateCompany,
    deleteCompany,
    updateDriver,
    deleteDriver,
    activeProfile,
  } = useFleet();

  // Rules State
  const [driverSalaryPct, setDriverSalaryPct] = useState(activeRules.defaultDriverSalaryPercent.toString());
  const [tdsPct, setTdsPct] = useState(activeRules.defaultTdsPercent.toString());
  const [rulesSaved, setRulesSaved] = useState(false);

  const handleSaveRules = (e: React.FormEvent) => {
    e.preventDefault();
    const dVal = parseFloat(driverSalaryPct);
    const tVal = parseFloat(tdsPct);
    if (isNaN(dVal) || isNaN(tVal) || dVal < 0 || tVal < 0) {
      alert('Percentages must be valid non-negative numbers');
      return;
    }

    updateRules({
      defaultDriverSalaryPercent: dVal,
      defaultTdsPercent: tVal,
    });
    setRulesSaved(true);
    setTimeout(() => setRulesSaved(false), 3000);
  };

  // Master Entity Edit State
  const [editingTruckId, setEditingTruckId] = useState<string | null>(null);
  const [truckReg, setTruckReg] = useState('');
  const [truckModel, setTruckModel] = useState('');

  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');

  const [editingDriverId, setEditingDriverId] = useState<string | null>(null);
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');

  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-500" />
            Rules & Master Entity Configuration Center
          </h2>
          <p className="text-xs text-slate-400">
            Configure system-wide calculation formulas, manage master dropdown entities, and entity profile scoping
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowProfileModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-xs rounded-xl border border-slate-700 transition"
        >
          <Building className="w-4 h-4" />
          <span>Active Entity: {activeProfile.name}</span>
        </button>
      </div>

      {/* SECTION 1: System Calculation Rules */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-500" />
              Automated Calculation Percentage Rules
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              These percentages govern default salary allocations and statutory deductions for all newly created trips
            </p>
          </div>
          {rulesSaved && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-lg animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              <span>Rules Saved Successfully!</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveRules} className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Driver Salary Rule */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
            <label className="block text-xs font-bold text-purple-300">
              Default Driver Salary Commission (%)
            </label>
            <p className="text-[11px] text-slate-400">
              System calculates driver trip salary as this percentage of <strong>Net Rent</strong> (calculated after deducting TDS and Broker Commission).
            </p>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                required
                value={driverSalaryPct}
                onChange={(e) => setDriverSalaryPct(e.target.value)}
                className="w-32 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-purple-500"
              />
              <span className="text-slate-400 font-bold">%</span>
            </div>
          </div>

          {/* TDS Deduction Rule */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
            <label className="block text-xs font-bold text-emerald-300">
              Default Statutory TDS Deduction (%)
            </label>
            <p className="text-[11px] text-slate-400">
              When TDS Deducted is checked in trip entry, this rate is withheld from the gross rent by client shippers under Section 194C.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                required
                value={tdsPct}
                onChange={(e) => setTdsPct(e.target.value)}
                className="w-32 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
              <span className="text-slate-400 font-bold">%</span>
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition"
            >
              Update Calculation Rules
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: Master Entity Management (Dropdowns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trucks Master */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-500" />
              Trucks Master ({trucks.length})
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Edit vehicle registration numbers or delete trucks in current profile:
          </p>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {trucks.map((t) => {
              const isEditing = editingTruckId === t.id;
              return (
                <div
                  key={t.id}
                  className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-2"
                >
                  {isEditing ? (
                    <div className="space-y-1.5 flex-1">
                      <input
                        type="text"
                        value={truckReg}
                        onChange={(e) => setTruckReg(e.target.value)}
                        className="w-full bg-slate-900 border border-amber-500 rounded px-2 py-1 text-xs text-white uppercase font-mono"
                      />
                      <input
                        type="text"
                        value={truckModel}
                        onChange={(e) => setTruckModel(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                      />
                      <div className="flex gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            updateTruck(t.id, {
                              registrationNumber: truckReg.trim().toUpperCase(),
                              model: truckModel.trim(),
                            });
                            setEditingTruckId(null);
                          }}
                          className="px-2 py-0.5 bg-amber-500 text-slate-950 font-bold text-[10px] rounded"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTruckId(null)}
                          className="px-2 py-0.5 bg-slate-700 text-slate-300 text-[10px] rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs font-bold text-white font-mono">{t.registrationNumber}</div>
                      <div className="text-[10px] text-slate-400">{t.model} ({t.capacity})</div>
                    </div>
                  )}

                  {!isEditing && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTruckId(t.id);
                          setTruckReg(t.registrationNumber);
                          setTruckModel(t.model);
                        }}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTruck(t.id)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Companies Master */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              Companies Master ({companies.length})
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Renaming updates all past trip invoices automatically:
          </p>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {companies.map((c) => {
              const isEditing = editingCompanyId === c.id;
              return (
                <div
                  key={c.id}
                  className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-2"
                >
                  {isEditing ? (
                    <div className="space-y-1.5 flex-1">
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full bg-slate-900 border border-amber-500 rounded px-2 py-1 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Phone"
                        value={companyPhone}
                        onChange={(e) => setCompanyPhone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                      />
                      <div className="flex gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            updateCompany(c.id, {
                              name: companyName.trim(),
                              phone: companyPhone.trim(),
                            });
                            setEditingCompanyId(null);
                          }}
                          className="px-2 py-0.5 bg-amber-500 text-slate-950 font-bold text-[10px] rounded"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCompanyId(null)}
                          className="px-2 py-0.5 bg-slate-700 text-slate-300 text-[10px] rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs font-bold text-white">{c.name}</div>
                      <div className="text-[10px] text-slate-400">{c.contactPerson || c.phone || 'No contact'}</div>
                    </div>
                  )}

                  {!isEditing && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCompanyId(c.id);
                          setCompanyName(c.name);
                          setCompanyPhone(c.phone || '');
                        }}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCompany(c.id)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Drivers Master */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Drivers Master ({drivers.length})
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Renaming updates driver ledgers and trip rosters:
          </p>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {drivers.map((d) => {
              const isEditing = editingDriverId === d.id;
              return (
                <div
                  key={d.id}
                  className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-2"
                >
                  {isEditing ? (
                    <div className="space-y-1.5 flex-1">
                      <input
                        type="text"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        className="w-full bg-slate-900 border border-amber-500 rounded px-2 py-1 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Phone"
                        value={driverPhone}
                        onChange={(e) => setDriverPhone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                      />
                      <div className="flex gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            updateDriver(d.id, {
                              name: driverName.trim(),
                              phone: driverPhone.trim(),
                            });
                            setEditingDriverId(null);
                          }}
                          className="px-2 py-0.5 bg-amber-500 text-slate-950 font-bold text-[10px] rounded"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingDriverId(null)}
                          className="px-2 py-0.5 bg-slate-700 text-slate-300 text-[10px] rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs font-bold text-white">{d.name}</div>
                      <div className="text-[10px] text-slate-400">{d.phone} • {d.licenseNumber}</div>
                    </div>
                  )}

                  {!isEditing && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDriverId(d.id);
                          setDriverName(d.name);
                          setDriverPhone(d.phone);
                        }}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteDriver(d.id)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
    </div>
  );
};
