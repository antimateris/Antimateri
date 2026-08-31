import React from 'react';
import { 
  ShieldCheck, 
  Search, 
  Coins, 
  Users, 
  Headphones, 
  Lock, 
  Zap, 
  Flame,
  Radio,
  Trophy,
  Gift,
  User,
  Sparkles,
  Award
} from 'lucide-react';
import { SystemSettings, CustomerUser } from '../types';
import { TIER_CONFIGS } from '../data/initialData';

interface NavbarProps {
  activeTab: 'order' | 'catalog' | 'track' | 'prices' | 'cs' | 'admin' | 'leaderboard' | 'rewards';
  setActiveTab?: (tab: any) => void;
  onNavigate?: (tab: any) => void;
  settings?: SystemSettings;
  runningTicker?: string;
  activeOrdersCount?: number;
  adminLoggedIn?: boolean;
  adminRole?: 'superadmin' | 'admin';
  onOpenAdmin?: () => void;
  onOpenAdminLogin?: () => void;
  currentCustomer?: CustomerUser | null;
  onOpenCustomerAuth?: () => void;
  onOpenCustomerProfile?: () => void;
  onOpenRewardsStore?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onNavigate,
  settings,
  runningTicker,
  adminLoggedIn = false,
  adminRole,
  onOpenAdmin,
  onOpenAdminLogin,
  currentCustomer,
  onOpenCustomerAuth,
  onOpenCustomerProfile,
  onOpenRewardsStore,
}) => {
  const handleNav = (tab: 'order' | 'catalog' | 'track' | 'prices' | 'cs' | 'admin' | 'leaderboard' | 'rewards') => {
    if (onNavigate) {
      onNavigate(tab);
    } else if (setActiveTab) {
      setActiveTab(tab);
    }
  };

  const handleAdminClick = () => {
    if (onOpenAdmin) {
      onOpenAdmin();
    } else if (onOpenAdminLogin) {
      onOpenAdminLogin();
    } else {
      handleNav('admin');
    }
  };

  const tickerText = runningTicker || settings?.runningTicker || '⚡ LIVE: Layanan Joki Koen & Mandor Arena Breakout Siap Order!';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      {/* Top running marquee / announcement */}
      {tickerText && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-b border-amber-200/80 py-1.5 px-3 sm:px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-amber-800 shrink-0 font-medium z-10 bg-white/90 px-2 py-0.5 rounded-md border border-amber-200 shadow-xs">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-600 shrink-0" />
              <span className="uppercase tracking-wider text-[10px] sm:text-[11px] font-bold bg-amber-100 px-1.5 sm:px-2 py-0.5 rounded text-amber-800">Live Status</span>
            </div>
            <div className="overflow-hidden whitespace-nowrap pl-3 text-slate-700 flex-1 relative">
              <div className="inline-block animate-marquee pl-[100%] text-xs font-semibold tracking-wide text-amber-950">
                {tickerText}
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-3 text-slate-600 text-xs shrink-0 pl-4 z-10 bg-white/90 px-2 py-0.5 rounded-md border border-slate-200">
              <span className="flex items-center text-emerald-700 gap-1 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Anti-Banned 100%
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-amber-800 font-semibold">CS WhatsApp 24/7</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            id="nav-brand-logo"
            onClick={() => handleNav('order')}
            className="flex items-center space-x-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20 border border-amber-400 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-black font-extrabold" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-bold font-tactical tracking-wider text-slate-900">
                  BREAKOUT<span className="text-amber-600">OPS</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-slate-100 text-amber-700 px-1.5 py-0.5 rounded border border-amber-400/40">
                  S6-VIP
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Jasa Joki Koen & Mandor Arena Breakout
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden xl:flex items-center space-x-1">
            <button
              id="nav-tab-order"
              onClick={() => handleNav('order')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'order'
                  ? 'bg-amber-100/80 text-amber-900 border border-amber-400/60 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Coins className="w-4 h-4 text-amber-600" />
              <span>Order Joki</span>
            </button>

            <button
              id="nav-tab-leaderboard"
              onClick={() => handleNav('leaderboard')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'leaderboard'
                  ? 'bg-amber-100/80 text-amber-900 border border-amber-400/60 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Trophy className="w-4 h-4 text-yellow-600" />
              <span>Leaderboard</span>
              <span className="bg-amber-200 text-amber-900 text-[9px] font-black px-1.5 py-0.5 rounded uppercase font-tactical">
                Top Sultan
              </span>
            </button>

            <button
              id="nav-tab-rewards"
              onClick={() => {
                if (onOpenRewardsStore) {
                  onOpenRewardsStore();
                } else {
                  handleNav('rewards');
                }
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'rewards'
                  ? 'bg-amber-100/80 text-amber-900 border border-amber-400/60 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Gift className="w-4 h-4 text-orange-600" />
              <span>Toko Rewards</span>
            </button>

            <button
              id="nav-tab-prices"
              onClick={() => handleNav('catalog')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'prices' || activeTab === 'catalog'
                  ? 'bg-amber-100/80 text-amber-900 border border-amber-400/60 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Daftar Harga</span>
            </button>

            <button
              id="nav-tab-track"
              onClick={() => handleNav('track')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'track'
                  ? 'bg-amber-100/80 text-amber-900 border border-amber-400/60 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="w-4 h-4 text-blue-600" />
              <span>Lacak Resi</span>
            </button>

            <button
              id="nav-tab-cs"
              onClick={() => handleNav('cs')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'cs'
                  ? 'bg-amber-100/80 text-amber-900 border border-amber-400/60 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Headphones className="w-4 h-4 text-green-600" />
              <span>CS WhatsApp</span>
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-2">
            
            {/* Customer Member Account Trigger */}
            {currentCustomer ? (
              <button
                type="button"
                id="btn-customer-profile-nav"
                onClick={onOpenCustomerProfile}
                className="flex items-center space-x-2 px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-xl hover:border-amber-400 transition-all cursor-pointer text-left shadow-xs"
              >
                {currentCustomer.avatar ? (
                  <img
                    src={currentCustomer.avatar}
                    alt={currentCustomer.name}
                    className="w-7 h-7 rounded-lg object-cover border border-amber-400 shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-amber-200 flex items-center justify-center font-bold text-amber-900 text-xs shrink-0">
                    {currentCustomer.name.charAt(0)}
                  </div>
                )}
                <div className="hidden sm:block">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-slate-900 max-w-[100px] truncate">
                      {currentCustomer.name.split(' ')[0]}
                    </span>
                    <span className={`text-[8px] uppercase font-black px-1.5 py-0.2 rounded border ${TIER_CONFIGS[currentCustomer.tier]?.badgeBg}`}>
                      {TIER_CONFIGS[currentCustomer.tier]?.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-700 font-mono font-bold block">
                    {currentCustomer.opsCoins} Koin
                  </span>
                </div>
              </button>
            ) : (
              <button
                type="button"
                id="btn-customer-login-nav"
                onClick={onOpenCustomerAuth}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl text-amber-900 text-xs font-bold font-tactical uppercase tracking-wider transition-all cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Member (+50 Koin)</span>
                <span className="sm:hidden">Member</span>
              </button>
            )}

            {/* Admin Portal Button */}
            <button
              id="btn-nav-admin-portal"
              onClick={handleAdminClick}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                adminLoggedIn
                  ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
              title="Admin Portal"
            >
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">
                {adminLoggedIn 
                  ? (adminRole === 'superadmin' ? 'Superadmin' : 'Admin')
                  : 'Admin'}
              </span>
            </button>

            {/* Main Order CTA Button */}
            <button
              id="btn-nav-order-cta"
              onClick={() => handleNav('order')}
              className="hidden lg:flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Flame className="w-4 h-4 fill-black text-black" />
              <span>Order</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="xl:hidden border-t border-slate-200 bg-white px-2 py-2 flex items-center justify-around text-xs shadow-xs">
        <button
          onClick={() => handleNav('order')}
          className={`flex flex-col items-center space-y-1 py-1 px-2 rounded-lg cursor-pointer ${
            activeTab === 'order' ? 'text-amber-600 font-bold bg-amber-50' : 'text-slate-600'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Pesan</span>
        </button>

        <button
          onClick={() => handleNav('leaderboard')}
          className={`flex flex-col items-center space-y-1 py-1 px-2 rounded-lg cursor-pointer ${
            activeTab === 'leaderboard' ? 'text-yellow-600 font-bold bg-yellow-50' : 'text-slate-600'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Leaderboard</span>
        </button>

        <button
          onClick={() => {
            if (onOpenRewardsStore) {
              onOpenRewardsStore();
            } else {
              handleNav('rewards');
            }
          }}
          className={`flex flex-col items-center space-y-1 py-1 px-2 rounded-lg cursor-pointer ${
            activeTab === 'rewards' ? 'text-orange-600 font-bold bg-orange-50' : 'text-slate-600'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Rewards</span>
        </button>

        <button
          onClick={() => handleNav('track')}
          className={`flex flex-col items-center space-y-1 py-1 px-2 rounded-lg cursor-pointer ${
            activeTab === 'track' ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Lacak</span>
        </button>

        <button
          onClick={() => handleNav('cs')}
          className={`flex flex-col items-center space-y-1 py-1 px-2 rounded-lg cursor-pointer ${
            activeTab === 'cs' ? 'text-green-600 font-bold bg-green-50' : 'text-slate-600'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>CS WA</span>
        </button>
      </div>
    </header>
  );
};
