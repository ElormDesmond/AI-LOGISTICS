import React, { useState } from 'react';
import { useShipments } from '../hooks/useShipments';
import { useRisks } from '../hooks/useRisks';
import { usePendingActions, useApproveAction, useRejectAction } from '../hooks/useActions';
import { useAuth } from '../hooks/useAuth';
import { MetricsOverview } from '../components/MetricsOverview';
import { ShipmentMap } from '../components/ShipmentMap';
import { ActionQueue } from '../components/ActionQueue';
import { RiskCard } from '../components/RiskCard';
import { Shipment } from '../types/api';
import { ShieldCheck, LogOut, RefreshCw, Cpu, Activity } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { data: shipments = [] } = useShipments();
  const { data: risks = [] } = useRisks();
  const { data: pendingActions = [] } = usePendingActions();
  const approveActionMutation = useApproveAction();
  const rejectActionMutation = useRejectAction();
  const { user, logout } = useAuth();

  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  // Compute key metrics
  const atRiskCount = shipments.filter(s => s.status === 'at_risk').length;
  const activeSelected = selectedShipment || shipments[0] || null;
  const activeRisk = activeSelected ? risks.find(r => r.shipment_id === activeSelected.id) : undefined;

  const handleApproveAction = async (actionId: number, notes?: string) => {
    await approveActionMutation.mutateAsync({ actionId, notes });
  };

  const handleRejectAction = async (actionId: number) => {
    await rejectActionMutation.mutateAsync(actionId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col">
      {/* Top Navbar */}
      <header className="flex items-center justify-between pb-6 mb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
            <Cpu size={26} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Cold-Chain Agentic Orchestrator <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">v1.0 MVP</span>
            </h1>
            <p className="text-xs text-slate-400">Real-time Autonomous Disruption Management & Operator Approval Center</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <Activity size={14} className="text-emerald-400 animate-pulse" /> Live Telematics Stream
          </div>

          <div className="text-right text-xs">
            <p className="font-semibold text-slate-200">{user?.email || 'operator@coldchain.com'}</p>
            <p className="text-[10px] text-slate-400 font-mono">Role: {user?.role || 'operator'}</p>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Metrics Overview Bar */}
      <MetricsOverview
        totalShipments={shipments.length}
        atRiskCount={atRiskCount}
        pendingApprovalsCount={pendingActions.length}
      />

      {/* Main 12-Column Grid Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Column (7 cols): Map Telemetry */}
        <div className="lg:col-span-7 h-[640px]">
          <ShipmentMap
            shipments={shipments}
            selectedShipment={activeSelected}
            onSelectShipment={(s) => setSelectedShipment(s)}
          />
        </div>

        {/* Right Column (5 cols): Action Queue + Risk Diagnosis */}
        <div className="lg:col-span-5 grid grid-rows-2 gap-6 h-[640px]">
          <div className="row-span-1">
            <ActionQueue
              pendingActions={pendingActions}
              onApprove={handleApproveAction}
              onReject={handleRejectAction}
            />
          </div>

          <div className="row-span-1">
            {activeSelected ? (
              <RiskCard shipment={activeSelected} risk={activeRisk} />
            ) : (
              <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex items-center justify-center text-slate-500 text-xs font-mono">
                No active shipment selected.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
