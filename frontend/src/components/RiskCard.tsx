import React from 'react';
import { Shipment, RiskAssessment } from '../types/api';
import { Thermometer, ShieldAlert, Cpu, CheckCircle2, MapPin, Truck, Calendar } from 'lucide-react';

interface RiskCardProps {
  shipment: Shipment;
  risk?: RiskAssessment;
}

export const RiskCard: React.FC<RiskCardProps> = ({ shipment, risk }) => {
  const getRiskScoreColor = (score: number = 0) => {
    if (score >= 7.0) return 'text-rose-500 bg-rose-500/10 border-rose-500/30';
    if (score >= 4.0) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 h-full flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Cpu className="text-blue-400" size={20} />
            <h3 className="text-md font-bold text-white">AI Risk Diagnosis</h3>
          </div>
          {risk && (
            <span className={`px-3 py-1 font-mono text-xs font-extrabold rounded-full border ${getRiskScoreColor(risk.risk_score)}`}>
              Risk Score: {risk.risk_score.toFixed(1)} / 10
            </span>
          )}
        </div>

        {/* Shipment Overview */}
        <div className="my-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-mono font-bold text-white">{shipment.tracking_id}</span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Truck size={14} /> {shipment.carrier}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs mt-3">
            <div>
              <p className="text-slate-400 flex items-center gap-1"><MapPin size={12} /> Route</p>
              <p className="font-semibold text-slate-200 mt-0.5">{shipment.origin} → {shipment.destination}</p>
            </div>

            <div>
              <p className="text-slate-400 flex items-center gap-1"><Thermometer size={12} /> Temperature</p>
              <p className={`font-mono font-bold mt-0.5 ${shipment.temperature && shipment.temperature > -20 ? 'text-rose-400' : 'text-cyan-400'}`}>
                {shipment.temperature !== undefined ? `${shipment.temperature}°C` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Reasoning explanation */}
        {risk ? (
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-amber-400" /> Agentic AI Reasoning Engine
            </p>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{risk.reasoning}</p>

            <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Category: <strong className="text-white uppercase">{risk.risk_category}</strong></span>
              <span>Confidence: <strong className="text-emerald-400">{(risk.confidence * 100).toFixed(0)}%</strong></span>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-500 text-xs">
            Select a shipment on the map or list to view AI diagnosis.
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between font-mono">
        <span>Cargo Value: ${shipment.value_usd.toLocaleString()}</span>
        <span>Status: <strong className="text-blue-400 uppercase">{shipment.status}</strong></span>
      </div>
    </div>
  );
};
