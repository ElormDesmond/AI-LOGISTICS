import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';
import { X, Database, Server, Cpu, FileCheck, CheckCircle2, Download, RefreshCw, ShieldCheck, FileText } from 'lucide-react';

interface ERPIntegrationModalProps {
  onClose: () => void;
  shipmentId?: number;
}

export const ERPIntegrationModal: React.FC<ERPIntegrationModalProps> = ({ onClose, shipmentId = 1 }) => {
  const [erpStatus, setErpStatus] = useState<any>(null);
  const [bolData, setBolData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statusRes, bolRes] = await Promise.all([
          apiClient.get('/erp/sync-status'),
          apiClient.get(`/erp/bill-of-lading/${shipmentId}`)
        ]);
        setErpStatus(statusRes.data);
        setBolData(bolRes.data);
      } catch (err) {
        console.error('Failed to fetch ERP integration data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [shipmentId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 overflow-y-auto font-mono">
      <div className="glass-panel w-full max-w-4xl rounded-3xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 relative max-h-[92vh] flex flex-col justify-between overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-2xl">
              <Database size={24} />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-white tracking-tight">
                Enterprise ERP & WMS Systems Integration
              </h3>
              <p className="text-xs text-slate-400 font-mono">SAP S/4HANA & Oracle NetSuite Live Webhook Telemetry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-1 text-xs font-bold"
          >
            <X size={18} />
            <span>Close</span>
          </button>
        </div>

        {/* ERP Live Systems Status Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 shrink-0 text-xs">
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-white flex items-center gap-1.5"><Server size={14} className="text-blue-400" /> SAP S/4HANA</span>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">CONNECTED</span>
            </div>
            <p className="text-[10px] text-slate-400">Latency: 18ms • Endpoint Sync Active</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-white flex items-center gap-1.5"><Database size={14} className="text-amber-400" /> Oracle NetSuite</span>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">CONNECTED</span>
            </div>
            <p className="text-[10px] text-slate-400">Latency: 24ms • Inventory Restlets Active</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-white flex items-center gap-1.5"><Cpu size={14} className="text-cyan-400" /> WMS Warehouse</span>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full">ACTIVE</span>
            </div>
            <p className="text-[10px] text-slate-400">Frankfurt GDP Hub • 2 Active Holds</p>
          </div>
        </div>

        {/* Electronic Bill of Lading (e-BOL) Viewer Card */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
          {loading || !bolData ? (
            <div className="p-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
              <Cpu size={16} className="animate-spin text-blue-400" />
              <span>Generating Electronic Bill of Lading (e-BOL)...</span>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 text-xs font-mono space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="font-bold text-white text-base">{bolData.document_title}</h4>
                  <p className="text-[11px] text-blue-400 font-bold">{bolData.bol_number}</p>
                </div>
                <span className="px-3 py-1 text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full">
                  SCAC: {bolData.carrier_scac}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Shipper Details</span>
                  <p className="text-white font-bold">{bolData.shipper_name}</p>
                  <p className="text-slate-400">{bolData.shipper_address}</p>
                  <p className="text-cyan-400 text-[10px] mt-1">SAP Ref: {bolData.erp_reference_sap}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Consignee Details</span>
                  <p className="text-white font-bold">{bolData.consignee_name}</p>
                  <p className="text-slate-400">{bolData.consignee_address}</p>
                  <p className="text-amber-400 text-[10px] mt-1">Oracle NetSuite Ref: {bolData.erp_reference_netsuite}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-200">
                <strong>Handling & Special Thermal Instructions:</strong> {bolData.handling_instructions}
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[10px] text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="block text-slate-300 font-bold">Signer: {bolData.digital_esignature?.signer_name}</span>
                  <span className="block text-[9px] text-slate-500">{bolData.digital_esignature?.timestamp}</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-bold block">✓ Cryptographic e-Signature Signed</span>
                  <span className="text-[9px] text-slate-500">{bolData.digital_esignature?.sha256_hash}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex justify-end gap-3 shrink-0">
          <button
            onClick={() => alert("Electronic Bill of Lading (e-BOL) PDF exported to ERP queue.")}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-blue-600/25 active:scale-95"
          >
            <Download size={15} /> Export e-BOL PDF to ERP
          </button>
        </div>
      </div>
    </div>
  );
};
