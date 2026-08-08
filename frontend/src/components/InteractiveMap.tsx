import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Shipment } from '../types/api';
import { Thermometer, ShieldAlert, Navigation, ArrowRight, CheckCircle2 } from 'lucide-react';

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

        {shipments.map((s) => {
          const lat = s.current_location?.lat ?? 50.0;
          const lng = s.current_location?.lng ?? 8.0;
          const color = getMarkerColor(s.status, s.temperature);

          const originCoords = CITY_COORDS[s.origin] || [lat - 2, lng - 5];
          const destCoords = CITY_COORDS[s.destination] || [lat + 2, lng + 5];

          const routePolyline: [number, number][] = [
            originCoords,
            [lat, lng],
            destCoords
          ];

          return (
            <React.Fragment key={s.id}>
              {/* Route Polyline Line */}
              <Polyline
                positions={routePolyline}
                pathOptions={{
                  color: color,
                  weight: s.status === 'at_risk' ? 3 : 2,
                  dashArray: s.status === 'at_risk' ? '6, 6' : '3, 6',
                  opacity: 0.7
                }}
              />

              {/* Pulsing Node Marker */}
              <CircleMarker
                center={[lat, lng]}
                radius={s.status === 'at_risk' ? 10 : 8}
                pathOptions={{
                  fillColor: color,
                  color: '#ffffff',
                  weight: 2,
                  fillOpacity: 0.9
                }}
                eventHandlers={{
                  click: () => onSelectShipment(s)
                }}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-1 font-sans text-xs bg-slate-950 text-slate-100 rounded-xl max-w-xs">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1 mb-1 font-mono">
                      <span className="font-bold text-white">{s.tracking_id}</span>
                      <span className="px-1.5 py-0.5 text-[9px] rounded font-bold uppercase" style={{ backgroundColor: `${color}33`, color }}>
                        {s.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-300">
                      <p><strong>Carrier:</strong> {s.carrier}</p>
                      <p><strong>Route:</strong> {s.origin} ➔ {s.destination}</p>
                      <p className="flex items-center gap-1 font-mono font-bold" style={{ color }}>
                        <Thermometer size={12} /> {s.temperature !== undefined ? `${s.temperature}°C` : 'N/A'}
                      </p>
                      {s.status === 'at_risk' && (
                        <div className="p-1.5 mt-1 rounded bg-rose-500/10 border border-rose-500/30 text-[10px] text-rose-300">
                          <strong>Failure Cause:</strong> Tarmac transfer heatwave delay (+36.5°C ambient). Nearest Hub: Frankfurt GDP Center (2.4 km).
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};
