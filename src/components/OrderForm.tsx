import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  Users, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Check, 
  HelpCircle, 
  Info, 
  Tag, 
  ChevronRight, 
  QrCode, 
  Wallet, 
  Building2, 
  Lock, 
  MessageCircle,
  Flame,
  Radio,
  Sliders,
  Trophy,
  UserCheck,
  Gift,
  X
} from 'lucide-react';
import { 
  ServiceType, 
  PaymentMethod, 
  Order, 
  PriceConfig, 
  SystemSettings,
  CustomerUser,
  CustomerRedeemedReward 
} from '../types';
import { 
  formatRupiah, 
  generateInvoiceNumber, 
  generateUniqueCode 
} from '../utils/helpers';
import { TIER_CONFIGS, calculateCoinsEarned } from '../data/initialData';

interface OrderFormProps {
  initialServiceType?: ServiceType;
  priceConfig: PriceConfig;
  settings?: SystemSettings;
  onOrderCreated?: (order: Order) => void;
  onOrderSubmitted?: (order: Order) => void;
  currentCustomer?: CustomerUser | null;
  onOpenCustomerAuth?: () => void;
  activeAppliedVoucher?: CustomerRedeemedReward | null;
  onClearAppliedVoucher?: () => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  initialServiceType = 'joki_koen',
  priceConfig,
  settings,
  onOrderCreated,
  onOrderSubmitted,
  currentCustomer,
  onOpenCustomerAuth,
  activeAppliedVoucher,
  onClearAppliedVoucher,
}) => {
  const [serviceType, setServiceType] = useState<ServiceType>(initialServiceType);
  
  // Koen state
  const [selectedKoenPkgId, setSelectedKoenPkgId] = useState<string>('koen_5m');
  const [isCustomKoen, setIsCustomKoen] = useState<boolean>(false);
  const [customKoenAmount, setCustomKoenAmount] = useState<number>(7); // in Million

  // Mandor state
  const [selectedMandorPkgId, setSelectedMandorPkgId] = useState<string>('mandor_3raid');
  const [mandorPlayMode, setMandorPlayMode] = useState<'mabar_squad' | 'solo_escort'>('mabar_squad');
  const [mandorSelectedMap, setMandorSelectedMap] = useState<string>('Armory Lockdown');

  // Account details state
  const [gameNickname, setGameNickname] = useState<string>(currentCustomer?.gameNickname || '');
  const [gameUserId, setGameUserId] = useState<string>(currentCustomer?.gameUserId || '');
  const [loginMethod, setLoginMethod] = useState<'Level Infinite' | 'Facebook' | 'Google' | 'VK'>('Level Infinite');
  const [accountNotes, setAccountNotes] = useState<string>('');

  // Customer contact state
  const [customerName, setCustomerName] = useState<string>(currentCustomer?.name || '');
  const [customerWhatsApp, setCustomerWhatsApp] = useState<string>(currentCustomer?.whatsapp || '');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qris');

  // Add-ons
  const [isPrioritySpeed, setIsPrioritySpeed] = useState<boolean>(false);
  const [isStreamDiscord, setIsStreamDiscord] = useState<boolean>(false);
  const [isSafeLootOnly, setIsSafeLootOnly] = useState<boolean>(true);

  // Promo code & Vouchers
  const [promoCode, setPromoCode] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // When customer logs in or updates, auto-populate details if empty
  useEffect(() => {
    if (currentCustomer) {
      if (!customerName) setCustomerName(currentCustomer.name);
      if (!customerWhatsApp) setCustomerWhatsApp(currentCustomer.whatsapp);
      if (!gameNickname && currentCustomer.gameNickname) setGameNickname(currentCustomer.gameNickname);
      if (!gameUserId && currentCustomer.gameUserId) setGameUserId(currentCustomer.gameUserId);
    }
  }, [currentCustomer]);

  // When activeAppliedVoucher is received, calculate and apply discount/perk
  useEffect(() => {
    if (activeAppliedVoucher) {
      if (activeAppliedVoucher.rewardType === 'discount_voucher' && activeAppliedVoucher.discountAmount) {
        setAppliedDiscount(activeAppliedVoucher.discountAmount);
        setPromoMessage({
          text: `Kupon Reward Aktif: ${activeAppliedVoucher.title} (-${formatRupiah(activeAppliedVoucher.discountAmount)})`,
          isError: false,
        });
      } else if (activeAppliedVoucher.rewardType === 'free_addon') {
        if (activeAppliedVoucher.addonType === 'priority') {
          setIsPrioritySpeed(true);
        } else if (activeAppliedVoucher.addonType === 'stream') {
          setIsStreamDiscord(true);
        }
        setPromoMessage({
          text: `Kupon Reward Aktif: ${activeAppliedVoucher.title} (Gratis Add-On!)`,
          isError: false,
        });
      } else if (activeAppliedVoucher.rewardType === 'free_koen') {
        setServiceType('joki_koen');
        setIsCustomKoen(false);
        if (activeAppliedVoucher.freeKoenAmountMillion === 1) {
          setSelectedKoenPkgId('koen_1m');
          setAppliedDiscount(25000);
        } else if (activeAppliedVoucher.freeKoenAmountMillion === 3) {
          setSelectedKoenPkgId('koen_3m');
          setAppliedDiscount(70000);
        }
        setPromoMessage({
          text: `Kupon Reward Aktif: ${activeAppliedVoucher.title} (100% Gratis!)`,
          isError: false,
        });
      }
    }
  }, [activeAppliedVoucher]);

  // Sync initial service type if prop changes
  useEffect(() => {
    if (initialServiceType) {
      setServiceType(initialServiceType);
    }
  }, [initialServiceType]);

  // Calculate pricing
  const calculateBasePrice = (): { basePrice: number; packageName: string } => {
    if (serviceType === 'joki_koen') {
      if (isCustomKoen) {
        // base rate per million with small volume discount
        let rate = priceConfig.koenPerMillionRate;
        if (customKoenAmount >= 15) rate = Math.round(rate * 0.85);
        else if (customKoenAmount >= 8) rate = Math.round(rate * 0.9);
        
        return {
          basePrice: customKoenAmount * rate,
          packageName: `Custom ${customKoenAmount} Juta Koen (${customKoenAmount}M)`
        };
      } else {
        const pkg = priceConfig.koenPackages.find(p => p.id === selectedKoenPkgId) || priceConfig.koenPackages[0];
        return {
          basePrice: pkg.price,
          packageName: pkg.title
        };
      }
    } else {
      const pkg = priceConfig.mandorPackages.find(p => p.id === selectedMandorPkgId) || priceConfig.mandorPackages[0];
      return {
        basePrice: pkg.price,
        packageName: `${pkg.title} (${mandorSelectedMap})`
      };
    }
  };

  const { basePrice, packageName } = calculateBasePrice();

  // Add-ons total
  let addOnsTotal = 0;
  if (isPrioritySpeed) addOnsTotal += priceConfig.prioritySpeedFee;
  if (isStreamDiscord) addOnsTotal += priceConfig.streamDiscordFee;
  if (isSafeLootOnly) addOnsTotal += priceConfig.safeLootGuaranteeFee;

  const subTotal = basePrice + addOnsTotal;
  const uniqueCode = 421; // fixed display or computed
  const finalTotal = Math.max(0, subTotal - appliedDiscount) + (paymentMethod !== 'qris' ? uniqueCode : 0);

  // Apply promo code handler
  const handleApplyPromo = (codeToApply?: string) => {
    const code = (codeToApply || promoCode).trim().toUpperCase();
    if (!code) return;

    // Check customer redeemed rewards first
    const foundUserVoucher = currentCustomer?.redeemedRewards?.find(
      (r) => r.code.toUpperCase() === code && !r.isUsed
    );

    if (foundUserVoucher) {
      if (foundUserVoucher.rewardType === 'discount_voucher' && foundUserVoucher.discountAmount) {
        setAppliedDiscount(foundUserVoucher.discountAmount);
        setPromoMessage({ text: `Kupon Reward ${foundUserVoucher.code} Aktif! Diskon ${formatRupiah(foundUserVoucher.discountAmount)}`, isError: false });
      } else if (foundUserVoucher.rewardType === 'free_addon') {
        if (foundUserVoucher.addonType === 'priority') setIsPrioritySpeed(true);
        if (foundUserVoucher.addonType === 'stream') setIsStreamDiscord(true);
        setPromoMessage({ text: `Kupon Reward ${foundUserVoucher.code} Aktif! Free Add-on diterapkan`, isError: false });
      } else if (foundUserVoucher.rewardType === 'free_koen') {
        setServiceType('joki_koen');
        setIsCustomKoen(false);
        const amountDisc = foundUserVoucher.freeKoenAmountMillion === 1 ? 25000 : 70000;
        setAppliedDiscount(amountDisc);
        setPromoMessage({ text: `Kupon ${foundUserVoucher.code} Aktif! Joki Koen Gratis`, isError: false });
      }
      return;
    }

    if (code === 'ARENA2026' || code === 'MANDORPRO') {
      const disc = Math.round(subTotal * 0.1); // 10% OFF
      setAppliedDiscount(disc);
      setPromoMessage({ text: `Kode ${code} Berhasil! Diskon 10% (-${formatRupiah(disc)})`, isError: false });
    } else if (code === 'SULTAN50') {
      setAppliedDiscount(25000);
      setPromoMessage({ text: `Kode SULTAN50 Berhasil! Potongan Rp 25.000`, isError: false });
    } else {
      setAppliedDiscount(0);
      setPromoMessage({ text: 'Kode promo tidak valid atau sudah kadaluarsa', isError: true });
    }
  };

  // Form submit handler
  const handleSubmitOrder = (e: React.FormEvent) => {
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
      alert('Silakan masukkan Nomor WhatsApp aktif untuk menerima update pesanan real-time');
      return;
    }

    const uniqueCd = generateUniqueCode();
    const invoiceNum = generateInvoiceNumber();
    const now = new Date().toISOString();

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      invoiceNumber: invoiceNum,
      serviceType,
      serviceName: serviceType === 'joki_koen' ? 'Joki Koen Arena Breakout' : 'Joki Mandor Escort Raid',
      packageName,
      koenAmountMillion: serviceType === 'joki_koen' 
        ? (isCustomKoen ? customKoenAmount : priceConfig.koenPackages.find(p => p.id === selectedKoenPkgId)?.amountMillion)
        : undefined,
      mandorPackageType: serviceType === 'joki_mandor'
        ? (priceConfig.mandorPackages.find(p => p.id === selectedMandorPkgId)?.type)
        : undefined,
      mandorRaidsCount: serviceType === 'joki_mandor'
        ? (priceConfig.mandorPackages.find(p => p.id === selectedMandorPkgId)?.quantity)
        : undefined,
      mandorMap: mandorSelectedMap,
      mandorPlayMode,
      gameNickname,
      loginMethod,
      gameUserId,
      accountNotes,
      customerName,
      customerWhatsApp,
      basePrice: subTotal,
      discount: appliedDiscount,
      uniqueCode: paymentMethod === 'qris' ? 0 : uniqueCd,
      totalPrice: Math.max(0, subTotal - appliedDiscount) + (paymentMethod === 'qris' ? 0 : uniqueCd),
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'unpaid',
      createdAt: now,
      currentProgressPercent: 0,
      progressHistory: [],
      isPrioritySpeed,
      isStreamDiscord,
      isSafeLootOnly,
    };

    if (onOrderCreated) {
      onOrderCreated(newOrder);
    } else if (onOrderSubmitted) {
      onOrderSubmitted(newOrder);
    }
  };

  const estimatedCoins = calculateCoinsEarned(finalTotal, currentCustomer ? currentCustomer.tier : 'recruit');
  const activeVouchers = currentCustomer?.redeemedRewards?.filter((r) => !r.isUsed) || [];

  return (
    <div id="order-form-container" className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Optional Customer Membership & Rewards Status Strip */}
      {currentCustomer ? (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-zinc-900 to-zinc-900 border border-amber-500/40 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3 text-left w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-tactical font-black text-base">
              {currentCustomer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white">
                  Member: {currentCustomer.name}
                </span>
                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded border ${TIER_CONFIGS[currentCustomer.tier]?.badgeBg}`}>
                  {TIER_CONFIGS[currentCustomer.tier]?.name}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Saldo: <strong className="text-amber-400">{currentCustomer.opsCoins} OpsCoins</strong> • Cashback Bonus: <strong className="text-emerald-400">+{Math.round((TIER_CONFIGS[currentCustomer.tier]?.coinMultiplier - 1) * 100)}%</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2.5 py-1 rounded-lg border border-amber-500/30 flex items-center space-x-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>Dapat +{estimatedCoins} Koin dari order ini</span>
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 text-amber-300">
            <Coins className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Dapatkan Cashback OpsCoins & Joki Gratis!</strong> Login akun member (opsional) untuk kumpulkan koin & naikkan tier pangkat.
            </span>
          </div>
          {onOpenCustomerAuth && (
            <button
              type="button"
              onClick={onOpenCustomerAuth}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold font-tactical uppercase tracking-wider text-xs rounded-xl shadow cursor-pointer whitespace-nowrap"
            >
              Masuk / Daftar (+50 Koin)
            </button>
          )}
        </div>
      )}

      {/* Active Voucher Banner if applied */}
      {activeAppliedVoucher && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center space-x-2">
            <Gift className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Kupon Diterapkan: <strong>{activeAppliedVoucher.title}</strong> ({activeAppliedVoucher.code})
            </span>
          </div>
          {onClearAppliedVoucher && (
            <button
              type="button"
              onClick={onClearAppliedVoucher}
              className="p-1 text-zinc-400 hover:text-white rounded"
              title="Hapus kupon"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Service Type Switcher Tabs (Only 2 types as requested) */}
      <div className="flex bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-800 shadow-xl max-w-xl mx-auto mb-8">
        <button
          type="button"
          id="btn-tab-joki-koen"
          onClick={() => setServiceType('joki_koen')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-tactical text-base sm:text-lg font-bold tracking-wide transition-all cursor-pointer ${
            serviceType === 'joki_koen'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/25'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          <Coins className="w-5 h-5" />
          <span>JOKI KOEN</span>
          <span className="text-[10px] bg-black/20 text-black px-1.5 py-0.5 rounded font-sans uppercase">
            Cepat
          </span>
        </button>

        <button
          type="button"
          id="btn-tab-joki-mandor"
          onClick={() => setServiceType('joki_mandor')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-tactical text-base sm:text-lg font-bold tracking-wide transition-all cursor-pointer ${
            serviceType === 'joki_mandor'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/25'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>JOKI MANDOR RAID</span>
          <span className="text-[10px] bg-black/20 text-black px-1.5 py-0.5 rounded font-sans uppercase">
            Carry Pro
          </span>
        </button>
      </div>

      <form onSubmit={handleSubmitOrder} className="space-y-8">

        {/* STEP 1: Pilih Paket Layanan */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 sm:p-7 shadow-lg">
          <div className="flex items-center space-x-3 mb-5 pb-3 border-b border-zinc-800">
            <span className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-tactical font-black text-lg flex items-center justify-center">
              1
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white font-tactical uppercase tracking-wider">
                {serviceType === 'joki_koen' ? 'PILIH JUMLAH JOKI KOEN' : 'PILIH PAKET JOKI MANDOR (ESCORT)'}
              </h2>
              <p className="text-xs text-zinc-400">
                {serviceType === 'joki_koen' 
                  ? 'Pilih nominal paket Koen atau gunakan kalkulator custom' 
                  : 'Pilih paket per raid atau per jam mabar dipandu pro player'}
              </p>
            </div>
          </div>

          {/* JOKI KOEN PACKAGES */}
          {serviceType === 'joki_koen' && (
            <div className="space-y-5">
              {/* Preset Packages Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {priceConfig.koenPackages.map((pkg) => {
                  const isSelected = !isCustomKoen && selectedKoenPkgId === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      id={`koen-pkg-${pkg.id}`}
                      onClick={() => {
                        setIsCustomKoen(false);
                        setSelectedKoenPkgId(pkg.id);
                      }}
                      className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 shadow-md shadow-amber-500/10'
                          : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900/60'
                      }`}
                    >
                      {pkg.popular && (
                        <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow">
                          POPULAR 🔥
                        </span>
                      )}

                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-tactical text-lg font-bold text-white tracking-wide">
                            {pkg.title}
                          </h3>
                          <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">
                            {pkg.description}
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'border-amber-400 bg-amber-400 text-black' : 'border-zinc-700'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-baseline justify-between">
                        <div>
                          <span className="text-base sm:text-lg font-extrabold text-amber-400 font-tactical">
                            {formatRupiah(pkg.price)}
                          </span>
                          {pkg.originalPrice > pkg.price && (
                            <span className="text-xs text-zinc-500 line-through ml-2">
                              {formatRupiah(pkg.originalPrice)}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-400 font-medium">
                          ~15-45 Menit
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Custom Koen Calculator Card */}
                <div
                  id="koen-pkg-custom"
                  onClick={() => setIsCustomKoen(true)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    isCustomKoen
                      ? 'border-amber-500 bg-amber-500/10 shadow-md shadow-amber-500/10'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <Sliders className="w-4 h-4 text-amber-400" />
                        <h3 className="font-tactical text-lg font-bold text-white tracking-wide">
                          Custom Nominal Koen
                        </h3>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Atur nominal bebas hingga 50 Juta Koen
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      isCustomKoen ? 'border-amber-400 bg-amber-400 text-black' : 'border-zinc-700'
                    }`}>
                      {isCustomKoen && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-baseline justify-between">
                    <span className="text-sm text-amber-400 font-bold">
                      Kalkulator Bebas
                    </span>
                    <span className="text-[11px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                      Diskon Tier
                    </span>
                  </div>
                </div>
              </div>

              {/* Slider for Custom Koen if active */}
              {isCustomKoen && (
                <div className="bg-zinc-950 p-4 sm:p-5 rounded-xl border border-amber-500/30 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-zinc-200">
                      Tentukan Jumlah Koen: <span className="text-amber-400 text-lg font-tactical">{customKoenAmount} Juta Koen ({customKoenAmount}M)</span>
                    </label>
                    <span className="text-xs text-emerald-400 font-semibold">
                      {customKoenAmount >= 15 ? '🔥 Diskon Spesial 15%' : customKoenAmount >= 8 ? '✨ Diskon Tier 10%' : 'Tarif Standar'}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={customKoenAmount}
                    onChange={(e) => setCustomKoenAmount(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />

                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>1M</span>
                    <span>10M</span>
                    <span>25M</span>
                    <span>50M (Mega Stash)</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* JOKI MANDOR PACKAGES */}
          {serviceType === 'joki_mandor' && (
            <div className="space-y-6">
              {/* Play Mode Choice */}
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-2">
                  PILIH METODE MANDOR:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setMandorPlayMode('mabar_squad')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      mandorPlayMode === 'mabar_squad'
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-sm text-white">Mabar Dibimbing (Party Squad)</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                      Anda ikut bermain di room/party, pro joki mengawal, melumpuhkan boss, dan membagi loot mahal.
                    </p>
                  </div>

                  <div
                    onClick={() => setMandorPlayMode('solo_escort')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      mandorPlayMode === 'solo_escort'
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-sm text-white">Joki Akun (Dimainkan Pro Joki)</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                      Akun Anda login dimainkan langsung oleh pro player joki tanpa perlu Anda repot bermain.
                    </p>
                  </div>
                </div>
              </div>

              {/* Target Map Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-2">
                  PILIH TARGET MAP MANDOR:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {[
                    'Farm Lockdown',
                    'Valley Lockdown',
                    'Northridge Lockdown',
                    'Armory Lockdown',
                    'TV Station',
                    'Port Lockdown'
                  ].map((mapName) => (
                    <button
                      key={mapName}
                      type="button"
                      onClick={() => setMandorSelectedMap(mapName)}
                      className={`p-2.5 rounded-lg text-xs font-bold border transition-all text-center ${
                        mandorSelectedMap === mapName
                          ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      {mapName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mandor Packages Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {priceConfig.mandorPackages.map((pkg) => {
                  const isSelected = selectedMandorPkgId === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      id={`mandor-pkg-${pkg.id}`}
                      onClick={() => setSelectedMandorPkgId(pkg.id)}
                      className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 shadow-md shadow-amber-500/10'
                          : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900/60'
                      }`}
                    >
                      {pkg.popular && (
                        <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow">
                          RECOMMENDED 🔥
                        </span>
                      )}

                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-tactical text-lg font-bold text-white tracking-wide">
                            {pkg.title}
                          </h3>
                          <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">
                            {pkg.description}
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'border-amber-400 bg-amber-400 text-black' : 'border-zinc-700'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-baseline justify-between">
                        <div>
                          <span className="text-base sm:text-lg font-extrabold text-amber-400 font-tactical">
                            {formatRupiah(pkg.price)}
                          </span>
                          {pkg.originalPrice > pkg.price && (
                            <span className="text-xs text-zinc-500 line-through ml-2">
                              {formatRupiah(pkg.originalPrice)}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-400 font-medium">
                          Garansi Evakuasi
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* STEP 2: Data Akun & Kontak */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 sm:p-7 shadow-lg">
          <div className="flex items-center space-x-3 mb-5 pb-3 border-b border-zinc-800">
            <span className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-tactical font-black text-lg flex items-center justify-center">
              2
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white font-tactical uppercase tracking-wider">
                DATA AKUN & KONTAK PELANGGAN
              </h2>
              <p className="text-xs text-zinc-400">
                Informasi login & WhatsApp untuk notifikasi otomatis pembaruan status
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nickname */}
            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1.5">
                Nickname Arena Breakout <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                id="input-game-nickname"
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
                id="select-login-method"
                value={loginMethod}
                onChange={(e) => setLoginMethod(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              >
                <option value="Level Infinite">Level Infinite Pass (Rekomendasi)</option>
                <option value="Facebook">Facebook Login</option>
                <option value="Google">Google Play Games</option>
                <option value="VK">VK Account</option>
              </select>
            </div>

            {/* Nama Pelanggan */}
            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1.5">
                Nama Lengkap Anda <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                id="input-customer-name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: Bima Satria"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* No WhatsApp */}
            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1.5">
                Nomor WhatsApp Aktif <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  id="input-customer-whatsapp"
                  value={customerWhatsApp}
                  onChange={(e) => setCustomerWhatsApp(e.target.value)}
                  placeholder="081234567890"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
                <span className="absolute right-3 top-2.5 text-[11px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                  Notif WA Realtime
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Sistem akan mengirim link bukti progres & notifikasi ke nomor ini.
              </p>
            </div>
          </div>

          {/* Account Notes */}
          <div className="mt-4">
            <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1.5">
              Catatan Khusus untuk Joki (Opsional)
            </label>
            <textarea
              rows={2}
              id="input-account-notes"
              value={accountNotes}
              onChange={(e) => setAccountNotes(e.target.value)}
              placeholder="Contoh: Senjata di Stash bebas pakai, mohon jangan jual kunci Farm/Motel..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Add-ons Checklist */}
          <div className="mt-5 pt-4 border-t border-zinc-800/80 space-y-2.5">
            <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">
              OPSI TAMBAHAN (ADD-ONS):
            </label>
            
            <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 cursor-pointer">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="addon-priority"
                  checked={isPrioritySpeed}
                  onChange={(e) => setIsPrioritySpeed(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-zinc-900 border-zinc-700 focus:ring-amber-400"
                />
                <div>
                  <span className="text-xs sm:text-sm font-bold text-white">Prioritas Ekspres (Langsung Dikerjakan)</span>
                  <p className="text-[11px] text-zinc-400">Langsung dikerjakan tanpa antrean regular</p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-400">
                +{formatRupiah(priceConfig.prioritySpeedFee)}
              </span>
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 cursor-pointer">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="addon-stream"
                  checked={isStreamDiscord}
                  onChange={(e) => setIsStreamDiscord(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-zinc-900 border-zinc-700 focus:ring-amber-400"
                />
                <div>
                  <span className="text-xs sm:text-sm font-bold text-white">Live Stream Discord / Record POV</span>
                  <p className="text-[11px] text-zinc-400">Tonton langsung aksi joki saat raid di Discord server VIP</p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-400">
                +{formatRupiah(priceConfig.streamDiscordFee)}
              </span>
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 cursor-pointer">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="addon-safeloot"
                  checked={isSafeLootOnly}
                  onChange={(e) => setIsSafeLootOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-zinc-900 border-zinc-700 focus:ring-amber-400"
                />
                <div>
                  <span className="text-xs sm:text-sm font-bold text-white">Garansi Safe Stash Extraction (Anti-Minus)</span>
                  <p className="text-[11px] text-zinc-400">Garansi joki ganti rugi 100% jika ada gear hilang</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400">
                +{formatRupiah(priceConfig.safeLootGuaranteeFee)} (Included)
              </span>
            </label>
          </div>
        </div>

        {/* STEP 3: Metode Pembayaran Otomatis */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 sm:p-7 shadow-lg">
          <div className="flex items-center space-x-3 mb-5 pb-3 border-b border-zinc-800">
            <span className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-tactical font-black text-lg flex items-center justify-center">
              3
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white font-tactical uppercase tracking-wider">
                PILIH METODE PEMBAYARAN OTOMATIS
              </h2>
              <p className="text-xs text-zinc-400">
                Mendukung QRIS instan, E-Wallet, dan Virtual Account Bank lokal
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* QRIS Category */}
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                <QrCode className="w-4 h-4" />
                <span>QRIS Instant (Semua Bank & E-Wallet) - Rekomendasi</span>
              </div>
              <div
                id="pay-method-qris"
                onClick={() => setPaymentMethod('qris')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  paymentMethod === 'qris'
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-white p-1 flex items-center justify-center">
                    <QrCode className="w-7 h-7 text-black" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">QRIS Auto Detect 24 Jam</h4>
                    <p className="text-xs text-zinc-400">GoPay, OVO, DANA, BCA, Mandiri, ShopeePay, LinkAja</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded">
                    Bebas Biaya Admin
                  </span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'qris' ? 'border-amber-400 bg-amber-400 text-black' : 'border-zinc-700'
                  }`}>
                    {paymentMethod === 'qris' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              </div>
            </div>

            {/* E-Wallet Category */}
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                <Wallet className="w-4 h-4" />
                <span>E-Wallet Direct API</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'dana', name: 'DANA', color: 'text-sky-400' },
                  { id: 'gopay', name: 'GoPay', color: 'text-emerald-400' },
                  { id: 'ovo', name: 'OVO', color: 'text-purple-400' },
                  { id: 'shopeepay', name: 'ShopeePay', color: 'text-orange-400' },
                ].map((ew) => (
                  <div
                    key={ew.id}
                    id={`pay-method-${ew.id}`}
                    onClick={() => setPaymentMethod(ew.id as any)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      paymentMethod === ew.id
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <span className={`font-black text-sm ${ew.color}`}>{ew.name}</span>
                      <p className="text-[10px] text-zinc-500">Auto Verification</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === ew.id ? 'border-amber-400 bg-amber-400 text-black' : 'border-zinc-700'
                    }`}>
                      {paymentMethod === ew.id && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Virtual Account / Bank Transfer */}
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                <Building2 className="w-4 h-4" />
                <span>Bank Transfer / Virtual Account</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'bca', name: 'BCA VA / Transfer' },
                  { id: 'mandiri', name: 'Mandiri VA' },
                  { id: 'bni', name: 'BNI VA' },
                  { id: 'bri', name: 'BRI VA' },
                ].map((bk) => (
                  <div
                    key={bk.id}
                    id={`pay-method-${bk.id}`}
                    onClick={() => setPaymentMethod(bk.id as any)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      paymentMethod === bk.id
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs text-white">{bk.name}</span>
                      <p className="text-[10px] text-zinc-500">Cek Otomatis 24 Jam</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === bk.id ? 'border-amber-400 bg-amber-400 text-black' : 'border-zinc-700'
                    }`}>
                      {paymentMethod === bk.id && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* STEP 4: Promo Code & Ringkasan Checkout */}
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-amber-500/30 rounded-2xl p-5 sm:p-7 shadow-2xl">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-zinc-800">
            <div>
              <h2 className="text-xl font-bold text-white font-tactical uppercase tracking-wider">
                RINGKASAN TOTAL PEMBAYARAN
              </h2>
              <p className="text-xs text-zinc-400">
                Layanan: <span className="text-amber-400 font-semibold">{packageName}</span>
              </p>
            </div>
            <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2.5 py-1 rounded border border-amber-500/40">
              GARANSI 100% AMAN
            </span>
          </div>

          {/* Promo Code Input */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1.5">
              Punya Kode Promo / Voucher Diskon? (Coba: ARENA2026 atau SULTAN50)
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="text"
                  id="input-promo-code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Masukkan Kode Voucher / Kode Penukaran..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                type="button"
                id="btn-apply-promo"
                onClick={() => handleApplyPromo()}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold text-xs rounded-xl border border-zinc-700 transition-colors cursor-pointer"
              >
                Terapkan
              </button>
            </div>

            {/* Quick Unused Vouchers of Logged In Customer */}
            {activeVouchers.length > 0 && (
              <div className="mt-2.5 p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1.5 flex items-center space-x-1">
                  <Gift className="w-3 h-3" />
                  <span>Kupon Reward Milik Anda Tersedia ({activeVouchers.length}):</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeVouchers.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setPromoCode(v.code);
                        handleApplyPromo(v.code);
                      }}
                      className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center space-x-1"
                    >
                      <span>{v.title}</span>
                      <span className="text-[10px] text-zinc-400">({v.code})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {promoMessage && (
              <p className={`text-xs mt-1.5 font-medium ${promoMessage.isError ? 'text-rose-400' : 'text-emerald-400'}`}>
                {promoMessage.text}
              </p>
            )}
          </div>

          {/* Breakdown Items */}
          <div className="space-y-2 text-xs sm:text-sm border-t border-zinc-800/80 pt-4">
            <div className="flex justify-between text-zinc-300">
              <span>Biaya Paket ({packageName})</span>
              <span className="font-semibold text-white">{formatRupiah(basePrice)}</span>
            </div>

            {isPrioritySpeed && (
              <div className="flex justify-between text-zinc-400">
                <span>Add-on Prioritas Ekspres</span>
                <span>+{formatRupiah(priceConfig.prioritySpeedFee)}</span>
              </div>
            )}

            {isStreamDiscord && (
              <div className="flex justify-between text-zinc-400">
                <span>Add-on Live Stream Discord</span>
                <span>+{formatRupiah(priceConfig.streamDiscordFee)}</span>
              </div>
            )}

            {appliedDiscount > 0 && (
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Diskon Kode Promo</span>
                <span>-{formatRupiah(appliedDiscount)}</span>
              </div>
            )}

            {paymentMethod !== 'qris' && (
              <div className="flex justify-between text-zinc-400">
                <span>Kode Unik Verifikasi Otomatis</span>
                <span>+{uniqueCode}</span>
              </div>
            )}

            <div className="flex justify-between text-base sm:text-xl font-bold font-tactical pt-3 border-t border-zinc-800 text-white">
              <span>TOTAL DIBAYARKAN:</span>
              <span className="text-amber-400 font-black tracking-wide text-xl sm:text-2xl">
                {formatRupiah(finalTotal)}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="btn-submit-order"
            className="w-full mt-6 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-base sm:text-lg font-tactical uppercase tracking-wider rounded-xl shadow-xl shadow-amber-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] cursor-pointer"
          >
            <Flame className="w-5 h-5 fill-black text-black" />
            <span>BUAT PESANAN & BAYAR SEKARANG ({formatRupiah(finalTotal)})</span>
          </button>

          <p className="text-center text-[11px] text-zinc-500 mt-3">
            🔒 Transaksi dilindungi enkripsi SSL 256-bit. Notifikasi & resi invoice akan dikirim ke WhatsApp Anda.
          </p>
        </div>

      </form>
    </div>
  );
};
