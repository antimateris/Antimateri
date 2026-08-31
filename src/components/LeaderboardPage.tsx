import React, { useState } from 'react';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Flame, 
  Coins, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Star, 
  TrendingUp, 
  Award, 
  Users, 
  Gamepad2,
  Calendar,
  Gift,
  ArrowRight
} from 'lucide-react';
import { CustomerUser, Order, AdminUser } from '../types';
import { TIER_CONFIGS } from '../data/initialData';
import { formatRupiah } from '../utils/helpers';

interface LeaderboardPageProps {
  customers: CustomerUser[];
  orders: Order[];
  onOpenOrder: () => void;
  onOpenAuth: () => void;
  onOpenRewards: () => void;
  currentCustomer: CustomerUser | null;
  admins?: AdminUser[];
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({
  customers,
  orders,
  onOpenOrder,
  onOpenAuth,
  onOpenRewards,
  currentCustomer,
  admins = [],
}) => {
  const [activeBoard, setActiveBoard] = useState<'top_spender' | 'top_grinder' | 'top_worker'>('top_spender');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Sort Customers by Total Spent (Top Spenders)
  const topSpenders = [...customers].sort((a, b) => b.totalSpent - a.totalSpent);

  // 2. Sort Customers by Total Koen Farmed (Top Grinders)
  const topGrinders = [...customers].sort((a, b) => b.totalKoenFarmedMillion - a.totalKoenFarmedMillion);

  // 3. Compute Top Workers from actual completed orders
  const workerStatsMap: Record<string, { name: string; avatar?: string; completedOrders: number; totalKoenMillion: number; rating: number }> = {
    'Pro Joki Alpha': { 
      name: 'Pro Joki Alpha (Raid Master)', 
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      completedOrders: 42, 
      totalKoenMillion: 185, 
      rating: 5.0 
    },
    'Admin Operasional': { 
      name: 'Admin Operasional (Rafi)', 
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      completedOrders: 28, 
      totalKoenMillion: 92, 
      rating: 4.9 
    },
    'Chief Operasional': { 
      name: 'Chief Operasional (OWNER & CEO)', 
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      completedOrders: 15, 
      totalKoenMillion: 60, 
      rating: 5.0 
    },
  };

  // Enhance worker stats from orders and admin avatars
  orders.forEach((o) => {
    if (o.orderStatus === 'completed' && o.assignedWorker) {
      const workerKey = o.assignedWorker;
      const matchedAdmin = admins.find((a) => a.name.toLowerCase().includes(workerKey.toLowerCase()) || workerKey.toLowerCase().includes(a.name.toLowerCase()));

      if (!workerStatsMap[workerKey]) {
        workerStatsMap[workerKey] = {
          name: workerKey,
          avatar: matchedAdmin?.avatar,
          completedOrders: 0,
          totalKoenMillion: 0,
          rating: matchedAdmin?.ratingScore || 4.9,
        };
      }
      workerStatsMap[workerKey].completedOrders += 1;
      if (matchedAdmin?.avatar && !workerStatsMap[workerKey].avatar) {
        workerStatsMap[workerKey].avatar = matchedAdmin.avatar;
      }
      if (o.koenAmountMillion) {
        workerStatsMap[workerKey].totalKoenMillion += o.koenAmountMillion;
      }
    }
  });

  const topWorkers = Object.values(workerStatsMap).sort((a, b) => b.completedOrders - a.completedOrders);

  // Filter based on search query
  const filteredSpenders = topSpenders.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.gameNickname && c.gameNickname.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredGrinders = topGrinders.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.gameNickname && c.gameNickname.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-black font-black shadow-lg shadow-amber-500/30">
          <Crown className="w-5 h-5 fill-black" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-zinc-300 to-zinc-400 flex items-center justify-center text-black font-black shadow-md">
          <Medal className="w-5 h-5 fill-black" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-700 to-orange-800 flex items-center justify-center text-white font-black shadow-md">
          <Medal className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-tactical font-bold text-xs">
        #{rank}
      </div>
    );
  };

  const getDisplayName = (cust: CustomerUser) => {
    if (cust.isAnonymizedInLeaderboard) {
      const parts = cust.name.split(' ');
      const first = parts[0] || 'Operator';
      return `${first}_${cust.username.slice(0, 2)}***`;
    }
    return cust.gameNickname ? `${cust.gameNickname} (${cust.name.split(' ')[0]})` : cust.name;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Title Section */}
        <div className="text-center space-y-3 relative">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold font-tactical tracking-wider">
            <Trophy className="w-4 h-4 text-amber-600" />
            <span>SEASON S6 HALL OF FAME & LEADERBOARD</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-tactical uppercase tracking-wider text-slate-900">
            PAPAN PERINGKAT <span className="text-amber-600">SULTAN & PRO JOKI</span>
          </h1>

          <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Daftar Top Spender setia dan Top Farmer Arena Breakout. Kumpulkan EXP setiap order untuk naik pangkat jabatan dan menangkan hadiah bulanan OpsCoins!
          </p>
        </div>

        {/* Season Rewards Banner */}
        <div className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-200 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative">
            <div className="space-y-2 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-2 text-amber-800 text-xs font-bold uppercase tracking-wider">
                <Gift className="w-4 h-4 text-amber-600 animate-bounce" />
                <span>HADIAH EKSKLUSIF BULAN INI (RESET SETIAP AKHIR BULAN)</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black font-tactical text-slate-900">
                TOP 1 REWARDS: <span className="text-amber-700">2.000 OPSCOINS</span> + 10M KOEN GRATIS!
              </h3>
              <p className="text-xs text-slate-600 max-w-xl">
                Juara 1-3 Leaderboard Top Spender & Top Grinder di akhir season otomatis menerima kiriman Koin Rewards dan Role Sultan di Discord VIP!
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                type="button"
                onClick={onOpenOrder}
                className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold font-tactical uppercase tracking-wider text-xs rounded-xl shadow-md transition-all hover:scale-105 cursor-pointer flex items-center space-x-2"
              >
                <Flame className="w-4 h-4 fill-black" />
                <span>Order Joki & Kejar Rank</span>
              </button>

              <button
                type="button"
                onClick={onOpenRewards}
                className="px-4 py-3 bg-white hover:bg-slate-100 border border-slate-300 text-amber-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 shadow-sm"
              >
                <Coins className="w-4 h-4 text-amber-600" />
                <span>Toko Rewards</span>
              </button>
            </div>
          </div>
        </div>

        {/* Board Switcher Navigation & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex bg-white border border-slate-200 p-1 rounded-2xl w-full sm:w-auto shadow-sm">
            <button
              type="button"
              onClick={() => setActiveBoard('top_spender')}
              className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold font-tactical uppercase tracking-wider transition-all cursor-pointer flex-1 sm:flex-initial ${
                activeBoard === 'top_spender'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>Top Spender (Sultan)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveBoard('top_grinder')}
              className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold font-tactical uppercase tracking-wider transition-all cursor-pointer flex-1 sm:flex-initial ${
                activeBoard === 'top_grinder'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>Top Koen Farmed</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveBoard('top_worker')}
              className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold font-tactical uppercase tracking-wider transition-all cursor-pointer flex-1 sm:flex-initial ${
                activeBoard === 'top_worker'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Pro Joki Hall</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nickname / nama..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none shadow-sm"
            />
          </div>
        </div>

        {/* TAB 1: TOP SPENDERS (SULTAN) */}
        {activeBoard === 'top_spender' && (
          <div className="space-y-6">
            
            {/* Top 3 Podium Cards */}
            {topSpenders.length >= 3 && !searchQuery && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                
                {/* 2nd Place */}
                <div className="order-2 md:order-1 p-5 rounded-3xl bg-white border border-slate-200 flex flex-col items-center text-center space-y-3 relative overflow-hidden shadow-sm">
                  <div className="relative">
                    {topSpenders[1].avatar ? (
                      <img
                        src={topSpenders[1].avatar}
                        alt={topSpenders[1].name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-300 shadow-md"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-slate-200 text-slate-800 flex items-center justify-center font-tactical font-black text-2xl shadow-sm">
                        {topSpenders[1].name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center shadow">
                      2
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {TIER_CONFIGS[topSpenders[1].tier]?.name}
                    </span>
                    <h4 className="font-bold text-slate-900 text-base mt-1.5 truncate max-w-[200px]">
                      {getDisplayName(topSpenders[1])}
                    </h4>
                    <span className="text-sm font-bold font-tactical text-amber-700 block mt-1">
                      {formatRupiah(topSpenders[1].totalSpent)}
                    </span>
                  </div>
                  <div className="w-full pt-3 border-t border-slate-100 flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>{topSpenders[1].totalOrders}x Order</span>
                    <span className="text-amber-700 font-semibold">{topSpenders[1].opsCoins} Koin</span>
                  </div>
                </div>

                {/* 1st Place - Champion */}
                <div className="order-1 md:order-2 p-6 rounded-3xl bg-amber-50/80 border-2 border-amber-500 flex flex-col items-center text-center space-y-3 relative overflow-hidden shadow-md transform md:-translate-y-2">
                  <div className="absolute top-2 bg-amber-500 text-black text-[10px] font-black uppercase px-3 py-0.5 rounded-full font-tactical">
                    CHAMPION SULTAN
                  </div>
                  <div className="relative mt-2">
                    {topSpenders[0].avatar ? (
                      <img
                        src={topSpenders[0].avatar}
                        alt={topSpenders[0].name}
                        className="w-20 h-20 rounded-3xl object-cover border-2 border-amber-400 ring-4 ring-amber-200 shadow-md"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-3xl bg-amber-400 text-black flex items-center justify-center font-tactical font-black text-3xl shadow-md">
                        {topSpenders[0].name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute -top-2.5 -right-2.5 w-8 h-8 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-md">
                      <Crown className="w-4 h-4 fill-black text-black" />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-900 bg-amber-200 px-2.5 py-0.5 rounded border border-amber-300">
                      {TIER_CONFIGS[topSpenders[0].tier]?.name}
                    </span>
                    <h4 className="font-black text-slate-900 text-lg mt-1.5 truncate max-w-[220px]">
                      {getDisplayName(topSpenders[0])}
                    </h4>
                    <span className="text-lg font-black font-tactical text-amber-700 block mt-1">
                      {formatRupiah(topSpenders[0].totalSpent)}
                    </span>
                  </div>
                  <div className="w-full pt-3 border-t border-amber-200/60 flex justify-between text-[11px] text-slate-700 font-mono">
                    <span>{topSpenders[0].totalOrders}x Order Selesai</span>
                    <span className="text-amber-800 font-bold">{topSpenders[0].opsCoins} OpsCoins</span>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="order-3 md:order-3 p-5 rounded-3xl bg-white border border-slate-200 flex flex-col items-center text-center space-y-3 relative overflow-hidden shadow-sm">
                  <div className="relative">
                    {topSpenders[2].avatar ? (
                      <img
                        src={topSpenders[2].avatar}
                        alt={topSpenders[2].name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-600 shadow-md"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-amber-700 text-white flex items-center justify-center font-tactical font-black text-2xl shadow-sm">
                        {topSpenders[2].name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow">
                      3
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      {TIER_CONFIGS[topSpenders[2].tier]?.name}
                    </span>
                    <h4 className="font-bold text-slate-900 text-base mt-1.5 truncate max-w-[200px]">
                      {getDisplayName(topSpenders[2])}
                    </h4>
                    <span className="text-sm font-bold font-tactical text-amber-700 block mt-1">
                      {formatRupiah(topSpenders[2].totalSpent)}
                    </span>
                  </div>
                  <div className="w-full pt-3 border-t border-slate-100 flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>{topSpenders[2].totalOrders}x Order</span>
                    <span className="text-amber-700 font-semibold">{topSpenders[2].opsCoins} Koin</span>
                  </div>
                </div>

              </div>
            )}

            {/* Detailed Table */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold font-tactical uppercase tracking-wider text-slate-900">
                  KLASEMEN LENGKAP TOP SPENDER
                </span>
                <span className="text-[11px] text-slate-500">Total {filteredSpenders.length} Member Terdaftar</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-tactical tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 text-center w-16">Peringkat</th>
                      <th className="py-3 px-4">Member / Nickname</th>
                      <th className="py-3 px-4">Pangkat Tier</th>
                      <th className="py-3 px-4 text-center">Total Order</th>
                      <th className="py-3 px-4 text-right">Total Belanja (EXP)</th>
                      <th className="py-3 px-4 text-right">OpsCoins</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSpenders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <Trophy className="w-8 h-8 text-slate-300" />
                            <p className="text-sm font-semibold text-slate-600">Belum ada data member di Season ini</p>
                            <p className="text-xs text-slate-400">Buat pesanan pertama Anda untuk memimpin Hall of Fame!</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredSpenders.map((cust, idx) => {
                      const rank = idx + 1;
                      const isCurrent = currentCustomer?.id === cust.id;
                      const tier = TIER_CONFIGS[cust.tier] || TIER_CONFIGS.recruit;

                      return (
                        <tr 
                          key={cust.id}
                          className={`hover:bg-slate-50 transition-colors ${
                            isCurrent ? 'bg-amber-50/70 border-l-4 border-amber-500' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex justify-center">{getRankBadge(rank)}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-2.5">
                              {cust.avatar ? (
                                <img
                                  src={cust.avatar}
                                  alt={cust.name}
                                  className="w-9 h-9 rounded-xl object-cover border border-amber-300 shadow-sm shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-amber-700 text-xs shrink-0">
                                  {cust.name.charAt(0)}
                                </div>
                              )}
                              <div>
                                <span className="font-bold text-slate-900 block">
                                  {getDisplayName(cust)}
                                  {isCurrent && (
                                    <span className="ml-1.5 text-[9px] bg-amber-500 text-black font-black px-1.5 py-0.2 rounded font-tactical">
                                      AKUN ANDA
                                    </span>
                                  )}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">@{cust.username}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${tier.badgeBg}`}>
                              {tier.name}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">
                            {cust.totalOrders}x
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-700">
                            {formatRupiah(cust.totalSpent)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center space-x-1 bg-amber-50 px-2 py-1 rounded-lg text-amber-800 font-mono font-bold border border-amber-200">
                              <Coins className="w-3 h-3 text-amber-600" />
                              <span>{cust.opsCoins}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    }))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: TOP GRINDERS (KOEN FARMED) */}
        {activeBoard === 'top_grinder' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold font-tactical uppercase tracking-wider text-slate-900">
                  TOP KOEN FARMED (TOTAL KOEN YANG BERHASIL DI-EXTRACT)
                </span>
                <span className="text-[11px] text-slate-500">Peringkat perolehan Koen terbesar</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-tactical tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 text-center w-16">Peringkat</th>
                      <th className="py-3 px-4">Member / Nickname</th>
                      <th className="py-3 px-4">Pangkat</th>
                      <th className="py-3 px-4 text-center">Jam Mandor</th>
                      <th className="py-3 px-4 text-right">Koen Di-Farming</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredGrinders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <Trophy className="w-8 h-8 text-slate-300" />
                            <p className="text-sm font-semibold text-slate-600">Belum ada statistik farming yang tercatat</p>
                            <p className="text-xs text-slate-400">Pesanan Joki Koen yang selesai akan otomatis masuk ke peringkat ini.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredGrinders.map((cust, idx) => {
                      const rank = idx + 1;
                      const isCurrent = currentCustomer?.id === cust.id;
                      const tier = TIER_CONFIGS[cust.tier] || TIER_CONFIGS.recruit;

                      return (
                        <tr 
                          key={cust.id}
                          className={`hover:bg-slate-50 transition-colors ${
                            isCurrent ? 'bg-amber-50/70' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex justify-center">{getRankBadge(rank)}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-2.5">
                              {cust.avatar ? (
                                <img
                                  src={cust.avatar}
                                  alt={cust.name}
                                  className="w-9 h-9 rounded-xl object-cover border border-emerald-300 shadow-sm shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-amber-700 text-xs shrink-0">
                                  {cust.name.charAt(0)}
                                </div>
                              )}
                              <div>
                                <span className="font-bold text-slate-900 block">
                                  {getDisplayName(cust)}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">@{cust.username}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${tier.badgeBg}`}>
                              {tier.name}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-blue-600">
                            {cust.totalRaidHours} Jam
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="text-base font-black font-tactical text-emerald-600">
                              {cust.totalKoenFarmedMillion} Juta Koen ({cust.totalKoenFarmedMillion}M)
                            </span>
                          </td>
                        </tr>
                      );
                    }))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRO WORKER HALL OF FAME */}
        {activeBoard === 'top_worker' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topWorkers.map((worker, idx) => (
                <div 
                  key={worker.name}
                  className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-amber-400 transition-all space-y-4 shadow-sm relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 font-tactical font-black text-lg">
                        {worker.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-amber-800 uppercase bg-amber-100 px-2 py-0.5 rounded">
                          TOP PRO JOKI #{idx + 1}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{worker.name}</h4>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-500 block uppercase">Misi Selesai</span>
                      <span className="text-sm font-bold font-tactical text-slate-900 mt-0.5 block">
                        {worker.completedOrders} Order
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-500 block uppercase">Koen Selesai</span>
                      <span className="text-sm font-bold font-tactical text-emerald-600 mt-0.5 block">
                        {worker.totalKoenMillion}M Koen
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span className="flex items-center space-x-1 text-emerald-600 font-bold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Winrate 99.8%</span>
                    </span>
                    <span className="flex items-center space-x-1 text-amber-600 font-bold">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      <span>{worker.rating}.0 / 5.0</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
