import React, { useState } from 'react';
import { 
  DollarSign, 
  Coins, 
  Users, 
  Save, 
  RotateCcw, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { PriceConfig, KoenPackagePrice, MandorPackagePrice } from '../../types';
import { formatRupiah } from '../../utils/helpers';
import { INITIAL_PRICE_CONFIG } from '../../data/initialData';

interface AdminPriceSettingsTabProps {
  priceConfig: PriceConfig;
  onSavePriceConfig: (newConfig: PriceConfig) => void;
}

export const AdminPriceSettingsTab: React.FC<AdminPriceSettingsTabProps> = ({
  priceConfig,
  onSavePriceConfig,
}) => {
  const [config, setConfig] = useState<PriceConfig>(JSON.parse(JSON.stringify(priceConfig)));
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Handle Koen Package Change
  const handleKoenPackageChange = (idx: number, field: keyof KoenPackagePrice, value: any) => {
    const updated = [...config.koenPackages];
    updated[idx] = { ...updated[idx], [field]: value };
    setConfig({ ...config, koenPackages: updated });
    setSavedSuccess(false);
  };

  // Handle Mandor Package Change
  const handleMandorPackageChange = (idx: number, field: keyof MandorPackagePrice, value: any) => {
    const updated = [...config.mandorPackages];
    updated[idx] = { ...updated[idx], [field]: value };
    setConfig({ ...config, mandorPackages: updated });
    setSavedSuccess(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePriceConfig(config);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefault = () => {
    if (window.confirm('Kembalikan semua daftar harga ke konfigurasi default pabrik?')) {
      setConfig(JSON.parse(JSON.stringify(INITIAL_PRICE_CONFIG)));
      onSavePriceConfig(INITIAL_PRICE_CONFIG);
      setSavedSuccess(true);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30">
              SUPERADMIN EXCLUSIVE
            </span>
            <h2 className="text-xl font-bold font-tactical text-white uppercase tracking-wider">
              PENGATURAN HARGA JOKI (KOEN & MANDOR)
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Perubahan harga di sini akan langsung aktif secara live di halaman order pelanggan.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleResetDefault}
            className="flex items-center space-x-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>

          <button
            type="submit"
            className="flex items-center space-x-1.5 px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold font-tactical uppercase tracking-wider text-xs rounded-xl shadow-lg transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan Harga</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-emerald-400 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Pengaturan harga berhasil disimpan dan langsung diterapkan ke formulir pemesanan!</span>
        </div>
      )}

      {/* SECTION 1: Harga Joki Koen */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-tactical text-lg font-bold text-white uppercase">
                HARGA PAKET JOKI KOEN
              </h3>
              <p className="text-xs text-zinc-400">Kelola tarif paket reguler dan base rate per million</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-zinc-400">Tarif Dasar / Juta Koen:</span>
            <input
              type="number"
              value={config.koenPerMillionRate}
              onChange={(e) => setConfig({ ...config, koenPerMillionRate: Number(e.target.value) })}
              className="w-28 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-amber-400 font-bold text-right"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {config.koenPackages.map((pkg, idx) => (
            <div key={pkg.id} className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase font-mono">
                  Paket #{idx + 1} ({pkg.amountMillion} Juta Koen)
                </span>
                <label className="flex items-center space-x-1.5 text-xs text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pkg.popular || false}
                    onChange={(e) => handleKoenPackageChange(idx, 'popular', e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-amber-500 bg-zinc-900 border-zinc-700"
                  />
                  <span>Tag Popular</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Judul Paket:</label>
                  <input
                    type="text"
                    value={pkg.title}
                    onChange={(e) => handleKoenPackageChange(idx, 'title', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Jumlah Koen (Milyar):</label>
                  <input
                    type="number"
                    value={pkg.amountMillion}
                    onChange={(e) => handleKoenPackageChange(idx, 'amountMillion', Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Harga Jual (Rp):</label>
                  <input
                    type="number"
                    value={pkg.price}
                    onChange={(e) => handleKoenPackageChange(idx, 'price', Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-amber-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Harga Coret / Asli (Rp):</label>
                  <input
                    type="number"
                    value={pkg.originalPrice}
                    onChange={(e) => handleKoenPackageChange(idx, 'originalPrice', Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Deskripsi Singkat:</label>
                <input
                  type="text"
                  value={pkg.description}
                  onChange={(e) => handleKoenPackageChange(idx, 'description', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-300"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Harga Joki Mandor */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-tactical text-lg font-bold text-white uppercase">
                HARGA PAKET JOKI MANDOR RAID (ESCORT)
              </h3>
              <p className="text-xs text-zinc-400">Kelola tarif paket per raid dan per jam</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {config.mandorPackages.map((pkg, idx) => (
            <div key={pkg.id} className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 uppercase font-mono">
                  Mandor #{idx + 1} ({pkg.type === 'per_raid' ? `${pkg.quantity} Raids` : `${pkg.quantity} Jam`})
                </span>
                <label className="flex items-center space-x-1.5 text-xs text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pkg.popular || false}
                    onChange={(e) => handleMandorPackageChange(idx, 'popular', e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-amber-500 bg-zinc-900 border-zinc-700"
                  />
                  <span>Tag Recommended</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Judul Paket:</label>
                  <input
                    type="text"
                    value={pkg.title}
                    onChange={(e) => handleMandorPackageChange(idx, 'title', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Kuantitas (Raid/Jam):</label>
                  <input
                    type="number"
                    value={pkg.quantity}
                    onChange={(e) => handleMandorPackageChange(idx, 'quantity', Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Harga Jual (Rp):</label>
                  <input
                    type="number"
                    value={pkg.price}
                    onChange={(e) => handleMandorPackageChange(idx, 'price', Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-amber-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Harga Coret / Asli (Rp):</label>
                  <input
                    type="number"
                    value={pkg.originalPrice}
                    onChange={(e) => handleMandorPackageChange(idx, 'originalPrice', Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Deskripsi Singkat:</label>
                <input
                  type="text"
                  value={pkg.description}
                  onChange={(e) => handleMandorPackageChange(idx, 'description', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-300"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: Biaya Add-ons */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <h3 className="font-tactical text-lg font-bold text-white uppercase border-b border-zinc-800 pb-2">
          BIAYA TAMBAHAN (ADD-ONS)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <label className="block font-bold text-zinc-200 mb-1">Biaya Prioritas Ekspres (Rp):</label>
            <input
              type="number"
              value={config.prioritySpeedFee}
              onChange={(e) => setConfig({ ...config, prioritySpeedFee: Number(e.target.value) })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-amber-400 font-bold"
            />
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <label className="block font-bold text-zinc-200 mb-1">Biaya Live Stream Discord (Rp):</label>
            <input
              type="number"
              value={config.streamDiscordFee}
              onChange={(e) => setConfig({ ...config, streamDiscordFee: Number(e.target.value) })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-amber-400 font-bold"
            />
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <label className="block font-bold text-zinc-200 mb-1">Biaya Garansi Safe Extraction (Rp):</label>
            <input
              type="number"
              value={config.safeLootGuaranteeFee}
              onChange={(e) => setConfig({ ...config, safeLootGuaranteeFee: Number(e.target.value) })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-amber-400 font-bold"
            />
          </div>
        </div>
      </div>

    </form>
  );
};
