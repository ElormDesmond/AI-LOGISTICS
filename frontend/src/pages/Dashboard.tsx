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
import { apiClient } from '../utils/api';
import { ShieldCheck, LogOut, Activity, Cpu, CheckCircle, RefreshCw, PlusCircle, Check } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { data: shipments = [], refetch: refetchShipments } = useShipments();
  const { data: risks = [] } = useRisks();
  const { data: pendingActions = [], refetch: refetchActions } = usePendingActions();
  const approveActionMutation = useApproveAction();
  const rejectActionMutation = useRejectAction();
  const { user, logout } = useAuth();

  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [showRoleInfo, setShowRoleInfo] = useState(false);

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

  const handleSimulateExcursion = async () => {
    setSimulating(true);
    try {
      const trackingId = `TRK-EXCURSION-${Math.floor(1000 + Math.random() * 9000)}`;
      await apiClient.post('/shipments', {
        tracking_id: trackingId,
        origin: 'Frankfurt, Germany',
        destination: 'Boston, USA',
        carrier: 'DHL Express',
        temperature: 18.5,
        current_location: { lat: 50.1109, lng: 8.6821 },
        value_usd: 350000,
        status: 'in_transit',
        estimated_delivery: new Date(Date.now() + 86400000 * 5).toISOString()
      });
      showNotification(`Simulated thermal breach ingested for ${trackingId}. AI Agent evaluating risk...`);
      setTimeout(() => {
        refetchShipments();
        refetchActions();
      }, 2500);
    } catch (err) {
      showNotification('Failed to trigger simulation. Verify API parameters.');
    } finally {
      setSimulating(false);
    }
  };

  const handleSimulateNormal = async () => {
    setSimulating(true);
    try {
      const trackingId = `TRK-SAFE-${Math.floor(1000 + Math.random() * 9000)}`;
      await apiClient.post('/shipments', {
        tracking_id: trackingId,
        origin: 'Zurich, Switzerland',
        destination: 'New York, USA',
        carrier: 'FedEx Priority Alert',
        temperature: -24.5,
        current_location: { lat: 47.3769, lng: 8.5417 },
        value_usd: 500000,
        status: 'in_transit',
        estimated_delivery: new Date(Date.now() + 86400000 * 3).toISOString()
      });
      showNotification(`Safe shipment ${trackingId} ingested (-24.5°C). Normal on-course status, zero actions required.`);
      setTimeout(() => {
        refetchShipments();
        refetchActions();
      }, 2500);
    } catch (err) {
      showNotification('Failed to trigger normal simulation.');
    } finally {
      setSimulating(false);
    }
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

        <div className="flex items-center gap-2.5">
          {/* Simulation Trigger Buttons */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-1 rounded-2xl">
            <button
              onClick={handleSimulateNormal}
              disabled={simulating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold transition active:scale-95"
              title="Simulate a safe cold-chain shipment on course (-24.5°C) requiring zero actions"
            >
              <Check size={13} className="text-cyan-400" />
              <span>+ Normal (-24.5°C)</span>
            </button>

            <button
              onClick={handleSimulateExcursion}
              disabled={simulating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold transition active:scale-95 shadow-md shadow-rose-500/10"
              title="Simulate a thermal breach (+18.5°C) to generate a pending action in the approval queue"
            >
              <Activity size={13} className={simulating ? 'animate-spin text-rose-400' : 'text-rose-400 animate-pulse'} />
              <span>+ Excursion (+18.5°C)</span>
            </button>
          </div>

          {/* User Role Card & Tooltip */}
          <div className="relative">
            <button
              onClick={() => setShowRoleInfo(!showRoleInfo)}
              className="text-right text-xs px-3 py-1.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex items-center gap-2"
            >
              <div>
                <p className="font-semibold text-slate-200">{user?.email || 'admin@pharma.com'}</p>
                <p className="text-[10px] text-cyan-400 font-mono font-semibold uppercase tracking-wider text-left">
                  Role: {user?.role || 'ADMIN'} ℹ️
                </p>
              </div>
            </button>

            {/* Role Info Tooltip Modal */}
            {showRoleInfo && (
              <div className="absolute right-0 top-12 z-50 w-80 p-4 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl text-xs font-mono backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <span className="font-bold text-white uppercase">{user?.role || 'ADMIN'} ACCESS CONTROL</span>
                  <button onClick={() => setShowRoleInfo(false)} className="text-slate-400 hover:text-white">✕</button>
                </div>
                {(user?.role?.toUpperCase() === 'ADMIN' || !user?.role) && (
                  <p className="text-slate-300 leading-relaxed">
                    <strong className="text-cyan-400">Admin Authority:</strong> Can approve/reject high-cost carrier reroutes, trigger test breach simulations, configure rules, and view compliance logs.
                  </p>
                )}
                {user?.role?.toUpperCase() === 'OPERATOR' && (
                  <p className="text-slate-300 leading-relaxed">
                    <strong className="text-amber-400">Operator Authority:</strong> Monitors live telematics grid, views breach alerts, and executes standard disruption mitigation proposals.
                  </p>
                )}
                {user?.role?.toUpperCase() === 'AUDITOR' && (
                  <p className="text-slate-300 leading-relaxed">
                    <strong className="text-emerald-400">Auditor Authority:</strong> Read-only compliance access to immutable FDA 21 CFR Part 11 audit trails and AI timestamps.
                  </p>
                )}
              </div>
            )}
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
