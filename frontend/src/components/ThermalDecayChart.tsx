import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';
import { Sun, Thermometer, AlertTriangle, Clock, ShieldAlert, Cpu, Flame } from 'lucide-react';

interface ThermalDecayChartProps {
  shipmentId: number;
}

export const ThermalDecayChart: React.FC<ThermalDecayChartProps> = ({ shipmentId }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchThermalDecay() {
      setLoading(true);
      try {
        const response = await apiClient.get(`/weather/shipment/${shipmentId}/thermal-decay`);
        if (isMounted) setData(response.data);
      } catch (err) {
        console.error('Failed to fetch thermal decay analytics', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchThermalDecay();
    return () => { isMounted = false; };
  }, [shipmentId]);

  if (loading) {
    return (
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-center gap-2">
        <Cpu size={16} className="animate-spin text-amber-400" />
        <span>Calculating 48-Hour Thermal Decay & Weather Solar Impact...</span>
      </div>
    );
  }

  if (!data || !data.thermal_decay) return null;

  const { weather_context, thermal_decay } = data;
  const decayPoints = thermal_decay.decay_points?.slice(0, 12) || []; // Display first 12 hours for compact layout

  return (
    <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-4 font-mono text-xs text-slate-200 my-3 shadow-xl">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg">
            <Sun size={16} />
          </div>
          <div>
            <h4 className="font-bold text-white tracking-wide text-xs">48-Hr Weather & Thermal Decay Analytics</h4>
            <p className="text-[10px] text-slate-400 font-sans">Newton's Cooling Model & Solar Heatwave Forecasting</p>
          </div>
        </div>

        {/* Time To Failure (TTF) Badge */}
        <div className="text-right">
          <span className="text-[9px] text-slate-400 uppercase block">Time-To-Failure</span>
          <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded border font-mono ${
            thermal_decay.time_to_failure_hours && thermal_decay.time_to_failure_hours < 8
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 glow-rose animate-pulse'
              : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
          }`}>
            <Clock size={11} className="inline mr-1" />
            {thermal_decay.ttf_formatted}
          </span>
        </div>
      </div>

      {/* Ambient Weather Alert Badge */}
      <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame size={15} className="text-amber-400 shrink-0" />
          <span className="text-amber-200">
            <strong>{weather_context?.location}:</strong> +{weather_context?.current_temp_c}°C Ambient • {weather_context?.condition}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-bold">UV Index: {weather_context?.solar_uv_index}</span>
      </div>

      {/* 12-Hour Thermal Projection Curve Bars */}
      <div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5 font-bold">
          <span>Forward Hour-by-Hour Package Temp Projection (°C):</span>
          <span className="text-rose-400">Safety Threshold: -20.0°C</span>
        </div>

        <div className="grid grid-cols-6 gap-1.5">
          {decayPoints.map((pt: any) => {
            const isBreach = pt.package_temp_c > -20.0;
            return (
              <div key={pt.hour} className={`p-1.5 rounded-lg border text-center font-mono ${
                isBreach ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'bg-slate-900 border-slate-800 text-cyan-300'
              }`}>
                <span className="block text-[9px] text-slate-500">{pt.time_label}</span>
                <strong className="text-[11px] font-extrabold">{pt.package_temp_c}°C</strong>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
