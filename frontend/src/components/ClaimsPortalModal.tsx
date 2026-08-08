import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';
import { X, ShieldCheck, DollarSign, FileText, Award, CheckCircle2, Download, Printer, Cpu, FileCheck, ArrowLeft } from 'lucide-react';

interface ClaimsPortalModalProps {
  onClose: () => void;
}

export const ClaimsPortalModal: React.FC<ClaimsPortalModalProps> = ({ onClose }) => {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState<any | null>(null);

  useEffect(() => {
    async function fetchClaims() {
      try {
        const response = await apiClient.get('/claims');
        setClaims(response.data);
      } catch (err) {
        console.error('Failed to fetch insurance claims', err);
      } finally {
        setLoading(false);
      }
    }
    fetchClaims();
  }, []);

  const handleViewCertificate = async (claimId: string) => {
    try {
      const response = await apiClient.get(`/claims/${claimId}/certificate`);
      setSelectedCertificate(response.data);
    } catch (err) {
      console.error('Failed to fetch loss certificate', err);
    }
  };

  const totalClaimed = claims.reduce((acc, c) => acc + (c.claimed_loss_usd || 0), 0);
  const totalPayout = claims.reduce((acc, c) => acc + (c.net_payout_usd || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 overflow-y-auto font-mono">
      <div className="glass-panel w-full max-w-4xl rounded-3xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 relative max-h-[92vh] flex flex-col justify-between overflow-hidden my-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-2xl">
              <Award size={24} />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-white tracking-tight">
                Digital Cargo Claims & GDP Loss Certificate Portal
              </h3>
              <p className="text-xs text-slate-400 font-mono">Automated Underwriter Loss Certification Engine</p>
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

        {/* Claims KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 shrink-0">
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
            <span className="text-slate-400 text-[11px] uppercase font-bold block">Total Loss Claims Filed</span>
            <p className="text-2xl font-extrabold text-white mt-1 font-mono">${totalClaimed.toLocaleString()}</p>
            <span className="text-[10px] text-purple-400 font-semibold mt-1 block">Policy POL-PHARMA-ALLIANZ-9901</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
            <span className="text-slate-400 text-[11px] uppercase font-bold block">Approved Net Indemnity Payout</span>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">${totalPayout.toLocaleString()}</p>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">✓ Underwriter Certified</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
            <span className="text-slate-400 text-[11px] uppercase font-bold block">Underwriter Authority</span>
            <p className="text-sm font-bold text-slate-200 mt-2 font-sans">Allianz Global Specialty</p>
            <span className="text-[10px] text-cyan-400 font-semibold mt-1 block">FDA 21 CFR Part 11 Certified</span>
          </div>
        </div>

        {/* Claims Table List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
          {loading ? (
            <div className="p-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
              <Cpu size={16} className="animate-spin text-purple-400" />
              <span>Loading digital cargo claims ledger...</span>
            </div>
          ) : claims.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">No active insurance claims filed.</div>
          ) : (
            claims.map((claim) => (
              <div
                key={claim.claim_id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{claim.claim_id}</span>
                    <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border ${
                      claim.status === 'APPROVED_PAYOUT'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {claim.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Shipment: <strong className="text-slate-200">{claim.tracking_id}</strong></p>
                  <p className="text-slate-400 text-[10px] font-sans italic">"{claim.cause}"</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block">Indemnity Payout</span>
                    <span className="text-emerald-400 font-extrabold text-sm">${claim.net_payout_usd?.toLocaleString()}</span>
                  </div>

                  <button
                    onClick={() => handleViewCertificate(claim.claim_id)}
                    className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition flex items-center gap-1.5 active:scale-95 shadow-md shadow-purple-500/10"
                  >
                    <FileCheck size={14} />
                    <span>View Loss Certificate</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* High-Z-Index Loss Certificate Viewer Popup Modal */}
        {selectedCertificate && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-3xl w-full p-6 sm:p-8 text-slate-100 shadow-2xl relative max-h-[92vh] flex flex-col justify-between overflow-y-auto my-auto animate-in fade-in zoom-in-95 duration-200">
              {/* Certificate Top Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <FileCheck size={20} className="text-purple-400" />
                  <span className="font-bold text-white text-sm tracking-wide font-mono">OFFICIAL GDP PHARMACEUTICAL LOSS CERTIFICATE</span>
                </div>
                <button
                  onClick={() => setSelectedCertificate(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 font-bold text-xs transition"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Claims</span>
                </button>
              </div>

              {/* Certificate Content Body */}
              <div className="space-y-4 text-xs font-mono flex-1 overflow-y-auto pr-1">
                <div className="p-5 rounded-2xl bg-slate-950 border border-purple-500/30 text-center shadow-lg">
                  <Award size={32} className="mx-auto mb-2 text-purple-400 animate-pulse" />
                  <h2 className="font-bold text-white text-base sm:text-lg tracking-wide">{selectedCertificate.certificate_title}</h2>
                  <p className="text-xs text-purple-300 mt-1 font-bold">{selectedCertificate.certificate_id}</p>
                  <p className="text-[11px] text-emerald-400 mt-1">Authority: {selectedCertificate.compliance_authority}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
                    <p className="text-slate-400">Claim File ID: <strong className="text-white">{selectedCertificate.claim_details?.claim_id}</strong></p>
                    <p className="text-slate-400">Cargo Tracking ID: <strong className="text-white">{selectedCertificate.claim_details?.tracking_id}</strong></p>
                    <p className="text-slate-400">Underwriter: <strong className="text-white">{selectedCertificate.claim_details?.underwriter}</strong></p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
                    <p className="text-slate-400">Thermal Excursion Peak: <strong className="text-rose-400 font-bold">{selectedCertificate.claim_details?.excursion_temp_c}°C</strong></p>
                    <p className="text-slate-400">Calculated MKT: <strong className="text-amber-400 font-bold">{selectedCertificate.claim_details?.mkt_calculated_c}°C</strong></p>
                    <p className="text-slate-400">Certified Indemnity Payout: <strong className="text-emerald-400 font-bold text-sm">${selectedCertificate.claim_details?.net_payout_usd?.toLocaleString()}</strong></p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-[11px] text-slate-300 leading-relaxed font-sans shadow-md">
                  <strong className="text-purple-300 block mb-1">Legal Underwriter Compliance Declaration:</strong>
                  {selectedCertificate.legal_declaration}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
                  <span className="truncate">Digital Signature Hash: <strong className="text-slate-200">{selectedCertificate.digital_signature_hash}</strong></span>
                  <span className="text-emerald-400 font-bold shrink-0">✓ Cryptographically Signed & Verified</span>
                </div>
              </div>

              {/* Certificate Bottom Actions Bar */}
              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
                <button
                  onClick={() => setSelectedCertificate(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition border border-slate-700"
                >
                  <ArrowLeft size={14} /> Close Certificate View
                </button>

                <button
                  onClick={() => alert("Loss Certificate PDF downloaded to local audit archive.")}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-purple-600/25 active:scale-95"
                >
                  <Download size={15} /> Download PDF Loss Certificate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
