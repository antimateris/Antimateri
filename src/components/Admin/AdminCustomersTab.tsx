import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  Coins, 
  Flame, 
  Trophy, 
  ShoppingBag, 
  MessageCircle, 
  Edit3, 
  Trash2, 
  Key, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Download, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  UserPlus,
  RefreshCw,
  Copy,
  Check,
  Award,
  Gamepad2,
  Clock,
  Ticket
} from 'lucide-react';
import { CustomerUser, CustomerTier, Order, AdminUser, CustomerRedeemedReward } from '../../types';
import { TIER_CONFIGS, calculateTierFromExp } from '../../data/initialData';
import { formatRupiah, formatDate, getWhatsAppDirectUrl } from '../../utils/helpers';

interface AdminCustomersTabProps {
  customers: CustomerUser[];
  orders: Order[];
  currentUser: AdminUser;
  onUpdateCustomer: (updatedCustomer: CustomerUser) => void;
  onDeleteCustomer: (customerId: string) => void;
}

export const AdminCustomersTab: React.FC<AdminCustomersTabProps> = ({
  customers,
  orders,
  currentUser,
  onUpdateCustomer,
  onDeleteCustomer,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'exp' | 'coins' | 'orders' | 'date'>('exp');

  // Modals state
  const [viewCustomer, setViewCustomer] = useState<CustomerUser | null>(null);
  const [editCustomer, setEditCustomer] = useState<CustomerUser | null>(null);
  const [coinExpAdjustCustomer, setCoinExpAdjustCustomer] = useState<CustomerUser | null>(null);
  const [resetPassCustomer, setResetPassCustomer] = useState<CustomerUser | null>(null);
  const [deleteConfirmCustomer, setDeleteConfirmCustomer] = useState<CustomerUser | null>(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState<boolean>(false);

  // Edit Customer Form State
  const [editName, setEditName] = useState<string>('');
  const [editWhatsApp, setEditWhatsApp] = useState<string>('');
  const [editGameNickname, setEditGameNickname] = useState<string>('');
  const [editGameUserId, setEditGameUserId] = useState<string>('');
  const [editIsAnonymized, setEditIsAnonymized] = useState<boolean>(false);

  // Coin & EXP Adjust State
  const [adjustCoinAmount, setAdjustCoinAmount] = useState<number>(50);
  const [adjustExpAmount, setAdjustExpAmount] = useState<number>(0);
  const [adjustActionType, setAdjustActionType] = useState<'add' | 'subtract'>('add');
  const [adjustReason, setAdjustReason] = useState<string>('Bonus Event & Kompensasi Layanan');

  // Reset Password State
  const [generatedTempPassword, setGeneratedTempPassword] = useState<string>('');
  const [customResetPassword, setCustomResetPassword] = useState<string>('');
  const [isResetCopied, setIsResetCopied] = useState<boolean>(false);

  // New Customer Form State
  const [newName, setNewName] = useState<string>('');
  const [newUsername, setNewUsername] = useState<string>('');
  const [newWhatsApp, setNewWhatsApp] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('member123');
  const [newGameNickname, setNewGameNickname] = useState<string>('');
  const [newGameUserId, setNewGameUserId] = useState<string>('');
  const [newBonusCoins, setNewBonusCoins] = useState<number>(50);

  // Toast / Feedback
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isSuperadmin = currentUser.role === 'superadmin';

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Filter and Sort Customers
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        const q = searchQuery.toLowerCase();
        const matchesQuery = 
          c.name.toLowerCase().includes(q) ||
          c.username.toLowerCase().includes(q) ||
          c.whatsapp.toLowerCase().includes(q) ||
          (c.gameNickname && c.gameNickname.toLowerCase().includes(q)) ||
          (c.gameUserId && c.gameUserId.toLowerCase().includes(q));

        const matchesTier = selectedTierFilter === 'all' || c.tier === selectedTierFilter;

        return matchesQuery && matchesTier;
      })
      .sort((a, b) => {
        if (sortBy === 'exp') return b.exp - a.exp;
        if (sortBy === 'coins') return b.opsCoins - a.opsCoins;
        if (sortBy === 'orders') return b.totalOrders - a.totalOrders;
        if (sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return 0;
      });
  }, [customers, searchQuery, selectedTierFilter, sortBy]);

  // Aggregate Metrics
  const totalOpsCoinsInCirculation = useMemo(() => {
    return customers.reduce((sum, c) => sum + (c.opsCoins || 0), 0);
  }, [customers]);

  const totalMembersSpent = useMemo(() => {
    return customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  }, [customers]);

  const totalSultansCount = useMemo(() => {
    return customers.filter((c) => c.tier === 'mythic' || c.tier === 'warlord').length;
  }, [customers]);

  // Open Edit Modal
  const handleOpenEdit = (c: CustomerUser) => {
    setEditCustomer(c);
    setEditName(c.name);
    setEditWhatsApp(c.whatsapp);
    setEditGameNickname(c.gameNickname || '');
    setEditGameUserId(c.gameUserId || '');
    setEditIsAnonymized(!!c.isAnonymizedInLeaderboard);
  };

  // Save Edit Modal
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCustomer) return;

    if (!editName.trim() || !editWhatsApp.trim()) {
      showToast('Nama dan No. WhatsApp tidak boleh kosong!', 'error');
      return;
    }

    const updated: CustomerUser = {
      ...editCustomer,
      name: editName.trim(),
      whatsapp: editWhatsApp.trim(),
      gameNickname: editGameNickname.trim() || undefined,
      gameUserId: editGameUserId.trim() || undefined,
      isAnonymizedInLeaderboard: editIsAnonymized,
    };

    onUpdateCustomer(updated);
    setEditCustomer(null);
    showToast(`Data member "${updated.name}" berhasil diperbarui!`);
  };

  // Open Adjust Modal
  const handleOpenAdjust = (c: CustomerUser) => {
    setCoinExpAdjustCustomer(c);
    setAdjustCoinAmount(50);
    setAdjustExpAmount(0);
    setAdjustActionType('add');
    setAdjustReason('Bonus Event & Kompensasi Layanan');
  };

  // Save Adjust Modal
  const handleSaveAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coinExpAdjustCustomer) return;

    let newCoins = coinExpAdjustCustomer.opsCoins;
    let newExp = coinExpAdjustCustomer.exp;

    if (adjustActionType === 'add') {
      newCoins += Number(adjustCoinAmount) || 0;
      newExp += Number(adjustExpAmount) || 0;
    } else {
      newCoins = Math.max(0, newCoins - (Number(adjustCoinAmount) || 0));
      newExp = Math.max(0, newExp - (Number(adjustExpAmount) || 0));
    }

    const newTier = calculateTierFromExp(newExp);

    const updated: CustomerUser = {
      ...coinExpAdjustCustomer,
      opsCoins: newCoins,
      exp: newExp,
      tier: newTier,
    };

    onUpdateCustomer(updated);
    setCoinExpAdjustCustomer(null);
    showToast(`Berhasil menyesuaikan saldo Koin (${newCoins}) & EXP (${formatRupiah(newExp)}) untuk "${updated.name}"!`);
  };

  // Open Reset Password Modal
  const handleOpenResetPassword = (c: CustomerUser) => {
    setResetPassCustomer(c);
    // Generate secure temporary 6-digit random code
    const randomCode = `PASS-${Math.floor(100000 + Math.random() * 900000)}`;
    setGeneratedTempPassword(randomCode);
    setCustomResetPassword(randomCode);
    setIsResetCopied(false);
  };

  // Confirm Password Reset
  const handleConfirmResetPassword = () => {
    if (!resetPassCustomer) return;

    const finalPass = customResetPassword.trim() || generatedTempPassword;
    if (!finalPass) {
      showToast('Password baru tidak boleh kosong!', 'error');
      return;
    }

    const updated: CustomerUser = {
      ...resetPassCustomer,
      password: finalPass,
    };

    onUpdateCustomer(updated);
    showToast(`Password member "${updated.name}" berhasil direset ke password sementara!`);
    setResetPassCustomer(null);
  };

  // Add New Customer Manually
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUsername.trim() || !newWhatsApp.trim()) {
      showToast('Nama, Username, dan No. WhatsApp wajib diisi!', 'error');
      return;
    }

    const cleanUsername = newUsername.trim().toLowerCase();
    if (customers.some((c) => c.username.toLowerCase() === cleanUsername)) {
      showToast('Username tersebut sudah terdaftar oleh pengguna lain!', 'error');
      return;
    }

    const newCust: CustomerUser = {
      id: `cust_${Date.now()}`,
      name: newName.trim(),
      username: cleanUsername,
      password: newPassword.trim() || 'member123',
      whatsapp: newWhatsApp.trim(),
      gameNickname: newGameNickname.trim() || undefined,
      gameUserId: newGameUserId.trim() || undefined,
      opsCoins: Number(newBonusCoins) || 50,
      exp: 0,
      tier: 'recruit',
      totalSpent: 0,
      totalOrders: 0,
      totalKoenFarmedMillion: 0,
      totalRaidHours: 0,
      createdAt: new Date().toISOString(),
      isAnonymizedInLeaderboard: false,
      redeemedRewards: [],
    };

    onUpdateCustomer(newCust);
    setIsAddCustomerOpen(false);
    setNewName('');
    setNewUsername('');
    setNewWhatsApp('');
    setNewGameNickname('');
    setNewGameUserId('');
    showToast(`Member baru "${newCust.name}" berhasil ditambahkan dengan +${newCust.opsCoins} OpsCoins!`);
  };

  // Export to CSV without raw passwords
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Nama Pelanggan',
      'Username',
      'WhatsApp',
      'Nickname Game',
      'ID Akun Game',
      'Pangkat (Tier)',
      'Total Belanja (EXP)',
      'Saldo OpsCoins',
      'Total Pesanan',
      'Koen Farmed (Million)',
      'Raid Hours',
      'Tanggal Terdaftar'
    ];

    const rows = customers.map((c) => [
      `"${c.id}"`,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.username}"`,
      `"${c.whatsapp}"`,
      `"${c.gameNickname || '-'}"`,
      `"${c.gameUserId || '-'}"`,
      `"${c.tier.toUpperCase()}"`,
      `"${c.totalSpent}"`,
      `"${c.opsCoins}"`,
      `"${c.totalOrders}"`,
      `"${c.totalKoenFarmedMillion}M"`,
      `"${c.totalRaidHours} Jam"`,
      `"${new Date(c.createdAt).toLocaleDateString('id-ID')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `data-pelanggan-breakoutops-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data pelanggan berhasil diekspor ke file CSV!');
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {feedbackMsg && (
        <div className={`p-4 rounded-xl flex items-center justify-between border shadow-xl animate-fade-in ${
          feedbackMsg.type === 'success'
            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
            : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
        }`}>
          <div className="flex items-center space-x-2">
            {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
            <span className="text-sm font-semibold">{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Privacy Notice Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Users className="w-4 h-4" />
              <span>Database Member & Customer CRM</span>
            </div>
            <h2 className="text-2xl font-tactical font-black text-white tracking-wide">
              MANAJEMEN DATA PENGGUNA & PELANGGAN
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
              Pantau seluruh akun member terdaftar, status pangkat tiering gamifikasi, akumulasi total belanja, saldo OpsCoins reward, dan kelola akun secara aman.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow"
              title="Unduh data pelanggan dalam format CSV"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Ekspor CSV</span>
            </button>

            <button
              onClick={() => setIsAddCustomerOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-tactical font-bold transition-all cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Member Baru</span>
            </button>
          </div>
        </div>

        {/* Zero-Trust Password Privacy Notice */}
        <div className="mt-5 p-3.5 bg-blue-950/30 border border-blue-500/30 rounded-xl flex items-start space-x-3 text-xs text-blue-200">
          <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-400 shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="font-bold text-blue-100 flex items-center space-x-2">
              <span>🔒 Standar Perlindungan Privasi & Keamanan Password Pelanggan</span>
              <span className="px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded text-[10px] uppercase font-mono">
                Zero-Knowledge Privacy
              </span>
            </div>
            <p className="text-blue-300/80 leading-relaxed text-[11px]">
              Demi menjaga kerahasiaan data pengguna, <strong>password asli pelanggan disimpan secara terenkripsi / disamarkan (<code className="bg-black/40 px-1 py-0.5 rounded text-amber-300 font-mono">••••••••</code>)</strong> dan tidak ditampilkan dalam teks terbuka bahkan ke administrator. Jika pelanggan lupa kata sandi mereka, Admin dapat menggunakan fitur <strong>"Reset Password"</strong> untuk membuatkan kode akses sementara baru yang aman.
            </p>
          </div>
        </div>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-1">
            <span>Total Member</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-tactical font-black text-white">
            {customers.length} <span className="text-xs font-sans text-zinc-400 font-normal">Akun</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Terdaftar di sistem CRM
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-1">
            <span>OpsCoins Beredar</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-tactical font-black text-amber-400">
            {totalOpsCoinsInCirculation.toLocaleString('id-ID')} <span className="text-xs font-sans text-zinc-400 font-normal">🪙</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Saldo koin siap ditukar reward
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-1">
            <span>Akumulasi Belanja</span>
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-tactical font-black text-emerald-400 truncate">
            {formatRupiah(totalMembersSpent)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Total EXP & omset dari member
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-1">
            <span>Member Sultan</span>
            <Trophy className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-tactical font-black text-yellow-400">
            {totalSultansCount} <span className="text-xs font-sans text-zinc-400 font-normal">Sultan</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Pangkat Warlord & Mythic
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        
        {/* Search Field */}
        <div className="relative flex-grow max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, username, no WA, nickname game..."
            className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Controls: Tier Filter & Sort By */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Filter Tier */}
          <div className="flex items-center space-x-1 bg-zinc-950 border border-zinc-700/80 rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedTierFilter}
              onChange={(e) => setSelectedTierFilter(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-zinc-900 text-white">Semua Pangkat</option>
              <option value="recruit" className="bg-zinc-900 text-white">Recruit (Pemula)</option>
              <option value="operative" className="bg-zinc-900 text-white">Operative</option>
              <option value="elite" className="bg-zinc-900 text-white">Elite Vanguard</option>
              <option value="warlord" className="bg-zinc-900 text-white">Warlord</option>
              <option value="mythic" className="bg-zinc-900 text-white">Mythic Sultan</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-1 bg-zinc-950 border border-zinc-700/80 rounded-xl px-2.5 py-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="exp" className="bg-zinc-900 text-white">Urut: EXP & Belanja Tertinggi</option>
              <option value="coins" className="bg-zinc-900 text-white">Urut: Saldo Koin Terbanyak</option>
              <option value="orders" className="bg-zinc-900 text-white">Urut: Pesanan Terbanyak</option>
              <option value="date" className="bg-zinc-900 text-white">Urut: Terdaftar Terbaru</option>
            </select>
          </div>

        </div>

      </div>

      {/* Customers Data Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-950/80 text-zinc-400 border-b border-zinc-800 font-tactical uppercase tracking-wider">
                <th className="py-3 px-4">Member / Pengguna</th>
                <th className="py-3 px-4">Kontak WhatsApp</th>
                <th className="py-3 px-4">Info Game</th>
                <th className="py-3 px-4">Pangkat (Tier)</th>
                <th className="py-3 px-4">Total Belanja (EXP)</th>
                <th className="py-3 px-4">OpsCoins</th>
                <th className="py-3 px-4 text-center">Keamanan Password</th>
                <th className="py-3 px-4 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30 text-zinc-400" />
                    <p className="text-sm font-semibold">Tidak ada data member yang cocok</p>
                    <p className="text-xs text-zinc-600 mt-0.5">Coba ubah kata kunci pencarian atau filter pangkat.</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const tierConfig = TIER_CONFIGS[cust.tier] || TIER_CONFIGS.recruit;
                  const isSultan = cust.tier === 'mythic' || cust.tier === 'warlord';
                  const customerOrders = orders.filter(
                    (o) => o.customerWhatsApp === cust.whatsapp || o.customerName.toLowerCase() === cust.name.toLowerCase()
                  );

                  return (
                    <tr key={cust.id} className="hover:bg-zinc-800/40 transition-colors group">
                      
                      {/* Member Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-tactical font-bold text-sm shrink-0 border ${
                            isSultan ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                          }`}>
                            {cust.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-white group-hover:text-amber-300 transition-colors">
                                {cust.name}
                              </span>
                              {cust.isAnonymizedInLeaderboard && (
                                <span className="px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 text-[9px] font-mono" title="Pelanggan mengaktifkan mode anonim di Leaderboard">
                                  Anonim
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-400 font-mono">
                              @{cust.username}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* WhatsApp */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-zinc-200">{cust.whatsapp}</span>
                          <a
                            href={getWhatsAppDirectUrl(cust.whatsapp, `Halo kak ${cust.name}, ini dari Admin BreakoutOps Arena Services...`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 transition-colors"
                            title="Chat langsung di WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>

                      {/* Game Info */}
                      <td className="py-3.5 px-4">
                        {cust.gameNickname ? (
                          <div>
                            <div className="font-semibold text-zinc-200 flex items-center space-x-1">
                              <Gamepad2 className="w-3 h-3 text-amber-400 shrink-0" />
                              <span>{cust.gameNickname}</span>
                            </div>
                            {cust.gameUserId && (
                              <div className="text-[10px] text-zinc-500 font-mono">
                                ID: {cust.gameUserId}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-zinc-600 italic text-[11px]">- Belum Diisi -</span>
                        )}
                      </td>

                      {/* Tier Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border ${tierConfig.badgeBg} ${tierConfig.color} ${tierConfig.borderBg}`}>
                          <Award className="w-3 h-3" />
                          <span>{tierConfig.name}</span>
                        </span>
                      </td>

                      {/* Total Spent / EXP */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-white">
                          {formatRupiah(cust.totalSpent || cust.exp || 0)}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {cust.totalOrders}x Pesanan Selesai
                        </div>
                      </td>

                      {/* OpsCoins */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1 font-bold text-amber-400 font-mono">
                          <Coins className="w-3.5 h-3.5" />
                          <span>{cust.opsCoins || 0}</span>
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {(cust.redeemedRewards || []).length} Voucher Ditukar
                        </div>
                      </td>

                      {/* Password Security Column (Always Masked) */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <div className="flex items-center space-x-1 px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400 text-[11px] font-mono">
                            <Lock className="w-3 h-3 text-emerald-400" />
                            <span>••••••••</span>
                          </div>
                          <span className="text-[9px] text-zinc-500 mt-0.5 flex items-center space-x-0.5">
                            <ShieldCheck className="w-2.5 h-2.5 text-blue-400" />
                            <span>Terenkripsi</span>
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          
                          {/* View Detail & History */}
                          <button
                            type="button"
                            onClick={() => setViewCustomer(cust)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                            title="Lihat Detail Profil & Riwayat Pesanan"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                          </button>

                          {/* Adjust Coins / EXP */}
                          <button
                            type="button"
                            onClick={() => handleOpenAdjust(cust)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-400 border border-transparent hover:border-amber-500/30 transition-all cursor-pointer"
                            title="Tambah / Kurangi OpsCoins & EXP"
                          >
                            <Coins className="w-3.5 h-3.5 text-amber-400" />
                          </button>

                          {/* Reset Password */}
                          <button
                            type="button"
                            onClick={() => handleOpenResetPassword(cust)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-purple-500/20 text-zinc-300 hover:text-purple-400 border border-transparent hover:border-purple-500/30 transition-all cursor-pointer"
                            title="Reset Kata Sandi Member (Buat Password Sementara)"
                          >
                            <Key className="w-3.5 h-3.5 text-purple-400" />
                          </button>

                          {/* Edit Customer Profile */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cust)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                            title="Edit Data Member"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-zinc-300" />
                          </button>

                          {/* Delete (Superadmin only) */}
                          {isSuperadmin && (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmCustomer(cust)}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer"
                              title="Hapus Akun Member (Khusus Superadmin)"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: VIEW DETAIL CUSTOMER & ORDER HISTORY */}
      {/* ========================================================================= */}
      {viewCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            
            <button
              onClick={() => setViewCustomer(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex items-center space-x-4 pb-6 border-b border-zinc-800">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-tactical font-black text-2xl">
                {viewCustomer.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-grow">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-tactical font-black text-white">{viewCustomer.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${TIER_CONFIGS[viewCustomer.tier]?.badgeBg} ${TIER_CONFIGS[viewCustomer.tier]?.color}`}>
                    {TIER_CONFIGS[viewCustomer.tier]?.name}
                  </span>
                </div>
                <div className="text-xs text-zinc-400 font-mono mt-0.5">
                  @{viewCustomer.username} • Terdaftar: {formatDate(viewCustomer.createdAt)}
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-3 my-5">
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <div className="text-[10px] text-zinc-500 uppercase font-semibold">Total Belanja (EXP)</div>
                <div className="text-sm font-mono font-bold text-white mt-0.5">
                  {formatRupiah(viewCustomer.totalSpent || viewCustomer.exp)}
                </div>
              </div>
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <div className="text-[10px] text-zinc-500 uppercase font-semibold">Saldo OpsCoins</div>
                <div className="text-sm font-mono font-bold text-amber-400 mt-0.5 flex items-center space-x-1">
                  <Coins className="w-3.5 h-3.5" />
                  <span>{viewCustomer.opsCoins} Koin</span>
                </div>
              </div>
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <div className="text-[10px] text-zinc-500 uppercase font-semibold">Koen Farmed</div>
                <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                  {viewCustomer.totalKoenFarmedMillion || 0}M Koen
                </div>
              </div>
            </div>

            {/* Account Security Box */}
            <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl mb-5 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-zinc-800 rounded-lg text-amber-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">Status Kata Sandi (Password)</div>
                  <div className="text-[11px] text-zinc-400">Tersimpan aman dengan enkripsi hash. Disamarkan: <code className="text-amber-400 font-mono">••••••••</code></div>
                </div>
              </div>
              <button
                onClick={() => {
                  const target = viewCustomer;
                  setViewCustomer(null);
                  handleOpenResetPassword(target);
                }}
                className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Reset Password
              </button>
            </div>

            {/* Redeemed Rewards Section */}
            <div className="mb-6">
              <h4 className="text-xs font-tactical font-bold text-zinc-300 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
                <Ticket className="w-3.5 h-3.5 text-amber-400" />
                <span>Voucher & Hadiah Ditukarkan ({(viewCustomer.redeemedRewards || []).length})</span>
              </h4>
              {(viewCustomer.redeemedRewards || []).length === 0 ? (
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-center text-xs text-zinc-500">
                  Member ini belum menukarkan voucher reward apapun.
                </div>
              ) : (
                <div className="space-y-2">
                  {(viewCustomer.redeemedRewards || []).map((rew) => (
                    <div key={rew.id} className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{rew.title}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">Kode: <strong className="text-amber-400">{rew.code}</strong></div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rew.isUsed ? 'bg-zinc-800 text-zinc-400' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {rew.isUsed ? `Sudah Digunakan (${rew.usedInInvoice || '-'})` : 'Tersedia'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Orders Linked to Customer */}
            <div>
              <h4 className="text-xs font-tactical font-bold text-zinc-300 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                <span>Riwayat Pesanan Pelanggan</span>
              </h4>
              {orders.filter((o) => o.customerWhatsApp === viewCustomer.whatsapp || o.customerName.toLowerCase() === viewCustomer.name.toLowerCase()).length === 0 ? (
                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-center text-xs text-zinc-500">
                  Belum ada pesanan aktif atau selesai atas nama kontak ini.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {orders
                    .filter((o) => o.customerWhatsApp === viewCustomer.whatsapp || o.customerName.toLowerCase() === viewCustomer.name.toLowerCase())
                    .map((ord) => (
                      <div key={ord.id} className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white flex items-center space-x-1.5">
                            <span className="font-mono text-amber-400">{ord.invoiceNumber}</span>
                            <span>•</span>
                            <span>{ord.packageName}</span>
                          </div>
                          <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                            {formatDate(ord.createdAt)} • {formatRupiah(ord.totalPrice)} ({ord.paymentMethod.toUpperCase()})
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          ord.orderStatus === 'completed' ? 'bg-emerald-500/20 text-emerald-300' :
                          ord.orderStatus === 'in_progress' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-zinc-800 text-zinc-400'
                        }`}>
                          {ord.orderStatus}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewCustomer(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADJUST OPSCOINS & EXP */}
      {/* ========================================================================= */}
      {coinExpAdjustCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <button
              onClick={() => setCoinExpAdjustCustomer(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase mb-1">
              <Coins className="w-4 h-4" />
              <span>Kelola Saldo Koin & EXP</span>
            </div>
            <h3 className="text-xl font-tactical font-black text-white">
              SESUAIKAN SALDO MEMBER
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Atur penambahan atau pengurangan saldo OpsCoins dan EXP member <strong>{coinExpAdjustCustomer.name}</strong> (@{coinExpAdjustCustomer.username}).
            </p>

            <form onSubmit={handleSaveAdjust} className="mt-5 space-y-4">
              
              {/* Action Type Toggle */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Tindakan:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustActionType('add')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      adjustActionType === 'add'
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    + Tambah (Kredit Bonus)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustActionType('subtract')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      adjustActionType === 'subtract'
                        ? 'bg-rose-600 text-white border-rose-500'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    - Kurangi (Debit)
                  </button>
                </div>
              </div>

              {/* OpsCoins Input */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Jumlah OpsCoins (🪙):
                </label>
                <input
                  type="number"
                  min="0"
                  value={adjustCoinAmount}
                  onChange={(e) => setAdjustCoinAmount(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  Saldo saat ini: {coinExpAdjustCustomer.opsCoins} OpsCoins
                </p>
              </div>

              {/* EXP Input */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Jumlah EXP / Akumulasi Belanja (Rp):
                </label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={adjustExpAmount}
                  onChange={(e) => setAdjustExpAmount(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  EXP saat ini: {formatRupiah(coinExpAdjustCustomer.exp)}
                </p>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Alasan / Catatan Penyesuaian:
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                  placeholder="Contoh: Kompensasi maintenance server joki"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCoinExpAdjustCustomer(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-tactical font-bold cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: RESET PASSWORD PENGGUNA */}
      {/* ========================================================================= */}
      {resetPassCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <button
              onClick={() => setResetPassCustomer(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold uppercase mb-1">
              <Key className="w-4 h-4" />
              <span>Reset Akses Kata Sandi</span>
            </div>
            <h3 className="text-xl font-tactical font-black text-white">
              RESET PASSWORD MEMBER
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Buatkan password sementara baru untuk akun member <strong>{resetPassCustomer.name}</strong> (@{resetPassCustomer.username}).
            </p>

            <div className="mt-5 space-y-4">
              
              {/* Generated Temp Password Display */}
              <div className="p-3.5 bg-zinc-950 border border-purple-500/30 rounded-xl">
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
                  Password Sementara yang Dihasilkan:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={customResetPassword}
                    onChange={(e) => setCustomResetPassword(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono font-bold text-purple-300 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(customResetPassword);
                      setIsResetCopied(true);
                      setTimeout(() => setIsResetCopied(false), 2000);
                    }}
                    className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg shrink-0 cursor-pointer"
                    title="Salin password ke clipboard"
                  >
                    {isResetCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* WhatsApp Quick Send Button */}
              <a
                href={getWhatsAppDirectUrl(
                  resetPassCustomer.whatsapp,
                  `Halo kak ${resetPassCustomer.name}! Password akun BreakoutOps Anda (@${resetPassCustomer.username}) telah berhasil direset oleh Admin.\n\n🔑 *Password Sementara:* ${customResetPassword}\n\nSilakan login kembali di website BreakoutOps dan ganti password Anda di menu profil demi keamanan. Terima kasih!`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Kirim Password Baru via WhatsApp</span>
              </a>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setResetPassCustomer(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmResetPassword}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-tactical font-bold cursor-pointer shadow-lg shadow-purple-600/30"
                >
                  Konfirmasi Reset Password
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EDIT MEMBER DATA */}
      {/* ========================================================================= */}
      {editCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <button
              onClick={() => setEditCustomer(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase mb-1">
              <Edit3 className="w-4 h-4" />
              <span>Edit Data Member</span>
            </div>
            <h3 className="text-xl font-tactical font-black text-white">
              EDIT PROFIL PELANGGAN
            </h3>

            <form onSubmit={handleSaveEdit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Nama Lengkap:</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Nomor WhatsApp:</label>
                <input
                  type="text"
                  required
                  value={editWhatsApp}
                  onChange={(e) => setEditWhatsApp(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Nickname Game Arena Breakout:</label>
                <input
                  type="text"
                  value={editGameNickname}
                  onChange={(e) => setEditGameNickname(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="Contoh: [KMN] ShadowOperative"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">ID Game (User ID):</label>
                <input
                  type="text"
                  value={editGameUserId}
                  onChange={(e) => setEditGameUserId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  placeholder="Contoh: 10992812"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="edit-anonymize-cb"
                  checked={editIsAnonymized}
                  onChange={(e) => setEditIsAnonymized(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-zinc-950 border-zinc-700"
                />
                <label htmlFor="edit-anonymize-cb" className="text-xs text-zinc-300 cursor-pointer">
                  Anonimkan nama pelanggan di Leaderboard
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditCustomer(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-tactical font-bold cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ADD NEW MEMBER MANUALLY */}
      {/* ========================================================================= */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <button
              onClick={() => setIsAddCustomerOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase mb-1">
              <UserPlus className="w-4 h-4" />
              <span>Registrasi Member Manual</span>
            </div>
            <h3 className="text-xl font-tactical font-black text-white">
              TAMBAH MEMBER BARU
            </h3>

            <form onSubmit={handleCreateCustomer} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Nama Lengkap:</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="Contoh: Dimas Prakoso"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Username (Unik):</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  placeholder="Contoh: dimasprakoso"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Nomor WhatsApp:</label>
                <input
                  type="text"
                  required
                  value={newWhatsApp}
                  onChange={(e) => setNewWhatsApp(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  placeholder="Contoh: 081234567890"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Password Awal:</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  placeholder="Default: member123"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Bonus Koin Pendaftaran:</label>
                <input
                  type="number"
                  min="0"
                  value={newBonusCoins}
                  onChange={(e) => setNewBonusCoins(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-tactical font-bold cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  Simpan Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: DELETE CONFIRMATION (SUPERADMIN ONLY) */}
      {/* ========================================================================= */}
      {deleteConfirmCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-rose-500/30 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <div className="flex items-center space-x-3 text-rose-400 mb-3">
              <div className="p-2 bg-rose-500/20 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-tactical font-black text-white">HAPUS AKUN MEMBER?</h3>
                <p className="text-xs text-zinc-400">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 mt-3 leading-relaxed">
              Apakah Anda yakin ingin menghapus akun member <strong>"{deleteConfirmCustomer.name}"</strong> (@{deleteConfirmCustomer.username})? Seluruh saldo OpsCoins ({deleteConfirmCustomer.opsCoins}) dan riwayat EXP akan dihapus secara permanen.
            </p>

            <div className="mt-6 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmCustomer(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteCustomer(deleteConfirmCustomer.id);
                  showToast(`Akun member "${deleteConfirmCustomer.name}" berhasil dihapus.`);
                  setDeleteConfirmCustomer(null);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-tactical font-bold cursor-pointer shadow-lg shadow-rose-600/30"
              >
                Ya, Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
