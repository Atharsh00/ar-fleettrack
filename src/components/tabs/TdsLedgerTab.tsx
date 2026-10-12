import React, { useState } from 'react';
import { useFleet } from '../../context/FleetContext';
import { Trip } from '../../types';
import { EditEntryModal } from '../modals/EditEntryModal';
import { Receipt, ShieldCheck, TrendingDown, DollarSign, Edit3, ArrowRight } from 'lucide-react';

export const TdsLedgerTab: React.FC = () => {
  const { filteredTrips, trucks, companies, summaryMetrics, currency } = useFleet();
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  const formatAmount = (val: number) => {
    return `${currency} ${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  // Trips with TDS
  const tdsTrips = filteredTrips.filter((t) => t.isTdsDeducted && (t.tdsAmount || 0) > 0);
  const totalTdsGross = tdsTrips.reduce((s, t) => s + t.totalRent, 0);

  return (
    <div className="space-y-6">
      {/* Header & Description */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            TDS Deduction Ledger (Section 194C)
          </h2>
          <p className="text-xs text-slate-400">
            Track statutory 1% tax deduction at source withheld by client shippers for quarterly Form 26AS reconciliation
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Total TDS Withheld (Filtered)</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {formatAmount(summaryMetrics.totalTdsDeducted)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Withheld across {summaryMetrics.tripsWithTdsCount} eligible freight invoices
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Gross Invoiced with TDS</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {formatAmount(totalTdsGross)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Base freight subject to 1% TDS deduction</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-slate-400">TDS Exemption / Non-TDS Trips</span>
            <div className="p-2 rounded-lg bg-slate-800 text-slate-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-300">
            {filteredTrips.length - tdsTrips.length} Trips
          </div>
          <p className="text-xs text-slate-400 mt-1">Trips where shipper did not deduct TDS</p>
        </div>
      </div>

      {/* TDS Itemized Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">Itemized TDS Deduction Records</h3>
          <span className="text-xs font-mono text-slate-400">{tdsTrips.length} Trips with TDS Withheld</span>
        </div>

        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-2.5 px-3">Trip Date</th>
              <th className="py-2.5 px-3">Truck Reg No</th>
              <th className="py-2.5 px-3">Client Company</th>
              <th className="py-2.5 px-3 text-right">Agreed Gross Rent</th>
              <th className="py-2.5 px-3 text-right">TDS Amount (1%)</th>
              <th className="py-2.5 px-3 text-right">Net Rent</th>
              <th className="py-2.5 px-3 text-center">Trip ID</th>
              <th className="py-2.5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {tdsTrips.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No trips with TDS deduction found for the selected period.
                </td>
              </tr>
            ) : (
              tdsTrips.map((trip) => {
                const trk = trucks.find((t) => t.id === trip.truckId);
                const cmp = companies.find((c) => c.id === trip.companyId);

                return (
                  <tr key={trip.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">{trip.date}</td>
                    <td className="py-3 px-3 font-mono font-bold text-white whitespace-nowrap">
                      {trk ? trk.registrationNumber : trip.truckId}
                    </td>
                    <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">
                      {cmp ? cmp.name : trip.companyId}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-white whitespace-nowrap">
                      {formatAmount(trip.totalRent)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                      {formatAmount(trip.tdsAmount || 0)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-blue-300 font-semibold whitespace-nowrap">
                      {formatAmount(trip.netRent || trip.totalRent - trip.tdsAmount)}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {trip.id}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setEditingTrip(trip)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 font-semibold rounded text-[11px] transition flex items-center gap-1 mx-auto"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {editingTrip && (
        <EditEntryModal
          target={{ type: 'TRIP', data: editingTrip }}
          onClose={() => setEditingTrip(null)}
        />
      )}
    </div>
  );
};
