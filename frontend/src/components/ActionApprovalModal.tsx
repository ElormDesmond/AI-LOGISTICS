import React, { useState } from 'react';
import { AgentAction } from '../types/api';
import { MultiAgentPanel } from './MultiAgentPanel';
import { X, CheckCircle2, XCircle, TrendingDown, DollarSign, ShieldCheck, Activity, Info, ArrowRight } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 sm:p-4 overflow-hidden">
      <div className="glass-panel w-full max-w-2xl rounded-3xl border border-slate-700/80 shadow-2xl p-5 sm:p-6 relative max-h-[92vh] flex flex-col justify-between overflow-hidden">
        {/* Ambient Glow Backdrop */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Pinned Top Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 shrink-0 z-20">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-xs font-mono font-extrabold rounded-full border ${getBadgeStyle(action.action_type)}`}>
              {action.action_type}
            </span>
            <div>
              <h3 className="font-display text-base sm:text-lg font-bold text-white tracking-tight">
                Agent Proposal Verification & Execution
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">Action #{action.id} • Human-in-the-Loop Sign-Off</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Middle Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs font-mono relative z-10 min-h-0">
          {/* Tradeoff Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                <DollarSign size={13} className="text-emerald-400" /> Total Reroute Cost
              </span>
              <p className="font-display text-xl font-extrabold text-white mt-1 font-mono">${action.estimated_cost}</p>
              <p className="text-[10px] text-slate-300 mt-1 leading-relaxed font-sans">
                <strong>Cost Breakdown:</strong> $300 express priority thermal flight slot + $150 GDP warehouse transfer fee.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                <TrendingDown size={13} className="text-emerald-400" /> Expected Risk Reduction
              </span>
              <p className="font-display text-xl font-extrabold text-emerald-400 mt-1 font-mono">
                -{action.expected_risk_reduction} pts
              </p>
              <p className="text-[10px] text-slate-300 mt-1 leading-relaxed font-sans">
                <strong>Yield Result:</strong> Drops risk score from 8.5 → 2.0. Protects $350,000 cargo from total thermal spoilage.
              </p>
            </div>
          </div>

          {/* Multi-Agent Autonomous Negotiation Transcript & MKT Stability Panel */}
          <MultiAgentPanel actionId={action.id} />

          {/* Expected Action Outcome Preview Box */}
          <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs font-mono text-cyan-200">
            <div className="flex items-center gap-1.5 font-bold mb-1 text-cyan-300">
              <Info size={14} /> Expected Action Execution Outcome:
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300 font-sans">
              Approving this action will instruct carrier <strong>{action.action_details?.carrier || 'DHL Express'}</strong> to transfer package <strong>{action.action_details?.tracking_id}</strong> to a priority temperature-controlled flight with active nitrogen cooling (-22.5°C).
            </p>
          </div>

          {/* Compliance Notes Input */}
          <div className="pb-1">
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 font-mono flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-cyan-400" /> Compliance Audit Sign-Off Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add quality control sign-off notes for FDA compliance audit log..."
              className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition resize-none h-14 font-sans"
            />
          </div>
        </div>

        {/* Pinned Bottom Action Footer Buttons - ALWAYS 100% VISIBLE */}
        <div className="flex gap-3 pt-3 mt-2 border-t border-slate-800 shrink-0 z-20 bg-[#070a12]/95 rounded-b-2xl">
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
