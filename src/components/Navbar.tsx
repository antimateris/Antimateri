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
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      {/* Top running marquee / announcement */}
      {tickerText && (
        <div className="bg-gradient-to-r from-amber-600/20 via-orange-600/20 to-amber-600/20 border-b border-amber-500/20 py-1.5 px-3 sm:px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-amber-400 shrink-0 font-medium z-10 bg-zinc-950/80 pr-2 rounded-r">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400 shrink-0" />
              <span className="uppercase tracking-wider text-[10px] sm:text-[11px] font-bold bg-amber-500/20 px-1.5 sm:px-2 py-0.5 rounded text-amber-300">Live Status</span>
            </div>
            <div className="overflow-hidden whitespace-nowrap pl-3 text-zinc-300 flex-1 relative">
              <div className="inline-block animate-marquee pl-[100%] text-xs font-semibold tracking-wide text-amber-200">
                {tickerText}
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-3 text-zinc-400 text-xs shrink-0 pl-4 z-10 bg-zinc-950/80 pl-2 rounded-l">
              <span className="flex items-center text-emerald-400 gap-1 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Anti-Banned 100%
              </span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">CS WhatsApp 24/7</span>
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
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400/40 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-black font-extrabold" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-bold font-tactical tracking-wider text-white">
                  BREAKOUT<span className="text-amber-400">OPS</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-zinc-800 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30">
                  S6-VIP
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Jasa Joki Koen & Mandor Arena Breakout
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden xl:flex items-center space-x-1">
            <button
              id="nav-tab-order"
              onClick={() => handleNav('order')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'order'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-sm'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Order Joki</span>
            </button>

            <button
              id="nav-tab-leaderboard"
              onClick={() => handleNav('leaderboard')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'leaderboard'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>Leaderboard</span>
              <span className="bg-amber-500/20 text-amber-300 text-[9px] font-black px-1.5 py-0.2 rounded uppercase font-tactical">
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
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'rewards'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Gift className="w-4 h-4 text-orange-400" />
              <span>Toko Rewards</span>
            </button>

            <button
              id="nav-tab-prices"
              onClick={() => handleNav('catalog')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'prices' || activeTab === 'catalog'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-sm'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Daftar Harga</span>
            </button>

            <button
              id="nav-tab-track"
              onClick={() => handleNav('track')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'track'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-sm'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Search className="w-4 h-4 text-blue-400" />
              <span>Lacak Resi</span>
            </button>

            <button
              id="nav-tab-cs"
              onClick={() => handleNav('cs')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'cs'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-sm'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Headphones className="w-4 h-4 text-green-400" />
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
                className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-xl hover:border-amber-400 transition-all cursor-pointer text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xs">
                  {currentCustomer.name.charAt(0)}
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-white max-w-[100px] truncate">
                      {currentCustomer.name.split(' ')[0]}
                    </span>
                    <span className={`text-[8px] uppercase font-black px-1.5 py-0.2 rounded border ${TIER_CONFIGS[currentCustomer.tier]?.badgeBg}`}>
                      {TIER_CONFIGS[currentCustomer.tier]?.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono font-bold block">
                    {currentCustomer.opsCoins} Koin
                  </span>
                </div>
              </button>
            ) : (
              <button
                type="button"
                id="btn-customer-login-nav"
                onClick={onOpenCustomerAuth}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400 text-xs font-bold font-tactical uppercase tracking-wider transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
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
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-500/20'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
              title="Admin Portal"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
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
              className="hidden lg:flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Flame className="w-4 h-4 fill-black text-black" />
              <span>Order</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="xl:hidden border-t border-zinc-800/80 bg-zinc-950 px-2 py-2 flex items-center justify-around text-xs">
        <button
          onClick={() => handleNav('order')}
          className={`flex flex-col items-center space-y-1 py-1 px-2 rounded-md cursor-pointer ${
            activeTab === 'order' ? 'text-amber-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Pesan</span>
        </button>

        <button
          onClick={() => handleNav('leaderboard')}
          className={`flex flex-col items-center space-y-1 py-1 px-2 rounded-md cursor-pointer ${
            activeTab === 'leaderboard' ? 'text-yellow-400 font-bold' : 'text-zinc-400'
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
          className={`flex flex-col items-center space-y-1 py-1 px-2 rounded-md cursor-pointer ${
            activeTab === 'rewards' ? 'text-orange-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Rewards</span>
        </button>

        <button
          onClick={() => handleNav('track')}
          className={`flex flex-col items-center space-y-1 py-1 px-2 rounded-md cursor-pointer ${
            activeTab === 'track' ? 'text-blue-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Lacak</span>
        </button>

        <button
          onClick={() => handleNav('cs')}
          className={`flex flex-col items-center space-y-1 py-1 px-2 rounded-md cursor-pointer ${
            activeTab === 'cs' ? 'text-green-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>CS WA</span>
        </button>
      </div>
    </header>
  );
};
