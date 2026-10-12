import React, { useState } from 'react';
import { useFleet } from '../../context/FleetContext';
import { Truck, Company, Driver, TruckStatus, DriverStatus } from '../../types';
import {
  Truck as TruckIcon,
  Building2,
  Users,
  Settings,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Search,
  Sliders,
  Building,
  ShieldCheck,
  Calendar,
  Phone,
  Mail,
  FileText,
  X,
  Check,
} from 'lucide-react';
import { ProfileModal } from '../modals/ProfileModal';

export const MastersTab: React.FC = () => {
  const {
    trucks,
    companies,
    drivers,
    addTruck,
    updateTruck,
    deleteTruck,
    addCompany,
    updateCompany,
    deleteCompany,
    addDriver,
    updateDriver,
    deleteDriver,
    activeRules,
    updateRules,
    activeProfile,
  } = useFleet();

  const [activeSubTab, setActiveSubTab] = useState<'trucks' | 'companies' | 'drivers' | 'rules'>('trucks');
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);

  // --- TRUCK MODAL STATE ---
  const [truckModalOpen, setTruckModalOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null);
  const [truckReg, setTruckReg] = useState('');
  const [truckModel, setTruckModel] = useState('');
  const [truckCapacity, setTruckCapacity] = useState('25 Ton');
  const [truckRegDate, setTruckRegDate] = useState('');
  const [truckNotes, setTruckNotes] = useState('');
  const [truckStatus, setTruckStatus] = useState<TruckStatus>('ACTIVE');

  // --- COMPANY MODAL STATE ---
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [companyContact, setCompanyContact] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyGstin, setCompanyGstin] = useState('');

  // --- DRIVER MODAL STATE ---
  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  const [driverJoiningDate, setDriverJoiningDate] = useState('');
  const [driverStatus, setDriverStatus] = useState<DriverStatus>('ACTIVE');

  // --- RULES STATE ---
  const [driverSalaryPct, setDriverSalaryPct] = useState(activeRules.defaultDriverSalaryPercent.toString());
  const [tdsPct, setTdsPct] = useState(activeRules.defaultTdsPercent.toString());
  const [rulesSaved, setRulesSaved] = useState(false);

  // Open Truck Modal
  const openTruckModal = (t?: Truck) => {
    if (t) {
      setEditingTruck(t);
      setTruckReg(t.registrationNumber);
      setTruckModel(t.model);
      setTruckCapacity(t.capacity);
      setTruckRegDate(t.registrationDate || '');
      setTruckNotes(t.notes || '');
      setTruckStatus(t.status || 'ACTIVE');
    } else {
      setEditingTruck(null);
      setTruckReg('');
      setTruckModel('');
      setTruckCapacity('25 Ton');
      setTruckRegDate(new Date().toISOString().split('T')[0]);
      setTruckNotes('');
      setTruckStatus('ACTIVE');
    }
    setTruckModalOpen(true);
  };

  const handleSaveTruck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!truckReg.trim()) return alert('Please enter Truck Registration Number');
    if (!truckModel.trim()) return alert('Please enter Vehicle Model');

    if (editingTruck) {
      updateTruck(editingTruck.id, {
        registrationNumber: truckReg.trim().toUpperCase(),
        model: truckModel.trim(),
        capacity: truckCapacity.trim(),
        registrationDate: truckRegDate,
        notes: truckNotes.trim(),
        status: truckStatus,
      });
    } else {
      addTruck({
        registrationNumber: truckReg.trim().toUpperCase(),
        model: truckModel.trim(),
        capacity: truckCapacity.trim(),
        registrationDate: truckRegDate,
        notes: truckNotes.trim(),
        status: truckStatus,
      });
    }
    setTruckModalOpen(false);
  };

  // Open Company Modal
  const openCompanyModal = (c?: Company) => {
    if (c) {
      setEditingCompany(c);
      setCompanyName(c.name);
      setCompanyContact(c.contactPerson || '');
      setCompanyPhone(c.phone || '');
      setCompanyEmail(c.email || '');
      setCompanyGstin(c.gstin || '');
    } else {
      setEditingCompany(null);
      setCompanyName('');
      setCompanyContact('');
      setCompanyPhone('');
      setCompanyEmail('');
      setCompanyGstin('');
    }
    setCompanyModalOpen(true);
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return alert('Please enter Company Name');

    if (editingCompany) {
      updateCompany(editingCompany.id, {
        name: companyName.trim(),
        contactPerson: companyContact.trim(),
        phone: companyPhone.trim(),
        email: companyEmail.trim(),
        gstin: companyGstin.trim().toUpperCase(),
      });
    } else {
      addCompany({
        name: companyName.trim(),
        contactPerson: companyContact.trim(),
        phone: companyPhone.trim(),
        email: companyEmail.trim(),
        gstin: companyGstin.trim().toUpperCase(),
      });
    }
    setCompanyModalOpen(false);
  };

  // Open Driver Modal
  const openDriverModal = (d?: Driver) => {
    if (d) {
      setEditingDriver(d);
      setDriverName(d.name);
      setDriverPhone(d.phone);
      setDriverLicense(d.licenseNumber);
      setDriverJoiningDate(d.joiningDate || '');
      setDriverStatus(d.status || 'ACTIVE');
    } else {
      setEditingDriver(null);
      setDriverName('');
      setDriverPhone('');
      setDriverLicense('');
      setDriverJoiningDate(new Date().toISOString().split('T')[0]);
      setDriverStatus('ACTIVE');
    }
    setDriverModalOpen(true);
  };

  const handleSaveDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName.trim()) return alert('Please enter Driver Name');
    if (!driverPhone.trim()) return alert('Please enter Phone Number');
    if (!driverLicense.trim()) return alert('Please enter License Number');

    if (editingDriver) {
      updateDriver(editingDriver.id, {
        name: driverName.trim(),
        phone: driverPhone.trim(),
        licenseNumber: driverLicense.trim().toUpperCase(),
        joiningDate: driverJoiningDate,
        status: driverStatus,
      });
    } else {
      addDriver({
        name: driverName.trim(),
        phone: driverPhone.trim(),
        licenseNumber: driverLicense.trim().toUpperCase(),
        joiningDate: driverJoiningDate,
        status: driverStatus,
      });
    }
    setDriverModalOpen(false);
  };

  // Save Rules
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

  // Filtered entity lists
  const filteredTrucks = trucks.filter((t) => {
    const q = searchTerm.toLowerCase();
    return (
      t.registrationNumber.toLowerCase().includes(q) ||
      t.model.toLowerCase().includes(q) ||
      t.capacity.toLowerCase().includes(q) ||
      (t.notes && t.notes.toLowerCase().includes(q))
    );
  });

  const filteredCompanies = companies.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.contactPerson && c.contactPerson.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.gstin && c.gstin.toLowerCase().includes(q))
    );
  });

  const filteredDrivers = drivers.filter((d) => {
    const q = searchTerm.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.phone.toLowerCase().includes(q) ||
      d.licenseNumber.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            Centralized Master Data Management
          </h2>
          <p className="text-xs text-slate-400">
            Maintain vehicles, client companies, drivers, and operational rules. Changes update historical logs and dropdowns instantly.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowProfileModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-xs rounded-xl border border-slate-700 transition shadow-sm"
        >
          <Building className="w-4 h-4" />
          <span>Profile: {activeProfile.name}</span>
        </button>
      </div>

      {/* Sub-Navigation & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => { setActiveSubTab('trucks'); setSearchTerm(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeSubTab === 'trucks'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TruckIcon className="w-4 h-4" />
            <span>Truck Master ({trucks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveSubTab('companies'); setSearchTerm(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeSubTab === 'companies'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Company Master ({companies.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveSubTab('drivers'); setSearchTerm(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeSubTab === 'drivers'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Driver Master ({drivers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveSubTab('rules'); setSearchTerm(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeSubTab === 'rules'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Rules & Formulas</span>
          </button>
        </div>

        {activeSubTab !== 'rules' && (
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-60">
              <input
                type="text"
                placeholder={`Search ${activeSubTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            {activeSubTab === 'trucks' && (
              <button
                type="button"
                onClick={() => openTruckModal()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Add Truck</span>
              </button>
            )}

            {activeSubTab === 'companies' && (
              <button
                type="button"
                onClick={() => openCompanyModal()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Add Company</span>
              </button>
            )}

            {activeSubTab === 'drivers' && (
              <button
                type="button"
                onClick={() => openDriverModal()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Add Driver</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* SUB-TAB 1: TRUCK MASTER */}
      {activeSubTab === 'trucks' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TruckIcon className="w-4 h-4 text-amber-500" />
              Registered Fleet Vehicles ({filteredTrucks.length})
            </h3>
            <span className="text-xs text-slate-400">
              Modifying vehicle numbers immediately cascades to all trip freight records
            </span>
          </div>

          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Registration No</th>
                <th className="py-2.5 px-3">Model / Make</th>
                <th className="py-2.5 px-3">Tonnage Capacity</th>
                <th className="py-2.5 px-3">Registration Date</th>
                <th className="py-2.5 px-3">Notes / Specs</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTrucks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No trucks found matching your search.
                  </td>
                </tr>
              ) : (
                filteredTrucks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-mono font-bold text-amber-400 text-sm">{t.registrationNumber}</td>
                    <td className="py-3 px-3 font-semibold text-white">{t.model}</td>
                    <td className="py-3 px-3 text-slate-300 font-mono">{t.capacity}</td>
                    <td className="py-3 px-3 text-slate-400 font-mono">{t.registrationDate || 'N/A'}</td>
                    <td className="py-3 px-3 text-slate-400">{t.notes || '—'}</td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          t.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {t.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openTruckModal(t)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition"
                          title="Edit Truck Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTruck(t.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-400 transition"
                          title="Delete Truck"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* SUB-TAB 2: COMPANY MASTER */}
      {activeSubTab === 'companies' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              Client Shipper Companies ({filteredCompanies.length})
            </h3>
            <span className="text-xs text-slate-400">
              Renaming a company immediately syncs historical invoices, receivables, and settlements
            </span>
          </div>

          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Company Name</th>
                <th className="py-2.5 px-3">Contact Person</th>
                <th className="py-2.5 px-3">Phone Number</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">GSTIN / Tax ID</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No client companies match your search.
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-bold text-white text-sm">{c.name}</td>
                    <td className="py-3 px-3 text-slate-300">{c.contactPerson || '—'}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">{c.phone || '—'}</td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">{c.email || '—'}</td>
                    <td className="py-3 px-3 font-mono text-amber-400">{c.gstin || '—'}</td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openCompanyModal(c)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition"
                          title="Edit Company Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCompany(c.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-400 transition"
                          title="Delete Company"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* SUB-TAB 3: DRIVER MASTER */}
      {activeSubTab === 'drivers' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Fleet Drivers Roster ({filteredDrivers.length})
            </h3>
            <span className="text-xs text-slate-400">
              Driver profiles link to 15% Net Rent commission calculations and salary ledger
            </span>
          </div>

          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Driver Name</th>
                <th className="py-2.5 px-3">Phone Number</th>
                <th className="py-2.5 px-3">License Number</th>
                <th className="py-2.5 px-3">Joining Date</th>
                <th className="py-2.5 px-3 text-center">Duty Status</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No drivers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-bold text-white text-sm">{d.name}</td>
                    <td className="py-3 px-3 font-mono text-purple-300">{d.phone}</td>
                    <td className="py-3 px-3 font-mono text-slate-300 font-semibold">{d.licenseNumber}</td>
                    <td className="py-3 px-3 text-slate-400 font-mono">{d.joiningDate || '—'}</td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          d.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {d.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openDriverModal(d)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition"
                          title="Edit Driver Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteDriver(d.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-400 transition"
                          title="Delete Driver"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* SUB-TAB 4: RULES CONFIGURATION */}
      {activeSubTab === 'rules' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-500" />
                Calculation Rules & Formula Parameters
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
                Calculated strictly on <strong>Net Rent</strong> (Agreed Gross Rent minus Statutory TDS minus Broker Commission).
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
                When TDS Deducted is checked in trip entry, this rate is withheld by client shippers under Section 194C.
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
                Save Calculation Rules
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- TRUCK ADD/EDIT MODAL --- */}
      {truckModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/40">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TruckIcon className="w-4 h-4 text-amber-500" />
                {editingTruck ? 'Edit Vehicle Master' : 'Add New Fleet Truck'}
              </h3>
              <button
                type="button"
                onClick={() => setTruckModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTruck} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Registration No *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MH-12-RN-4825"
                    value={truckReg}
                    onChange={(e) => setTruckReg(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono font-bold uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Model / Make *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tata Signa 4825.TK"
                    value={truckModel}
                    onChange={(e) => setTruckModel(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Capacity</label>
                  <input
                    type="text"
                    placeholder="e.g. 28 Ton"
                    value={truckCapacity}
                    onChange={(e) => setTruckCapacity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Registration Date</label>
                  <input
                    type="date"
                    value={truckRegDate}
                    onChange={(e) => setTruckRegDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={truckStatus}
                    onChange={(e) => setTruckStatus(e.target.value as TruckStatus)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="IN_MAINTENANCE">MAINTENANCE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Specifications</label>
                <textarea
                  rows={2}
                  placeholder="Body type, axle configuration, GPS unit ID, etc."
                  value={truckNotes}
                  onChange={(e) => setTruckNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTruckModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow-md transition"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingTruck ? 'Update Vehicle' : 'Register Vehicle'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- COMPANY ADD/EDIT MODAL --- */}
      {companyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/40">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                {editingCompany ? 'Edit Client Company' : 'Add Client Shipper Company'}
              </h3>
              <button
                type="button"
                onClick={() => setCompanyModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Shipper Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LogiXpress Logistics Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Sharma"
                    value={companyContact}
                    onChange={(e) => setCompanyContact(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98220 11223"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="billing@company.com"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">GSTIN / Tax ID</label>
                  <input
                    type="text"
                    placeholder="27AABCL1234F1Z5"
                    value={companyGstin}
                    onChange={(e) => setCompanyGstin(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono uppercase"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCompanyModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow-md transition"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingCompany ? 'Save Company' : 'Register Company'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DRIVER ADD/EDIT MODAL --- */}
      {driverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/40">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                {editingDriver ? 'Edit Driver Profile' : 'Register New Fleet Driver'}
              </h3>
              <button
                type="button"
                onClick={() => setDriverModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDriver} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Yadav"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 97110 12345"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">License Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MH-12-201500892"
                    value={driverLicense}
                    onChange={(e) => setDriverLicense(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={driverStatus}
                    onChange={(e) => setDriverStatus(e.target.value as DriverStatus)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="ON_LEAVE">ON LEAVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Joining Date</label>
                <input
                  type="date"
                  value={driverJoiningDate}
                  onChange={(e) => setDriverJoiningDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white [color-scheme:dark]"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDriverModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow-md transition"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingDriver ? 'Save Driver' : 'Register Driver'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
    </div>
  );
};
