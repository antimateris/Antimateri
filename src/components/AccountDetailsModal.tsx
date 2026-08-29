import React, { useState } from 'react';
import {
  X,
  MessageCircle
} from 'lucide-react';
import { PriceConfig } from '../types';
import { formatRupiah } from '../utils/helpers';

interface AccountDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (details: {
    gameNickname: string;
    gameUserId: string;
    loginMethod: string;
    accountNotes: string;
    customerName: string;
    customerWhatsApp: string;
  }) => void;
  initialData?: {
    gameNickname: string;
    gameUserId: string;
    loginMethod: string;
    accountNotes: string;
    customerName: string;
    customerWhatsApp: string;
  };
  priceConfig: PriceConfig;
  totalPrice: number;
  packageName: string;
}

export const AccountDetailsModal: React.FC<AccountDetailsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  priceConfig,
  totalPrice,
  packageName,
}) => {
  const [gameNickname, setGameNickname] = useState(initialData?.gameNickname || '');
  const [gameUserId, setGameUserId] = useState(initialData?.gameUserId || '');
  const [loginMethod, setLoginMethod] = useState(initialData?.loginMethod || 'Level Infinite');
  const [accountNotes, setAccountNotes] = useState(initialData?.accountNotes || '');
  const [customerName, setCustomerName] = useState(initialData?.customerName || '');
  const [customerWhatsApp, setCustomerWhatsApp] = useState(initialData?.customerWhatsApp || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!gameNickname.trim()) {
      alert('Silakan masukkan Nickname Game Arena Breakout Anda');
      return;
    }
    if (!customerName.trim()) {
      alert('Silakan masukkan Nama Lengkap Anda');
      return;
    }
    if (!customerWhatsApp.trim() || customerWhatsApp.length < 9) {
      alert('Silakan masukkan Nomor WhatsApp aktif');
      return;
    }

    onSave({
      gameNickname,
      gameUserId,
      loginMethod,
      accountNotes,
      customerName,
      customerWhatsApp,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="font-tactical text-xl font-bold text-white uppercase tracking-wider">
              Data Akun & Kontak
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              {packageName} • {formatRupiah(totalPrice)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Game Account Info */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3">Informasi Akun Game</h4>
            
            <div className="space-y-3">
              {/* Nickname */}
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1.5">
                  Nickname Arena Breakout <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={gameNickname}
                  onChange={(e) => setGameNickname(e.target.value)}
                  placeholder="Contoh: GhostOperator99"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Login Method */}
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1.5">
                  Metode Login Akun <span className="text-amber-400">*</span>
                </label>
                <select
                  value={loginMethod}
                  onChange={(e) => setLoginMethod(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                >
                  <option value="Level Infinite">Level Infinite Pass (Rekomendasi)</option>
                  <option value="Facebook">Facebook Login</option>
                  <option value="Google">Google Play Games</option>
                  <option value="VK">VK Account</option>
                </select>
              </div>

              {/* User ID (Optional) */}
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1.5">
                  User ID Game (Opsional)
                </label>
                <input
                  type="text"
                  value={gameUserId}
                  onChange={(e) => setGameUserId(e.target.value)}
                  placeholder="Contoh: 123456789"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Account Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1.5">
                  Catatan Khusus untuk Joki (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={accountNotes}
                  onChange={(e) => setAccountNotes(e.target.value)}
                  placeholder="Contoh: Senjata di Stash bebas pakai, mohon jangan jual kunci..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-zinc-800"></div>

          {/* Customer Contact Info */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3">Kontak Pelanggan</h4>
            
            <div className="space-y-3">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1.5">
                  Nama Lengkap Anda <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Bima Satria"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1.5">
                  Nomor WhatsApp Aktif <span className="text-amber-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerWhatsApp}
                  onChange={(e) => setCustomerWhatsApp(e.target.value)}
                  placeholder="081234567890"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  💬 Notifikasi update pesanan akan dikirim ke nomor ini
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm rounded-xl transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20"
            >
              Lanjut ke Pembayaran
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
