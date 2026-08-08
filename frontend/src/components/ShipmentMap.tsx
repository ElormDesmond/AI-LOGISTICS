import React from 'react';
import { Shipment } from '../types/api';
import { MapPin, Navigation, Thermometer, AlertCircle } from 'lucide-react';

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
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'at_risk': return 'bg-rose-500 border-rose-300 text-rose-500 shadow-rose-500/50';
      case 'delayed': return 'bg-amber-500 border-amber-300 text-amber-500 shadow-amber-500/50';
      case 'delivered': return 'bg-emerald-500 border-emerald-300 text-emerald-500 shadow-emerald-500/50';
      default: return 'bg-blue-500 border-blue-300 text-blue-500 shadow-blue-500/50';
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 h-full flex flex-col relative overflow-hidden">
      {/* Map Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 z-10">
        <div className="flex items-center gap-2">
          <Navigation className="text-blue-400" size={18} />
          <h3 className="text-md font-bold text-white">Live Cold-Chain Telemetry Map</h3>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Critical</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Delayed</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Normal</span>
        </div>
      </div>

      {/* Visual Simulation World Grid Container */}
      <div className="flex-1 bg-slate-950/90 rounded-xl border border-slate-800/80 relative p-4 flex flex-col justify-between overflow-hidden">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30"></div>

        {/* Global Nodes */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-auto">
          {shipments.map((s) => {
            const isSelected = selectedShipment?.id === s.id;
            return (
              <div
                key={s.id}
                onClick={() => onSelectShipment(s)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/20 scale-[1.02]'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full border shadow-lg ${getStatusColor(s.status)}`}></span>
                    <span className="text-xs font-mono font-bold text-white">{s.tracking_id}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">{s.carrier}</span>
                </div>

                <div className="mt-2 text-[11px] text-slate-300 flex justify-between items-center">
                  <span>{s.origin} → {s.destination}</span>
                  <span className={`font-mono font-bold ${s.temperature && s.temperature > -20 ? 'text-rose-400' : 'text-cyan-400'}`}>
                    {s.temperature !== undefined ? `${s.temperature}°C` : 'N/A'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative z-10 text-[11px] text-slate-500 font-mono flex justify-between items-center pt-2">
          <span>PostGIS Telemetry Feed Active</span>
          <span>5-Second Auto Refresh</span>
        </div>
      </div>
    </div>
  );
};
