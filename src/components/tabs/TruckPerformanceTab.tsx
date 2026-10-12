import React, { useState } from 'react';
import { useFleet } from '../../context/FleetContext';
import { Truck, Fuel, DollarSign, TrendingUp, AlertCircle, Wrench, Shield, Layers } from 'lucide-react';
import { ExpenseCategory } from '../../types';

export const TruckPerformanceTab: React.FC = () => {
  const {
    trucks,
    filteredTrips,
    filteredTruckExpenses,
    truckPerformanceList,
    getCompanyName,
    getTripExpenses,
    getTripProfit,
    currency,
  } = useFleet();

  const [selectedTruckId, setSelectedTruckId] = useState<string>('all');

  const formatAmount = (val: number) => {
    return `${currency} ${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const selectedTruckSummary =
    selectedTruckId !== 'all'
      ? truckPerformanceList.find((tp) => tp.truck.id === selectedTruckId)
      : null;

  // Trips for selected truck
  const relevantTrips =
    selectedTruckId === 'all'
      ? filteredTrips
      : filteredTrips.filter((t) => t.truckId === selectedTruckId);

  // Expenses for selected truck
  const relevantExpenses =
    selectedTruckId === 'all'
      ? filteredTruckExpenses
      : filteredTruckExpenses.filter((e) => e.truckId === selectedTruckId);

  const getTruckLabel = (id: string) => {
    const trk = trucks.find((t) => t.id === id);
    return trk ? `${trk.registrationNumber} (${trk.model})` : id;
  };

  return (
    <div className="space-y-6">
      {/* Top Controller Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-500" />
            Truck-Wise Performance & P&L
          </h2>
          <p className="text-xs text-slate-400">
            Compare vehicle profitability, direct costs (fuel, repairs, tolls), and itemized logs
          </p>
        </div>

        {/* Truck Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-400">Select Vehicle:</label>
          <select
            value={selectedTruckId}
            onChange={(e) => setSelectedTruckId(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-amber-500 font-mono"
          >
            <option value="all">🚛 All Trucks (Fleet Summary)</option>
            {trucks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.registrationNumber} - {t.model}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Truck KPI Cards */}
      {selectedTruckSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fadeIn">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow">
            <span className="text-xs text-slate-400 uppercase font-semibold">Total Revenue</span>
            <div className="text-xl font-bold font-mono text-blue-400 mt-1">
              {formatAmount(selectedTruckSummary.totalRevenue)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">{selectedTruckSummary.tripsCount} trips completed</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow">
            <span className="text-xs text-slate-400 uppercase font-semibold">Direct Expenses</span>
            <div className="text-xl font-bold font-mono text-rose-400 mt-1">
              {formatAmount(selectedTruckSummary.totalExpenses)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Fuel, maintenance, tolls, permits</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow">
            <span className="text-xs text-slate-400 uppercase font-semibold">Net Profit</span>
            <div
              className={`text-xl font-bold font-mono mt-1 ${
                selectedTruckSummary.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-500'
              }`}
            >
              {formatAmount(selectedTruckSummary.netProfit)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Revenue minus direct costs</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow">
            <span className="text-xs text-slate-400 uppercase font-semibold">Profit Margin</span>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">
              {Math.round(selectedTruckSummary.profitMarginPercent)}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Net ROI for filtered period</div>
          </div>
        </div>
      )}

      {/* Summary Table if "All Trucks" is chosen (Notice: Status column removed as per requirement 2) */}
      {selectedTruckId === 'all' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg overflow-x-auto">
          <h3 className="text-sm font-bold text-white mb-4">All Vehicles Financial Summary</h3>
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Truck Reg No</th>
                <th className="py-2.5 px-3">Model & Capacity</th>
                <th className="py-2.5 px-3 text-center">Trips</th>
                <th className="py-2.5 px-3 text-right">Total Revenue</th>
                <th className="py-2.5 px-3 text-right">Direct Expenses</th>
                <th className="py-2.5 px-3 text-right">Net Profit</th>
                <th className="py-2.5 px-3 text-right">Margin %</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {truckPerformanceList.map((tp) => (
                <tr key={tp.truck.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-mono font-bold text-white">{tp.truck.registrationNumber}</td>
                  <td className="py-3 px-3 text-slate-400">
                    {tp.truck.model} ({tp.truck.capacity})
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-semibold text-slate-300">
                    {tp.tripsCount}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-white">
                    {formatAmount(tp.totalRevenue)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-rose-400">
                    {formatAmount(tp.totalExpenses)}
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-mono font-bold ${
                      tp.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-500'
                    }`}
                  >
                    {formatAmount(tp.netProfit)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-amber-400 font-semibold">
                    {Math.round(tp.profitMarginPercent)}%
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => setSelectedTruckId(tp.truck.id)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 font-semibold text-[11px] transition"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Two Column Section: Itemized Trips & Itemized Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Itemized Trips Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Itemized Trips ({relevantTrips.length})
            </h3>
            {selectedTruckId !== 'all' && (
              <span className="text-xs text-amber-400 font-mono font-semibold">
                {getTruckLabel(selectedTruckId)}
              </span>
            )}
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0">
                <tr>
                  <th className="py-2 px-2.5">Date</th>
                  <th className="py-2 px-2.5">Company Name</th>
                  <th className="py-2 px-2.5">Route</th>
                  <th className="py-2 px-2.5 text-right">Rent</th>
                  <th className="py-2 px-2.5 text-right">Trip Exp</th>
                  <th className="py-2 px-2.5 text-right">Trip Profit</th>
                  <th className="py-2 px-2.5 text-right">Advance</th>
                  <th className="py-2 px-2.5 text-right">Balance Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {relevantTrips.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-500">
                      No trips found for this vehicle in the filtered period
                    </td>
                  </tr>
                ) : (
                  relevantTrips.map((t) => {
                    const assocExp = getTripExpenses(t.id);
                    const profit = getTripProfit(t);
                    return (
                      <tr key={t.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-2.5 font-mono text-slate-400">{t.date}</td>
                        <td className="py-2.5 px-2.5 font-semibold text-white">
                          {getCompanyName(t.companyId || (t as any).companyName) || (t as any).companyName || '—'}
                        </td>
                        <td className="py-2.5 px-2.5 font-medium text-slate-200">{t.route || 'Freight'}</td>
                        <td className="py-2.5 px-2.5 text-right font-mono font-semibold text-white">
                          {formatAmount(t.totalRent)}
                        </td>
                        <td className="py-2.5 px-2.5 text-right font-mono text-rose-400">
                          {assocExp > 0 ? `-${formatAmount(assocExp)}` : '—'}
                        </td>
                        <td className={`py-2.5 px-2.5 text-right font-mono font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                          {formatAmount(profit)}
                        </td>
                        <td className="py-2.5 px-2.5 text-right font-mono text-emerald-400">
                          {formatAmount(t.advanceReceived)}
                        </td>
                        <td className="py-2.5 px-2.5 text-right font-mono text-amber-400 font-semibold">
                          {formatAmount(t.balancePending)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Itemized Expenses Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Fuel className="w-4 h-4 text-rose-400" />
              Itemized Direct Expenses ({relevantExpenses.length})
            </h3>
            {selectedTruckId !== 'all' && (
              <span className="text-xs text-amber-400 font-mono font-semibold">
                {getTruckLabel(selectedTruckId)}
              </span>
            )}
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0">
                <tr>
                  <th className="py-2 px-2.5">Date</th>
                  <th className="py-2 px-2.5">Category</th>
                  <th className="py-2 px-2.5">Method & Notes</th>
                  <th className="py-2 px-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {relevantExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      No direct expenses logged for this vehicle in the filtered period
                    </td>
                  </tr>
                ) : (
                  relevantExpenses.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-2.5 font-mono text-slate-400">{e.date}</td>
                      <td className="py-2.5 px-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                          {e.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5 text-slate-400 text-[11px] truncate max-w-[140px]">
                        {e.notes || e.paymentMethod}
                      </td>
                      <td className="py-2.5 px-2.5 text-right font-mono font-bold text-rose-400">
                        {formatAmount(e.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
