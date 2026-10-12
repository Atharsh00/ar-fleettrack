import React from 'react';
import { useFleet } from '../../context/FleetContext';
import { ExpenseCategory } from '../../types';
import { Truck, AlertTriangle, TrendingUp, Compass, ChevronRight } from 'lucide-react';

interface OverviewTabProps {
  onNavigateTab: (tab: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ onNavigateTab }) => {
  const {
    filteredTrips,
    filteredTruckExpenses,
    summaryMetrics,
    truckPerformanceList,
    companyAccounts,
    currency,
  } = useFleet();

  const formatAmount = (val: number) => {
    return `${currency} ${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  // Compute expense distribution
  const expenseByCategory: Record<ExpenseCategory, number> = {
    DIESEL: 0,
    MAINTENANCE: 0,
    TOLL: 0,
    INSURANCE: 0,
    PERMITS: 0,
    SPARE_PARTS: 0,
    OTHER: 0,
  };

  filteredTruckExpenses.forEach((exp) => {
    if (expenseByCategory[exp.category] !== undefined) {
      expenseByCategory[exp.category] += exp.amount;
    } else {
      expenseByCategory.OTHER += exp.amount;
    }
  });

  const totalExpense = summaryMetrics.totalDirectExpenses || 1; // avoid / 0

  const categoryLabels: Record<ExpenseCategory, { label: string; color: string }> = {
    DIESEL: { label: 'Diesel / Fuel', color: 'bg-amber-500' },
    MAINTENANCE: { label: 'Maintenance & Repairs', color: 'bg-blue-500' },
    TOLL: { label: 'Tolls & Fastag', color: 'bg-emerald-500' },
    INSURANCE: { label: 'Insurance Premium', color: 'bg-purple-500' },
    PERMITS: { label: 'State & National Permits', color: 'bg-indigo-500' },
    SPARE_PARTS: { label: 'Spare Parts & Tires', color: 'bg-rose-500' },
    OTHER: { label: 'Other Sundry Expenses', color: 'bg-slate-500' },
  };

  // High balance debtor companies
  const highDueCompanies = companyAccounts
    .filter((ca) => ca.balanceDue > 0)
    .sort((a, b) => b.balanceDue - a.balanceDue)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Top Split: Expense Breakdown & Receivables Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Category Breakdown */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                Fleet Direct Expense Breakdown
              </h3>
              <p className="text-xs text-slate-400">Total logged: {formatAmount(summaryMetrics.totalDirectExpenses)}</p>
            </div>
            <button
              onClick={() => onNavigateTab('truck_performance')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              Truck Details <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {(Object.keys(expenseByCategory) as ExpenseCategory[]).map((cat) => {
              const amount = expenseByCategory[cat];
              const pct = Math.round((amount / totalExpense) * 100);
              const meta = categoryLabels[cat];

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">{meta.label}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-slate-400">{pct}%</span>
                      <span className="text-white font-semibold">{formatAmount(amount)}</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${meta.color} transition-all duration-500 rounded-full`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* High Receivables Alert / Watchlist */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Receivables Watchlist
              </h3>
              <button
                onClick={() => onNavigateTab('company_accounts')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                All Accounts <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Companies with the highest pending balances in selected period:
            </p>

            <div className="space-y-3">
              {highDueCompanies.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  All company accounts are fully settled for this period! 🎉
                </div>
              ) : (
                highDueCompanies.map((item) => (
                  <div
                    key={item.company.id}
                    className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white truncate max-w-[150px]">
                        {item.company.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.tripsCount} trips contracted
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-amber-400 font-mono">
                        {formatAmount(item.balanceDue)}
                      </div>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        Pending Due
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={() => onNavigateTab('company_accounts')}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
            >
              Open Receivables Ledger
            </button>
          </div>
        </div>
      </div>

      {/* Fleet Trucks Performance Snapshot */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-400" />
              Vehicle Profitability Ranking
            </h3>
            <p className="text-xs text-slate-400">Net earnings per truck (Revenue minus direct fuel/maintenance/tolls)</p>
          </div>
          <button
            onClick={() => onNavigateTab('truck_performance')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
          >
            Deep Dive <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {truckPerformanceList.map((tp) => (
            <div
              key={tp.truck.id}
              className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between"
            >
              <div>
                <div className="mb-2">
                  <span className="text-xs font-bold text-white tracking-wider font-mono block">
                    {tp.truck.registrationNumber}
                  </span>
                  <div className="text-[11px] text-slate-400">{tp.truck.model}</div>
                </div>

                <div className="space-y-1.5 text-xs mt-3">
                  <div className="flex justify-between text-slate-400">
                    <span>Revenue:</span>
                    <span className="text-slate-200 font-mono">{formatAmount(tp.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Expenses:</span>
                    <span className="text-slate-200 font-mono">{formatAmount(tp.totalExpenses)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Net Profit:</span>
                  <span
                    className={`text-sm font-bold font-mono ${
                      tp.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {formatAmount(tp.netProfit)}
                  </span>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-900 text-slate-300">
                  {Math.round(tp.profitMarginPercent)}% Margin
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Trips Stream */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-400" />
              Recent Trips in Period
            </h3>
            <p className="text-xs text-slate-400">Showing {filteredTrips.length} trips within selected date filter</p>
          </div>
          <button
            onClick={() => onNavigateTab('data_entry')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
          >
            + Add New Trip <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/70 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Route / Vehicle</th>
                <th className="py-2.5 px-3">Company</th>
                <th className="py-2.5 px-3 text-right">Gross Rent</th>
                <th className="py-2.5 px-3 text-right">Advance Paid</th>
                <th className="py-2.5 px-3 text-right">TDS (1%)</th>
                <th className="py-2.5 px-3 text-right">Balance Due</th>
                <th className="py-2.5 px-3 text-right">Driver Salary (15%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTrips.slice(0, 6).map((trip) => (
                <tr key={trip.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-mono text-slate-400">{trip.date}</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-white">{trip.route || `${trip.fromLocation} -> ${trip.toLocation}`}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{trip.truckId}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-medium">{trip.companyId}</td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-white">
                    {formatAmount(trip.totalRent)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-400">
                    {formatAmount(trip.advanceReceived)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-blue-400 font-semibold">
                    {trip.isTdsDeducted ? formatAmount(trip.tdsAmount || 0) : '-'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-amber-400">
                    {formatAmount(trip.balancePending)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-purple-300 font-semibold">
                    {formatAmount(trip.driverCommission)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
