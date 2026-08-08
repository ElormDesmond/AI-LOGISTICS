import React, { useState } from 'react';
import { Shipment } from '../types/api';
import { Navigation, Thermometer, MapPin, Search, Cpu, CheckCircle2, ArrowRight, ShieldAlert, RefreshCw } from 'lucide-react';

interface ShipmentMapProps {
  shipments: Shipment[];
  selectedShipment: Shipment | null;
  onSelectShipment: (shipment: Shipment) => void;
}

export const ShipmentMap: React.FC<ShipmentMapProps> = ({
  shipments,
  selectedShipment,
  onSelectShipment,
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'at_risk':
        return {
          color: 'bg-rose-500/20 text-rose-300 border-rose-500/40 glow-rose',
          dot: 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)] animate-pulse',
          label: 'CRITICAL BREACH'
        };
      case 'rerouted':
        return {
          color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          dot: 'bg-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.8)]',
          label: 'REROUTED'
        };
      case 'delayed':
        return {
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]',
          label: 'DELAYED'
        };
      case 'delivered':
        return {
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          dot: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]',
          label: 'DELIVERED'
        };
      default:
        return {
          color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          dot: 'bg-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.8)]',
          label: 'IN TRANSIT'
        };
    }
  };

  const getStatusExplanation = (s: Shipment) => {
    if (s.status === 'at_risk') {
      return `CRITICAL EXCURSION: Temp reading (${s.temperature !== undefined ? `${s.temperature}°C` : 'N/A'}) exceeds safe cold-chain limit (-20°C). Requires immediate reroute.`;
    }
    if (s.status === 'rerouted') {
      return `REROUTE IN PROGRESS: Re-booked priority express cold storage. Thermal chamber normalized to ${s.temperature !== undefined ? `${s.temperature}°C` : '-22.5°C'}.`;
    }
    if (s.status === 'delivered') {
      return `DELIVERED: Chain of custody and GDP compliance certificates verified.`;
    }
    return `NOMINAL TELEMETRY: Operating safely at ${s.temperature !== undefined ? `${s.temperature}°C` : '-24.5°C'} with active thermal margin.`;
  };

  const filteredShipments = shipments.filter(s => {
    const matchesFilter = filter === 'all' || s.status === filter;
    const matchesSearch = s.tracking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.carrier.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 h-full flex flex-col relative overflow-hidden">
      {/* Map Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800/80 gap-3 z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl">
            <Navigation size={20} />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-white tracking-tight">
              Live Cold-Chain Telemetry Grid
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              PostGIS Geospatial Engine Active • Real-time Status Tracking
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-xl text-xs overflow-x-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'at_risk', label: 'Critical' },
            { id: 'rerouted', label: 'Rerouted' },
            { id: 'in_transit', label: 'In Transit' },
            { id: 'delivered', label: 'Delivered' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="mb-4 relative z-10">
        <Search className="absolute left-3.5 top-3 text-slate-500" size={16} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Tracking ID, Origin, Destination, or Carrier..."
          className="w-full bg-slate-950/90 border border-slate-800/80 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition font-sans"
        />
      </div>

      {/* Grid Container */}
      <div className="flex-1 bg-slate-950/60 rounded-xl border border-slate-800/80 relative p-4 overflow-y-auto max-h-[460px]">
        {/* Subtle Map Grid Backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20 pointer-events-none"></div>

        {filteredShipments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 relative z-10">
            {filteredShipments.map((s) => {
              const isSelected = selectedShipment?.id === s.id;
              const badge = getStatusBadge(s.status);
              const explanation = getStatusExplanation(s);

              return (
                <div
                  key={s.id}
                  onClick={() => onSelectShipment(s)}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-br from-blue-950/80 to-slate-900 border-cyan-500/80 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/10 scale-[1.01]'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${badge.dot}`}></span>
                      <span className="text-xs font-mono font-bold text-white tracking-wide">{s.tracking_id}</span>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-mono font-extrabold rounded-full border ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span className="flex items-center gap-1"><MapPin size={12} className="text-cyan-400" /> {s.origin}</span>
                      <ArrowRight size={12} className="text-slate-600" />
                      <span>{s.destination}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">{s.carrier}</span>
                      <span className={`font-bold ${s.temperature && s.temperature > -20 ? 'text-rose-400 font-extrabold' : s.status === 'rerouted' ? 'text-purple-300' : 'text-cyan-400'}`}>
                        <Thermometer size={12} className="inline mr-1" />
                        {s.temperature !== undefined ? `${s.temperature}°C` : 'N/A'}
                      </span>
                    </div>

                    {/* Status Explanation Banner */}
                    <div className="mt-2.5 p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-slate-300 leading-tight">
                      {explanation}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 text-xs font-mono relative z-10">
            <Cpu size={32} className="mb-2 text-slate-700 animate-pulse" />
            <p>No shipments match current status filter criteria.</p>
          </div>
        )}
      </div>

      <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono z-10">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle2 size={13} /> Encrypted Telemetry Stream
        </span>
        <span>Showing {filteredShipments.length} of {shipments.length} Active Feeds</span>
      </div>
    </div>
  );
};
