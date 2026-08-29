import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';
import { PriceConfig } from '../types';
import { formatRupiah } from '../utils/helpers';

interface AccountDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (details: {
    gameNickname: string;
    gamePassword?: string;
    gameUserId: string;
    loginMethod: string;
    accountNotes: string;
    customerName: string;
    customerWhatsApp: string;
  }) => void;
  initialData?: {
    gameNickname: string;
    gamePassword?: string;
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
  const [gamePassword, setGamePassword] = useState(initialData?.gamePassword || '');
  const [showGamePassword, setShowGamePassword] = useState<boolean>(false);
  const [gameUserId, setGameUserId] = useState(initialData?.gameUserId || '');
  const [loginMethod, setLoginMethod] = useState(initialData?.loginMethod || 'Level Infinite');
  const [accountNotes, setAccountNotes] = useState(initialData?.accountNotes || '');
  const [customerName, setCustomerName] = useState(initialData?.customerName || '');
  const [customerWhatsApp, setCustomerWhatsApp] = useState(initialData?.customerWhatsApp || '');
  const [honeypotField, setHoneypotField] = useState<string>(''); // Bot trap
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // 1. Bot Honeypot detection
    if (honeypotField.trim() !== '') {
      setValidationError('Akses tidak valid terdeteksi.');
      return;
    }

    // 2. Anti-spam order cooldown check (30 seconds)
    const lastOrderTime = localStorage.getItem('breakoutops_last_order_ts');
    if (lastOrderTime) {
      const elapsedSeconds = Math.floor((Date.now() - parseInt(lastOrderTime, 10)) / 1000);
      const cooldownRemaining = 30 - elapsedSeconds;
      if (cooldownRemaining > 0) {
        setValidationError(`Mohon tunggu ${cooldownRemaining} detik sebelum membuat orderan baru demi mencegah spam.`);
        return;
      }
    }

    // 3. Nickname validation
    const cleanNick = gameNickname.trim();
    if (!cleanNick || cleanNick.length < 3) {
      setValidationError('Silakan masukkan Nickname Game yang valid (minimal 3 karakter).');
      return;
    }

    // 4. Name validation
    const cleanName = customerName.trim();
    if (!cleanName || cleanName.length < 2) {
      setValidationError('Silakan masukkan Nama Lengkap Anda.');
      return;
    }

    // 5. WhatsApp number validation (Indonesia active standard)
    const cleanPhone = customerWhatsApp.trim().replace(/[^0-9+]/g, '');
    const isIndoStandard = /^(08|\+628|628)[0-9]{8,13}$/.test(cleanPhone);
    if (!isIndoStandard || cleanPhone.length < 10 || cleanPhone.length > 15) {
      setValidationError('Nomor WhatsApp tidak valid. Format harus diawali 08... atau 628... (10-14 digit).');
      return;
    }

    // Record timestamp for rate limiting
    localStorage.setItem('breakoutops_last_order_ts', Date.now().toString());

    onSave({
      gameNickname: cleanNick,
      gamePassword: gamePassword.trim(),
      gameUserId: gameUserId.trim(),
      loginMethod,
      accountNotes: accountNotes.trim(),
      customerName: cleanName,
      customerWhatsApp: cleanPhone,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto overscroll-contain">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-amber-500/40 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh] my-auto animate-in zoom-in-95 duration-200">
        
        {/* Header (Fixed at top) */}
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="font-tactical text-lg sm:text-xl font-bold text-white uppercase tracking-wider">
              Data Akun & Kontak Pelanggan
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {packageName} • {formatRupiah(totalPrice)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container with Flex-Col */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4 sm:space-y-5 custom-scrollbar">
            {validationError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-2.5 text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{validationError}</div>
              </div>
            )}

            {/* Hidden Honeypot for Anti-Bot */}
            <div className="hidden" aria-hidden="true">
              <input
                type="text"
                name="website_verification_trap"
                tabIndex={-1}
                autoComplete="off"
                value={honeypotField}
                onChange={(e) => setHoneypotField(e.target.value)}
              />
            </div>
            
            {/* Game Account Info */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wide border-b border-zinc-800/80 pb-2">
                Informasi Akun Game Arena Breakout
              </h4>
              
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

              {/* Password Akun Game */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase text-zinc-300 flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Password / Kata Sandi Akun Game</span>
                  </label>
                  <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                    Privasi Dijamin
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showGamePassword ? 'text' : 'password'}
                    value={gamePassword}
                    onChange={(e) => setGamePassword(e.target.value)}
                    placeholder="Masukkan password akun game..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-4 pr-11 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGamePassword(!showGamePassword)}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-200 transition-colors p-1"
                    title={showGamePassword ? 'Sembunyikan Password' : 'Lihat Password'}
                  >
                    {showGamePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Important Temporary Password Notice */}
                <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-2 text-[11px] text-amber-300">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <div>
                    <span className="font-bold">Mohon Gunakan Password Sementara:</span> Demi keamanan maksimal akun Anda, disarankan untuk mengubah password menjadi password sementara saat memesan joki, dan menggantinya kembali setelah proses joki selesai 100%.
                  </div>
                </div>
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

            {/* Customer Contact Info */}
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-bold text-white uppercase tracking-wide border-b border-zinc-800/80 pb-2">
                Kontak Pelanggan
              </h4>
              
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
                  💬 Notifikasi update progres pengerjaan akan dikirim ke nomor ini
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons (Fixed / Sticky Footer) */}
          <div className="flex-shrink-0 p-3 sm:p-4 bg-zinc-950 border-t border-zinc-800 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Lanjut ke Pembayaran
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
