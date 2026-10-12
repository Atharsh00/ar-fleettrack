import React, { useState, useMemo } from 'react';
import { useFleet } from '../../context/FleetContext';
import { Trip, TruckExpense, DriverPayment, CompanySettlement, UniversalLedgerType } from '../../types';
import { EditEntryModal, EditModalTarget } from '../modals/EditEntryModal';
import { Layers, Edit3, Trash2, Filter, Search, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

export const UniversalLedgerTab: React.FC = () => {
  const {
    filteredTrips,
    filteredTruckExpenses,
    filteredDriverPayments,
    filteredCompanySettlements,
    trucks,
    companies,
    drivers,
    deleteTrip,
    deleteTruckExpense,
    deleteDriverPayment,
    deleteCompanySettlement,
    currency,
  } = useFleet();

  const [typeFilter, setTypeFilter] = useState<'ALL' | UniversalLedgerType>('ALL');
  const [truckFilter, setTruckFilter] = useState<string>('ALL');
  const [companyFilter, setCompanyFilter] = useState<string>('ALL');
  const [driverFilter, setDriverFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [editTarget, setEditTarget] = useState<EditModalTarget | null>(null);

  const formatAmount = (val: number) => {
    return `${currency} ${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  // Build unified master log items
  const unifiedLogs = useMemo(() => {
    const list: Array<{
      id: string;
      rawId: string;
      type: UniversalLedgerType;
      date: string;
      title: string;
      entityName: string;
      categoryOrType: string;
      primaryAmount: number;
      secondaryInfo: string;
      rawObj: Trip | TruckExpense | DriverPayment | CompanySettlement;
      truckId?: string;
      companyId?: string;
      driverId?: string;
    }> = [];

    // Trips
    filteredTrips.forEach((t) => {
      const trk = trucks.find((x) => x.id === t.truckId);
      const cmp = companies.find((x) => x.id === t.companyId);
      const drv = drivers.find((x) => x.id === t.driverId);

      list.push({
        id: `trip-${t.id}`,
        rawId: t.id,
        type: 'TRIP',
        date: t.date,
        title: `Trip Freight: ${t.route || `${t.fromLocation} -> ${t.toLocation}`}`,
        entityName: cmp ? cmp.name : t.companyId,
        categoryOrType: `Gross Rent (TDS: ${t.isTdsDeducted ? '1%' : 'None'})`,
        primaryAmount: t.totalRent,
        secondaryInfo: `Adv: ${formatAmount(t.advanceReceived)} | Net: ${formatAmount(t.netRent)} | Due: ${formatAmount(t.balancePending)}`,
        rawObj: t,
        truckId: t.truckId,
        companyId: t.companyId,
        driverId: t.driverId,
      });
    });

    // Expenses
    filteredTruckExpenses.forEach((e) => {
      const trk = trucks.find((x) => x.id === e.truckId);
      list.push({
        id: `exp-${e.id}`,
        rawId: e.id,
        type: 'TRUCK_EXPENSE',
        date: e.date,
        title: `Truck Expense: ${e.category}`,
        entityName: trk ? `${trk.registrationNumber}` : e.truckId,
        categoryOrType: e.category,
        primaryAmount: e.amount,
        secondaryInfo: `${e.paymentMethod} • ${e.notes || 'No remarks'}`,
        rawObj: e,
        truckId: e.truckId,
      });
    });

    // Driver Payments
    filteredDriverPayments.forEach((p) => {
      const drv = drivers.find((x) => x.id === p.driverId);
      list.push({
        id: `dp-${p.id}`,
        rawId: p.id,
        type: 'DRIVER_PAYMENT',
        date: p.date,
        title: p.type === 'SALARY_PAYOUT' ? 'Driver Cash Payout / Advance' : 'Driver Expense Claim',
        entityName: drv ? drv.name : p.driverId,
        categoryOrType: p.type === 'SALARY_PAYOUT' ? 'Salary Advance' : 'Reimbursement Claim',
        primaryAmount: p.amount,
        secondaryInfo: `${p.paymentMethod || 'Cash'} • ${p.description}`,
        rawObj: p,
        driverId: p.driverId,
      });
    });

    // Settlements
    filteredCompanySettlements.forEach((s) => {
      const cmp = companies.find((x) => x.id === s.companyId);
      list.push({
        id: `set-${s.id}`,
        rawId: s.id,
        type: 'COMPANY_SETTLEMENT',
        date: s.date,
        title: 'Company Receivables Settlement',
        entityName: cmp ? cmp.name : s.companyId,
        categoryOrType: `Payment (${s.paymentMethod})`,
        primaryAmount: s.amount,
        secondaryInfo: `Ref: ${s.referenceNumber || 'N/A'} • ${s.notes || ''}`,
        rawObj: s,
        companyId: s.companyId,
      });
    });

    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredTrips, filteredTruckExpenses, filteredDriverPayments, filteredCompanySettlements, trucks, companies, drivers]);

  // Filter application
  const filteredList = useMemo(() => {
    return unifiedLogs.filter((item) => {
      if (typeFilter !== 'ALL' && item.type !== typeFilter) return false;
      if (truckFilter !== 'ALL' && item.truckId !== truckFilter) return false;
      if (companyFilter !== 'ALL' && item.companyId !== companyFilter) return false;
      if (driverFilter !== 'ALL' && item.driverId !== driverFilter) return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matches =
          item.title.toLowerCase().includes(query) ||
          item.entityName.toLowerCase().includes(query) ||
          item.secondaryInfo.toLowerCase().includes(query) ||
          item.rawId.toLowerCase().includes(query);
        if (!matches) return false;
      }

      return true;
    });
  }, [unifiedLogs, typeFilter, truckFilter, companyFilter, driverFilter, searchTerm]);

  // Delete Action
  const handleDelete = (item: (typeof unifiedLogs)[0]) => {
    if (!window.confirm(`Are you sure you want to permanently delete this ${item.type.replace('_', ' ')} record? All associated ledgers and calculations will be recomputed immediately.`)) {
      return;
    }

    if (item.type === 'TRIP') {
      deleteTrip(item.rawId);
    } else if (item.type === 'TRUCK_EXPENSE') {
      deleteTruckExpense(item.rawId);
    } else if (item.type === 'DRIVER_PAYMENT') {
      deleteDriverPayment(item.rawId);
    } else if (item.type === 'COMPANY_SETTLEMENT') {
      deleteCompanySettlement(item.rawId);
    }
  };

  // Edit Action
  const handleEdit = (item: (typeof unifiedLogs)[0]) => {
    if (item.type === 'TRIP') {
      setEditTarget({ type: 'TRIP', data: item.rawObj as Trip });
    } else if (item.type === 'TRUCK_EXPENSE') {
      setEditTarget({ type: 'TRUCK_EXPENSE', data: item.rawObj as TruckExpense });
    } else if (item.type === 'DRIVER_PAYMENT') {
      setEditTarget({ type: 'DRIVER_PAYMENT', data: item.rawObj as DriverPayment });
    } else if (item.type === 'COMPANY_SETTLEMENT') {
      setEditTarget({ type: 'COMPANY_SETTLEMENT', data: item.rawObj as CompanySettlement });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controller */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              Universal Data Entry Ledger
            </h2>
            <p className="text-xs text-slate-400">
              Master chronological log across all Trips, Expenses, Payouts, and Settlements with in-place Edit and Delete
            </p>
          </div>
          <span className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-lg">
            {filteredList.length} of {unifiedLogs.length} Records
          </span>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-3 border-t border-slate-800">
          {/* Type Filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Record Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
            >
              <option value="ALL">All Record Types</option>
              <option value="TRIP">Trips & Freight</option>
              <option value="TRUCK_EXPENSE">Truck Direct Expenses</option>
              <option value="DRIVER_PAYMENT">Driver Payouts & Claims</option>
              <option value="COMPANY_SETTLEMENT">Company Settlements</option>
            </select>
          </div>

          {/* Truck Filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Truck Filter</label>
            <select
              value={truckFilter}
              onChange={(e) => setTruckFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
            >
              <option value="ALL">All Trucks</option>
              {trucks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.registrationNumber}
                </option>
              ))}
            </select>
          </div>

          {/* Company Filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Company Filter</label>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
            >
              <option value="ALL">All Companies</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Driver Filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Driver Filter</label>
            <select
              value={driverFilter}
              onChange={(e) => setDriverFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
            >
              <option value="ALL">All Drivers</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Search Keywords</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Route, Ref, Remarks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-7 pr-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Master Data Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">Record Type</th>
              <th className="py-2.5 px-3">Entity Involved</th>
              <th className="py-2.5 px-3">Transaction Summary</th>
              <th className="py-2.5 px-3">Details / Accounting</th>
              <th className="py-2.5 px-3 text-right">Amount</th>
              <th className="py-2.5 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No records match your selected filters and date range.
                </td>
              </tr>
            ) : (
              filteredList.map((item) => {
                const badgeColor =
                  item.type === 'TRIP'
                    ? 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                    : item.type === 'TRUCK_EXPENSE'
                    ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                    : item.type === 'DRIVER_PAYMENT'
                    ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">{item.date}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${badgeColor}`}>
                        {item.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">{item.entityName}</td>
                    <td className="py-3 px-3">
                      <div className="text-white font-medium">{item.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono">ID: {item.rawId}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">{item.secondaryInfo}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-white whitespace-nowrap">
                      {formatAmount(item.primaryAmount)}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          title="Edit Record"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          title="Delete Record"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editTarget && <EditEntryModal target={editTarget} onClose={() => setEditTarget(null)} />}
    </div>
  );
};
