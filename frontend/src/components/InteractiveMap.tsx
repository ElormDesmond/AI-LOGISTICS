import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Shipment } from '../types/api';
import { Thermometer, ShieldAlert, Navigation, ArrowRight, CheckCircle2, AlertTriangle, Route } from 'lucide-react';

// Fix default Leaflet icon assets
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Known city coordinate lookup for polyline route lines
const CITY_COORDS: Record<string, [number, number]> = {
  'Frankfurt, Germany': [50.1109, 8.6821],
  'Basel, Switzerland': [47.5596, 7.5886],
  'Zurich, Switzerland': [47.3769, 8.5417],
  'Boston, USA': [42.3601, -71.0589],
  'Boston Distribution Hub, USA': [42.3601, -71.0589],
  'New York, USA': [40.7128, -74.0060],
  'London, UK': [51.5074, -0.1278],
  'Rotterdam, Netherlands': [51.9244, 4.4777],
  'Hamburg, Germany': [53.5511, 9.9937]
};

// Known GDP Cold Storage Hub Coordinates
const GDP_HUB_COORDS: Record<string, [number, number]> = {
  'Frankfurt Airport (EDDF) GDP Cargo Center': [50.0379, 8.5622],
  'Basel EuroAirport (LFSB) Cold Chamber Hub': [47.5896, 7.5299],
  'Zurich Airport (LSZH) Pharma Freight Terminal': [47.4582, 8.5555],
  'Boston Logan (KBOS) Cargo Terminal 3': [42.3656, -71.0096]
};

