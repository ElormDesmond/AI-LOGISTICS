import React, { useState } from 'react';
import { AgentAction } from '../types/api';
import { X, CheckCircle2, XCircle, TrendingDown, DollarSign, ShieldCheck, Activity } from 'lucide-react';

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

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'REROUTE': return 'bg-rose-500/20 text-rose-300 border-rose-500/40 glow-rose';
      case 'NEGOTIATE': return 'bg-amber-500/20 text-amber-300 border-amber-500/40 glow-amber';
      case 'INSURE': return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'NOTIFY': return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-xl rounded-3xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-xs font-mono font-extrabold rounded-full border ${getBadgeStyle(action.action_type)}`}>
              {action.action_type}
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-white tracking-tight">
                Agent Proposal Verification
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">Action #{action.id} • Pending Human Approval</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tradeoff Cards */}
        <div className="grid grid-cols-2 gap-4 my-6">
          <div className="bg-slate-900/90 border border-slate-800/90 p-4 rounded-2xl">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              <DollarSign size={14} className="text-emerald-400" /> Estimated Cost
            </div>
            <p className="font-display text-2xl font-extrabold text-white mt-1.5 font-mono">${action.estimated_cost}</p>
            <p className="text-[11px] text-slate-400 mt-1">Expedited cold storage re-booking</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800/90 p-4 rounded-2xl">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              <TrendingDown size={14} className="text-emerald-400" /> Expected Risk Reduction
            </div>
            <p className="font-display text-2xl font-extrabold text-emerald-400 mt-1.5 font-mono">
              -{action.expected_risk_reduction} pts
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Mitigates thermal spoilage</p>
          </div>
        </div>

        {/* Compliance Notes Input */}
        <div className="mb-6">
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-cyan-400" /> Compliance Audit Sign-Off Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add quality control sign-off notes for FDA compliance audit log..."
            className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition resize-none h-20 font-sans"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleApprove}
            disabled={submitting}
            className="flex-1 py-3 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/25 active:scale-[0.99]"
          >
            {submitting ? (
              <>
                <Activity size={16} className="animate-spin text-emerald-200" />
                <span>Dispatching Reroute Signal...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Approve & Execute Reroute</span>
              </>
            )}
          </button>

          <button
            onClick={handleReject}
            disabled={submitting}
            className="px-5 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-slate-300 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 border border-slate-800 transition active:scale-[0.99]"
          >
            <XCircle size={16} />
            <span>Reject Proposal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
