import React from 'react';
import { useI18n } from '../i18n/i18nContext';
import { Language } from '../i18n/translations';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useI18n();

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'es', label: 'Español', flag: '🇪🇸' }
  ];

  return (
    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-1.5 rounded-2xl text-xs font-mono">
      <Globe size={14} className="text-cyan-400 shrink-0" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="bg-transparent text-slate-200 font-bold text-[11px] focus:outline-none cursor-pointer"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-200">
            {lang.flag} {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
};
