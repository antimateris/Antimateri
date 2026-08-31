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
    <div className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100/60 border-b border-slate-200">
      {/* Background Military Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
      
      {/* Glow highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 sm:w-[600px] h-48 bg-amber-400/10 blur-[90px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          
          {/* Tagline Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold tracking-wide shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Spesialis Joki Arena Breakout: Koen & Mandor Raid</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-tactical tracking-tight text-slate-900 uppercase leading-none">
            Stash Penuh <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700">Milyaran Koen</span>, Raid Selalu <span className="text-amber-600">Selamat!</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
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
              className="flex items-center space-x-2 px-6 py-3 bg-white hover:bg-slate-50 border-2 border-amber-500 text-amber-950 hover:text-amber-900 font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-sm transition-all hover:scale-105 cursor-pointer"
            >
              <Users className="w-5 h-5 text-amber-600" />
              <span>Order Joki Mandor Raid</span>
            </button>

            <button
              id="hero-cta-track"
              onClick={handleTrack}
              className="flex items-center space-x-1.5 px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 font-semibold text-sm rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <Zap className="w-4 h-4 text-blue-600" />
              <span>Cek Status / Resi</span>
            </button>

            {onOpenPriceCatalog && (
              <button
                id="hero-cta-catalog"
                onClick={onOpenPriceCatalog}
                className="flex items-center space-x-1.5 px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-amber-800 hover:text-amber-900 font-semibold text-sm rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <span>Lihat Katalog</span>
              </button>
            )}
          </div>
        </div>

        {/* Feature Cards Grid (4 Trust Pillars) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-10 pt-4 border-t border-slate-200">
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 hover:border-amber-400 transition-colors shadow-xs">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">100% Anti-Banned</h4>
                <p className="text-[11px] text-slate-500">Pure manual gameplay pro player</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 hover:border-amber-400 transition-colors shadow-xs">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Bayar Otomatis</h4>
                <p className="text-[11px] text-slate-500">QRIS & Semua E-Wallet instan</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 hover:border-amber-400 transition-colors shadow-xs">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Pelacakan Live</h4>
                <p className="text-[11px] text-slate-500">Pantau bukti & progres tanpa login</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 hover:border-amber-400 transition-colors shadow-xs">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Notif WhatsApp</h4>
                <p className="text-[11px] text-slate-500">Update status pesanan real-time</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
