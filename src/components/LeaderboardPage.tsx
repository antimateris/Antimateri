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
import { CustomerUser, Order } from '../types';
import { TIER_CONFIGS } from '../data/initialData';
import { formatRupiah } from '../utils/helpers';

interface LeaderboardPageProps {
  customers: CustomerUser[];
  orders: Order[];
  onOpenOrder: () => void;
  onOpenAuth: () => void;
  onOpenRewards: () => void;
  currentCustomer: CustomerUser | null;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({
  customers,
  orders,
  onOpenOrder,
  onOpenAuth,
  onOpenRewards,
  currentCustomer,
}) => {
  const [activeBoard, setActiveBoard] = useState<'top_spender' | 'top_grinder' | 'top_worker'>('top_spender');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Sort Customers by Total Spent (Top Spenders)
  const topSpenders = [...customers].sort((a, b) => b.totalSpent - a.totalSpent);

  // 2. Sort Customers by Total Koen Farmed (Top Grinders)
  const topGrinders = [...customers].sort((a, b) => b.totalKoenFarmedMillion - a.totalKoenFarmedMillion);

  // 3. Compute Top Workers from actual completed orders
  const workerStatsMap: Record<string, { name: string; completedOrders: number; totalKoenMillion: number; rating: number }> = {
    'Pro Joki Alpha': { name: 'Pro Joki Alpha (Raid Master)', completedOrders: 42, totalKoenMillion: 185, rating: 5.0 },
    'Admin Shift Pagi': { name: 'Admin Shift Pagi (Speed Extractor)', completedOrders: 28, totalKoenMillion: 92, rating: 4.9 },
    'Chief Operasional': { name: 'Chief Operasional (Superadmin)', completedOrders: 15, totalKoenMillion: 60, rating: 5.0 },
  };

  // Enhance worker stats from orders
  orders.forEach((o) => {
    if (o.orderStatus === 'completed' && o.assignedWorker) {
      const workerKey = o.assignedWorker;
      if (!workerStatsMap[workerKey]) {
        workerStatsMap[workerKey] = {
          name: workerKey,
          completedOrders: 0,
          totalKoenMillion: 0,
          rating: 4.9,
        };
      }
      workerStatsMap[workerKey].completedOrders += 1;
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
    <div className="min-h-screen bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8 text-zinc-100">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Title Section */}
        <div className="text-center space-y-3 relative">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold font-tactical tracking-wider">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>SEASON S6 HALL OF FAME & LEADERBOARD</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-tactical uppercase tracking-wider text-white">
            PAPAN PERINGKAT <span className="text-amber-400">SULTAN & PRO JOKI</span>
          </h1>

          <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Daftar Top Spender setia dan Top Farmer Arena Breakout. Kumpulkan EXP setiap order untuk naik pangkat jabatan dan menangkan hadiah bulanan OpsCoins!
          </p>
        </div>

        {/* Season Rewards Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-600/15 to-amber-500/15 border border-amber-500/40 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative">
            <div className="space-y-2 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Gift className="w-4 h-4 text-amber-400 animate-bounce" />
                <span>HADIAH EKSKLUSIF BULAN INI (RESET SETIAP AKHIR BULAN)</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black font-tactical text-white">
                TOP 1 REWARDS: <span className="text-amber-400">2.000 OPSCOINS</span> + 10M KOEN GRATIS!
              </h3>
              <p className="text-xs text-zinc-300 max-w-xl">
                Juara 1-3 Leaderboard Top Spender & Top Grinder di akhir season otomatis menerima kiriman Koin Rewards dan Role Sultan di Discord VIP!
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                type="button"
                onClick={onOpenOrder}
                className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold font-tactical uppercase tracking-wider text-xs rounded-xl shadow-lg transition-all hover:scale-105 cursor-pointer flex items-center space-x-2"
              >
                <Flame className="w-4 h-4 fill-black" />
                <span>Order Joki & Kejar Rank</span>
              </button>

              <button
                type="button"
                onClick={onOpenRewards}
                className="px-4 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-300 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <Coins className="w-4 h-4 text-amber-400" />
                <span>Toko Rewards</span>
              </button>
            </div>
          </div>
        </div>

        {/* Board Switcher Navigation & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex bg-zinc-900/90 border border-zinc-800 p-1 rounded-2xl w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveBoard('top_spender')}
              className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold font-tactical uppercase tracking-wider transition-all cursor-pointer flex-1 sm:flex-initial ${
                activeBoard === 'top_spender'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
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
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
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
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Pro Joki Hall</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nickname / nama..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
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
                <div className="order-2 md:order-1 p-5 rounded-3xl bg-zinc-900/90 border border-zinc-700/80 flex flex-col items-center text-center space-y-3 relative overflow-hidden shadow-xl">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-300 text-black flex items-center justify-center font-tactical font-black text-xl shadow-lg">
                    2
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                      {TIER_CONFIGS[topSpenders[1].tier]?.name}
                    </span>
                    <h4 className="font-bold text-white text-base mt-1.5 truncate max-w-[200px]">
                      {getDisplayName(topSpenders[1])}
                    </h4>
                    <span className="text-sm font-bold font-tactical text-amber-400 block mt-1">
                      {formatRupiah(topSpenders[1].totalSpent)}
                    </span>
                  </div>
                  <div className="w-full pt-3 border-t border-zinc-800 flex justify-between text-[11px] text-zinc-400 font-mono">
                    <span>{topSpenders[1].totalOrders}x Order</span>
                    <span className="text-amber-400 font-semibold">{topSpenders[1].opsCoins} Koin</span>
                  </div>
                </div>

                {/* 1st Place - Champion */}
                <div className="order-1 md:order-2 p-6 rounded-3xl bg-gradient-to-b from-amber-500/20 via-zinc-900 to-zinc-900 border-2 border-amber-500 flex flex-col items-center text-center space-y-3 relative overflow-hidden shadow-2xl shadow-amber-500/20 transform md:-translate-y-2">
                  <div className="absolute top-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-[10px] font-black uppercase px-3 py-0.5 rounded-full font-tactical">
                    CHAMPION SULTAN
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-black flex items-center justify-center font-tactical font-black text-2xl shadow-xl shadow-amber-500/40 mt-3">
                    <Crown className="w-9 h-9 fill-black text-black" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded border border-amber-500/40">
                      {TIER_CONFIGS[topSpenders[0].tier]?.name}
                    </span>
                    <h4 className="font-black text-white text-lg mt-1.5 truncate max-w-[220px]">
                      {getDisplayName(topSpenders[0])}
                    </h4>
                    <span className="text-lg font-black font-tactical text-amber-400 block mt-1">
                      {formatRupiah(topSpenders[0].totalSpent)}
                    </span>
                  </div>
                  <div className="w-full pt-3 border-t border-zinc-800 flex justify-between text-[11px] text-zinc-300 font-mono">
                    <span>{topSpenders[0].totalOrders}x Order Selesai</span>
                    <span className="text-amber-400 font-bold">{topSpenders[0].opsCoins} OpsCoins</span>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="order-3 md:order-3 p-5 rounded-3xl bg-zinc-900/90 border border-amber-800/60 flex flex-col items-center text-center space-y-3 relative overflow-hidden shadow-xl">
                  <div className="w-14 h-14 rounded-2xl bg-amber-800 text-white flex items-center justify-center font-tactical font-black text-xl shadow-lg">
                    3
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-900/30 px-2 py-0.5 rounded">
                      {TIER_CONFIGS[topSpenders[2].tier]?.name}
                    </span>
                    <h4 className="font-bold text-white text-base mt-1.5 truncate max-w-[200px]">
                      {getDisplayName(topSpenders[2])}
                    </h4>
                    <span className="text-sm font-bold font-tactical text-amber-400 block mt-1">
                      {formatRupiah(topSpenders[2].totalSpent)}
                    </span>
                  </div>
                  <div className="w-full pt-3 border-t border-zinc-800 flex justify-between text-[11px] text-zinc-400 font-mono">
                    <span>{topSpenders[2].totalOrders}x Order</span>
                    <span className="text-amber-400 font-semibold">{topSpenders[2].opsCoins} Koin</span>
                  </div>
                </div>

              </div>
            )}

            {/* Detailed Table */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-bold font-tactical uppercase tracking-wider text-white">
                  KLASEMEN LENGKAP TOP SPENDER
                </span>
                <span className="text-[11px] text-zinc-400">Total {filteredSpenders.length} Member Terdaftar</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950/80 text-zinc-400 uppercase font-tactical tracking-wider text-[10px] border-b border-zinc-800">
                    <tr>
                      <th className="py-3 px-4 text-center w-16">Peringkat</th>
                      <th className="py-3 px-4">Member / Nickname</th>
                      <th className="py-3 px-4">Pangkat Tier</th>
                      <th className="py-3 px-4 text-center">Total Order</th>
                      <th className="py-3 px-4 text-right">Total Belanja (EXP)</th>
                      <th className="py-3 px-4 text-right">OpsCoins</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredSpenders.map((cust, idx) => {
                      const rank = idx + 1;
                      const isCurrent = currentCustomer?.id === cust.id;
                      const tier = TIER_CONFIGS[cust.tier] || TIER_CONFIGS.recruit;

                      return (
                        <tr 
                          key={cust.id}
                          className={`hover:bg-zinc-800/40 transition-colors ${
                            isCurrent ? 'bg-amber-500/10 border-l-4 border-amber-500' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex justify-center">{getRankBadge(rank)}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-amber-400 text-xs">
                                {cust.name.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-white block">
                                  {getDisplayName(cust)}
                                  {isCurrent && (
                                    <span className="ml-1.5 text-[9px] bg-amber-500 text-black font-black px-1.5 py-0.2 rounded font-tactical">
                                      AKUN ANDA
                                    </span>
                                  )}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-mono">@{cust.username}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${tier.badgeBg}`}>
                              {tier.name}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-zinc-300">
                            {cust.totalOrders}x
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-400">
                            {formatRupiah(cust.totalSpent)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center space-x-1 bg-amber-500/10 px-2 py-1 rounded-lg text-amber-400 font-mono font-bold">
                              <Coins className="w-3 h-3" />
                              <span>{cust.opsCoins}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: TOP GRINDERS (KOEN FARMED) */}
        {activeBoard === 'top_grinder' && (
          <div className="space-y-6">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-bold font-tactical uppercase tracking-wider text-white">
                  TOP KOEN FARMED (TOTAL KOEN YANG BERHASIL DI-EXTRACT)
                </span>
                <span className="text-[11px] text-zinc-400">Peringkat perolehan Koen terbesar</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950/80 text-zinc-400 uppercase font-tactical tracking-wider text-[10px] border-b border-zinc-800">
                    <tr>
                      <th className="py-3 px-4 text-center w-16">Peringkat</th>
                      <th className="py-3 px-4">Member / Nickname</th>
                      <th className="py-3 px-4">Pangkat</th>
                      <th className="py-3 px-4 text-center">Jam Mandor</th>
                      <th className="py-3 px-4 text-right">Koen Di-Farming</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredGrinders.map((cust, idx) => {
                      const rank = idx + 1;
                      const isCurrent = currentCustomer?.id === cust.id;
                      const tier = TIER_CONFIGS[cust.tier] || TIER_CONFIGS.recruit;

                      return (
                        <tr 
                          key={cust.id}
                          className={`hover:bg-zinc-800/40 transition-colors ${
                            isCurrent ? 'bg-amber-500/10' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex justify-center">{getRankBadge(rank)}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-amber-400 text-xs">
                                {cust.name.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-white block">
                                  {getDisplayName(cust)}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-mono">@{cust.username}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${tier.badgeBg}`}>
                              {tier.name}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-blue-400">
                            {cust.totalRaidHours} Jam
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="text-base font-black font-tactical text-emerald-400">
                              {cust.totalKoenFarmedMillion} Juta Koen ({cust.totalKoenFarmedMillion}M)
                            </span>
                          </td>
                        </tr>
                      );
                    })}
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
                  className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 transition-all space-y-4 shadow-xl relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-tactical font-black text-lg">
                        {worker.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-amber-400 uppercase bg-amber-500/15 px-2 py-0.5 rounded">
                          TOP PRO JOKI #{idx + 1}
                        </span>
                        <h4 className="font-bold text-white text-sm mt-1">{worker.name}</h4>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800 text-xs">
                    <div className="p-2.5 bg-zinc-950 rounded-xl">
                      <span className="text-[10px] text-zinc-500 block uppercase">Misi Selesai</span>
                      <span className="text-sm font-bold font-tactical text-white mt-0.5 block">
                        {worker.completedOrders} Order
                      </span>
                    </div>

                    <div className="p-2.5 bg-zinc-950 rounded-xl">
                      <span className="text-[10px] text-zinc-500 block uppercase">Koen Selesai</span>
                      <span className="text-sm font-bold font-tactical text-emerald-400 mt-0.5 block">
                        {worker.totalKoenMillion}M Koen
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                    <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Winrate 99.8%</span>
                    </span>
                    <span className="flex items-center space-x-1 text-amber-400 font-bold">
                      <Star className="w-4 h-4 fill-amber-400" />
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
