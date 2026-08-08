import React, { useState } from 'react';
import { AgentAction } from '../types/api';
import { ActionApprovalModal } from './ActionApprovalModal';
import { AlertTriangle, ChevronRight, Check, X, ShieldAlert } from 'lucide-react';

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
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 h-full flex flex-col">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-amber-400" size={20} />
          <h3 className="text-md font-bold text-white">Action Approval Queue</h3>
        </div>
        <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
          {pendingActions.length} PENDING
        </span>
      </div>

      {pendingActions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
          <div className="p-4 rounded-full bg-slate-900 mb-3 border border-slate-800">
            <Check size={28} className="text-emerald-500" />
          </div>
          <p className="font-semibold text-slate-300">All Queue Actions Approved</p>
          <p className="text-xs text-slate-500 mt-1">No pending agent recommendations require intervention.</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
          {pendingActions.map((action) => (
            <div
              key={action.id}
              onClick={() => setSelectedAction(action)}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer glass-panel-hover"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 uppercase">
                    {action.action_type}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">ID #{action.id}</span>
                </div>
                <ChevronRight size={16} className="text-slate-500" />
              </div>

              <div className="flex items-center justify-between text-xs mt-3">
                <div className="text-slate-300">
                  Cost: <span className="font-mono text-white font-bold">${action.estimated_cost}</span>
                </div>
                <div className="text-emerald-400 font-mono font-semibold">
                  Risk -{action.expected_risk_reduction} / 10
                </div>
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
