import React from 'react';
import { useFleet } from '../context/FleetContext';
import { DollarSign, TrendingUp, Users, AlertCircle, Fuel } from 'lucide-react';

export const SummaryCards: React.FC = () => {
  const { summaryMetrics, currency } = useFleet();

  const formatAmount = (val: number) => {
    return `${currency} ${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const cards = [
    {
      title: 'Total Revenue',
      value: formatAmount(summaryMetrics.totalRevenue),
      subtitle: `${summaryMetrics.totalTripsCount} Trips logged in period`,
      icon: DollarSign,
      color: 'from-blue-600/20 to-blue-500/5',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
      textColor: 'text-blue-100',
    },
    {
      title: 'Outstanding Receivables',
      value: formatAmount(summaryMetrics.totalCompanyReceivables),
      subtitle: 'Pending collection from client companies',
      icon: AlertCircle,
      color: 'from-amber-600/20 to-amber-500/5',
      borderColor: 'border-amber-500/30',
      iconColor: 'text-amber-400',
      textColor: 'text-amber-100',
    },
    {
      title: 'Net Driver Payable',
      value: formatAmount(summaryMetrics.netDriverPayable),
      subtitle: 'Commissions + claims minus advances paid',
      icon: Users,
      color: 'from-purple-600/20 to-purple-500/5',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400',
      textColor: 'text-purple-100',
    },
    {
      title: 'Fleet Net Profit',
      value: formatAmount(summaryMetrics.fleetProfit),
      subtitle: `Direct Expenses: ${formatAmount(summaryMetrics.totalDirectExpenses)}`,
      icon: TrendingUp,
      color: summaryMetrics.fleetProfit >= 0 ? 'from-emerald-600/20 to-emerald-500/5' : 'from-rose-600/20 to-rose-500/5',
      borderColor: summaryMetrics.fleetProfit >= 0 ? 'border-emerald-500/30' : 'border-rose-500/30',
      iconColor: summaryMetrics.fleetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400',
      textColor: summaryMetrics.fleetProfit >= 0 ? 'text-emerald-100' : 'text-rose-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`relative overflow-hidden bg-gradient-to-br ${card.color} bg-slate-900/80 border ${card.borderColor} rounded-xl p-5 shadow-lg backdrop-blur transition-all duration-200 hover:scale-[1.01]`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg bg-slate-800/80 ${card.iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className={`text-2xl font-bold tracking-tight mb-1 ${card.textColor}`}>
              {card.value}
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              {card.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
};
