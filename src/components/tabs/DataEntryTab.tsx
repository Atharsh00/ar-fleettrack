import React, { useState } from 'react';
import { useFleet } from '../../context/FleetContext';
import { ExpenseCategory, DriverPaymentType } from '../../types';
import { PlusCircle, Truck, Building2, Users, CheckCircle, Calculator, Fuel, Wallet, Plus, Trash2, MapPin } from 'lucide-react';

export const DataEntryTab: React.FC = () => {
  const {
    trucks,
    companies,
    drivers,
    trips,
    addTrip,
    addTruckExpense,
    addDriverPayment,
    addTruck,
    addCompany,
    addDriver,
    activeRules,
    currency,
  } = useFleet();

  const [activeForm, setActiveForm] = useState<'trip' | 'expense' | 'driver' | 'masters'>('trip');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // 1. Trip Form State
  const [tripDate, setTripDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [tripTruckId, setTripTruckId] = useState<string>(trucks[0]?.id || '');
  const [tripCompanyId, setTripCompanyId] = useState<string>(companies[0]?.id || '');
  const [tripDriverId, setTripDriverId] = useState<string>(drivers[0]?.id || '');
  
  // Route fields
  const [fromLocation, setFromLocation] = useState<string>('');
  const [toLocation, setToLocation] = useState<string>('');
  const [additionalDrops, setAdditionalDrops] = useState<string[]>([]);

  // Financial fields
  const [totalRent, setTotalRent] = useState<string>('');
  const [commissionAmount, setCommissionAmount] = useState<string>('0');
  const [isTdsDeducted, setIsTdsDeducted] = useState<boolean>(true);
  const [advanceReceived, setAdvanceReceived] = useState<string>('');
  const [tripNotes, setTripNotes] = useState<string>('');

  // Drop handlers
  const handleAddDrop = () => {
    setAdditionalDrops([...additionalDrops, '']);
  };

  const handleUpdateDrop = (index: number, val: string) => {
    const updated = [...additionalDrops];
    updated[index] = val;
    setAdditionalDrops(updated);
  };

  const handleRemoveDrop = (index: number) => {
    setAdditionalDrops(additionalDrops.filter((_, idx) => idx !== index));
  };

  // Auto-calculated values based on revised rules:
  const parsedTotalRent = parseFloat(totalRent) || 0;
  const parsedCommission = parseFloat(commissionAmount) || 0;
  const parsedAdvance = parseFloat(advanceReceived) || 0;

  const tdsPct = activeRules.defaultTdsPercent || 1;
  const driverCommPct = activeRules.defaultDriverSalaryPercent || 15;

  const calculatedTdsAmount = isTdsDeducted ? (parsedTotalRent * tdsPct) / 100 : 0;
  const calculatedNetRent = Math.max(0, parsedTotalRent - calculatedTdsAmount - parsedCommission);
  const calculatedDriverSalary = calculatedNetRent * (driverCommPct / 100);
  // Receivables Formula: Balance Due = Total Rent - Advance Received - Commission - TDS
  const calculatedBalancePending = Math.max(0, parsedTotalRent - parsedAdvance - parsedCommission - calculatedTdsAmount);

  const handleTripSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripTruckId) {
      alert('Please select a truck from the dropdown (or create one in Master Management)');
      return;
    }
    if (!tripCompanyId) {
      alert('Please select a client company from the dropdown (or create one in Master Management)');
      return;
    }
    if (!tripDriverId) {
      alert('Please select a driver from the dropdown (or create one in Master Management)');
      return;
    }
    if (!fromLocation.trim() || !toLocation.trim()) {
      alert('Please provide Origin (From) and Destination (To) locations');
      return;
    }
    if (parsedTotalRent <= 0) {
      alert('Agreed Gross Rent must be greater than 0');
      return;
    }

    addTrip({
      date: tripDate,
      truckId: tripTruckId,
      companyNameOrId: tripCompanyId,
      driverNameOrId: tripDriverId,
      fromLocation: fromLocation.trim(),
      toLocation: toLocation.trim(),
      additionalDrops: additionalDrops.filter((d) => d.trim().length > 0),
      totalRent: parsedTotalRent,
      commissionAmount: parsedCommission,
      isTdsDeducted,
      advanceReceived: parsedAdvance,
      notes: tripNotes.trim() || undefined,
    });

    showSuccess(
      `Trip logged! Gross: ${currency} ${parsedTotalRent.toLocaleString('en-IN')} | TDS (1%): ${currency} ${calculatedTdsAmount.toLocaleString(
        'en-IN'
      )} | Net Rent: ${currency} ${calculatedNetRent.toLocaleString('en-IN')} | Driver 15%: ${currency} ${calculatedDriverSalary.toLocaleString(
        'en-IN'
      )} | Company Due: ${currency} ${calculatedBalancePending.toLocaleString('en-IN')}`
    );

    // Reset fields
    setTotalRent('');
    setCommissionAmount('0');
    setAdvanceReceived('');
    setFromLocation('');
    setToLocation('');
    setAdditionalDrops([]);
    setTripNotes('');
  };

  // 2. Expense Form State
  const [expenseDate, setExpenseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expenseTruckId, setExpenseTruckId] = useState<string>(trucks[0]?.id || '');
  const [expenseTripId, setExpenseTripId] = useState<string>('');
  const [isReimbursable, setIsReimbursable] = useState<boolean>(false);
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('DIESEL');
  const [expenseAmount, setExpenseAmount] = useState<string>('');
  const [expensePaymentMethod, setExpensePaymentMethod] = useState<string>('Fleet Card');
  const [expenseNotes, setExpenseNotes] = useState<string>('');

  // Trips dynamically filtered for selected truck
  const truckTrips = trips.filter((t) => t.truckId === expenseTruckId);

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid expense amount');
      return;
    }
    if (!expenseTruckId) {
      alert('Please select a truck');
      return;
    }

    addTruckExpense({
      date: expenseDate,
      truckId: expenseTruckId,
      tripId: expenseTripId || undefined,
      isReimbursable,
      category: expenseCategory,
      amount,
      paymentMethod: expensePaymentMethod,
      notes: expenseNotes.trim() || undefined,
    });

    showSuccess(`Logged ${currency} ${amount.toLocaleString('en-IN')} expense under ${expenseCategory}${expenseTripId ? ' (linked to trip)' : ''}${isReimbursable ? ' [Reimbursable by Client]' : ''}`);
    setExpenseAmount('');
    setExpenseNotes('');
    setIsReimbursable(false);
  };

  // 3. Driver Payment / Expense Form State
  const [dpDate, setDpDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dpDriverId, setDpDriverId] = useState<string>(drivers[0]?.id || '');
  const [dpType, setDpType] = useState<DriverPaymentType>('SALARY_PAYOUT');
  const [dpAmount, setDpAmount] = useState<string>('');
  const [dpPaymentMethod, setDpPaymentMethod] = useState<string>('Cash');
  const [dpDescription, setDpDescription] = useState<string>('');

  const handleDriverPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(dpAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (!dpDriverId) {
      alert('Please select a driver');
      return;
    }
    if (!dpDescription.trim()) {
      alert('Please enter a description');
      return;
    }

    addDriverPayment({
      date: dpDate,
      driverId: dpDriverId,
      type: dpType,
      amount,
      paymentMethod: dpPaymentMethod,
      description: dpDescription.trim(),
    });

    showSuccess(
      dpType === 'SALARY_PAYOUT'
        ? `Driver cash payout of ${currency} ${amount.toLocaleString('en-IN')} recorded!`
        : `Driver expense claim of ${currency} ${amount.toLocaleString('en-IN')} added to ledger!`
    );
    setDpAmount('');
    setDpDescription('');
  };

  // 4. Quick Add Masters
  const [newTruckReg, setNewTruckReg] = useState('');
  const [newTruckModel, setNewTruckModel] = useState('');
  const [newTruckCap, setNewTruckCap] = useState('');

  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyContact, setNewCompanyContact] = useState('');
  const [newCompanyPhone, setNewCompanyPhone] = useState('');

  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [newDriverLicense, setNewDriverLicense] = useState('');

  const handleAddTruck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTruckReg.trim() || !newTruckModel.trim()) return;
    addTruck({
      registrationNumber: newTruckReg.trim().toUpperCase(),
      model: newTruckModel.trim(),
      capacity: newTruckCap.trim() || '25 Ton',
      status: 'ACTIVE',
    });
    showSuccess(`Truck ${newTruckReg.toUpperCase()} added to current entity!`);
    setNewTruckReg('');
    setNewTruckModel('');
    setNewTruckCap('');
  };

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    addCompany(newCompanyName.trim(), newCompanyContact.trim(), newCompanyPhone.trim());
    showSuccess(`Client Company ${newCompanyName} registered!`);
    setNewCompanyName('');
    setNewCompanyContact('');
    setNewCompanyPhone('');
  };

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverName.trim()) return;
    addDriver(newDriverName.trim(), newDriverPhone.trim() || 'N/A', newDriverLicense.trim() || 'N/A');
    showSuccess(`Driver ${newDriverName} registered!`);
    setNewDriverName('');
    setNewDriverPhone('');
    setNewDriverLicense('');
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl flex items-center gap-3 shadow-lg animate-fadeIn">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-xs font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveForm('trip')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeForm === 'trip'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>1. Trip & Freight Entry</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveForm('expense')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeForm === 'expense'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Fuel className="w-4 h-4" />
          <span>2. Truck Expense Entry</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveForm('driver')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeForm === 'driver'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>3. Driver Payout & Claims</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveForm('masters')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeForm === 'masters'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>4. Quick Add Masters</span>
        </button>
      </div>

      {/* FORM 1: Trip & Rent Entry Form */}
      {activeForm === 'trip' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur max-w-4xl mx-auto">
          <div className="border-b border-slate-800 pb-4 mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-500" />
              New Trip & Freight Contract Entry
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Supports multi-drop routes, broker commission deduction, 1% TDS deduction, and automated 15% driver salary on Net Rent.
            </p>
          </div>

          <form onSubmit={handleTripSubmit} className="space-y-5">
            {/* Row 1: Date & Truck */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Trip Date *</label>
                <input
                  type="date"
                  required
                  value={tripDate}
                  onChange={(e) => setTripDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Truck *</label>
                <select
                  required
                  value={tripTruckId}
                  onChange={(e) => setTripTruckId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                >
                  {trucks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.registrationNumber} - {t.model} ({t.capacity})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Company & Driver (Strict Master Dropdowns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Client Company (from Master) *</label>
                <select
                  required
                  value={tripCompanyId}
                  onChange={(e) => setTripCompanyId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-medium"
                >
                  {companies.length === 0 ? (
                    <option value="">No client companies found — add in Master Management first</option>
                  ) : (
                    companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.contactPerson ? `(${c.contactPerson})` : ''}
                      </option>
                    ))
                  )}
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  * Strictly populated from Company Master list
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Driver Assigned (from Master) *</label>
                <select
                  required
                  value={tripDriverId}
                  onChange={(e) => setTripDriverId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-medium"
                >
                  {drivers.length === 0 ? (
                    <option value="">No drivers found — add in Master Management first</option>
                  ) : (
                    drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.phone || 'Driver'})
                      </option>
                    ))
                  )}
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  * 15% salary is automatically calculated on Net Rent (after TDS & Broker Commission)
                </span>
              </div>
            </div>

            {/* Row 3: Dynamic Route (From, To, Add Destination Drop) */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  Route & Multi-Drop Locations
                </span>
                <button
                  type="button"
                  onClick={handleAddDrop}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-lg border border-slate-700 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Destination Drop (+)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">From (Origin) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai JNPT Port"
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">To (Primary Destination) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Solapur MIDC"
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Dynamic Drops */}
              {additionalDrops.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-400 font-semibold block">Intermediate / Additional Drops:</span>
                  {additionalDrops.map((drop, idx) => (
                    <div key={idx} className="flex items-center gap-2 animate-fadeIn">
                      <span className="text-xs font-mono text-slate-500 w-5">#{idx + 1}</span>
                      <input
                        type="text"
                        placeholder={`Drop point #${idx + 1} (e.g. Pune Chakan Hub)`}
                        value={drop}
                        onChange={(e) => handleUpdateDrop(idx, e.target.value)}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveDrop(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Row 4: Financial Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Agreed Gross Rent ({currency}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  min="1"
                  placeholder="e.g. 50000"
                  value={totalRent}
                  onChange={(e) => setTotalRent(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Commission Amount ({currency})
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0"
                  value={commissionAmount}
                  onChange={(e) => setCommissionAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Broker / Agent fee deduction</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Advance Received ({currency})
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0"
                  value={advanceReceived}
                  onChange={(e) => setAdvanceReceived(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Cash/Bank received upfront</span>
              </div>
            </div>

            {/* TDS Checkbox */}
            <div className="bg-slate-800/50 border border-slate-700/80 rounded-xl p-3 flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTdsDeducted}
                  onChange={(e) => setIsTdsDeducted(e.target.checked)}
                  className="h-4 w-4 rounded bg-slate-900 border-slate-600 text-amber-500 focus:ring-amber-500"
                />
                <div>
                  <span className="text-xs font-bold text-white block">TDS Deducted (1% by Shipper)</span>
                  <span className="text-[10px] text-slate-400">
                    If checked, 1% of gross rent ({currency} {calculatedTdsAmount.toLocaleString('en-IN')}) is withheld at source
                  </span>
                </div>
              </label>
              <span className="text-xs font-bold font-mono text-amber-400">
                {isTdsDeducted ? `${currency} ${calculatedTdsAmount.toLocaleString('en-IN')}` : `${currency} 0`}
              </span>
            </div>

            {/* Live Automated Calculations Preview Callout */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-blue-300 block">Net Rent</span>
                <div className="text-lg font-bold font-mono text-blue-400 mt-1">
                  {currency} {calculatedNetRent.toLocaleString('en-IN')}
                </div>
                <p className="text-[9px] text-slate-400 mt-0.5">Gross - TDS - Commission</p>
              </div>

              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-purple-300 block">Driver 15% Salary</span>
                <div className="text-lg font-bold font-mono text-purple-300 mt-1">
                  {currency} {calculatedDriverSalary.toLocaleString('en-IN')}
                </div>
                <p className="text-[9px] text-slate-400 mt-0.5">15% of Net Rent</p>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-amber-300 block">Company Balance Due</span>
                <div className="text-lg font-bold font-mono text-amber-400 mt-1">
                  {currency} {calculatedBalancePending.toLocaleString('en-IN')}
                </div>
                <p className="text-[9px] text-slate-400 mt-0.5">Gross - Adv - Comm - TDS</p>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-emerald-300 block">TDS Withheld</span>
                <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
                  {currency} {calculatedTdsAmount.toLocaleString('en-IN')}
                </div>
                <p className="text-[9px] text-slate-400 mt-0.5">Tracked in TDS Ledger</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Remarks</label>
              <textarea
                rows={2}
                placeholder="Weighbridge slip number, consignor details, cargo condition, etc."
                value={tripNotes}
                onChange={(e) => setTripNotes(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm shadow-xl shadow-amber-500/20 transition"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Save Trip & Update All Ledgers</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FORM 2: Truck Expense Entry Form */}
      {activeForm === 'expense' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur max-w-3xl mx-auto">
          <div className="border-b border-slate-800 pb-4 mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Fuel className="w-5 h-5 text-rose-500" />
              Truck Operating Expense Entry
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select a truck first, optionally link to a specific trip for automatic trip profit deduction, and record operating expenses.
            </p>
          </div>

          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Date of Entry *</label>
                <input
                  type="date"
                  required
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Truck Selection *</label>
                <select
                  required
                  value={expenseTruckId}
                  onChange={(e) => {
                    setExpenseTruckId(e.target.value);
                    setExpenseTripId('');
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                >
                  {trucks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.registrationNumber} - {t.model}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dynamic Trip Linking for selected truck */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Link to Specific Trip (Optional — Deducts directly from Trip Profitability)
              </label>
              <select
                value={expenseTripId}
                onChange={(e) => setExpenseTripId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              >
                <option value="">-- General Vehicle Expense (Unlinked / General Fleet Cost) --</option>
                {truckTrips.map((tr) => (
                  <option key={tr.id} value={tr.id}>
                    {tr.date} | {tr.route || `${tr.fromLocation} -> ${tr.toLocation}`} (Gross: {currency} {tr.totalRent.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {truckTrips.length === 0
                  ? 'No historical trips found for this vehicle'
                  : `Showing ${truckTrips.length} trip(s) for this truck. Linking deducts expense from trip profit calculation.`}
              </span>
            </div>

            {/* Reimbursable on Behalf of Company Option */}
            <div className="bg-slate-800/50 border border-slate-700/80 rounded-xl p-3 flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isReimbursable}
                  onChange={(e) => setIsReimbursable(e.target.checked)}
                  className="h-4 w-4 rounded bg-slate-900 border-slate-600 text-amber-500 focus:ring-amber-500"
                />
                <div>
                  <span className="text-xs font-bold text-white block">
                    Expense Paid on Behalf of Client Company (Reimbursable)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    If checked, this expense will be automatically added to the client company's Balance Due for this trip.
                  </span>
                </div>
              </label>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${isReimbursable ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-500'}`}>
                {isReimbursable ? '+ ADDS TO BALANCE DUE' : 'OPERATIONAL COST'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Expense Category *</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="DIESEL">⛽ Diesel / Fuel</option>
                  <option value="MAINTENANCE">🔧 Maintenance & Repairs</option>
                  <option value="TOLL">🛣️ Toll & FASTag</option>
                  <option value="INSURANCE">🛡️ Insurance Premium</option>
                  <option value="PERMITS">📑 State & National Permits</option>
                  <option value="SPARE_PARTS">⚙️ Spare Parts & Tires</option>
                  <option value="OTHER">📦 Other Sundry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Amount Paid ({currency}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  min="1"
                  placeholder="0.00"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
                <select
                  value={expensePaymentMethod}
                  onChange={(e) => setExpensePaymentMethod(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Fleet Card">Fleet Fuel Card (HPCL/IOCL/BPCL)</option>
                  <option value="FASTag">FASTag Automated</option>
                  <option value="UPI">UPI / QR Scan</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash Handover</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Bill Reference</label>
                <input
                  type="text"
                  placeholder="e.g. 240 Liters diesel at highway pump #44"
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-sm shadow-xl shadow-rose-600/20 transition"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Record Truck Expense</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FORM 3: Driver Cash Payout & Expense Entry Form */}
      {activeForm === 'driver' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur max-w-3xl mx-auto">
          <div className="border-b border-slate-800 pb-4 mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-purple-400" />
              Driver Cash Payout & Out-of-Pocket Expense Entry
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Disburse cash advances or log driver road expense reimbursements.
            </p>
          </div>

          <form onSubmit={handleDriverPaymentSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Transaction Type *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setDpType('SALARY_PAYOUT')}
                  className={`cursor-pointer p-4 rounded-xl border transition ${
                    dpType === 'SALARY_PAYOUT'
                      ? 'border-purple-500 bg-purple-500/10 text-white shadow-md'
                      : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-bold text-sm text-purple-300">💰 Salary Payout / Advance Paid</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Cash handed directly to driver. Decreases the balance fleet owes him.
                  </div>
                </div>

                <div
                  onClick={() => setDpType('DRIVER_EXPENSE')}
                  className={`cursor-pointer p-4 rounded-xl border transition ${
                    dpType === 'DRIVER_EXPENSE'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                      : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-bold text-sm text-blue-300">🧾 Driver-Incurred Expense / Allowance</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Food, lodging, roadside puncture paid by driver. Increases balance fleet owes him.
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={dpDate}
                  onChange={(e) => setDpDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Driver Selection *</label>
                <select
                  required
                  value={dpDriverId}
                  onChange={(e) => setDpDriverId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.phone})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Amount ({currency}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  min="1"
                  placeholder="0.00"
                  value={dpAmount}
                  onChange={(e) => setDpAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
                <select
                  value={dpPaymentMethod}
                  onChange={(e) => setDpPaymentMethod(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Cash">Cash Handover</option>
                  <option value="UPI">UPI (GPay / PhonePe)</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Remarks *</label>
              <input
                type="text"
                required
                placeholder="e.g. Mid-trip emergency tire repair at highway dhaba"
                value={dpDescription}
                onChange={(e) => setDpDescription(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-sm shadow-xl shadow-purple-600/20 transition"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Save Driver Entry</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FORM 4: Quick Add Masters */}
      {activeForm === 'masters' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Add Truck */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-500" />
              Add New Truck
            </h4>
            <form onSubmit={handleAddTruck} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Reg Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MH-12-AB-9999"
                  value={newTruckReg}
                  onChange={(e) => setNewTruckReg(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white uppercase font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Make & Model *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tata Signa 4825.TK"
                  value={newTruckModel}
                  onChange={(e) => setNewTruckModel(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Payload Capacity</label>
                <input
                  type="text"
                  placeholder="e.g. 25 Ton"
                  value={newTruckCap}
                  onChange={(e) => setNewTruckCap(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition"
              >
                + Register Truck
              </button>
            </form>
          </div>

          {/* Add Company */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              Add Client Company
            </h4>
            <form onSubmit={handleAddCompany} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JSW Steel Corp"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Mr. Sharma"
                  value={newCompanyContact}
                  onChange={(e) => setNewCompanyContact(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Phone</label>
                <input
                  type="text"
                  placeholder="+91 98..."
                  value={newCompanyPhone}
                  onChange={(e) => setNewCompanyPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition"
              >
                + Register Company
              </button>
            </form>
          </div>

          {/* Add Driver */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Add New Driver
            </h4>
            <form onSubmit={handleAddDriver} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Driver Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Harvinder Singh"
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 97..."
                  value={newDriverPhone}
                  onChange={(e) => setNewDriverPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">License Number</label>
                <input
                  type="text"
                  placeholder="e.g. DL-042018..."
                  value={newDriverLicense}
                  onChange={(e) => setNewDriverLicense(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs transition"
              >
                + Register Driver
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
