import React, { useState } from 'react';
import { 
  X, 
  User, 
  Coins, 
  Trophy, 
  Sparkles, 
  ShieldCheck, 
  Tag, 
  Copy, 
  Check, 
  ArrowRight, 
  LogOut, 
  Lock, 
  Eye, 
  EyeOff, 
  Flame, 
  Key, 
  Award, 
  TrendingUp, 
  Gamepad2, 
  Phone,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CustomerUser, CustomerRedeemedReward } from '../../types';
import { TIER_CONFIGS, calculateTierFromExp } from '../../data/initialData';
import { formatRupiah, formatDate } from '../../utils/helpers';

interface CustomerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerUser;
  onUpdateCustomer: (updated: CustomerUser) => void;
  onLogout: () => void;
  onOpenRewardsStore: () => void;
  onApplyVoucherToOrder?: (voucher: CustomerRedeemedReward) => void;
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  isOpen,
  onClose,
  customer,
  onUpdateCustomer,
  onLogout,
  onOpenRewardsStore,
  onApplyVoucherToOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'vouchers' | 'security'>('profile');
  
  // Security & Profile Edit State
  const [editName, setEditName] = useState<string>(customer.name);
  const [editGameNick, setEditGameNick] = useState<string>(customer.gameNickname || '');
  const [editWhatsApp, setEditWhatsApp] = useState<string>(customer.whatsapp);
  const [editPassword, setEditPassword] = useState<string>(customer.password || 'user123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isAnonymized, setIsAnonymized] = useState<boolean>(customer.isAnonymizedInLeaderboard || false);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  // Copy voucher feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTier = TIER_CONFIGS[customer.tier] || TIER_CONFIGS.recruit;
  
  // Next tier calculation
  const tierOrder: (keyof typeof TIER_CONFIGS)[] = ['recruit', 'operative', 'elite', 'warlord', 'mythic'];
  const currentIndex = tierOrder.indexOf(customer.tier);
  const nextTierKey = currentIndex < tierOrder.length - 1 ? tierOrder[currentIndex + 1] : null;
  const nextTier = nextTierKey ? TIER_CONFIGS[nextTierKey] : null;

  const expNeeded = nextTier ? nextTier.minExp - customer.exp : 0;
  const progressPercent = nextTier 
    ? Math.min(100, Math.max(0, Math.round((customer.exp / nextTier.minExp) * 100))) 
    : 100;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CustomerUser = {
      ...customer,
      name: editName.trim(),
      gameNickname: editGameNick.trim(),
      whatsapp: editWhatsApp.trim(),
      password: editPassword.trim(),
      isAnonymizedInLeaderboard: isAnonymized,
    };
    onUpdateCustomer(updated);
    setEditSuccess('Profil dan Password Anda berhasil disimpan!');
    setTimeout(() => setEditSuccess(null), 3000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const activeVouchers = customer.redeemedRewards?.filter((r) => !r.isUsed) || [];
  const usedVouchers = customer.redeemedRewards?.filter((r) => r.isUsed) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto overscroll-contain">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] sm:max-h-[90vh] my-auto">
        
        {/* Modal Header (Fixed at top) */}
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-tactical font-black text-base sm:text-lg shrink-0">
              {customer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h3 className="font-tactical text-sm sm:text-lg font-bold text-white uppercase tracking-wider">
                  AKUN MEMBER & OPS-COINS
                </h3>
                <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded border ${currentTier.badgeBg}`}>
                  {currentTier.name}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">@{customer.username} • {customer.whatsapp}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container covering entire modal body */}
        <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar divide-y divide-zinc-800/80">
          
          {/* Gamified Coins & Tier Header Card (Scrolls smoothly with content) */}
          <div className="p-4 sm:p-6 bg-gradient-to-b from-zinc-950 to-zinc-900">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              
              {/* Left: OpsCoins Balance & Store Button */}
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-amber-500/40 relative overflow-hidden shadow-lg shadow-amber-500/10 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                      Saldo OpsCoins Anda
                    </span>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <Coins className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 fill-amber-400 animate-pulse" />
                      <span className="text-2xl sm:text-3xl font-black font-tactical text-amber-400 tracking-wider">
                        {customer.opsCoins}
                      </span>
                      <span className="text-xs text-zinc-400 font-bold">Koin</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenRewardsStore();
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold font-tactical uppercase tracking-wider text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-1 shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Tukar Hadiah</span>
                  </button>
                </div>

                <div className="mt-3 pt-2.5 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
                  <span>Bonus Cashback Tier:</span>
                  <span className="font-bold text-emerald-400">+{Math.round((currentTier.coinMultiplier - 1) * 100)}% Koin Setiap Order</span>
                </div>
              </div>

              {/* Right: EXP & Tier Progress Bar */}
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Pangkat & Jabatan Akun
                    </span>
                    <span className="text-xs font-bold text-amber-400">{currentTier.title}</span>
                  </div>

                  <div className="mt-2.5">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-zinc-400">EXP Total Belanja:</span>
                      <span className="text-white font-mono font-bold">{formatRupiah(customer.exp)}</span>
                    </div>
                    <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-zinc-400 flex justify-between">
                  {nextTier ? (
                    <>
                      <span>Next: <strong className="text-zinc-200">{nextTier.name}</strong></span>
                      <span className="text-amber-400 font-semibold">Kurang {formatRupiah(expNeeded)} EXP</span>
                    </>
                  ) : (
                    <span className="text-amber-400 font-bold">★ Telah Mencapai Pangkat Tertinggi (MAX)!</span>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Sub Navigation Tabs (Sticky at top of scroll body) */}
          <div className="sticky top-0 z-20 flex border-b border-zinc-800 bg-zinc-950 px-4 sm:px-6 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`py-3 px-3 sm:px-4 text-xs font-bold font-tactical uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              Statistik & Keuntungan Tier
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('vouchers')}
              className={`py-3 px-3 sm:px-4 text-xs font-bold font-tactical uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'vouchers'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <span>Kupon & Voucher Saya</span>
              {activeVouchers.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] font-black flex items-center justify-center">
                  {activeVouchers.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`py-3 px-3 sm:px-4 text-xs font-bold font-tactical uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'security'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              Ganti Password & Profil
            </button>
          </div>

          {/* Tab Content Area */}
          <div className="p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: PROFILE & STATS */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              
              {/* 4 Lifetime Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-zinc-950 rounded-2xl border border-zinc-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Total Pesanan</span>
                  <span className="text-lg font-bold font-tactical text-white mt-1 block">
                    {customer.totalOrders}x Order
                  </span>
                </div>
                <div className="p-3.5 bg-zinc-950 rounded-2xl border border-zinc-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Total Belanja</span>
                  <span className="text-base font-bold font-tactical text-amber-400 mt-1 block truncate">
                    {formatRupiah(customer.totalSpent)}
                  </span>
                </div>
                <div className="p-3.5 bg-zinc-950 rounded-2xl border border-zinc-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Koen Di-Farming</span>
                  <span className="text-lg font-bold font-tactical text-emerald-400 mt-1 block">
                    {customer.totalKoenFarmedMillion}M Koen
                  </span>
                </div>
                <div className="p-3.5 bg-zinc-950 rounded-2xl border border-zinc-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Jam Mandor</span>
                  <span className="text-lg font-bold font-tactical text-blue-400 mt-1 block">
                    {customer.totalRaidHours} Jam
                  </span>
                </div>
              </div>

              {/* Unlocked Perks List for this Tier */}
              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold font-tactical text-white uppercase tracking-wider">
                    FASILITAS & HAK ISTIMEWA {currentTier.name.toUpperCase()}
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {currentTier.perks.map((perk, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-zinc-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Callout to Leaderboard */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Leaderboard Top Joki & Top Spender Sedang Berlangsung!</span>
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Kumpulkan order & EXP untuk merebut peringkat 1 dan hadiah bulanan OpsCoins.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: VOUCHERS & COUPONS */}
          {activeTab === 'vouchers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold font-tactical text-white uppercase tracking-wider">
                    KUPON AKTIF & HADIAH TERSEDIA
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Gunakan kupon saat checkout pesanan untuk diskon atau add-on gratis.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenRewardsStore();
                  }}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Katalog Rewards</span>
                </button>
              </div>

              {activeVouchers.length === 0 ? (
                <div className="p-8 text-center bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                  <Tag className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="text-xs text-zinc-400">
                    Kamu belum memiliki kupon aktif. Tukarkan OpsCoins kamu di Toko Rewards!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeVouchers.map((v) => (
                    <div 
                      key={v.id}
                      className="p-4 bg-zinc-950 rounded-2xl border border-amber-500/30 flex flex-col justify-between space-y-3 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded">
                            {v.rewardType.replace('_', ' ')}
                          </span>
                          <h5 className="font-bold text-white text-xs mt-1.5">{v.title}</h5>
                        </div>
                        <Tag className="w-5 h-5 text-amber-400" />
                      </div>

                      <div className="bg-zinc-900 p-2 rounded-xl border border-zinc-800 flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-amber-300">{v.code}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(v.code)}
                          className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
                          title="Salin Kode Kupon"
                        >
                          {copiedCode === v.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {onApplyVoucherToOrder && (
                        <button
                          type="button"
                          onClick={() => {
                            onApplyVoucherToOrder(v);
                            onClose();
                          }}
                          className="w-full py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs uppercase font-tactical rounded-xl shadow cursor-pointer"
                        >
                          Pakai Kupon Ini di Order
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {usedVouchers.length > 0 && (
                <div className="pt-4 border-t border-zinc-800 space-y-2">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase">Riwayat Kupon yang Sudah Digunakan:</span>
                  <div className="space-y-1.5">
                    {usedVouchers.map((uv) => (
                      <div key={uv.id} className="p-2.5 bg-zinc-950/60 rounded-xl border border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
                        <span>{uv.title} ({uv.code})</span>
                        <span className="text-[10px] text-emerald-500">Digunakan di {uv.usedInInvoice || 'Pesanan'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SECURITY & PROFILE EDIT */}
          {activeTab === 'security' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs sm:text-sm">
              {editSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-emerald-400 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{editSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                    Nama Lengkap Anda:
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                    Nickname Game AB:
                  </label>
                  <input
                    type="text"
                    value={editGameNick}
                    onChange={(e) => setEditGameNick(e.target.value)}
                    placeholder="Contoh: GhostRider_AB"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-amber-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                  Nomor WhatsApp Aktif:
                </label>
                <input
                  type="tel"
                  required
                  value={editWhatsApp}
                  onChange={(e) => setEditWhatsApp(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-amber-500 font-mono text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase text-zinc-300">
                    Password Akun (Ganti Sandi):
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1"
                  >
                    {showPassword ? (
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
                  <Key className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-white focus:border-amber-500 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Privacy Setting: Leaderboard */}
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Privasi Papan Peringkat (Leaderboard)</span>
                  <span className="text-[11px] text-zinc-400 block">
                    {isAnonymized ? 'Nama Anda akan disamarkan (Anonim)' : 'Tampilkan Nickname Anda di Top Ranking'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAnonymized(!isAnonymized)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    isAnonymized
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                  }`}
                >
                  {isAnonymized ? 'Anonim (Aktif)' : 'Tampilkan Nama'}
                </button>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold font-tactical uppercase tracking-wider text-xs rounded-xl shadow-lg cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          )}

          </div>
        </div>

        {/* Modal Footer with Logout Button (Fixed bottom) */}
        <div className="px-4 sm:px-6 py-3.5 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="flex items-center space-x-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun (Logout)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
