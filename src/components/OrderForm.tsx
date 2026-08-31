import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  Users, 
  ShieldCheck, 
  Check, 
  Sliders,
  Flame,
  Gift,
  X,
  ArrowRight,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { 
  ServiceType, 
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
import { AccountDetailsModal } from './AccountDetailsModal';
import { PaymentModal } from './PaymentModal';

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
  const [customKoenAmount, setCustomKoenAmount] = useState<number>(7);

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

  // Add-ons
  const [isPrioritySpeed, setIsPrioritySpeed] = useState<boolean>(false);
  const [isStreamDiscord, setIsStreamDiscord] = useState<boolean>(false);
  const [isSafeLootOnly, setIsSafeLootOnly] = useState<boolean>(true);

  // Promo code & Vouchers
  const [promoCode, setPromoCode] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);

  // Modal states
  const [showAccountModal, setShowAccountModal] = useState<boolean>(false);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (currentCustomer) {
      if (!customerName) setCustomerName(currentCustomer.name);
      if (!customerWhatsApp) setCustomerWhatsApp(currentCustomer.whatsapp);
      if (!gameNickname && currentCustomer.gameNickname) setGameNickname(currentCustomer.gameNickname);
      if (!gameUserId && currentCustomer.gameUserId) setGameUserId(currentCustomer.gameUserId);
    }
  }, [currentCustomer]);

  useEffect(() => {
    if (activeAppliedVoucher) {
      if (activeAppliedVoucher.rewardType === 'discount_voucher' && activeAppliedVoucher.discountAmount) {
        setAppliedDiscount(activeAppliedVoucher.discountAmount);
      } else if (activeAppliedVoucher.rewardType === 'free_addon') {
        if (activeAppliedVoucher.addonType === 'priority') {
          setIsPrioritySpeed(true);
        } else if (activeAppliedVoucher.addonType === 'stream') {
          setIsStreamDiscord(true);
        }
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
      }
    }
  }, [activeAppliedVoucher]);

  useEffect(() => {
    if (initialServiceType) {
      setServiceType(initialServiceType);
    }
  }, [initialServiceType]);

  const calculateBasePrice = (): { basePrice: number; packageName: string } => {
    if (serviceType === 'joki_koen') {
      if (isCustomKoen) {
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
  const finalTotal = Math.max(0, basePrice - appliedDiscount);

  // Handle package selection - open account modal
  const handlePackageSelected = () => {
    setShowAccountModal(true);
  };

  // Handle account details saved - create order and show payment
  const handleAccountDetailsSaved = (details: {
    gameNickname: string;
    gamePassword?: string;
    gameUserId: string;
    loginMethod: string;
    accountNotes: string;
    customerName: string;
    customerWhatsApp: string;
  }) => {
    setGameNickname(details.gameNickname);
    setGameUserId(details.gameUserId);
    setLoginMethod(details.loginMethod as any);
    setAccountNotes(details.accountNotes);
    setCustomerName(details.customerName);
    setCustomerWhatsApp(details.customerWhatsApp);
    setShowAccountModal(false);

    // Create order
    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(),
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
      gameNickname: details.gameNickname,
      gamePassword: details.gamePassword,
      loginMethod: details.loginMethod as any,
      gameUserId: details.gameUserId,
      accountNotes: details.accountNotes,
      customerName: details.customerName,
      customerWhatsApp: details.customerWhatsApp,
      basePrice,
      discount: appliedDiscount,
      uniqueCode: 0,
      totalPrice: finalTotal,
      paymentMethod: 'manual',
      paymentStatus: 'pending',
      orderStatus: 'unpaid',
      createdAt: new Date().toISOString(),
      currentProgressPercent: 0,
      progressHistory: [],
      isPrioritySpeed: false,
      isStreamDiscord: false,
      isSafeLootOnly: false
    };

    // Immediately notify App and save to Firestore & LocalStorage
    try {
      localStorage.setItem('breakoutops_active_order', JSON.stringify(newOrder));
      localStorage.setItem('breakoutops_pending_invoice', newOrder.invoiceNumber);
    } catch {}

    if (onOrderCreated) {
      onOrderCreated(newOrder);
    } else if (onOrderSubmitted) {
      onOrderSubmitted(newOrder);
    }

    setPaymentOrder(newOrder);
  };

  const estimatedCoins = calculateCoinsEarned(finalTotal, currentCustomer ? currentCustomer.tier : 'recruit');
  const activeVouchers = currentCustomer?.redeemedRewards?.filter((r) => !r.isUsed) || [];

  return (
    <>
      <div id="order-form-container" className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-32 space-y-6">
        
        {/* Customer Membership Strip */}
        {currentCustomer ? (
          <div className="p-4 rounded-2xl bg-white border border-amber-300 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3 text-left w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 font-tactical font-black text-base">
                {currentCustomer.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-900">
                    Member: {currentCustomer.name}
                  </span>
                  <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded border ${TIER_CONFIGS[currentCustomer.tier]?.badgeBg}`}>
                    {TIER_CONFIGS[currentCustomer.tier]?.name}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Saldo: <strong className="text-amber-700">{currentCustomer.opsCoins} OpsCoins</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded-lg border border-amber-300 flex items-center space-x-1 shadow-xs">
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                <span>+{estimatedCoins} Koin</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2 text-slate-700">
              <Coins className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Dapatkan Cashback OpsCoins & Joki Gratis!</strong> Login akun member untuk kumpulkan koin.
              </span>
            </div>
            {onOpenCustomerAuth && (
              <button
                type="button"
                onClick={onOpenCustomerAuth}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold font-tactical uppercase tracking-wider text-xs rounded-xl shadow cursor-pointer whitespace-nowrap"
              >
                Masuk / Daftar
              </button>
            )}
          </div>
        )}

        {/* Active Voucher Banner */}
        {activeAppliedVoucher && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between text-xs text-emerald-900 shadow-xs">
            <div className="flex items-center space-x-2">
              <Gift className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Kupon Diterapkan: <strong>{activeAppliedVoucher.title}</strong>
              </span>
            </div>
            {onClearAppliedVoucher && (
              <button
                type="button"
                onClick={onClearAppliedVoucher}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Service Type Tabs */}
        <div className="flex bg-slate-200/80 p-1.5 rounded-2xl border border-slate-300 shadow-inner max-w-xl mx-auto mb-8">
          <button
            type="button"
            onClick={() => setServiceType('joki_koen')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-tactical text-base sm:text-lg font-bold tracking-wide transition-all cursor-pointer ${
              serviceType === 'joki_koen'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Coins className="w-5 h-5" />
            <span>JOKI KOEN</span>
          </button>

          <button
            type="button"
            onClick={() => setServiceType('joki_mandor')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-tactical text-base sm:text-lg font-bold tracking-wide transition-all cursor-pointer ${
              serviceType === 'joki_mandor'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>JOKI MANDOR RAID</span>
          </button>
        </div>

        {/* JOKI KOEN PACKAGES */}
        {serviceType === 'joki_koen' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-sm">
            <div className="flex items-center space-x-3 mb-5 pb-3 border-b border-slate-200">
              <span className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 font-tactical font-black text-lg flex items-center justify-center">
                1
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-tactical uppercase tracking-wider">
                  PILIH JUMLAH JOKI KOEN
                </h2>
                <p className="text-xs text-slate-500">
                  Pilih nominal paket Koen atau gunakan kalkulator custom
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {priceConfig.koenPackages.map((pkg) => {
                  const isSelected = !isCustomKoen && selectedKoenPkgId === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => {
                        setIsCustomKoen(false);
                        setSelectedKoenPkgId(pkg.id);
                      }}
                      className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/70 shadow-sm'
                          : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      {pkg.popular && (
                        <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                          POPULAR 🔥
                        </span>
                      )}

                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-tactical text-lg font-bold text-slate-900 tracking-wide">
                            {pkg.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {pkg.description}
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'border-amber-500 bg-amber-500 text-black' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200 flex items-baseline justify-between">
                        <div>
                          <span className="text-base sm:text-lg font-extrabold text-amber-700 font-tactical">
                            {formatRupiah(pkg.price)}
                          </span>
                          {pkg.originalPrice > pkg.price && (
                            <span className="text-xs text-slate-400 line-through ml-2">
                              {formatRupiah(pkg.originalPrice)}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          ~15-45 Menit
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Custom Koen */}
                <div
                  onClick={() => {
                    setIsCustomKoen(true);
                  }}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    isCustomKoen
                      ? 'border-amber-500 bg-amber-50/70 shadow-sm'
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <Sliders className="w-4 h-4 text-amber-600" />
                        <h3 className="font-tactical text-lg font-bold text-slate-900 tracking-wide">
                          Custom Nominal
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Atur nominal bebas hingga 50 Juta Koen
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      isCustomKoen ? 'border-amber-500 bg-amber-500 text-black' : 'border-slate-300 bg-white'
                    }`}>
                      {isCustomKoen && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-baseline justify-between">
                    <span className="text-sm text-amber-700 font-bold">
                      Kalkulator Bebas
                    </span>
                    <span className="text-[11px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                      Diskon Tier
                    </span>
                  </div>
                </div>
              </div>

              {/* Custom Koen Slider */}
              {isCustomKoen && (
                <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-amber-300 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-800">
                      Tentukan Jumlah: <span className="text-amber-700 text-lg font-tactical">{customKoenAmount}M</span>
                    </label>
                    <span className="text-xs text-emerald-700 font-semibold">
                      {customKoenAmount >= 15 ? '🔥 Diskon 15%' : customKoenAmount >= 8 ? '✨ Diskon 10%' : 'Standar'}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={customKoenAmount}
                    onChange={(e) => setCustomKoenAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />

                  <div className="flex justify-between text-xs text-slate-400">
                    <span>1M</span>
                    <span>10M</span>
                    <span>25M</span>
                    <span>50M</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* JOKI MANDOR PACKAGES */}
        {serviceType === 'joki_mandor' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-200">
              <span className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 font-tactical font-black text-lg flex items-center justify-center">
                1
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-tactical uppercase tracking-wider">
                  PILIH PAKET JOKI MANDOR
                </h2>
                <p className="text-xs text-slate-500">
                  Pilih paket per raid atau per jam mabar dipandu pro player
                </p>
              </div>
            </div>

            {/* Play Mode Choice */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">
                PILIH METODE MANDOR:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setMandorPlayMode('mabar_squad')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    mandorPlayMode === 'mabar_squad'
                      ? 'border-amber-500 bg-amber-50/70 shadow-xs'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-sm text-slate-900">Mabar Dibimbing</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Anda ikut bermain di room, pro joki mengawal dan membagi loot.
                  </p>
                </div>

                <div
                  onClick={() => setMandorPlayMode('solo_escort')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    mandorPlayMode === 'solo_escort'
                      ? 'border-amber-500 bg-amber-50/70 shadow-xs'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-sm text-slate-900">Joki Akun</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Akun Anda dimainkan langsung oleh pro player.
                  </p>
                </div>
              </div>
            </div>

            {/* Map Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">
                PILIH TARGET MAP:
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
                        ? 'border-amber-500 bg-amber-100 text-amber-900 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    {mapName}
                  </button>
                ))}
              </div>
            </div>

            {/* Mandor Packages */}
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {priceConfig.mandorPackages.map((pkg) => {
                  const isSelected = selectedMandorPkgId === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => {
                        setSelectedMandorPkgId(pkg.id);
                      }}
                      className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/70 shadow-sm'
                          : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      {pkg.popular && (
                        <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                          RECOMMENDED 🔥
                        </span>
                      )}

                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-tactical text-lg font-bold text-slate-900 tracking-wide">
                            {pkg.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {pkg.description}
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'border-amber-500 bg-amber-500 text-black' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200 flex items-baseline justify-between">
                        <div>
                          <span className="text-base sm:text-lg font-extrabold text-amber-700 font-tactical">
                            {formatRupiah(pkg.price)}
                          </span>
                          {pkg.originalPrice > pkg.price && (
                            <span className="text-xs text-slate-400 line-through ml-2">
                              {formatRupiah(pkg.originalPrice)}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Garansi Evakuasi
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Summary Section */}
        <div className="bg-gradient-to-br from-white via-slate-50 to-amber-50/40 border-2 border-amber-400/80 rounded-2xl p-5 sm:p-7 shadow-md">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-tactical uppercase tracking-wider">
                RINGKASAN PEMBAYARAN
              </h2>
              <p className="text-xs text-slate-500">
                Paket: <span className="text-amber-800 font-semibold">{packageName}</span>
              </p>
            </div>
            <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded border border-amber-300 shadow-xs">
              100% AMAN & BERGARANSI
            </span>
          </div>

          <div className="space-y-2 text-xs sm:text-sm border-b border-slate-200 pb-4">
            <div className="flex justify-between text-slate-600">
              <span>Biaya Paket</span>
              <span className="font-semibold text-slate-900">{formatRupiah(basePrice)}</span>
            </div>

            {appliedDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Diskon Promo / Voucher</span>
                <span>-{formatRupiah(appliedDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between text-base sm:text-xl font-bold font-tactical pt-2 text-slate-900">
              <span>TOTAL DIBAYARKAN:</span>
              <span className="text-amber-700 font-black tracking-wide text-xl sm:text-2xl">
                {formatRupiah(finalTotal)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePackageSelected}
            className="w-full mt-4 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-base font-tactical uppercase tracking-wider rounded-xl shadow-md shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <Flame className="w-5 h-5 fill-black text-black" />
            <span>LANJUTKAN PEMESANAN ({formatRupiah(finalTotal)})</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>

          <p className="text-center text-[11px] text-slate-500 mt-3">
            🔒 Notifikasi & resi invoice akan dikirim ke WhatsApp Anda
          </p>
        </div>
      </div>

      {/* Floating Bottom Bar (Pop Up Kecil di Bawah Layar) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-amber-300/80 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] animate-in slide-in-from-bottom duration-300">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
          {/* Left: Product & Price details */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 text-amber-800 shadow-xs">
              {serviceType === 'joki_koen' ? (
                <Coins className="w-5 h-5" />
              ) : (
                <Users className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                  {serviceType === 'joki_koen' ? 'Joki Koen' : 'Joki Mandor'}
                </span>
                <span className="text-xs text-slate-500 truncate hidden sm:inline">
                  {serviceType === 'joki_mandor' ? mandorSelectedMap : 'Arena Breakout'}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900 font-tactical tracking-wide truncate">
                {packageName}
              </div>
            </div>
          </div>

          {/* Right: Total Price & Lanjutkan Button */}
          <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] uppercase font-semibold text-slate-500">Total Harga:</div>
              <div className="text-base sm:text-lg font-black text-amber-700 font-tactical">
                {formatRupiah(finalTotal)}
              </div>
            </div>

            <button
              type="button"
              id="btn-floating-continue"
              onClick={handlePackageSelected}
              className="py-2.5 sm:py-3 px-5 sm:px-6 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-sm sm:text-base font-tactical uppercase tracking-wider rounded-xl shadow-md shadow-amber-500/20 flex items-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Lanjutkan</span>
              <span className="sm:hidden text-xs bg-black/10 text-black px-1.5 py-0.5 rounded font-mono font-bold">
                {formatRupiah(finalTotal)}
              </span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Account Details Modal */}
      {showAccountModal && (
        <AccountDetailsModal
          isOpen={showAccountModal}
          onClose={() => setShowAccountModal(false)}
          onSave={handleAccountDetailsSaved}
          initialData={{
            gameNickname,
            gameUserId,
            loginMethod,
            accountNotes,
            customerName,
            customerWhatsApp,
          }}
          priceConfig={priceConfig}
          totalPrice={finalTotal}
          packageName={packageName}
        />
      )}

      {/* Payment Modal */}
      {paymentOrder && (
        <PaymentModal
          order={paymentOrder}
          settings={settings}
          onClose={() => setPaymentOrder(null)}
          onPaymentSuccess={(paidOrder) => {
            if (onOrderCreated) {
              onOrderCreated(paidOrder);
            } else if (onOrderSubmitted) {
              onOrderSubmitted(paidOrder);
            }
            setPaymentOrder(null);
          }}
        />
      )}
    </>
  );
};
