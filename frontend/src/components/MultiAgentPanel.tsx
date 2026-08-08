import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';
import { Bot, ShieldCheck, DollarSign, Award, CheckCircle2, TrendingDown, Cpu, Sparkles } from 'lucide-react';

interface MultiAgentPanelProps {
  actionId: number;
}

export const MultiAgentPanel: React.FC<MultiAgentPanelProps> = ({ actionId }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchNegotiation() {
      setLoading(true);
      try {
        const response = await apiClient.get(`/actions/${actionId}/multi-agent-negotiation`);
        if (isMounted) setData(response.data);
      } catch (err) {
        console.error('Failed to fetch multi-agent negotiation transcript', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchNegotiation();
    return () => { isMounted = false; };
  }, [actionId]);

  if (loading) {
    return (
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-center gap-2">
        <Cpu size={16} className="animate-spin text-cyan-400" />
        <span>Synthesizing Multi-Agent Dialogue & Carrier Rate Negotiation...</span>
      </div>
    );
  }

  if (!data) return null;

  const { quality_evaluation, carrier_negotiation, claims_evaluation, dialogue_transcript, unified_recommendation } = data;

  return (
    <div className="rounded-2xl bg-slate-950/90 border border-slate-800/90 p-4 font-mono text-xs text-slate-200 my-3 shadow-xl relative overflow-hidden">
      {/* Header Badge */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 text-cyan-300 rounded-lg">
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="font-bold text-white tracking-wide text-xs">Autonomous Multi-Agent Collaboration Engine</h4>
            <p className="text-[10px] text-slate-400">Carrier, Quality, & Claims Agents Consensus Protocol</p>
          </div>
        </div>
        <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full uppercase tracking-wider">
          ✓ {data.status}
        </span>
      </div>

      {/* Live Agent Dialogue Transcript */}
      <div className="space-y-2 mb-3 max-h-44 overflow-y-auto pr-1">
        {dialogue_transcript.map((item: any, idx: number) => {
          const isQA = item.speaker === 'QualityAssuranceAgent';
          const isCarrier = item.speaker === 'CarrierNegotiationAgent';
          const badgeColor = isQA ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' :
                             isCarrier ? 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10' :
                             'text-purple-400 border-purple-500/40 bg-purple-500/10';

          return (
            <div key={idx} className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] leading-relaxed">
              <div className="flex items-center justify-between mb-1">
                <span className={`px-2 py-0.5 text-[9px] font-bold rounded border ${badgeColor}`}>
                  🤖 {item.role_title}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{item.speaker}</span>
              </div>
              <p className="text-slate-300 text-[10px] mt-1 font-sans">{item.message}</p>
            </div>
          );
        })}
      </div>

      {/* Multi-Agent Metrics & Negotiation Grid */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[10px]">
        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
          <span className="text-slate-400 block text-[9px]">Calculated MKT</span>
          <strong className="text-emerald-400 font-bold text-xs">{quality_evaluation?.mean_kinetic_temp_c}°C</strong>
        </div>

        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
          <span className="text-slate-400 block text-[9px]">Negotiated Rate</span>
          <strong className="text-cyan-400 font-bold text-xs">${unified_recommendation?.final_cost_usd}</strong>
          <span className="text-[9px] text-emerald-400 block">(-${unified_recommendation?.savings_usd} Saved)</span>
        </div>

        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
          <span className="text-slate-400 block text-[9px]">Claim Avoidance</span>
          <strong className="text-purple-400 font-bold text-xs">${claims_evaluation?.potential_loss_usd?.toLocaleString()}</strong>
        </div>
      </div>
    </div>
  );
};
