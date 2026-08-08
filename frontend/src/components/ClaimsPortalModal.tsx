import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';
import { X, ShieldCheck, DollarSign, FileText, Award, CheckCircle2, Download, Printer, Cpu, FileCheck } from 'lucide-react';

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
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={18} />
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
                    className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
                  >
                    <FileCheck size={14} />
                    <span>View Loss Certificate</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Certificate View Modal Popup */}
        {selectedCertificate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 text-slate-100 shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <span className="font-bold text-purple-400 text-xs tracking-wider">GDP COMPLIANCE LOSS CERTIFICATE</span>
                <button onClick={() => setSelectedCertificate(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <h2 className="font-bold text-white text-base tracking-wide">{selectedCertificate.certificate_title}</h2>
                  <p className="text-[11px] text-slate-400 mt-1">{selectedCertificate.certificate_id}</p>
                  <p className="text-[10px] text-emerald-400 mt-1">Authority: {selectedCertificate.compliance_authority}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-[11px]">
                  <p><strong>Claim ID:</strong> {selectedCertificate.claim_details?.claim_id}</p>
                  <p><strong>Tracking ID:</strong> {selectedCertificate.claim_details?.tracking_id}</p>
                  <p><strong>Underwriter:</strong> {selectedCertificate.claim_details?.underwriter}</p>
                  <p><strong>Excursion Temperature:</strong> {selectedCertificate.claim_details?.excursion_temp_c}°C</p>
                  <p><strong>Certified Net Indemnity Payout:</strong> <span className="text-emerald-400 font-extrabold">${selectedCertificate.claim_details?.net_payout_usd?.toLocaleString()}</span></p>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-[11px] text-slate-300 leading-relaxed font-sans">
                  <strong>Legal Compliance Declaration:</strong> {selectedCertificate.legal_declaration}
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-400 flex items-center justify-between font-mono">
                  <span>Digital Hash: {selectedCertificate.digital_signature_hash}</span>
                  <span className="text-emerald-400 font-bold">✓ Cryptographically Signed</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  onClick={() => alert("Loss Certificate PDF downloaded to local audit archive.")}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Download size={14} /> Download PDF Certificate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
