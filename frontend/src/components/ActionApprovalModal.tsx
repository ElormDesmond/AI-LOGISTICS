import React, { useState } from 'react';
import { AgentAction } from '../types/api';
import { X, CheckCircle, XCircle, TrendingDown, DollarSign, ShieldAlert, ArrowRight } from 'lucide-react';

interface ActionApprovalModalProps {
  action: AgentAction;
  onClose: () => void;
  onApprove: (actionId: number, notes?: string) => Promise<void>;
  onReject: (actionId: number) => Promise<void>;
}

export const ActionApprovalModal: React.FC<ActionApprovalModalProps> = ({
  action,
  onClose,
  onApprove,
  onReject,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await onApprove(action.id, notes);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    setSubmitting(true);
    try {
      await onReject(action.id);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'REROUTE': return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'NEGOTIATE': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'INSURE': return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'NOTIFY': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-slate-700/60 shadow-2xl p-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-xs font-mono font-bold rounded-full border ${getBadgeColor(action.action_type)}`}>
              {action.action_type}
            </span>
            <div>
              <h3 className="text-lg font-bold text-white">Agent Recommendation Approval</h3>
              <p className="text-xs text-slate-400">Action ID #{action.id} • Pending Human Approval</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X size={20} />
          </button>
        </div>

        {/* Tradeoff Cards */}
        <div className="grid grid-cols-2 gap-4 my-6">
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase">
              <DollarSign size={14} className="text-emerald-400" /> Estimated Cost
            </div>
            <p className="text-2xl font-extrabold text-white mt-1 font-mono">${action.estimated_cost}</p>
            <p className="text-[11px] text-slate-400 mt-1">Carrier re-booking / expedited handling</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase">
              <TrendingDown size={14} className="text-emerald-400" /> Expected Risk Reduction
            </div>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
              -{action.expected_risk_reduction} / 10
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Prevents thermal excursion failure</p>
          </div>
        </div>

        {/* Operator Notes Input */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
            Operator Compliance Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add quality assurance sign-off notes for the audit log..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition resize-none h-20"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleApprove}
            disabled={submitting}
            className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20"
          >
            <CheckCircle size={18} /> {submitting ? 'Executing...' : 'Approve & Execute Reroute'}
          </button>

          <button
            onClick={handleReject}
            disabled={submitting}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-semibold rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition"
          >
            <XCircle size={18} /> Reject
          </button>
        </div>
      </div>
    </div>
  );
};
