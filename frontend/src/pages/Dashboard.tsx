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
import { ShieldCheck, LogOut, Activity, Cpu, Radio, CheckCircle, RefreshCw } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { data: shipments = [], refetch: refetchShipments } = useShipments();
  const { data: risks = [] } = useRisks();
  const { data: pendingActions = [], refetch: refetchActions } = usePendingActions();
  const approveActionMutation = useApproveAction();
  const rejectActionMutation = useRejectAction();
  const { user, logout } = useAuth();

  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Compute key metrics
  const atRiskCount = shipments.filter(s => s.status === 'at_risk').length;
  const activeSelected = selectedShipment || shipments[0] || null;
  const activeRisk = activeSelected ? risks.find(r => r.shipment_id === activeSelected.id) : undefined;

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleApproveAction = async (actionId: number, notes?: string) => {
    await approveActionMutation.mutateAsync({ actionId, notes });
    showNotification(`Action #${actionId} successfully approved & reroute command dispatched.`);
    refetchActions();
    refetchShipments();
  };

  const handleRejectAction = async (actionId: number) => {
    await rejectActionMutation.mutateAsync(actionId);
    showNotification(`Action #${actionId} rejected by operator.`);
    refetchActions();
    refetchShipments();
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 p-4 sm:p-6 flex flex-col font-sans relative overflow-hidden">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 p-4 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-mono flex items-center gap-2.5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4">
          <CheckCircle size={18} className="text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Navbar Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-slate-800/80 gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/30 text-cyan-400 rounded-2xl shadow-lg shadow-blue-500/10">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              PharmaShield <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">AI</span>
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full uppercase tracking-wide">
                v1.0 Operational
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Autonomous Cold-Chain Disruption Management & Human-in-the-Loop Control Center
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300">
            <Radio size={14} className="text-emerald-400 animate-pulse" /> Live Telematics Active
          </div>

          <div className="text-right text-xs pr-2">
            <p className="font-semibold text-slate-200">{user?.email || 'admin@pharma.com'}</p>
            <p className="text-[10px] text-cyan-400 font-mono font-semibold uppercase tracking-wider">Role: {user?.role || 'ADMIN'}</p>
          </div>

          <button
            onClick={() => {
              refetchShipments();
              refetchActions();
              showNotification('Telemetry grid & action queues refreshed.');
            }}
            className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Refresh Data"
          >
            <RefreshCw size={18} />
          </button>

          <button
            onClick={logout}
            className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
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
        {/* Left Column (7 cols): Telemetry Map */}
        <div className="lg:col-span-7 min-h-[600px] h-auto flex flex-col">
          <ShipmentMap
            shipments={shipments}
            selectedShipment={activeSelected}
            onSelectShipment={(s) => setSelectedShipment(s)}
          />
        </div>

        {/* Right Column (5 cols): Action Queue + Risk Card */}
        <div className="lg:col-span-5 grid grid-rows-2 gap-6 min-h-[600px] h-auto">
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
              <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col items-center justify-center text-slate-500 text-xs font-mono h-full">
                <Cpu size={32} className="mb-2 text-slate-700 animate-pulse" />
                <p>No active shipment selected on telemetry grid.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