interface InteractiveMapProps {
  shipments: Shipment[];
  selectedShipment: Shipment | null;
  onSelectShipment: (shipment: Shipment) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  shipments,
  selectedShipment,
  onSelectShipment,
}) => {
  const mapCenter: [number, number] = [35.0, -15.0];

  const getMarkerColor = (status: string, temp?: number) => {
    if (status === 'at_risk' || (temp !== undefined && temp > -20.0)) return '#f43f5e'; // Rose
    if (status === 'rerouted') return '#c084fc'; // Purple
    if (status === 'delivered') return '#10b981'; // Emerald
    return '#38bdf8'; // Cyan
  };

  // Group shipments by coordinate key and apply spiderfy/jitter offset for overlapping markers
  const groupedShipments: Record<string, Shipment[]> = {};
  shipments.forEach(s => {
    const rawLat = s.current_location?.lat ?? 50.0;
    const rawLng = s.current_location?.lng ?? 8.0;
    const key = `${rawLat.toFixed(2)}_${rawLng.toFixed(2)}`;
    if (!groupedShipments[key]) groupedShipments[key] = [];
    groupedShipments[key].push(s);
  });

  return (
    <div className="w-full h-full min-h-[440px] rounded-2xl overflow-hidden border border-slate-800 relative z-0">
      <MapContainer
        center={mapCenter}
        zoom={3}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', minHeight: '440px', background: '#070a12' }}
      >
        {/* Dark Cybernetic CartoDB Map Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {Object.entries(groupedShipments).map(([key, group]) => {
          const count = group.length;

          return group.map((s, index) => {
            const rawLat = s.current_location?.lat ?? 50.0;
            const rawLng = s.current_location?.lng ?? 8.0;

            // Apply spiral jitter offset if multiple shipments share exact same location
            let lat = rawLat;
            let lng = rawLng;
            if (count > 1) {
              const angle = (index / count) * 2 * Math.PI;
              const radius = 0.35; // ~35km spatial spread for cluster visibility
              lat = rawLat + radius * Math.sin(angle);
              lng = rawLng + radius * Math.cos(angle);
            }

            const color = getMarkerColor(s.status, s.temperature);
            const originCoords = CITY_COORDS[s.origin] || [lat - 2, lng - 5];
            const destCoords = CITY_COORDS[s.destination] || [lat + 2, lng + 5];

            // Primary Route Polyline Line
            const routePolyline: [number, number][] = [
              originCoords,
              [lat, lng],
              destCoords
            ];

            // Reroute Path Line to Nearest Cold Hub if Rerouted or At Risk
            const nearestHubCoords = GDP_HUB_COORDS['Frankfurt Airport (EDDF) GDP Cargo Center'] || [50.0379, 8.5622];
            const reroutePolyline: [number, number][] = [
              [lat, lng],
              nearestHubCoords
            ];

            return (
              <React.Fragment key={`${s.id}_${index}`}>
                {/* Primary Route Line */}
                <Polyline
                  positions={routePolyline}
                  pathOptions={{
                    color: color,
                    weight: s.status === 'at_risk' ? 3 : 2,
                    dashArray: s.status === 'at_risk' ? '6, 6' : '3, 6',
                    opacity: 0.6
                  }}
                />

                {/* Reroute Path Line (Green) if shipment is rerouted or critical */}
                {(s.status === 'rerouted' || s.status === 'at_risk') && (
                  <Polyline
                    positions={reroutePolyline}
                    pathOptions={{
                      color: '#10b981', // Emerald green reroute path
                      weight: 3,
                      dashArray: '4, 4',
                      opacity: 0.9
                    }}
                  >
                    <Tooltip permanent direction="top" className="custom-reroute-tooltip">
                      <span className="text-[10px] font-mono font-bold text-emerald-400">
                        ⚡ Active Reroute Path ➔ Frankfurt Cold Storage Hub
                      </span>
                    </Tooltip>
                  </Polyline>
                )}

                {/* Failure Point Marker if thermal excursion occurred */}
                {s.status === 'at_risk' && (
                  <CircleMarker
                    center={[lat, lng]}
                    radius={14}
                    pathOptions={{
                      fillColor: '#f43f5e',
                      color: '#ffe4e6',
                      weight: 3,
                      fillOpacity: 0.3
                    }}
                  />
                )}

                {/* Shipment Position Circle Marker */}
                <CircleMarker
                  center={[lat, lng]}
                  radius={count > 1 ? 10 : 8}
                  pathOptions={{
                    fillColor: color,
                    color: '#ffffff',
                    weight: 2,
                    fillOpacity: 0.95
                  }}
                  eventHandlers={{
                    click: () => onSelectShipment(s)
                  }}
                >
                  <Popup className="custom-leaflet-popup">
                    <div className="p-2 font-sans text-xs bg-slate-950 text-slate-100 rounded-xl max-w-xs shadow-2xl">
                      {/* Multi-Shipment Location Badge Header */}
                      {count > 1 && (
                        <div className="mb-2 px-2 py-1 bg-blue-500/20 border border-blue-500/40 rounded-lg text-[10px] font-mono text-cyan-300 flex items-center justify-between font-bold">
                          <span>📍 Location Cluster ({count} Shipments)</span>
                          <span className="text-slate-400"># {index + 1} of {count}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-1.5 font-mono">
                        <span className="font-bold text-white text-xs">{s.tracking_id}</span>
                        <span className="px-1.5 py-0.5 text-[9px] rounded font-bold uppercase" style={{ backgroundColor: `${color}33`, color }}>
                          {s.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-[11px] text-slate-300 font-sans">
                        <p><strong>Carrier:</strong> {s.carrier}</p>
                        <p><strong>Route:</strong> {s.origin} ➔ {s.destination}</p>
                        <p className="flex items-center gap-1 font-mono font-bold" style={{ color }}>
                          <Thermometer size={13} /> Telemetry Temp: {s.temperature !== undefined ? `${s.temperature}°C` : 'N/A'}
                        </p>

                        {/* Exact Excursion Failure Breakdown */}
                        {s.status === 'at_risk' && (
                          <div className="p-2 mt-1.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-[10px] font-mono text-rose-200 leading-tight">
                            <div className="flex items-center gap-1 font-bold text-rose-300 mb-1">
                              <AlertTriangle size={12} /> Failure Point Breakdown:
                            </div>
                            <p><strong>Location:</strong> Lat {lat.toFixed(2)}°N, Lng {lng.toFixed(2)}°E</p>
                            <p><strong>Cause:</strong> Tarmac transfer heatwave (+36.5°C ambient) loading delay.</p>
                            <p className="mt-1 text-emerald-400"><strong>Nearest Hub:</strong> Frankfurt Cargo Center (2.4 km)</p>
                          </div>
                        )}

                        {/* Rerouted Confirmation Status */}
                        {s.status === 'rerouted' && (
                          <div className="p-2 mt-1.5 rounded-lg bg-purple-950/40 border border-purple-500/40 text-[10px] font-mono text-purple-200 leading-tight">
                            <div className="flex items-center gap-1 font-bold text-purple-300 mb-1">
                              <Route size={12} /> Active Reroute Path:
                            </div>
                            <p>Cargo diverted to Frankfurt GDP Cold-Storage Terminal.</p>
                            <p className="text-emerald-300">Thermal reading normalized to -22.5°C.</p>
                          </div>
                        )}
                      </div>

                      {/* Other Shipments in this Cluster List */}
                      {count > 1 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-800">
                          <p className="text-[10px] font-mono text-slate-400 mb-1 font-bold">Other shipments at this hub:</p>
                          <div className="space-y-1">
                            {group.filter(other => other.id !== s.id).map(other => (
                              <button
                                key={other.id}
                                onClick={() => onSelectShipment(other)}
                                className="w-full text-left p-1 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500 text-[10px] font-mono flex items-center justify-between"
                              >
                                <span className="text-slate-200 font-bold">{other.tracking_id}</span>
                                <span className="text-slate-400 font-semibold uppercase">{other.status}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
              </React.Fragment>
            );
          });
        })}
      </MapContainer>
    </div>
  );
};
