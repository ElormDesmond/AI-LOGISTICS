import React from 'react';
import { Package, ShieldAlert, Clock, ThermometerSnowflake, Activity, TrendingUp, Sparkles } from 'lucide-react';
import { useI18n } from '../i18n/i18nContext';

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
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
      {/* Total Shipments Card */}
      <div className="glass-card p-5 rounded-2xl flex items-center justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition"></div>
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <span>{t('metrics_active_shipments')}</span>
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="font-display text-3xl font-extrabold text-white">{totalShipments}</p>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp size={12} /> Active Telematics
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono flex items-center gap-1">
            <Activity size={12} className="text-emerald-400 animate-pulse" /> 100% Real-time Monitored
          </p>
        </div>
        <div className="p-3.5 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/10 group-hover:scale-110 transition duration-300">
          <Package size={26} />
        </div>
      </div>

      {/* Critical Risks Flagged Card */}
      <div className="glass-card p-5 rounded-2xl flex items-center justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition"></div>
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            {t('metrics_at_risk')}
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className={`font-display text-3xl font-extrabold ${atRiskCount > 0 ? 'text-rose-500' : 'text-slate-200'}`}>
              {atRiskCount}
            </p>
            {atRiskCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full animate-pulse">
                {t('action_req')}
              </span>
            )}
          </div>
          <p className="text-[11px] text-rose-400/90 mt-2 font-mono">
            {atRiskCount > 0 ? 'Requires Operator Decision' : t('zero_breaches')}
          </p>
        </div>
        <div className={`p-3.5 rounded-2xl border transition duration-300 group-hover:scale-110 ${
          atRiskCount > 0
            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-lg shadow-rose-500/20'
            : 'bg-slate-800/50 text-slate-400 border-slate-700'
        }`}>
          <ShieldAlert size={26} />
        </div>
      </div>

      {/* Actions Awaiting Approval Card */}
      <div className="glass-card p-5 rounded-2xl flex items-center justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition"></div>
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            {t('metrics_pending_actions')}
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className={`font-display text-3xl font-extrabold ${pendingApprovalsCount > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
              {pendingApprovalsCount}
            </p>
            {pendingApprovalsCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                {t('ai_proposed')}
              </span>
            )}
          </div>
          <p className="text-[11px] text-amber-300/80 mt-2 font-mono">
            {pendingApprovalsCount > 0 ? 'Agent Mitigation Queued' : t('queue_safe')}
          </p>
        </div>
        <div className={`p-3.5 rounded-2xl border transition duration-300 group-hover:scale-110 ${
          pendingApprovalsCount > 0
            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-lg shadow-amber-500/20'
            : 'bg-slate-800/50 text-slate-400 border-slate-700'
        }`}>
          <Clock size={26} />
        </div>
      </div>

      {/* Thermal Telemetry Card */}
      <div className="glass-card p-5 rounded-2xl flex items-center justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition"></div>
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            {t('metrics_thermal_buffer')}
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="font-display text-3xl font-extrabold text-cyan-400 font-mono">
              {avgTemperature}°C
            </p>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono flex items-center gap-1">
            <Sparkles size={12} className="text-cyan-400" /> FDA Standard: &lt; -20.0°C
          </p>
        </div>
        <div className="p-3.5 bg-cyan-500/10 rounded-2xl text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/10 group-hover:scale-110 transition duration-300">
          <ThermometerSnowflake size={26} />
        </div>
      </div>
    </div>
  );
};
