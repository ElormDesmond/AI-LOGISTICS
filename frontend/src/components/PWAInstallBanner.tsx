import React, { useState, useEffect } from 'react';
import { Smartphone, Wifi, WifiOff, Download } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    // Register ServiceWorker for offline caching
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('ServiceWorker registration skipped:', err);
      });
    }

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
      });
    } else {
      alert("App is ready! On mobile/desktop, use your browser menu to 'Add to Home Screen' or 'Install App'.");
    }
  };

  return (
    <div className="flex items-center gap-2 font-mono text-xs">
      {/* Network Sync Status Badge */}
      <span className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 text-[10px] font-bold ${
        isOnline
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          : 'bg-amber-500/15 text-amber-300 border-amber-500/40 animate-pulse'
      }`}>
        {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
        <span>{isOnline ? 'Online Sync' : 'Offline Cached'}</span>
      </span>

      {/* PWA Mobile App Install Button */}
      <button
        onClick={handleInstallClick}
        className="px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold transition flex items-center gap-1.5 active:scale-95"
        title="Install PharmaShield AI Mobile Control Center App"
      >
        <Smartphone size={13} className="text-cyan-400" />
        <span>Install App</span>
      </button>
    </div>
  );
};
