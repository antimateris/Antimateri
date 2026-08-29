import React, { useState } from 'react';
import { 
  X, 
  User, 
  Lock, 
  Phone, 
  Gamepad2, 
  Sparkles, 
  Trophy, 
  Coins, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  ArrowRight,
  UserCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CustomerUser, CustomerTier } from '../../types';
import { INITIAL_CUSTOMERS, calculateTierFromExp } from '../../data/initialData';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: CustomerUser[];
  onLoginSuccess: (customer: CustomerUser) => void;
  onRegisterSuccess: (newCustomer: CustomerUser) => void;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  customers,
  onLoginSuccess,
  onRegisterSuccess,
}) => {
  const [activeMode, setActiveMode] = useState<'login' | 'register'>('login');
  
  // Login Form
  const [loginIdentifier, setLoginIdentifier] = useState<string>(''); // username or whatsapp
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register Form
  const [regName, setRegName] = useState<string>('');
  const [regUsername, setRegUsername] = useState<string>('');
  const [regWhatsApp, setRegWhatsApp] = useState<string>('');
  const [regGameNick, setRegGameNick] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);
  const [regError, setRegError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanIdentifier = loginIdentifier.trim().toLowerCase();
    const cleanPass = loginPassword.trim();

    if (!cleanIdentifier || !cleanPass) {
      setLoginError('Mohon isi username/no. WA dan password');
      return;
    }

    const matched = customers.find(
      (c) =>
        (c.username.toLowerCase() === cleanIdentifier ||
          c.whatsapp.replace(/\D/g, '') === cleanIdentifier.replace(/\D/g, '')) &&
        (c.password ? c.password === cleanPass : cleanPass === 'user123')
    );

    if (!matched) {
      setLoginError('Akun tidak ditemukan atau password salah. Cek akun demo di bawah.');
      return;
    }

    onLoginSuccess(matched);
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    const cleanUsername = regUsername.trim().toLowerCase();
    const cleanName = regName.trim();
    const cleanPhone = regWhatsApp.trim();
    const cleanGame = regGameNick.trim();
    const cleanPass = regPassword.trim();

    if (!cleanUsername || !cleanName || !cleanPhone || !cleanPass) {
      setRegError('Semua kolom wajib diisi (kecuali nickname jika belum ada)');
      return;
    }

    // Check duplicate
    if (customers.some((c) => c.username.toLowerCase() === cleanUsername)) {
      setRegError('Username sudah terpakai, gunakan username lain.');
      return;
    }

    const newCustomer: CustomerUser = {
      id: `cust_${Date.now()}`,
      username: cleanUsername,
      name: cleanName,
      whatsapp: cleanPhone,
      gameNickname: cleanGame || 'Operator_AB',
      password: cleanPass,
      opsCoins: 50, // Welcome bonus 50 OpsCoins!
      exp: 0,
      tier: 'recruit',
      totalSpent: 0,
      totalOrders: 0,
      totalKoenFarmedMillion: 0,
      totalRaidHours: 0,
      createdAt: new Date().toISOString(),
      redeemedRewards: [],
      isAnonymizedInLeaderboard: false,
    };

    onRegisterSuccess(newCustomer);
    onLoginSuccess(newCustomer);
    onClose();
  };

  const handleQuickLogin = (cust: CustomerUser) => {
    onLoginSuccess(cust);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto overscroll-contain">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] sm:max-h-[90vh] my-auto">
        
        {/* Header with Gamification Perks Banner (Fixed top) */}
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-4 sm:p-6 border-b border-zinc-800 relative flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-black shrink-0">
                <Coins className="w-6 h-6 sm:w-7 sm:h-7 fill-black" />
              </div>
              <div>
                <div className="flex items-center space-x-2 flex-wrap">
                  <h3 className="font-tactical text-base sm:text-lg font-bold text-white uppercase tracking-wider">
                    MEMBER & OPS-COINS
                  </h3>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30">
                    OPSIONAL
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Dapatkan cashback koin setiap order & tukarkan dengan joki gratis!
                </p>
              </div>
            </div>

            <button
              type="button"
              id="btn-close-auth-modal"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Perks Strip */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-zinc-800/80 text-[10px] sm:text-[11px]">
            <div className="flex items-center space-x-1 text-amber-300">
              <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>Cashback Koin</span>
            </div>
            <div className="flex items-center space-x-1 text-blue-300">
              <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>Tier Pangkat</span>
            </div>
            <div className="flex items-center space-x-1 text-emerald-300">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>Hadiah Gratis</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar">
          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-zinc-800 bg-zinc-950/60 p-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveMode('login');
              setLoginError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold font-tactical uppercase tracking-wider transition-all cursor-pointer ${
              activeMode === 'login'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Masuk Member
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode('register');
              setRegError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold font-tactical uppercase tracking-wider transition-all cursor-pointer ${
              activeMode === 'register'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Daftar Baru (+50 Koin Bonus)
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {activeMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4 text-xs sm:text-sm">
              {loginError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2 text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                  Username / No. WhatsApp:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Contoh: sultan_kamona atau 081298877665"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:border-amber-500 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase text-zinc-300">
                    Password Akun:
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1"
                  >
                    {showLoginPassword ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Sembunyikan</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan password Anda..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:border-amber-500 font-mono text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold font-tactical uppercase tracking-wider text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>Masuk ke Akun Member</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Login Test Accounts */}
              <div className="pt-4 border-t border-zinc-800/80 space-y-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold block text-center">
                  ⚡ Atau Masuk Cepat Akun Demo (Untuk Pengujian):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {customers.slice(0, 2).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleQuickLogin(c)}
                      className="p-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 rounded-xl text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-amber-400 truncate max-w-[90px]">
                          {c.name.split(' ')[0]}
                        </span>
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded uppercase">
                          {c.tier}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-[10px] text-amber-400/90 font-mono mt-0.5">
                        <Coins className="w-3 h-3" />
                        <span>{c.opsCoins} Koin</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5 text-xs sm:text-sm">
              {regError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2 text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 flex items-center space-x-2 text-amber-300 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Bonus Pendaftaran: Dapatkan 50 OpsCoins gratis langsung di akunmu!</span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                  Nama Lengkap:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Contoh: Dimas Rayhan"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-white focus:border-amber-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                    Username:
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="dimas_ab"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-amber-500 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                    Nomor WhatsApp:
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      value={regWhatsApp}
                      onChange={(e) => setRegWhatsApp(e.target.value)}
                      placeholder="08123456789"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-white focus:border-amber-500 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                  Nickname Game Arena Breakout (Opsional):
                </label>
                <div className="relative">
                  <Gamepad2 className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={regGameNick}
                    onChange={(e) => setRegGameNick(e.target.value)}
                    placeholder="Contoh: GhostRider_AB"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-white focus:border-amber-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase text-zinc-300">
                    Buat Password:
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1"
                  >
                    {showRegPassword ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Sembunyikan</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimal 4 karakter..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-white focus:border-amber-500 font-mono text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold font-tactical uppercase tracking-wider text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-2 mt-2"
              >
                <span>Daftar & Klaim 50 Koin</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="mt-4 pt-3 border-t border-zinc-800/80 text-center">
            <p className="text-[11px] text-zinc-500">
              *Pesanan tetap dapat dilakukan secara <strong>Guest (Tanpa Login)</strong> kapan saja.
            </p>
          </div>
        </div>

        </div>
      </div>
    </div>
  );
};
