import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Wrench, 
  Clock, 
  MessageCircle, 
  Search, 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  Headphones
} from 'lucide-react';
import { SystemSettings } from '../types';
import { getWhatsAppDirectUrl } from '../utils/helpers';

interface MaintenanceScreenProps {
  settings: SystemSettings;
  onOpenAdminLogin: () => void;
  onTrackOrder?: (query: string) => void;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({
  settings,
  onOpenAdminLogin,
  onTrackOrder
}) => {
  const [invoiceQuery, setInvoiceQuery] = useState('');
  const [showTrackModal, setShowTrackModal] = useState(false);

  const csUrl = getWhatsAppDirectUrl(
    settings.whatsappCSNumber,
    `Halo CS ${settings.storeName}, saya pengunjung website. Saya ingin menanyakan estimasi pemeliharaan server atau bantuan pesanan saya.`
  );

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceQuery.trim()) return;
    if (onTrackOrder) {
      onTrackOrder(invoiceQuery.trim());
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-amber-500 selection:text-black">
      {/* Tactical Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b18_1px,transparent_1px),linear-gradient(to_bottom,#18181b18_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Ambient Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[540px] h-96 sm:h-[540px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-72 h-72 bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Bar Header */}
      <header className="relative z-10 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-tactical font-black text-sm shadow-md">
            BO
          </div>
          <div>
            <span className="font-tactical font-black text-sm sm:text-base tracking-wider text-white">
              {settings.storeName.toUpperCase()}
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30">
              SYSTEM MAINTENANCE
            </span>
          </div>
        </div>

        {/* Superadmin Login Shortcut */}
        <button
          type="button"
          onClick={onOpenAdminLogin}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 hover:border-amber-500/40 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
        >
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span>Login Staff / Admin</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-2xl bg-gradient-to-b from-zinc-900/95 via-zinc-900/90 to-zinc-950/95 border border-amber-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-black/80 backdrop-blur-xl text-center space-y-6">
          
          {/* Animated Tactical Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-bold font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span>PEMELIHARAAN SISTEM TERJADWAL</span>
          </div>

          {/* Central Icon Graphics */}
          <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-3xl bg-amber-500/20 blur-xl animate-pulse" />
            <div className="relative w-full h-full rounded-3xl bg-zinc-950 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-inner">
              <Wrench className="w-10 h-10 sm:w-12 sm:h-12 animate-bounce" style={{ animationDuration: '2.5s' }} />
            </div>
          </div>

          {/* Title & Message */}
          <div className="space-y-3">
            <h1 className="font-tactical text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-wide uppercase">
              {settings.maintenanceTitle || 'PEMELIHARAAN SISTEM SEDANG BERLANGSUNG'}
            </h1>
            
            <p className="text-sm sm:text-base text-zinc-300 max-w-lg mx-auto leading-relaxed">
              {settings.maintenanceMessage || 
                'Kami sedang melakukan optimasi server dan pembaruan sistem antrean joki Arena Breakout. Pembuatan pesanan baru dihentikan sementara demi keamanan transaksi.'}
            </p>
          </div>

          {/* Estimated Time Badge */}
          {settings.maintenanceEstimatedEnd && (
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-xs sm:text-sm text-zinc-300 font-medium">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{settings.maintenanceEstimatedEnd}</span>
            </div>
          )}

          {/* Status Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
            <div className="p-3.5 bg-zinc-950/70 border border-zinc-800 rounded-2xl flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-white block">Order Sedang Jalan Tetap Aman</span>
                <span className="text-zinc-400">Joki yang sedang raid di Kamona tetap diproses sampai target tuntas.</span>
              </div>
            </div>

            <div className="p-3.5 bg-zinc-950/70 border border-zinc-800 rounded-2xl flex items-start space-x-3">
              <Headphones className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-white block">CS WhatsApp Selalu Siaga</span>
                <span className="text-zinc-400">Jam operasional: {settings.csWorkingHours}</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-zinc-800/80">
            {/* Contact CS WhatsApp Button */}
            <a
              href={csUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-tactical font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-green-950/50 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Hubungi CS WhatsApp</span>
            </a>

            {/* Quick Invoice Track Toggle */}
            <button
              type="button"
              onClick={() => setShowTrackModal(!showTrackModal)}
              className="w-full sm:w-auto px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-tactical font-bold text-xs uppercase tracking-wider rounded-xl border border-zinc-700 hover:border-amber-500/40 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Search className="w-4 h-4 text-amber-400" />
              <span>{showTrackModal ? 'Tutup Cek Resi' : 'Lacak Status Resi Aktif'}</span>
            </button>
          </div>

          {/* Collapsible Track Form */}
          {showTrackModal && (
            <form onSubmit={handleTrackSubmit} className="pt-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 bg-zinc-950 rounded-2xl border border-amber-500/30 space-y-3">
                <span className="text-xs text-zinc-400 block text-left font-medium">
                  Sudah punya Invoice pengerjaan sebelumnya? Masukkan nomor invoice atau WhatsApp:
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={invoiceQuery}
                    onChange={(e) => setInvoiceQuery(e.target.value)}
                    placeholder="Contoh: ABO-2026-9821 atau 08123456789"
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-tactical font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Lacak
                  </button>
                </div>
              </div>
            </form>
          )}

        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-zinc-500 border-t border-zinc-900">
        <p>© 2026 {settings.storeName}. All Tactical Operations Reserved.</p>
      </footer>
    </div>
  );
};
