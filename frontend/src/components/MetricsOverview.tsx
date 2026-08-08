import React from 'react';
import { Package, ShieldAlert, Clock, ThermometerSnowflake } from 'lucide-react';

interface MetricsOverviewProps {
  totalShipments: number;
  atRiskCount: number;
  pendingApprovalsCount: number;
  avgTemperature?: number;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  totalShipments,
  atRiskCount,
  pendingApprovalsCount,
  avgTemperature = -22.4,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Total Shipments */}
      <div className="glass-panel p-4 rounded-xl flex items-center justify-between border-slate-800">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Active Shipments</p>
          <p className="text-3xl font-extrabold text-white mt-1">{totalShipments}</p>
          <p className="text-xs text-emerald-400 mt-1 font-mono">100% Monitored Real-time</p>
        </div>
        <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
          <Package size={24} />
        </div>
      </div>

      {/* At-Risk Shipments */}
      <div className="glass-panel p-4 rounded-xl flex items-center justify-between border-slate-800">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Critical Risks Flagged</p>
          <p className="text-3xl font-extrabold text-rose-500 mt-1">{atRiskCount}</p>
          <p className="text-xs text-rose-400 mt-1 font-mono">Requires Operator Review</p>
        </div>
        <div className="p-3 bg-rose-500/10 rounded-lg text-rose-500 border border-rose-500/20">
          <ShieldAlert size={24} />
        </div>
      </div>

      {/* Pending Approval Queue */}
      <div className="glass-panel p-4 rounded-xl flex items-center justify-between border-slate-800">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions Awaiting Approval</p>
          <p className="text-3xl font-extrabold text-amber-400 mt-1">{pendingApprovalsCount}</p>
          <p className="text-xs text-amber-300/80 mt-1 font-mono">Agent Reroutes / Rate Proposals</p>
        </div>
        <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
          <Clock size={24} />
        </div>
      </div>

      {/* Thermal Telemetry */}
      <div className="glass-panel p-4 rounded-xl flex items-center justify-between border-slate-800">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Thermal Buffer</p>
          <p className="text-3xl font-extrabold text-cyan-400 mt-1 font-mono">{avgTemperature}°C</p>
          <p className="text-xs text-slate-400 mt-1">Pharma Standard: &lt; -20°C</p>
        </div>
        <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20">
          <ThermometerSnowflake size={24} />
        </div>
      </div>
    </div>
  );
};
