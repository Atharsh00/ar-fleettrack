import React, { useState } from 'react';
import { useFleet } from '../../context/FleetContext';
import { Company, Trip, CompanySettlement } from '../../types';
import { Building2, CheckCircle2, AlertCircle, Receipt, ArrowRight, DollarSign, Edit3, Trash2, X } from 'lucide-react';
import { SettlementModal as SettlementDialog } from '../modals/SettlementModal';
import { EditEntryModal, EditModalTarget } from '../modals/EditEntryModal';

export const CompanyAccountsTab: React.FC = () => {
  const {
    companyAccounts,
    filteredTrips,
    filteredCompanySettlements,
    deleteTrip,
    deleteCompanySettlement,
    getCompanyName,
    getTruckReg,
    getTripReimbursable,
    getTripBalancePending,
    currency,
  } = useFleet();

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');
  const [settlingCompany, setSettlingCompany] = useState<{ company: Company; balanceDue: number } | null>(null);
  const [deepDiveCompany, setDeepDiveCompany] = useState<Company | null>(null);
  const [editTarget, setEditTarget] = useState<EditModalTarget | null>(null);

  const formatAmount = (val: number) => {
    return `${currency} ${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const selectedAccount =
    selectedCompanyId !== 'all'
      ? companyAccounts.find((ca) => ca.company.id === selectedCompanyId)
      : null;

  const relevantTrips =
    selectedCompanyId === 'all'
      ? filteredTrips
      : filteredTrips.filter((t) => t.companyId === selectedCompanyId);

  const relevantSettlements =
    selectedCompanyId === 'all'
      ? filteredCompanySettlements
      : filteredCompanySettlements.filter((s) => s.companyId === selectedCompanyId);

  // For deep dive modal:
  const deepDiveTrips = deepDiveCompany
    ? filteredTrips.filter((t) => t.companyId === deepDiveCompany.id)
    : [];
  const deepDiveSettles = deepDiveCompany
    ? filteredCompanySettlements.filter((s) => s.companyId === deepDiveCompany.id)
    : [];
  const deepDiveSummary = deepDiveCompany
    ? companyAccounts.find((ca) => ca.company.id === deepDiveCompany.id)
    : null;

  return (
    <div className="space-y-6">
      {/* Tab Header & Filter */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-500" />
            Company Accounts & Receivables Ledger
          </h2>
          <p className="text-xs text-slate-400">
            Track client billing, advances collected, pending outstanding dues, and record settlements
          </p>
        </div>

        {/* Company Dropdown Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-400">Filter Company:</label>
          <select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">🏢 All Client Companies</option>
            {companyAccounts.map((ca) => (
              <option key={ca.company.id} value={ca.company.id}>
                {ca.company.name} (Due: {formatAmount(ca.balanceDue)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Company Focus Banner */}
      {selectedAccount && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">Account Overview</span>
              <h3 className="text-xl font-extrabold text-white mt-0.5">{selectedAccount.company.name}</h3>
              <p className="text-xs text-slate-400 mt-1">
                Contact: {selectedAccount.company.contactPerson || 'N/A'} | Phone: {selectedAccount.company.phone || 'N/A'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeepDiveCompany(selectedAccount.company)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs border border-slate-700 transition"
              >
                Deep-Dive Ledger
              </button>

              {selectedAccount.balanceDue > 0 ? (
                <button
                  type="button"
                  onClick={() => setSettlingCompany({ company: selectedAccount.company, balanceDue: selectedAccount.balanceDue })}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Record Settlement ({formatAmount(selectedAccount.balanceDue)})</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Account Fully Settled</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-5 border-t border-slate-700/60">
            <div>
              <span className="text-xs text-slate-400">Total Contracted:</span>
              <div className="text-base font-bold font-mono text-white mt-0.5">
                {formatAmount(selectedAccount.totalContracted)}
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-400">Broker Commission:</span>
              <div className="text-base font-bold font-mono text-rose-400 mt-0.5">
                {formatAmount(selectedAccount.totalCommissions)}
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-400">TDS Withheld (1%):</span>
              <div className="text-base font-bold font-mono text-blue-400 mt-0.5">
                {formatAmount(selectedAccount.totalTdsDeducted)}
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-400">Advances Received:</span>
              <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                {formatAmount(selectedAccount.totalAdvanceReceived)}
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold">Outstanding Due:</span>
              <div className="text-base font-bold font-mono text-amber-400 mt-0.5">
                {formatAmount(selectedAccount.balanceDue)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Company Receivable Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {companyAccounts.map((item) => (
          <div
            key={item.company.id}
            className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
              item.balanceDue > 0
                ? 'bg-slate-900/90 border-slate-700/80 shadow-md'
                : 'bg-slate-900/50 border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4
                  onClick={() => setDeepDiveCompany(item.company)}
                  className="font-bold text-white text-sm leading-snug cursor-pointer hover:text-amber-400 transition"
                >
                  {item.company.name}
                </h4>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold whitespace-nowrap ${
                    item.balanceDue > 0
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {item.balanceDue > 0 ? 'Pending Dues' : 'Settled'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-4">{item.tripsCount} contracted trips</p>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Contracted Rent:</span>
                  <span className="text-slate-200 font-mono">{formatAmount(item.totalContracted)}</span>
                </div>
                {item.totalReimbursable > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Reimbursable Exp:</span>
                    <span className="text-amber-300 font-mono">+{formatAmount(item.totalReimbursable)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Broker Commission:</span>
                  <span className="text-rose-400 font-mono">-{formatAmount(item.totalCommissions)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>TDS Withheld (1%):</span>
                  <span className="text-blue-400 font-mono">-{formatAmount(item.totalTdsDeducted)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Received:</span>
                  <span className="text-emerald-400 font-mono">-{formatAmount(item.totalReceived)}</span>
                </div>
                <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                  <span className="font-semibold text-slate-300">Balance Pending:</span>
                  <span className="font-bold font-mono text-amber-400">{formatAmount(item.balanceDue)}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setDeepDiveCompany(item.company)}
                className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1"
              >
                Deep-Dive <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {item.balanceDue > 0 && (
                <button
                  type="button"
                  onClick={() => setSettlingCompany({ company: item.company, balanceDue: item.balanceDue })}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold rounded-lg text-xs transition"
                >
                  Settle Due
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Trips & Settlements Ledger Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-500" />
              Company Receivables Transaction Ledger
            </h3>
            <p className="text-xs text-slate-400">
              Trip invoices and subsequent bank/cash settlements (with in-place editing)
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {relevantTrips.length} Trips | {relevantSettlements.length} Settlements
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Company</th>
                <th className="py-2.5 px-3">Truck No.</th>
                <th className="py-2.5 px-3">Transaction Type & Route</th>
                <th className="py-2.5 px-3 text-right">Agreed Gross</th>
                <th className="py-2.5 px-3 text-right">Advance Received</th>
                <th className="py-2.5 px-3 text-right">Balance Due</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {relevantTrips.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-mono text-slate-400">{t.date}</td>
                  <td className="py-3 px-3 font-semibold text-white">{getCompanyName(t.companyId)}</td>
                  <td className="py-3 px-3 font-mono font-bold text-amber-400">{getTruckReg(t.truckId)}</td>
                  <td className="py-3 px-3">
                    <span className="text-white font-medium">Trip: {t.route || `${t.fromLocation} -> ${t.toLocation}`}</span>
                    {t.isTdsDeducted && (
                      <span className="ml-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        TDS: {formatAmount(t.tdsAmount || 0)}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-white">
                    {formatAmount(t.totalRent)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-400">
                    {formatAmount(t.advanceReceived)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-amber-400">
                    {formatAmount(t.balancePending)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        t.balancePending === 0
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {t.balancePending === 0 ? 'PAID' : 'DUE'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditTarget({ type: 'TRIP', data: t })}
                        title="Edit Trip"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Delete this trip? Dependent ledgers and balances will be recomputed immediately.')) {
                            deleteTrip(t.id);
                          }
                        }}
                        title="Delete Trip"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Settlement rows */}
              {relevantSettlements.map((s) => (
                <tr key={s.id} className="bg-emerald-950/20 hover:bg-emerald-950/30">
                  <td className="py-3 px-3 font-mono text-emerald-400">{s.date}</td>
                  <td className="py-3 px-3 font-semibold text-white">{getCompanyName(s.companyId)}</td>
                  <td className="py-3 px-3 font-mono text-slate-500">—</td>
                  <td className="py-3 px-3">
                    <span className="text-emerald-300 font-bold">
                      Settlement Received ({s.paymentMethod})
                    </span>
                    {s.referenceNumber && (
                      <span className="text-[10px] font-mono text-emerald-400 ml-2">
                        Ref: {s.referenceNumber}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-500">-</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                    +{formatAmount(s.amount)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-400 font-semibold">
                    - Settled
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      SETTLED
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditTarget({ type: 'COMPANY_SETTLEMENT', data: s })}
                        title="Edit Settlement"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Delete settlement record? Company outstanding dues will update immediately.')) {
                            deleteCompanySettlement(s.id);
                          }
                        }}
                        title="Delete Settlement"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DEEP DIVE MODAL FOR COMPANY */}
      {deepDiveCompany && deepDiveSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-800 bg-slate-800/40 flex justify-between items-center flex-shrink-0">
              <div>
                <span className="text-xs uppercase font-bold text-amber-400">Company Account Deep-Dive</span>
                <h3 className="text-xl font-bold text-white">{deepDiveCompany.name}</h3>
                <p className="text-xs text-slate-400">
                  {deepDiveCompany.contactPerson} • {deepDiveCompany.phone || 'No phone'} • {deepDiveCompany.email || ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeepDiveCompany(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-5 bg-slate-950/50 border-b border-slate-800 flex-shrink-0">
              <div className="p-3 bg-slate-800/60 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Total Invoiced</span>
                <div className="text-base font-bold font-mono text-white mt-0.5">{formatAmount(deepDiveSummary.totalContracted)}</div>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Broker Commission</span>
                <div className="text-base font-bold font-mono text-rose-400 mt-0.5">{formatAmount(deepDiveSummary.totalCommissions)}</div>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold">TDS (1%)</span>
                <div className="text-base font-bold font-mono text-blue-400 mt-0.5">{formatAmount(deepDiveSummary.totalTdsDeducted)}</div>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Total Received</span>
                <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">{formatAmount(deepDiveSummary.totalReceived)}</div>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Net Balance Due</span>
                <div className="text-base font-bold font-mono text-amber-400 mt-0.5">{formatAmount(deepDiveSummary.balanceDue)}</div>
              </div>
            </div>

            {/* Records List with in-place Edit & Delete */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Historical Transactions & Edit Actions</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 text-[10px] uppercase">
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Truck No.</th>
                      <th className="p-2">Type</th>
                      <th className="p-2">Route / Details</th>
                      <th className="p-2 text-right">Gross</th>
                      <th className="p-2 text-right">Commission</th>
                      <th className="p-2 text-right">TDS (1%)</th>
                      <th className="p-2 text-right">Reimbursable</th>
                      <th className="p-2 text-right">Adv/Paid</th>
                      <th className="p-2 text-right">Balance Due</th>
                      <th className="p-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {deepDiveTrips.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/40">
                        <td className="p-2 font-mono text-slate-400 whitespace-nowrap">{t.date}</td>
                        <td className="p-2 font-mono font-bold text-amber-400 whitespace-nowrap">{getTruckReg(t.truckId)}</td>
                        <td className="p-2"><span className="text-blue-300 font-bold">Trip Freight</span></td>
                        <td className="p-2">{t.route}</td>
                        <td className="p-2 text-right font-mono font-bold text-white">{formatAmount(t.totalRent)}</td>
                        <td className="p-2 text-right font-mono text-rose-400">{formatAmount(t.commissionAmount || 0)}</td>
                        <td className="p-2 text-right font-mono text-blue-400">{formatAmount(t.tdsAmount || 0)}</td>
                        <td className="p-2 text-right font-mono text-amber-300 font-bold">
                          {getTripReimbursable(t.id) > 0 ? `+${formatAmount(getTripReimbursable(t.id))}` : '-'}
                        </td>
                        <td className="p-2 text-right font-mono text-emerald-400">{formatAmount(t.advanceReceived)}</td>
                        <td className="p-2 text-right font-mono text-amber-400 font-bold">{formatAmount(getTripBalancePending(t))}</td>
                        <td className="p-2 text-center whitespace-nowrap">
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
                              title="Delete Trip"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {deepDiveSettles.map((s) => (
                      <tr key={s.id} className="bg-emerald-950/20">
                        <td className="p-2 font-mono text-emerald-400 whitespace-nowrap">{s.date}</td>
                        <td className="p-2 font-mono text-slate-500">—</td>
                        <td className="p-2"><span className="text-emerald-300 font-bold">Settlement</span></td>
                        <td className="p-2">{s.paymentMethod} {s.referenceNumber && `(Ref: ${s.referenceNumber})`}</td>
                        <td className="p-2 text-right font-mono text-slate-500">-</td>
                        <td className="p-2 text-right font-mono text-slate-500">-</td>
                        <td className="p-2 text-right font-mono text-slate-500">-</td>
                        <td className="p-2 text-right font-mono text-slate-500">-</td>
                        <td className="p-2 text-right font-mono text-emerald-400 font-bold">+{formatAmount(s.amount)}</td>
                        <td className="p-2 text-right font-mono text-emerald-400">-</td>
                        <td className="p-2 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => setEditTarget({ type: 'COMPANY_SETTLEMENT', data: s })}
                              className="p-1 hover:text-amber-400"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm('Delete settlement?')) deleteCompanySettlement(s.id);
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
                      <td colSpan={4} className="p-2.5 uppercase tracking-wider text-amber-400 font-extrabold text-[11px]">
                        Total ({deepDiveTrips.length} Trips, {deepDiveSettles.length} Settlements)
                      </td>
                      <td className="p-2.5 text-right font-mono text-white">
                        {formatAmount(deepDiveTrips.reduce((s, t) => s + t.totalRent, 0))}
                      </td>
                      <td className="p-2.5 text-right font-mono text-rose-400">
                        -{formatAmount(deepDiveTrips.reduce((s, t) => s + (t.commissionAmount || 0), 0))}
                      </td>
                      <td className="p-2.5 text-right font-mono text-blue-400">
                        -{formatAmount(deepDiveTrips.reduce((s, t) => s + (t.tdsAmount || 0), 0))}
                      </td>
                      <td className="p-2.5 text-right font-mono text-amber-300">
                        +{formatAmount(deepDiveTrips.reduce((s, t) => s + getTripReimbursable(t.id), 0))}
                      </td>
                      <td className="p-2.5 text-right font-mono text-emerald-400">
                        -{formatAmount(deepDiveTrips.reduce((s, t) => s + t.advanceReceived, 0) + deepDiveSettles.reduce((s, st) => s + st.amount, 0))}
                      </td>
                      <td className="p-2.5 text-right font-mono text-amber-400 font-extrabold">
                        {formatAmount(deepDiveSummary.balanceDue)}
                      </td>
                      <td className="p-2.5"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-800/40 flex justify-end">
              <button
                type="button"
                onClick={() => setDeepDiveCompany(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Close Deep-Dive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settlement Dialog Modal */}
      {settlingCompany && (
        <SettlementDialog
          company={settlingCompany.company}
          balanceDue={settlingCompany.balanceDue}
          onClose={() => setSettlingCompany(null)}
        />
      )}

      {/* Edit Modal */}
      {editTarget && <EditEntryModal target={editTarget} onClose={() => setEditTarget(null)} />}
    </div>
  );
};
