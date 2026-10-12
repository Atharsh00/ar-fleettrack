import React, { useState } from 'react';
import { useFleet } from '../../context/FleetContext';
import { Company } from '../../types';
import { X, CheckCircle } from 'lucide-react';

interface SettlementModalProps {
  company: Company;
  balanceDue: number;
  onClose: () => void;
}

export const SettlementModal: React.FC<SettlementModalProps> = ({ company, balanceDue, onClose }) => {
  const { addCompanySettlement, currency } = useFleet();
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<string>(balanceDue.toString());
  const [paymentMethod, setPaymentMethod] = useState<string>('NEFT');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid settlement amount greater than 0');
      return;
    }

    addCompanySettlement({
      date,
      companyId: company.id,
      amount: parsedAmount,
      paymentMethod,
      referenceNumber: referenceNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/40">
          <div>
            <h3 className="text-base font-bold text-white">Record Balance Settlement</h3>
            <p className="text-xs text-amber-400 font-medium">{company.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex justify-between items-center text-xs">
            <span className="text-slate-300">Current Outstanding Due:</span>
            <span className="text-amber-400 font-bold text-sm">
              {currency} {balanceDue.toLocaleString('en-IN')}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Settlement Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Settlement Amount ({currency})</label>
            <input
              type="number"
              step="any"
              required
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="NEFT">Bank Transfer (NEFT/RTGS/IMPS)</option>
              <option value="Cheque">Cheque</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">UTR / Cheque Reference (Optional)</label>
            <input
              type="text"
              placeholder="e.g. UTR84729103 or CHQ-4029"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Remarks / Notes</label>
            <input
              type="text"
              placeholder="e.g. Final clearance for May shipments"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow-lg shadow-amber-500/20"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Confirm Settlement</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
