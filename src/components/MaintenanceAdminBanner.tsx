import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Wrench, 
  LayoutDashboard,
  Eye
} from 'lucide-react';
import { SystemSettings } from '../types';

interface MaintenanceAdminBannerProps {
  settings: SystemSettings;
  onOpenAdminPortal: () => void;
}

export const MaintenanceAdminBanner: React.FC<MaintenanceAdminBannerProps> = ({
  settings,
  onOpenAdminPortal
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (!settings.maintenanceMode || isDismissed) {
    return null;
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom duration-300">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="flex items-center space-x-2 px-3.5 py-2 bg-rose-600/95 hover:bg-rose-500 text-white font-tactical font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-rose-950/60 border border-rose-400/50 backdrop-blur-md transition-all cursor-pointer hover:scale-105"
          title="Klik untuk Buka Panel Maintenance"
        >
          <Wrench className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
          <span>⚠️ Maintenance Aktif (Preview Admin)</span>
          <ChevronUp className="w-3.5 h-3.5 text-rose-200" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm sm:max-w-md w-full px-3 sm:px-0 animate-in slide-in-from-bottom duration-300">
      <div className="bg-zinc-900/95 border-2 border-rose-500/80 rounded-2xl p-3.5 sm:p-4 shadow-2xl shadow-black/80 backdrop-blur-xl space-y-2.5">
        
        {/* Header with Minimize & Close */}
        <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
            </span>
            <span className="font-tactical font-black text-xs uppercase tracking-wider text-rose-400">
              MODE MAINTENANCE AKTIF
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Kecilkan / Minimize"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-1 text-zinc-400 hover:text-rose-400 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Tutup Widget"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message */}
        <p className="text-[11px] sm:text-xs text-zinc-300 leading-relaxed">
          Pengunjung publik saat ini dialihkan ke <span className="text-amber-300 font-semibold">Layar Pemeliharaan</span>. Anda login sebagai Superadmin/Admin dan dapat leluasa menguji transaksi, memesan, serta melihat website.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between pt-1 gap-2">
          <button
            type="button"
            onClick={onOpenAdminPortal}
            className="flex-1 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-tactical font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Ke Portal Admin</span>
          </button>
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-[11px] rounded-xl border border-zinc-700 transition-colors cursor-pointer"
          >
            Kecilkan
          </button>
        </div>

      </div>
    </div>
  );
};
