import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../utils/api';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff, Activity, Shield, CheckCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@pharma.com');
  const [password, setPassword] = useState('SecurePassword123!');
  const [role, setRole] = useState<'ADMIN' | 'OPERATOR' | 'AUDITOR'>('ADMIN');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await apiClient.post<{ access_token: string }>('/auth/login', {
        email,
        password,
        company_id: 1,
        role: role.toLowerCase()
      });
      login(response.data.access_token);
      navigate('/');
    } catch (err: any) {
      if (err.response?.data?.detail) {
        setError(typeof err.response.data.detail === 'string' ? err.response.data.detail : 'Authentication failed');
      } else {
        setError('Authentication failed. Verify backend service connection.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none animate-pulse-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

      {/* Main Glassmorphic Login Container */}
      <div className="glass-panel w-full max-w-lg p-8 sm:p-10 rounded-3xl border border-slate-800/80 shadow-2xl relative z-10">
        
        {/* Top Branding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/30 text-cyan-400 rounded-2xl mb-4 shadow-lg shadow-blue-500/10">
            <ShieldCheck size={36} />
          </div>
          <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">
            PharmaShield <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">AI</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">
            Autonomous Cold-Chain Orchestration & Risk Mitigation Center
          </p>
        </div>

        {/* Error Alert Display */}
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} className="text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Element */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selection Tabs */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
              Access Role Context
            </label>
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl">
              {(['ADMIN', 'OPERATOR', 'AUDITOR'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl transition-all ${
                    role === r
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {r === 'ADMIN' ? 'Admin' : r === 'OPERATOR' ? 'Operator' : 'Auditor'}
                </button>
              ))}
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
              Operator Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-500" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@pharma.com"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition font-sans"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
              Security Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-500" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-3 pl-11 pr-11 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2.5 transition shadow-lg shadow-blue-600/30 hover:shadow-cyan-500/25 active:scale-[0.99]"
          >
            {submitting ? (
              <>
                <Activity size={18} className="animate-spin text-cyan-200" />
                <span>Authenticating JWT Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to Control Center</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Regulatory Compliance Badges */}
        <div className="mt-8 border-t border-slate-800/80 pt-5">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle size={12} /> FDA 21 CFR Part 11 Validated
            </span>
            <span className="flex items-center gap-1 text-cyan-400">
              <Shield size={12} /> SOC 2 Type II
            </span>
            <span className="text-slate-400">
              GxP Compliant
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
