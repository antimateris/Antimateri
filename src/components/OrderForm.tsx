import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  Users, 
  ShieldCheck, 
  Check, 
  Sliders,
  Flame,
  Gift,
  X
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

  let addOnsTotal = 0;
  if (isPrioritySpeed) addOnsTotal += priceConfig.prioritySpeedFee;
  if (isStreamDiscord) addOnsTotal += priceConfig.streamDiscordFee;
  if (isSafeLootOnly) addOnsTotal += priceConfig.safeLootGuaranteeFee;

  const subTotal = basePrice + addOnsTotal;
  const uniqueCode = generateUniqueCode();
  const finalTotal = Math.max(0, subTotal - appliedDiscount);

  // Handle package selection - open account modal
  const handlePackageSelected = () => {
    setShowAccountModal(true);
  };

  // Handle account details saved - create order and show payment
  const handleAccountDetailsSaved = (details: {
    gameNickname: string;
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
      loginMethod: details.loginMethod as any,
      gameUserId: details.gameUserId,
      accountNotes: details.accountNotes,
      customerName: details.customerName,
      customerWhatsApp: details.customerWhatsApp,
      basePrice: subTotal,
      discount: appliedDiscount,
      uniqueCode: 0,
      totalPrice: finalTotal,
      paymentMethod: 'manual',
      paymentStatus: 'pending',
      orderStatus: 'unpaid',
      createdAt: new Date().toISOString(),
      currentProgressPercent: 0,
      progressHistory: [],
      isPrioritySpeed,
      isStreamDiscord,
      isSafeLootOnly,
    };

    // Show payment modal
    setPaymentOrder(newOrder);
  };

  const estimatedCoins = calculateCoinsEarned(finalTotal, currentCustomer ? currentCustomer.tier : 'recruit');
  const activeVouchers = currentCustomer?.redeemedRewards?.filter((r) => !r.isUsed) || [];

  return (
    <>
      <div id="order-form-container" className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-28 space-y-6">
        
        {/* Customer Membership Strip */}
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
                  Saldo: <strong className="text-amber-400">{currentCustomer.opsCoins} OpsCoins</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2.5 py-1 rounded-lg border border-amber-500/30 flex items-center space-x-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>+{estimatedCoins} Koin</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2 text-amber-300">
              <Coins className="w-4 h-4 text-amber-400 shrink-0" />
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
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center space-x-2">
              <Gift className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Kupon Diterapkan: <strong>{activeAppliedVoucher.title}</strong>
              </span>
            </div>
            {onClearAppliedVoucher && (
              <button
                type="button"
                onClick={onClearAppliedVoucher}
                className="p-1 text-zinc-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Service Type Tabs */}
        <div className="flex bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-800 shadow-xl max-w-xl mx-auto mb-8">
          <button
            type="button"
            onClick={() => setServiceType('joki_koen')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-tactical text-base sm:text-lg font-bold tracking-wide transition-all cursor-pointer ${
              serviceType === 'joki_koen'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/25'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
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
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/25'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>JOKI MANDOR RAID</span>
          </button>
        </div>

        {/* JOKI KOEN PACKAGES */}
        {serviceType === 'joki_koen' && (
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 sm:p-7 shadow-lg">
            <div className="flex items-center space-x-3 mb-5 pb-3 border-b border-zinc-800">
              <span className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-tactical font-black text-lg flex items-center justify-center">
                1
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white font-tactical uppercase tracking-wider">
                  PILIH JUMLAH JOKI KOEN
                </h2>
                <p className="text-xs text-zinc-400">
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
                          ? 'border-amber-500 bg-amber-500/10 shadow-md shadow-amber-500/10'
                          : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900/60'
                      }`}
                    >
                      {pkg.popular && (
                        <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
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

                {/* Custom Koen */}
                <div
                  onClick={() => {
                    setIsCustomKoen(true);
                  }}
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
                          Custom Nominal
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

              {/* Custom Koen Slider */}
              {isCustomKoen && (
                <div className="bg-zinc-950 p-4 sm:p-5 rounded-xl border border-amber-500/30 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-zinc-200">
                      Tentukan Jumlah: <span className="text-amber-400 text-lg font-tactical">{customKoenAmount}M</span>
                    </label>
                    <span className="text-xs text-emerald-400 font-semibold">
             
