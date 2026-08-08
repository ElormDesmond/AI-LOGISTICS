import React, { useState } from 'react';
import { AgentAction } from '../types/api';
import { ActionApprovalModal } from './ActionApprovalModal';
import { ShieldAlert, ChevronRight, CheckCircle2, DollarSign, TrendingDown, Sparkles } from 'lucide-react';

interface ActionQueueProps {
  pendingActions: AgentAction[];
  onApprove: (actionId: number, notes?: string) => Promise<void>;
  onReject: (actionId: number) => Promise<void>;
}

export const ActionQueue: React.FC<ActionQueueProps> = ({
  pendingActions,
  onApprove,
  onReject,
}) => {
  const [selectedAction, setSelectedAction] = useState<AgentAction | null>(null);

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 h-full flex flex-col relative overflow-hidden">
      {/* Queue Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80 z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-white tracking-tight">
              Action Approval Queue
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Human-in-the-Loop Operator Verification
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-mono font-extrabold rounded-full border ${
          pendingActions.length > 0
            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 glow-amber animate-pulse'
            : 'bg-slate-900 text-slate-500 border-slate-800'
        }`}>
          {pendingActions.length} PENDING
        </span>
      </div>

      {/* Queue Content */}
      {pendingActions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 relative z-10">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="font-display text-sm font-bold text-slate-200">All Queue Actions Cleared</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs font-sans">
            No pending agent disruption mitigation proposals require operator intervention.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5 overflow-y-auto max-h-[460px] pr-1 relative z-10">
          {pendingActions.map((action) => (
            <div
              key={action.id}
              onClick={() => setSelectedAction(action)}
              className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 transition duration-200 cursor-pointer group shadow-md"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-[10px] font-mono font-extrabold rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-wider">
                    {action.action_type}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">Action #{action.id}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold group-hover:translate-x-1 transition">
                  <span>Review</span>
                  <ChevronRight size={16} />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-slate-800/60 font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  <DollarSign size={13} className="text-slate-500" /> Cost: <strong className="text-white">${action.estimated_cost}</strong>
                </span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <TrendingDown size={13} /> Risk -{action.expected_risk_reduction} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAction && (
        <ActionApprovalModal
          action={selectedAction}
          onClose={() => setSelectedAction(null)}
          onApprove={onApprove}
          onReject={onReject}
        />
      )}
    </div>
  );
};
