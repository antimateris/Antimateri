import React from 'react';
import { 
  Coins, 
  Users, 
  ShieldCheck, 
  Zap, 
  Check, 
  Sparkles, 
  Flame, 
  Clock, 
  Award,
  ArrowRight
} from 'lucide-react';
import { PriceConfig } from '../types';
import { formatRupiah } from '../utils/helpers';

interface PriceCatalogPageProps {
  priceConfig: PriceConfig;
  onSelectService?: (service: 'joki_koen' | 'joki_mandor', pkgId?: string) => void;
  onSelectPackage?: (service: 'joki_koen' | 'joki_mandor', pkgId?: string) => void;
}

export const PriceCatalogPage: React.FC<PriceCatalogPageProps> = ({
  priceConfig,
  onSelectService,
  onSelectPackage,
}) => {
  const handleSelect = (service: 'joki_koen' | 'joki_mandor', pkgId?: string) => {
    if (onSelectService) {
      onSelectService(service, pkgId);
    } else if (onSelectPackage) {
      onSelectPackage(service, pkgId);
    }
  };
  return (
    <div id="price-catalog-container" className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>Daftar Harga Resmi & Garansi Anti-Minus</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black font-tactical text-white uppercase tracking-wider">
          KATALOG LAYANAN JOKI ARENA BREAKOUT
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Hanya melayani spesialis <strong className="text-amber-400">Joki Koen</strong> dan <strong className="text-amber-400">Joki Mandor Raid</strong> dengan jaminan keamanan akun 100%.
        </p>
      </div>

      {/* SECTION 1: JOKI KOEN */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-tactical text-white uppercase tracking-wider">
                1. JOKI KOEN (MATA UANG ARENA BREAKOUT)
              </h2>
              <p className="text-xs text-zinc-400">
                Pengerjaan cepat via farming safe rooms, looting gold items & safe extraction
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectService('joki_koen')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <span>Order Joki Koen</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {priceConfig.koenPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-zinc-900/80 border rounded-2xl p-6 flex flex-col justify-between transition-all hover:border-amber-500/50 hover:shadow-xl ${
                pkg.popular ? 'border-amber-500/80 bg-zinc-900/95 relative' : 'border-zinc-800'
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-[11px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-lg">
                  BEST SELLER 🔥
                </span>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-amber-500/10 text-amber-400 font-bold px-2.5 py-1 rounded-lg border border-amber-500/20">
                    Paket {pkg.amountMillion} Juta Koen
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">100% Manual</span>
                </div>

                <div>
                  <h3 className="font-tactical text-2xl font-bold text-white tracking-wide">
                    {pkg.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {pkg.description}
                  </p>
                </div>

                <div className="space-y-2 text-xs text-zinc-300 pt-2 border-t border-zinc-800/80">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Garansi Koen Bersih di Stash</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Anti Banned (No Cheat / No Macro)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Update Notif WhatsApp Realtime</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-zinc-800 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-black font-tactical text-amber-400">
                      {formatRupiah(pkg.price)}
                    </span>
                    {pkg.originalPrice > pkg.price && (
                      <span className="text-xs text-zinc-500 line-through ml-2">
                        {formatRupiah(pkg.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleSelect('joki_koen', pkg.id)}
                  className="w-full py-2.5 bg-zinc-800 hover:bg-amber-500 hover:text-black text-amber-300 font-bold text-xs uppercase tracking-wider rounded-xl border border-amber-500/30 transition-all cursor-pointer"
                >
                  Pilih Paket Ini
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: JOKI MANDOR RAID */}
      <div className="space-y-6 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-tactical text-white uppercase tracking-wider">
                2. JOKI MANDOR RAID (ESCORT & CARRY SQUAD)
              </h2>
              <p className="text-xs text-zinc-400">
                Kawal raid di Lockdown, Armory, TV Station, atau mabar bareng pro player joki
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectService('joki_mandor')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <span>Order Joki Mandor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {priceConfig.mandorPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-zinc-900/80 border rounded-2xl p-6 flex flex-col justify-between transition-all hover:border-blue-500/50 hover:shadow-xl ${
                pkg.popular ? 'border-amber-500/80 bg-zinc-900/95 relative' : 'border-zinc-800'
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-[11px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-lg">
                  HOT PICK 🔥
                </span>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-blue-500/10 text-blue-400 font-bold px-2.5 py-1 rounded-lg border border-blue-500/20">
                    {pkg.type === 'per_raid' ? `${pkg.quantity}x Raid Lockdown` : `${pkg.quantity} Jam Mabar`}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">Squad Carry</span>
                </div>

                <div>
                  <h3 className="font-tactical text-2xl font-bold text-white tracking-wide">
                    {pkg.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {pkg.description}
                  </p>
                </div>

                <div className="space-y-2 text-xs text-zinc-300 pt-2 border-t border-zinc-800/80">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Garansi Evakuasi Selamat</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Pilihan Mabar Squad / Joki Akun</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Bebas Pilih Map Lockdown & Armory</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-zinc-800 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-black font-tactical text-amber-400">
                      {formatRupiah(pkg.price)}
                    </span>
                    {pkg.originalPrice > pkg.price && (
                      <span className="text-xs text-zinc-500 line-through ml-2">
                        {formatRupiah(pkg.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleSelect('joki_mandor', pkg.id)}
                  className="w-full py-2.5 bg-zinc-800 hover:bg-amber-500 hover:text-black text-amber-300 font-bold text-xs uppercase tracking-wider rounded-xl border border-amber-500/30 transition-all cursor-pointer"
                >
                  Pilih Paket Ini
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
