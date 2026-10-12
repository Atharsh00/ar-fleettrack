import React, { useState } from 'react';
import { useFleet } from '../../context/FleetContext';
import { Trip, TruckExpense, DriverPayment, CompanySettlement, ExpenseCategory, DriverPaymentType } from '../../types';
import { X, CheckCircle, Trash2, Plus, MapPin } from 'lucide-react';

export type EditModalTarget =
  | { type: 'TRIP'; data: Trip }
  | { type: 'TRUCK_EXPENSE'; data: TruckExpense }
  | { type: 'DRIVER_PAYMENT'; data: DriverPayment }
  | { type: 'COMPANY_SETTLEMENT'; data: CompanySettlement };

interface EditEntryModalProps {
  target: EditModalTarget;
  onClose: () => void;
}

export const EditEntryModal: React.FC<EditEntryModalProps> = ({ target, onClose }) => {
  const {
    trucks,
    companies,
    drivers,
    trips,
    updateTrip,
    updateTruckExpense,
    updateDriverPayment,
    updateCompanySettlement,
    activeRules,
    currency,
  } = useFleet();

  // --- TRIP EDIT STATE ---
  const initialTrip = target.type === 'TRIP' ? target.data : null;
  const [tripDate, setTripDate] = useState(initialTrip?.date || '');
  const [tripTruckId, setTripTruckId] = useState(initialTrip?.truckId || '');
  const [tripCompanyId, setTripCompanyId] = useState(initialTrip?.companyId || '');
  const [tripDriverId, setTripDriverId] = useState(initialTrip?.driverId || '');
  const [fromLoc, setFromLoc] = useState(initialTrip?.fromLocation || '');
  const [toLoc, setToLoc] = useState(initialTrip?.toLocation || '');
  const [drops, setDrops] = useState<string[]>(initialTrip?.additionalDrops || []);
  const [totalRent, setTotalRent] = useState(initialTrip?.totalRent?.toString() || '');
  const [commission, setCommission] = useState(initialTrip?.commissionAmount?.toString() || '0');
  const [isTds, setIsTds] = useState(initialTrip?.isTdsDeducted ?? true);
  const [advance, setAdvance] = useState(initialTrip?.advanceReceived?.toString() || '');
  const [tripNotes, setTripNotes] = useState(initialTrip?.notes || '');

  // Live calculations for trip editing
  const grossNum = parseFloat(totalRent) || 0;
  const commNum = parseFloat(commission) || 0;
  const advNum = parseFloat(advance) || 0;
  const tdsPct = activeRules?.defaultTdsPercent ?? 1;
  const drvSalaryPct = activeRules?.defaultDriverSalaryPercent ?? 15;
  const previewTdsAmt = isTds ? (grossNum * (tdsPct / 100)) : 0;
  const previewNetRent = Math.max(0, grossNum - previewTdsAmt - commNum);
  const previewDriverSalary = previewNetRent * (drvSalaryPct / 100);
  const previewBalDue = Math.max(0, grossNum - advNum - commNum - previewTdsAmt);

  // Dynamic Drops helpers
  const handleAddDrop = () => setDrops([...drops, '']);
  const handleUpdateDrop = (i: number, val: string) => {
    const next = [...drops];
    next[i] = val;
    setDrops(next);
  };
  const handleRemoveDrop = (i: number) => setDrops(drops.filter((_, idx) => idx !== i));

  // --- EXPENSE EDIT STATE ---
  const initialExp = target.type === 'TRUCK_EXPENSE' ? target.data : null;
  const [expDate, setExpDate] = useState(initialExp?.date || '');
  const [expTruckId, setExpTruckId] = useState(initialExp?.truckId || '');
  const [expTripId, setExpTripId] = useState(initialExp?.tripId || '');
  const [expReimbursable, setExpReimbursable] = useState(initialExp?.isReimbursable ?? false);
  const [expCat, setExpCat] = useState<ExpenseCategory>(initialExp?.category || 'DIESEL');
  const [expAmt, setExpAmt] = useState(initialExp?.amount?.toString() || '');
  const [expMethod, setExpMethod] = useState(initialExp?.paymentMethod || 'Fleet Card');
  const [expNotes, setExpNotes] = useState(initialExp?.notes || '');

  // Filter trips for selected truck in expense edit
  const truckTrips = trips.filter((t) => t.truckId === expTruckId);

  // --- DRIVER PAYMENT EDIT STATE ---
  const initialDp = target.type === 'DRIVER_PAYMENT' ? target.data : null;
  const [dpDate, setDpDate] = useState(initialDp?.date || '');
  const [dpDriverId, setDpDriverId] = useState(initialDp?.driverId || '');
  const [dpType, setDpType] = useState<DriverPaymentType>(initialDp?.type || 'SALARY_PAYOUT');
  const [dpAmt, setDpAmt] = useState(initialDp?.amount?.toString() || '');
  const [dpMethod, setDpMethod] = useState(initialDp?.paymentMethod || 'Cash');
  const [dpDesc, setDpDesc] = useState(initialDp?.description || '');

  // --- SETTLEMENT EDIT STATE ---
  const initialSet = target.type === 'COMPANY_SETTLEMENT' ? target.data : null;
  const [setDate, setSetDate] = useState(initialSet?.date || '');
  const [setCompanyId, setSetCompanyId] = useState(initialSet?.companyId || '');
  const [setAmt, setSetAmt] = useState(initialSet?.amount?.toString() || '');
  const [setMethod, setSetMethod] = useState(initialSet?.paymentMethod || 'NEFT');
  const [setRef, setSetRef] = useState(initialSet?.referenceNumber || '');
  const [setNotes, setSetNotes] = useState(initialSet?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (target.type === 'TRIP') {
      const rentNum = parseFloat(totalRent) || 0;
      if (rentNum <= 0) return alert('Rent must be greater than 0');
      updateTrip(target.data.id, {
        date: tripDate,
        truckId: tripTruckId,
        companyId: tripCompanyId,
        driverId: tripDriverId,
        fromLocation: fromLoc.trim(),
        toLocation: toLoc.trim(),
        additionalDrops: drops.filter(Boolean),
        totalRent: rentNum,
        commissionAmount: commNum,
        isTdsDeducted: isTds,
        advanceReceived: advNum,
        tdsAmount: previewTdsAmt,
        netRent: previewNetRent,
        driverCommission: previewDriverSalary,
        balancePending: previewBalDue,
        notes: tripNotes.trim(),
      });
    } else if (target.type === 'TRUCK_EXPENSE') {
      const amt = parseFloat(expAmt);
      if (!amt || amt <= 0) return alert('Enter valid amount');
      updateTruckExpense(target.data.id, {
        date: expDate,
        truckId: expTruckId,
        tripId: expTripId || undefined,
        isReimbursable: expReimbursable,
        category: expCat,
        amount: amt,
        paymentMethod: expMethod,
        notes: expNotes.trim(),
      });
    } else if (target.type === 'DRIVER_PAYMENT') {
      const amt = parseFloat(dpAmt);
      if (!amt || amt <= 0) return alert('Enter valid amount');
      updateDriverPayment(target.data.id, {
        date: dpDate,
        driverId: dpDriverId,
        type: dpType,
        amount: amt,
        paymentMethod: dpMethod,
        description: dpDesc.trim(),
      });
    } else if (target.type === 'COMPANY_SETTLEMENT') {
      const amt = parseFloat(setAmt);
      if (!amt || amt <= 0) return alert('Enter valid amount');
      updateCompanySettlement(target.data.id, {
        date: setDate,
        companyId: setCompanyId,
        amount: amt,
        paymentMethod: setMethod,
        referenceNumber: setRef.trim(),
        notes: setNotes.trim(),
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/40 flex-shrink-0">
          <div>
            <h3 className="text-base font-bold text-white">Edit Record</h3>
            <p className="text-xs text-amber-400 font-mono">
              {target.type.replace('_', ' ')} • ID: {target.data.id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* TRIP EDIT */}
          {target.type === 'TRIP' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={tripDate}
                    onChange={(e) => setTripDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Truck</label>
                  <select
                    value={tripTruckId}
                    onChange={(e) => setTripTruckId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                  >
                    {trucks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.registrationNumber} ({t.model})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Company</label>
                  <select
                    value={tripCompanyId}
                    onChange={(e) => setTripCompanyId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Driver</label>
                  <select
                    value={tripDriverId}
                    onChange={(e) => setTripDriverId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  >
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Route */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> Route Details
                  </span>
                  <button
                    type="button"
                    onClick={handleAddDrop}
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Drop
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Origin (From)"
                    value={fromLoc}
                    onChange={(e) => setFromLoc(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Destination (To)"
                    value={toLoc}
                    onChange={(e) => setToLoc(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
                  />
                </div>
                {drops.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Drop #${i + 1}`}
                      value={d}
                      onChange={(e) => handleUpdateDrop(i, e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveDrop(i)}
                      className="text-slate-400 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Financials */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Gross Rent ({currency})</label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="1"
                    value={totalRent}
                    onChange={(e) => setTotalRent(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Commission ({currency})</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={commission}
                    onChange={(e) => setCommission(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Advance ({currency})</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={advance}
                    onChange={(e) => setAdvance(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700">
                <input
                  type="checkbox"
                  id="modal-tds"
                  checked={isTds}
                  onChange={(e) => setIsTds(e.target.checked)}
                  className="rounded text-amber-500"
                />
                <label htmlFor="modal-tds" className="text-xs text-white font-medium cursor-pointer">
                  TDS Deducted (1% by Shipper)
                </label>
              </div>

              {/* Dynamic Calculations Live Preview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                <div className="bg-blue-500/10 border border-blue-500/20 p-2 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-blue-300 block">Net Rent</span>
                  <div className="text-xs font-bold font-mono text-blue-400 mt-0.5">{currency} {previewNetRent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 p-2 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-purple-300 block">Driver {drvSalaryPct}%</span>
                  <div className="text-xs font-bold font-mono text-purple-300 mt-0.5">{currency} {previewDriverSalary.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-amber-300 block">Balance Due</span>
                  <div className="text-xs font-bold font-mono text-amber-400 mt-0.5">{currency} {previewBalDue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-emerald-300 block">{tdsPct}% TDS</span>
                  <div className="text-xs font-bold font-mono text-emerald-400 mt-0.5">{currency} {previewTdsAmt.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes</label>
                <input
                  type="text"
                  value={tripNotes}
                  onChange={(e) => setTripNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          )}

          {/* TRUCK EXPENSE EDIT */}
          {target.type === 'TRUCK_EXPENSE' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Truck</label>
                  <select
                    value={expTruckId}
                    onChange={(e) => {
                      setExpTruckId(e.target.value);
                      setExpTripId('');
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  >
                    {trucks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.registrationNumber} - {t.model}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Linked Trip (Optional - Deduct from Trip Profit)
                </label>
                <select
                  value={expTripId}
                  onChange={(e) => setExpTripId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                >
                  <option value="">-- General Vehicle Expense (Unlinked) --</option>
                  {truckTrips.map((tr) => (
                    <option key={tr.id} value={tr.id}>
                      {tr.date} | {tr.route || `${tr.fromLocation} -> ${tr.toLocation}`} (Gross: {currency} {tr.totalRent.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  {truckTrips.length === 0
                    ? 'No trips logged for this vehicle'
                    : `Showing ${truckTrips.length} trip(s) performed by this truck`}
                </span>
              </div>

              {/* Reimbursable on Behalf of Client Company Checkbox */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3 flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={expReimbursable}
                    onChange={(e) => setExpReimbursable(e.target.checked)}
                    className="h-4 w-4 rounded bg-slate-900 border-slate-600 text-amber-500 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Reimbursable by Client Company (Paid on client's behalf)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      If checked, this expense is added to the client company's Balance Due for this trip.
                    </span>
                  </div>
                </label>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${expReimbursable ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-500'}`}>
                  {expReimbursable ? '+ ADDS TO BALANCE DUE' : 'OPERATIONAL COST'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={expCat}
                    onChange={(e) => setExpCat(e.target.value as ExpenseCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="DIESEL">⛽ Diesel / Fuel</option>
                    <option value="MAINTENANCE">🔧 Maintenance & Repairs</option>
                    <option value="TOLL">🛣️ Toll & FASTag</option>
                    <option value="INSURANCE">🛡️ Insurance Premium</option>
                    <option value="PERMITS">📑 State Permits</option>
                    <option value="SPARE_PARTS">⚙️ Spare Parts & Tires</option>
                    <option value="OTHER">📦 Other Sundry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Amount ({currency})</label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="1"
                    value={expAmt}
                    onChange={(e) => setExpAmt(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
                <select
                  value={expMethod}
                  onChange={(e) => setExpMethod(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="Fleet Card">Fleet Card</option>
                  <option value="FASTag">FASTag</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Bill Reference</label>
                <input
                  type="text"
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          )}

          {/* DRIVER PAYMENT EDIT */}
          {target.type === 'DRIVER_PAYMENT' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Transaction Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDpType('SALARY_PAYOUT')}
                    className={`p-2.5 rounded-lg border text-xs font-bold text-left ${
                      dpType === 'SALARY_PAYOUT'
                        ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                        : 'border-slate-700 bg-slate-800 text-slate-400'
                    }`}
                  >
                    💰 Salary Payout / Advance
                  </button>
                  <button
                    type="button"
                    onClick={() => setDpType('DRIVER_EXPENSE')}
                    className={`p-2.5 rounded-lg border text-xs font-bold text-left ${
                      dpType === 'DRIVER_EXPENSE'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                        : 'border-slate-700 bg-slate-800 text-slate-400'
                    }`}
                  >
                    🧾 Driver Expense Claim
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={dpDate}
                    onChange={(e) => setDpDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Driver</label>
                  <select
                    value={dpDriverId}
                    onChange={(e) => setDpDriverId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Amount ({currency})</label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="1"
                    value={dpAmt}
                    onChange={(e) => setDpAmt(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
                  <select
                    value={dpMethod}
                    onChange={(e) => setDpMethod(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={dpDesc}
                  onChange={(e) => setDpDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          )}

          {/* SETTLEMENT EDIT */}
          {target.type === 'COMPANY_SETTLEMENT' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={setDate}
                    onChange={(e) => setSetDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Company</label>
                  <select
                    value={setCompanyId}
                    onChange={(e) => setSetCompanyId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Amount ({currency})</label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="1"
                    value={setAmt}
                    onChange={(e) => setSetAmt(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
                  <select
                    value={setMethod}
                    onChange={(e) => setSetMethod(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="NEFT">Bank Transfer (NEFT/RTGS)</option>
                    <option value="Cheque">Cheque</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">UTR / Cheque Ref</label>
                <input
                  type="text"
                  value={setRef}
                  onChange={(e) => setSetRef(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes</label>
                <input
                  type="text"
                  value={setNotes}
                  onChange={(e) => setSetNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow-md transition"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Update Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
