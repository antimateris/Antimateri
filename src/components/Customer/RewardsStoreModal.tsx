import React, { useState } from 'react';
import { 
  X, 
  Coins, 
  Sparkles, 
  Tag, 
  Gift, 
  Check, 
  Zap, 
  ShieldCheck, 
  Radio, 
  Flame, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';
import { CustomerUser, RewardItem, CustomerRedeemedReward } from '../../types';
import { REWARD_CATALOG, TIER_CONFIGS } from '../../data/initialData';
import { formatRupiah } from '../../utils/helpers';

interface RewardsStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerUser | null;
  onOpenAuth: () => void;
  onRedeemSuccess: (updatedCustomer: CustomerUser, newReward: CustomerRedeemedReward) => void;
  onApplyVoucherToOrder?: (voucher: CustomerRedeemedReward) => void;
}

export const RewardsStoreModal: React.FC<RewardsStoreModalProps> = ({
  isOpen,
  onClose,
  customer,
  onOpenAuth,
  onRedeemSuccess,
  onApplyVoucherToOrder,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'free_koen' | 'free_mandor' | 'discount_voucher' | 'free_addon'>('all');
  const [confirmingReward, setConfirmingReward] = useState<RewardItem | null>(null);
  const [redeemSuccessMsg, setRedeemSuccessMsg] = useState<{ reward: CustomerRedeemedReward; title: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCoins = customer ? customer.opsCoins : 0;

  const filteredRewards = REWARD_CATALOG.filter((item) => {
    if (selectedFilter === 'all') return true;
    return item.rewardType === selectedFilter;
  });

  const handleStartRedeem = (reward: RewardItem) => {
    setErrorMsg(null);
    if (!customer) {
      onClose();
      onOpenAuth();
      return;
    }

    if (customer.opsCoins < reward.coinCost) {
      setErrorMsg(`Saldo OpsCoins tidak cukup. Anda membutuhkan ${reward.coinCost} koin (Saat ini: ${customer.opsCoins} koin).`);
      return;
    }

    setConfirmingReward(reward);
  };

  const handleExecuteRedeem = () => {
    if (!customer || !confirmingReward) return;

    if (customer.opsCoins < confirmingReward.coinCost) {
      setErrorMsg('Saldo OpsCoins tidak cukup!');
      setConfirmingReward(null);
      return;
    }

    // Generate unique code
    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
    const rewardPrefix = confirmingReward.rewardType === 'discount_voucher' 
      ? 'REW-DISC' 
      : confirmingReward.rewardType === 'free_koen'
      ? 'REW-KOEN'
      : confirmingReward.rewardType === 'free_mandor'
      ? 'REW-MANDOR'
      : 'REW-ADDON';
    
    const code = `${rewardPrefix}-${uniqueSuffix}`;

    const newRedeemed: CustomerRedeemedReward = {
      id: `red_${Date.now()}`,
      rewardId: confirmingReward.id,
      code: code,
      title: confirmingReward.title,
      rewardType: confirmingReward.rewardType,
      discountAmount: confirmingReward.discountAmount,
      freeKoenAmountMillion: confirmingReward.freeKoenAmountMillion,
      freeMandorHours: confirmingReward.freeMandorHours,
      addonType: confirmingReward.addonType,
      redeemedAt: new Date().toISOString(),
      isUsed: false,
    };

    const updatedCustomer: CustomerUser = {
      ...customer,
      opsCoins: customer.opsCoins - confirmingReward.coinCost,
      redeemedRewards: [newRedeemed, ...(customer.redeemedRewards || [])],
    };

    onRedeemSuccess(updatedCustomer, newRedeemed);
    setConfirmingReward(null);
    setRedeemSuccessMsg({
      reward: newRedeemed,
      title: confirmingReward.title,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto overscroll-contain">
      <div className="relative w-full max-w-3xl bg-zinc-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] sm:max-h-[90vh] my-auto">
        
        {/* Modal Top Header (Fixed) */}
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-black shrink-0">
              <Gift className="w-5 h-5 sm:w-6 sm:h-6 fill-black" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h3 className="font-tactical text-base sm:text-lg font-bold text-white uppercase tracking-wider">
                  TOKO PENUKARAN REWARDS
                </h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded border border-amber-500/30">
                  OPSCOINS
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Tukarkan koin hasil order joki dengan layanan gratis & kupon diskon
              </p>
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

        {/* Customer Balance Ribbon (Sticky) */}
        <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-zinc-950 to-zinc-900 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-2 flex-shrink-0">
          {customer ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl">
                <Coins className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-zinc-300">Saldo Anda:</span>
                <span className="text-base font-black font-tactical text-amber-400">{customer.opsCoins} Koin</span>
              </div>
              <span className="text-xs text-zinc-400 hidden sm:inline">
                Pangkat: <strong className="text-amber-300">{TIER_CONFIGS[customer.tier]?.name}</strong>
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2 text-xs text-amber-300 font-medium">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Masuk akun untuk melihat saldo koin dan menukarkan hadiah joki gratis!</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="px-3 py-1.5 bg-amber-500 text-black font-bold text-xs rounded-lg hover:bg-amber-400 transition-colors shrink-0"
              >
                Login Member
              </button>
            </div>
          )}

          {/* Quick Filter Tags */}
          <div className="flex items-center space-x-1 overflow-x-auto text-[11px] py-1">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'free_koen', label: 'Joki Gratis 1M-3M' },
              { id: 'free_mandor', label: 'Mandor Gratis' },
              { id: 'discount_voucher', label: 'Voucher Diskon' },
              { id: 'free_addon', label: 'Add-on Pass' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
                  selectedFilter === tab.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Redeemed Banner */}
          {redeemSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-white text-xs sm:text-sm">
                      Penukaran Berhasil! ({redeemSuccessMsg.title})
                    </h4>
                    <p className="text-xs text-emerald-300/90">
                      Kode kupon Anda telah dibuat dan otomatis tersimpan di menu akun.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRedeemSuccessMsg(null)}
                  className="text-zinc-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase">Kode Kupon Anda:</span>
                  <span className="font-mono text-sm font-black text-amber-400 tracking-wider">
                    {redeemSuccessMsg.reward.code}
                  </span>
                </div>

                {onApplyVoucherToOrder && (
                  <button
                    type="button"
                    onClick={() => {
                      onApplyVoucherToOrder(redeemSuccessMsg.reward);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase font-tactical rounded-xl shadow cursor-pointer"
                  >
                    Gunakan di Form Order Sekarang
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Rewards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredRewards.map((reward) => {
              const canAfford = customer ? customer.opsCoins >= reward.coinCost : false;
              
              return (
                <div
                  key={reward.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                    canAfford
                      ? 'bg-zinc-950/80 border-zinc-800 hover:border-amber-500/40 hover:shadow-lg'
                      : 'bg-zinc-950/40 border-zinc-800/60 opacity-80'
                  }`}
                >
                  {reward.popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-black text-[9px] font-black uppercase px-3 py-0.5 rounded-bl-xl shadow font-tactical">
                      POPULER
                    </div>
                  )}

                  <div>
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
                        {reward.rewardType === 'free_koen' ? (
                          <Coins className="w-5 h-5 fill-amber-400" />
                        ) : reward.rewardType === 'free_mandor' ? (
                          <ShieldCheck className="w-5 h-5" />
                        ) : reward.rewardType === 'discount_voucher' ? (
                          <Tag className="w-5 h-5" />
                        ) : (
                          <Zap className="w-5 h-5" />
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded">
                          {reward.badge}
                        </span>
                        <h4 className="font-bold text-white text-xs sm:text-sm mt-1 leading-snug">
                          {reward.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                          {reward.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-tactical font-black text-base text-amber-400">
                        {reward.coinCost}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-semibold">OpsCoins</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStartRedeem(reward)}
                      className={`px-3.5 py-1.5 rounded-xl font-tactical font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1 ${
                        canAfford
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-md'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      <span>{canAfford ? 'Tukar Sekarang' : 'Tukar Kupon'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Confirmation Modal Overlay */}
        {confirmingReward && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-md bg-zinc-900 border border-amber-500/50 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center space-x-3 text-amber-400">
                <Gift className="w-6 h-6" />
                <h4 className="font-tactical text-base font-bold text-white uppercase">
                  Konfirmasi Penukaran Koin
                </h4>
              </div>

              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-2">
                <span className="text-xs text-zinc-400 block">Anda akan menukarkan:</span>
                <p className="text-sm font-bold text-white">{confirmingReward.title}</p>
                <div className="flex justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800 font-mono">
                  <span>Biaya Koin:</span>
                  <span className="font-bold text-rose-400">-{confirmingReward.coinCost} OpsCoins</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-400 font-mono">
                  <span>Sisa Saldo Setelahnya:</span>
                  <span className="font-bold text-amber-400">
                    {customer ? customer.opsCoins - confirmingReward.coinCost : 0} OpsCoins
                  </span>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmingReward(null)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExecuteRedeem}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold font-tactical uppercase tracking-wider text-xs rounded-xl shadow-lg cursor-pointer"
                >
                  Ya, Tukarkan
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
