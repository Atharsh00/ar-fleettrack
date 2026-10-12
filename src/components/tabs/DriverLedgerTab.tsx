import React, { useState } from 'react';
import { useFleet } from '../../context/FleetContext';
import { Driver, Trip, DriverPayment } from '../../types';
import { Users, DollarSign, PlusCircle, CheckCircle, Clock, ArrowRight, Wallet, Edit3, Trash2, X } from 'lucide-react';
import { DriverPayoutModal } from '../modals/DriverPayoutModal';
import { EditEntryModal, EditModalTarget } from '../modals/EditEntryModal';

export const DriverLedgerTab: React.FC = () => {
  const {
    driverAccounts,
    filteredTrips,
    filteredDriverPayments,
    deleteTrip,
    deleteDriverPayment,
    getDriverName,
    currency,
  } = useFleet();

  const [selectedDriverId, setSelectedDriverId] = useState<string>('all');
  const [activeDriverModal, setActiveDriverModal] = useState<Driver | null>(null);
  const [deepDiveDriver, setDeepDiveDriver] = useState<Driver | null>(null);
  const [editTarget, setEditTarget] = useState<EditModalTarget | null>(null);

  const formatAmount = (val: number) => {
    return `${currency} ${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const selectedDriverAccount =
    selectedDriverId !== 'all'
      ? driverAccounts.find((da) => da.driver.id === selectedDriverId)
      : null;

  const relevantTrips =
    selectedDriverId === 'all'
      ? filteredTrips
      : filteredTrips.filter((t) => t.driverId === selectedDriverId);

  const relevantPayments =
    selectedDriverId === 'all'
      ? filteredDriverPayments
      : filteredDriverPayments.filter((p) => p.driverId === selectedDriverId);

  // Timeline Events
  interface TimelineEvent {
    id: string;
    rawId: string;
    date: string;
    driverId: string;
    type: 'TRIP_COMMISSION' | 'SALARY_PAYOUT' | 'DRIVER_EXPENSE';
    title: string;
    details: string;
    earned: number;
    claimed: number;
    paid: number;
    impact: number;
    rawObj: Trip | DriverPayment;
  }

  const timelineEvents: TimelineEvent[] = [
    ...relevantTrips.map((t) => ({
      id: `trip-${t.id}`,
      rawId: t.id,
      date: t.date,
      driverId: t.driverId,
      type: 'TRIP_COMMISSION' as const,
      title: `Trip 15% Salary: ${t.route || `${t.fromLocation} -> ${t.toLocation}`}`,
      details: `Gross: ${formatAmount(t.totalRent)} | Net: ${formatAmount(t.netRent)} | 15% Comm: ${formatAmount(t.driverCommission)}`,
      earned: t.driverCommission,
      claimed: 0,
      paid: 0,
      impact: t.driverCommission,
      rawObj: t,
    })),
    ...relevantPayments.map((p) => ({
      id: `pay-${p.id}`,
      rawId: p.id,
      date: p.date,
      driverId: p.driverId,
      type: p.type,
      title:
        p.type === 'SALARY_PAYOUT'
          ? `Cash/Bank Advance Disbursed (${p.paymentMethod || 'Cash'})`
          : `Driver Roadside Claim (${p.description})`,
      details: p.description,
      earned: 0,
      claimed: p.type === 'DRIVER_EXPENSE' ? p.amount : 0,
      paid: p.type === 'SALARY_PAYOUT' ? p.amount : 0,
      impact: p.type === 'DRIVER_EXPENSE' ? p.amount : -p.amount,
      rawObj: p,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  // Deep dive calculations for selected modal driver
  const deepDiveTrips = deepDiveDriver
    ? filteredTrips.filter((t) => t.driverId === deepDiveDriver.id)
    : [];
  const deepDivePayments = deepDiveDriver
    ? filteredDriverPayments.filter((p) => p.driverId === deepDiveDriver.id)
    : [];
  const deepDiveSummary = deepDiveDriver
    ? driverAccounts.find((da) => da.driver.id === deepDiveDriver.id)
    : null;

  return (
    <div className="space-y-6">
      {/* Tab Header & Filter */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Driver Accounts & Salary Ledger
          </h2>
          <p className="text-xs text-slate-400">
            Automated 15% salary on Net Rent, advance payouts tracking, out-of-pocket claims, and deep-dive ledgers
          </p>
        </div>

        {/* Driver Filter Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-400">Select Driver:</label>
          <select
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">👨‍✈️ All Drivers (Fleet Ledger)</option>
            {driverAccounts.map((da) => (
              <option key={da.driver.id} value={da.driver.id}>
                {da.driver.name} (Due: {formatAmount(da.netBalanceDue)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Driver Spotlight Card */}
      {selectedDriverAccount && (
        <div className="bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900 border border-purple-500/30 rounded-2xl p-6 shadow-xl animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-purple-400 tracking-wider">Driver Ledger</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {selectedDriverAccount.driver.status}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white mt-0.5">{selectedDriverAccount.driver.name}</h3>
              <p className="text-xs text-slate-400 mt-1">
                Phone: {selectedDriverAccount.driver.phone} | License: {selectedDriverAccount.driver.licenseNumber}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeepDiveDriver(selectedDriverAccount.driver)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs border border-slate-700 transition"
              >
                Deep-Dive Ledger
              </button>

              <button
                type="button"
                onClick={() => setActiveDriverModal(selectedDriverAccount.driver)}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-purple-600/20 transition"
              >
                <Wallet className="w-4 h-4" />
                <span>+ Disburse Payout / Claim</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-700/60">
            <div>
              <span className="text-xs text-slate-400">Total Salary Earned (15%):</span>
              <div className="text-base font-bold font-mono text-purple-300 mt-0.5">
                {formatAmount(selectedDriverAccount.totalSalaryEarned)}
              </div>
              <span className="text-[10px] text-slate-500">{selectedDriverAccount.tripsCount} trips driven</span>
            </div>
            <div>
              <span className="text-xs text-slate-400">Driver Expenses Claimed:</span>
              <div className="text-base font-bold font-mono text-blue-400 mt-0.5">
                {formatAmount(selectedDriverAccount.totalDriverExpenses)}
              </div>
              <span className="text-[10px] text-slate-500">Reimbursement dues</span>
            </div>
            <div>
              <span className="text-xs text-slate-400">Total Payouts Made:</span>
              <div className="text-base font-bold font-mono text-rose-400 mt-0.5">
                {formatAmount(selectedDriverAccount.totalPayoutsMade)}
              </div>
              <span className="text-[10px] text-slate-500">Cash advances & transfers</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold">Net Balance Due to Driver:</span>
              <div
                className={`text-lg font-bold font-mono mt-0.5 ${
                  selectedDriverAccount.netBalanceDue >= 0 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {formatAmount(selectedDriverAccount.netBalanceDue)}
              </div>
              <span className="text-[10px] text-slate-400">
                {selectedDriverAccount.netBalanceDue >= 0 ? 'Fleet owes driver' : 'Driver overdrawn'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Driver Ledger Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {driverAccounts.map((da) => (
          <div
            key={da.driver.id}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4
                  onClick={() => setDeepDiveDriver(da.driver)}
                  className="font-bold text-white text-sm cursor-pointer hover:text-purple-400 transition"
                >
                  {da.driver.name}
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {da.tripsCount} Trips
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3 font-mono">{da.driver.phone}</p>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>15% Salary Earned:</span>
                  <span className="text-purple-300 font-mono font-semibold">
                    {formatAmount(da.totalSalaryEarned)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Expenses Claimed:</span>
                  <span className="text-blue-300 font-mono">
                    {formatAmount(da.totalDriverExpenses)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Payouts / Advances:</span>
                  <span className="text-rose-400 font-mono">
                    {formatAmount(da.totalPayoutsMade)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 pt-1.5 border-t border-slate-800">
                  <span className="font-bold text-slate-200">Net Due:</span>
                  <span
                    className={`font-bold font-mono ${
                      da.netBalanceDue >= 0 ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {formatAmount(da.netBalanceDue)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setDeepDiveDriver(da.driver)}
                className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1"
              >
                Deep-Dive <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setActiveDriverModal(da.driver)}
                className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white font-bold rounded-lg text-xs transition"
              >
                + Payout/Claim
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Comprehensive Chronological Audit Timeline */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              Driver Financial Transaction Audit Timeline
            </h3>
            <p className="text-xs text-slate-400">
              15% salary commissions on Net Rent, cash advances disbursed, and roadside claims (with in-place editing)
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {timelineEvents.length} Recorded Transactions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Driver</th>
                <th className="py-2.5 px-3">Transaction & Description</th>
                <th className="py-2.5 px-3 text-right">15% Salary (+)</th>
                <th className="py-2.5 px-3 text-right">Expense Claim (+)</th>
                <th className="py-2.5 px-3 text-right">Payout / Adv (-)</th>
                <th className="py-2.5 px-3 text-right">Net Impact</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {timelineEvents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No transactions found for the selected driver and date filter.
                  </td>
                </tr>
              ) : (
                timelineEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono text-slate-400">{evt.date}</td>
                    <td className="py-3 px-3 font-semibold text-white">{getDriverName(evt.driverId)}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-200">{evt.title}</div>
                      <div className="text-[10px] text-slate-500">{evt.details}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-purple-300 font-semibold">
                      {evt.earned > 0 ? `+${formatAmount(evt.earned)}` : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-blue-300 font-semibold">
                      {evt.claimed > 0 ? `+${formatAmount(evt.claimed)}` : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-rose-400 font-semibold">
                      {evt.paid > 0 ? `-${formatAmount(evt.paid)}` : '-'}
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-mono font-bold ${
                        evt.impact >= 0 ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {evt.impact >= 0 ? `+${formatAmount(evt.impact)}` : `-${formatAmount(Math.abs(evt.impact))}`}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (evt.type === 'TRIP_COMMISSION') {
                              setEditTarget({ type: 'TRIP', data: evt.rawObj as Trip });
                            } else {
                              setEditTarget({ type: 'DRIVER_PAYMENT', data: evt.rawObj as DriverPayment });
                            }
                          }}
                          title="Edit Transaction"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (evt.type === 'TRIP_COMMISSION') {
                              if (window.confirm('Delete this trip? Associated 15% salary and fleet metrics will recalculate immediately.')) {
                                deleteTrip(evt.rawId);
                              }
                            } else {
                              if (window.confirm('Delete this payment/expense claim? Driver balance will update immediately.')) {
                                deleteDriverPayment(evt.rawId);
                              }
                            }
                          }}
                          title="Delete Transaction"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-400 transition"
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
      </div>

      {/* DEEP DIVE MODAL FOR DRIVER */}
      {deepDiveDriver && deepDiveSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-800 bg-slate-800/40 flex justify-between items-center flex-shrink-0">
              <div>
                <span className="text-xs uppercase font-bold text-purple-400">Driver Account Deep-Dive</span>
                <h3 className="text-xl font-bold text-white">{deepDiveDriver.name}</h3>
                <p className="text-xs text-slate-400">
                  Phone: {deepDiveDriver.phone} • License: {deepDiveDriver.licenseNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeepDiveDriver(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-4 gap-3 p-5 bg-slate-950/50 border-b border-slate-800 flex-shrink-0">
              <div className="p-3 bg-slate-800/60 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold">15% Salary Earned</span>
                <div className="text-base font-bold font-mono text-purple-300 mt-0.5">{formatAmount(deepDiveSummary.totalSalaryEarned)}</div>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Expenses Claimed</span>
                <div className="text-base font-bold font-mono text-blue-400 mt-0.5">{formatAmount(deepDiveSummary.totalDriverExpenses)}</div>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Payouts Disbursed</span>
                <div className="text-base font-bold font-mono text-rose-400 mt-0.5">{formatAmount(deepDiveSummary.totalPayoutsMade)}</div>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Net Balance Due</span>
                <div className="text-base font-bold font-mono text-amber-400 mt-0.5">{formatAmount(deepDiveSummary.netBalanceDue)}</div>
              </div>
            </div>

            {/* Records List with in-place Edit & Delete */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Driver Trips & Financial Transactions</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 text-[10px] uppercase">
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Type</th>
                      <th className="p-2">Description / Route</th>
                      <th className="p-2 text-right">Earned/Claimed</th>
                      <th className="p-2 text-right">Payout Paid</th>
                      <th className="p-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {deepDiveTrips.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/40">
                        <td className="p-2 font-mono text-slate-400">{t.date}</td>
                        <td className="p-2"><span className="text-purple-300 font-bold">15% Trip Salary</span></td>
                        <td className="p-2">{t.route} (Net: {formatAmount(t.netRent)})</td>
                        <td className="p-2 text-right font-mono text-purple-300 font-bold">+{formatAmount(t.driverCommission)}</td>
                        <td className="p-2 text-right font-mono text-slate-500">-</td>
                        <td className="p-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => setEditTarget({ type: 'TRIP', data: t })}
                              className="p-1 hover:text-amber-400"
                              title="Edit Trip"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm('Delete this trip?')) deleteTrip(t.id);
                              }}
                              className="p-1 hover:text-rose-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {deepDivePayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/40">
                        <td className="p-2 font-mono text-slate-400">{p.date}</td>
                        <td className="p-2">
                          <span className={p.type === 'SALARY_PAYOUT' ? 'text-rose-400 font-bold' : 'text-blue-300 font-bold'}>
                            {p.type === 'SALARY_PAYOUT' ? 'Cash Advance' : 'Expense Claim'}
                          </span>
                        </td>
                        <td className="p-2">{p.description} ({p.paymentMethod || 'Cash'})</td>
                        <td className="p-2 text-right font-mono text-blue-300 font-bold">
                          {p.type === 'DRIVER_EXPENSE' ? `+${formatAmount(p.amount)}` : '-'}
                        </td>
                        <td className="p-2 text-right font-mono text-rose-400 font-bold">
                          {p.type === 'SALARY_PAYOUT' ? `-${formatAmount(p.amount)}` : '-'}
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => setEditTarget({ type: 'DRIVER_PAYMENT', data: p })}
                              className="p-1 hover:text-amber-400"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm('Delete payment record?')) deleteDriverPayment(p.id);
                              }}
                              className="p-1 hover:text-rose-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Column Totals Footer */}
                  <tfoot className="bg-slate-950/95 font-bold border-t-2 border-slate-700 text-white">
                    <tr>
                      <td colSpan={3} className="p-2.5 uppercase tracking-wider text-purple-400 font-extrabold text-[11px]">
                        Total ({deepDiveTrips.length} Trips, {deepDivePayments.length} Payouts/Claims)
                      </td>
                      <td className="p-2.5 text-right font-mono text-purple-300 font-extrabold">
                        +{formatAmount(
                          deepDiveTrips.reduce((s, t) => s + t.driverCommission, 0) +
                          deepDivePayments.filter((p) => p.type === 'DRIVER_EXPENSE').reduce((s, p) => s + p.amount, 0)
                        )}
                      </td>
                      <td className="p-2.5 text-right font-mono text-rose-400 font-extrabold">
                        -{formatAmount(
                          deepDivePayments.filter((p) => p.type === 'SALARY_PAYOUT').reduce((s, p) => s + p.amount, 0)
                        )}
                      </td>
                      <td className="p-2.5 text-center font-mono font-extrabold text-amber-400 text-[11px] whitespace-nowrap">
                        Net: {formatAmount(deepDiveSummary.netBalanceDue)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-800/40 flex justify-end">
              <button
                type="button"
                onClick={() => setDeepDiveDriver(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Close Deep-Dive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Modal */}
      {activeDriverModal && (
        <DriverPayoutModal
          driver={activeDriverModal}
          onClose={() => setActiveDriverModal(null)}
        />
      )}

      {/* Edit Modal */}
      {editTarget && <EditEntryModal target={editTarget} onClose={() => setEditTarget(null)} />}
    </div>
  );
};
