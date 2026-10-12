import React, { useState } from 'react';
import { useFleet } from '../../context/FleetContext';
import { Driver, DriverPaymentType } from '../../types';
import { X, CheckCircle } from 'lucide-react';

interface DriverPayoutModalProps {
  driver: Driver;
  onClose: () => void;
}

export const DriverPayoutModal: React.FC<DriverPayoutModalProps> = ({ driver, onClose }) => {
  const { addDriverPayment, currency } = useFleet();
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<DriverPaymentType>('SALARY_PAYOUT');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [description, setDescription] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }
    if (!description.trim()) {
      alert('Please enter a description or remark');
      return;
    }

    addDriverPayment({
      date,
      driverId: driver.id,
      type,
      amount: parsedAmount,
      paymentMethod,
      description: description.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/40">
          <div>
            <h3 className="text-base font-bold text-white">Record Driver Transaction</h3>
            <p className="text-xs text-purple-400 font-medium">{driver.name}</p>
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
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Transaction Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('SALARY_PAYOUT')}
                className={`p-2.5 rounded-lg border text-xs font-semibold text-left transition ${
                  type === 'SALARY_PAYOUT'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                    : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div>💰 Cash Advance / Payout</div>
                <span className="text-[10px] text-slate-500 block mt-0.5">Reduces driver balance</span>
              </button>
              <button
                type="button"
                onClick={() => setType('DRIVER_EXPENSE')}
                className={`p-2.5 rounded-lg border text-xs font-semibold text-left transition ${
                  type === 'DRIVER_EXPENSE'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                    : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div>🧾 Driver-Incurred Expense</div>
                <span className="text-[10px] text-slate-500 block mt-0.5">Reimbursement (adds to balance)</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Amount ({currency})</label>
            <input
              type="number"
              step="any"
              required
              min="1"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            >
              <option value="Cash">Cash Handover</option>
              <option value="UPI">UPI / GPay / PhonePe</option>
              <option value="Bank Transfer">Bank Account Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Remarks</label>
            <input
              type="text"
              required
              placeholder={type === 'SALARY_PAYOUT' ? 'e.g. Mid-month salary advance handed at yard' : 'e.g. Emergency tire repair on highway & DEF fluid'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
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
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs shadow-lg shadow-purple-600/20"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Save Transaction</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
