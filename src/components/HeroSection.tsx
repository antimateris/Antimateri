import React from 'react';
import { 
  ShieldCheck, 
  Coins, 
  Users, 
  Zap, 
  Clock, 
  Lock, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  Sparkles,
  Flame
} from 'lucide-react';
import { SystemSettings } from '../types';

interface HeroSectionProps {
  onOrderClick?: (type?: 'joki_koen' | 'joki_mandor') => void;
  onSelectService?: (type?: 'joki_koen' | 'joki_mandor') => void;
  onTrackClick?: () => void;
  onTrackOrder?: () => void;
  onOpenPriceCatalog?: () => void;
  settings?: SystemSettings;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOrderClick,
  onSelectService,
  onTrackClick,
  onTrackOrder,
  onOpenPriceCatalog,
  settings,
}) => {
  const handleOrder = (type?: 'joki_koen' | 'joki_mandor') => {
    if (onOrderClick) {
      onOrderClick(type);
    } else if (onSelectService) {
      onSelectService(type);
    }
  };

  const handleTrack = () => {
    if (onTrackClick) {
      onTrackClick();
    } else if (onTrackOrder) {
      onTrackOrder();
    }
  };
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 border-b border-zinc-800">
      {/* Background Military Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />
      
      {/* Glow highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 sm:w-[600px] h-48 bg-amber-500/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          
          {/* Tagline Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Spesialis Joki Arena Breakout: Koen & Mandor Raid</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-tactical tracking-tight text-white uppercase leading-none">
            Stash Penuh <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500">Milyaran Koen</span>, Raid Selalu <span className="text-amber-400">Selamat!</span>
          </h1>

          {/* Subtitle */}
          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Solusi joki game Arena Breakout profesional dan anti-minus. Tim pro player siap memanen Koen hingga puluhan juta dan mengawal akun Anda di mode Lockdown, Armory, dan TV Station.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              id="hero-cta-koen"
              onClick={() => handleOrder('joki_koen')}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/25 transition-all hover:scale-105 cursor-pointer"
            >
              <Coins className="w-5 h-5 fill-black text-black" />
              <span>Order Joki Koen</span>
            </button>

            <button
              id="hero-cta-mandor"
              onClick={() => handleOrder('joki_mandor')}
              className="flex items-center space-x-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 text-amber-300 hover:text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-md transition-all hover:scale-105 cursor-pointer"
            >
              <Users className="w-5 h-5 text-amber-400" />
              <span>Order Joki Mandor Raid</span>
            </button>

            <button
              id="hero-cta-track"
              onClick={handleTrack}
              className="flex items-center space-x-1.5 px-4 py-3 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer"
            >
              <Zap className="w-4 h-4 text-blue-400" />
              <span>Cek Status / Resi</span>
            </button>

            {onOpenPriceCatalog && (
              <button
                id="hero-cta-catalog"
                onClick={onOpenPriceCatalog}
                className="flex items-center space-x-1.5 px-4 py-3 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-amber-400 hover:text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer"
              >
                <span>Lihat Katalog</span>
              </button>
            )}
          </div>
        </div>

        {/* Feature Cards Grid (4 Trust Pillars) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-10 pt-4 border-t border-zinc-800/80">
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3.5 sm:p-4 hover:border-amber-500/30 transition-colors">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-zinc-100">100% Anti-Banned</h4>
                <p className="text-[11px] text-zinc-400">Pure manual gameplay pro player</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3.5 sm:p-4 hover:border-amber-500/30 transition-colors">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-zinc-100">Bayar Otomatis</h4>
                <p className="text-[11px] text-zinc-400">QRIS & Semua E-Wallet instan</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3.5 sm:p-4 hover:border-amber-500/30 transition-colors">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-zinc-100">Pelacakan Live</h4>
                <p className="text-[11px] text-zinc-400">Pantau bukti & progres tanpa login</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3.5 sm:p-4 hover:border-amber-500/30 transition-colors">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-zinc-100">Notif WhatsApp</h4>
                <p className="text-[11px] text-zinc-400">Update status pesanan real-time</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
