import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, AlertTriangle } from 'lucide-react';
import { useI18n } from '../i18n/i18nContext';

interface AcousticAlarmBannerProps {
  hasActiveExcursion: boolean;
  excursionTrackingId?: string;
  excursionTemp?: number;
}

export const AcousticAlarmBanner: React.FC<AcousticAlarmBannerProps> = ({
  hasActiveExcursion,
  excursionTrackingId,
  excursionTemp
}) => {
  const { t } = useI18n();
  const [muted, setMuted] = useState(false);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  useEffect(() => {
    // Request desktop Web Push notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (hasActiveExcursion && !muted) {
      // Trigger Web Audio API Emergency Siren
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioCtx(ctx);

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } catch (err) {
        console.warn('Web Audio playback blocked until user interaction', err);
      }

      // Trigger Desktop Web Push Notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`🚨 ${t('critical_alarm_title')}: ${excursionTrackingId}`, {
          body: `Shipment ${excursionTrackingId} reached +${excursionTemp}°C. Action approval required.`,
          icon: '/favicon.ico'
        });
      }
    }
  }, [hasActiveExcursion, excursionTrackingId, excursionTemp, muted, t]);

  if (!hasActiveExcursion) return null;

  return (
    <div className="w-full bg-rose-500/20 border border-rose-500/50 p-3 rounded-2xl mb-4 text-xs font-mono text-rose-200 flex items-center justify-between shadow-lg shadow-rose-500/10 animate-pulse">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 bg-rose-500/30 text-rose-300 rounded-lg">
          <AlertTriangle size={18} className="animate-bounce" />
        </div>
        <div>
          <strong className="text-white font-bold block text-xs">
            {t('critical_alarm_title')}
          </strong>
          <span className="text-rose-300 text-[11px]">
            Shipment <strong>{excursionTrackingId}</strong> breached thermal threshold at +{excursionTemp}°C.
          </span>
        </div>
      </div>

      <button
        onClick={() => setMuted(!muted)}
        className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition ${
          muted ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-rose-500/30 border-rose-500/60 text-white glow-rose'
        }`}
      >
        {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        <span>{muted ? t('alarm_muted') : t('acoustic_siren_on')}</span>
      </button>
    </div>
  );
};
