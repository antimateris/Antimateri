import React, { useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  Plus, 
  X, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  TrendingUp, 
  Users, 
  Sparkles, 
  FileText, 
  Shield, 
  ArrowUpRight, 
  MessageSquare,
  Building2,
  Wallet,
  Receipt,
  UserCheck,
  Award
} from 'lucide-react';
import { WorkerPayout, AdminUser, Order, PayoutStatus } from '../../types';
import { formatRupiah, formatDate } from '../../utils/helpers';

interface AdminPayoutsTabProps {
  payouts: WorkerPayout[];
  admins: AdminUser[];
  orders: Order[];
  currentUser: AdminUser;
  onAddPayout: (payout: WorkerPayout) => void;
  onUpdatePayout: (payout: WorkerPayout) => void;
  onDeletePayout: (payoutId: string) => void;
  onUpdateAdmin: (admin: AdminUser) => void;
}

export const AdminPayoutsTab: React.FC<AdminPayoutsTabProps> = ({
  payouts,
  admins,
  orders,
  currentUser,
  onAddPayout,
  onUpdatePayout,
  onDeletePayout,
  onUpdateAdmin,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<PayoutStatus | 'all'>('all');
  const [workerFilter, setWorkerFilter] = useState<string>('all');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingPayout, setEditingPayout] = useState<WorkerPayout | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [evaluatingAdmin, setEvaluatingAdmin] = useState<AdminUser | null>(null);
  const [isEvalModalOpen, setIsEvalModalOpen] = useState<boolean>(false);

  // New Payout Form State
  const [newWorkerId, setNewWorkerId] = useState<string>('');
  const [newBank, setNewBank] = useState<string>('BCA');
  const [newAccNumber, setNewAccNumber] = useState<string>('');
  const [newAccHolder, setNewAccHolder] = useState<string>('');
  const [newAmount, setNewAmount] = useState<number>(0);
  const [newPeriod, setNewPeriod] = useState<string>(`Pekan ${Math.ceil(new Date().getDate() / 7)} - ${new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date())}`);
  const [newWorkSummary, setNewWorkSummary] = useState<string>('');
  const [newStatus, setNewStatus] = useState<PayoutStatus>('pending');
  const [newAdminNotes, setNewAdminNotes] = useState<string>('');
  const [newFeedback, setNewFeedback] = useState<string>('');
  const [newProofUrl, setNewProofUrl] = useState<string>('');

  // Copy Feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filtered Workers (exclude current CEO or show all admins)
  const workerList = admins.filter((a) => a.active);

  // Auto-fill bank details when worker selected in Add Modal
  const handleSelectWorker = (workerId: string) => {
    setNewWorkerId(workerId);
    const worker = admins.find((a) => a.id === workerId);
    if (worker) {
      if (worker.bankName) setNewBank(worker.bankName);
      if (worker.bankAccountNumber) setNewAccNumber(worker.bankAccountNumber);
      if (worker.bankAccountHolder) setNewAccHolder(worker.bankAccountHolder);

      // Calculate completed orders assigned to this worker that have not yet been paid
      const completedOrders = orders.filter(
        (o) =>
          o.orderStatus === 'completed' &&
          (o.assignedWorker?.toLowerCase().includes(worker.name.toLowerCase()) ||
            o.assignedWorker?.toLowerCase().includes(worker.username.toLowerCase()))
      );

      const defaultCommissionRate = (worker.commissionRatePercent || 70) / 100;
      const totalEstimated = completedOrders.reduce(
        (sum, o) => sum + Math.round(o.totalPrice * defaultCommissionRate),
        0
      );

      if (completedOrders.length > 0) {
        setNewWorkSummary(`${completedOrders.length} Order Selesai (${completedOrders.map((o) => o.invoiceNumber).slice(0, 3).join(', ')}${completedOrders.length > 3 ? '...' : ''})`);
        if (newAmount === 0 && totalEstimated > 0) {
          setNewAmount(totalEstimated);
        }
      }
    }
  };

  const handleCreatePayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerId || newAmount <= 0 || !newAccNumber || !newAccHolder) {
      alert('Mohon lengkapi data worker, nomor rekening, atas nama, dan nominal transfer!');
      return;
    }

    const worker = admins.find((a) => a.id === newWorkerId);
    const payoutNumber = `TRF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPayout: WorkerPayout = {
      id: `pay_${Date.now()}`,
      payoutNumber,
      workerId: newWorkerId,
      workerName: worker?.name || 'Worker Tim',
      workerUsername: worker?.username,
      accountBank: newBank,
      accountNumber: newAccNumber.trim(),
      accountHolderName: newAccHolder.trim(),
      amount: Number(newAmount),
      period: newPeriod.trim(),
      workSummary: newWorkSummary.trim() || 'Pengerjaan Joki Tim Selesai',
      completedOrdersCount: 1,
      status: newStatus,
      createdAt: new Date().toISOString(),
      processedAt: newStatus === 'processing' || newStatus === 'transferred' ? new Date().toISOString() : undefined,
      transferredAt: newStatus === 'transferred' ? new Date().toISOString() : undefined,
      transferProofUrl: newProofUrl.trim() || undefined,
      adminNotes: newAdminNotes.trim() || undefined,
      improvementFeedback: newFeedback.trim() || undefined,
    };

    onAddPayout(newPayout);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleUpdateStatusAndProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayout) return;

    const updated: WorkerPayout = {
      ...editingPayout,
      processedAt:
        editingPayout.status !== 'pending' && !editingPayout.processedAt
          ? new Date().toISOString()
          : editingPayout.processedAt,
      transferredAt:
        editingPayout.status === 'transferred' && !editingPayout.transferredAt
          ? new Date().toISOString()
          : editingPayout.transferredAt,
    };

    onUpdatePayout(updated);
    setIsEditModalOpen(false);
    setEditingPayout(null);
  };

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingAdmin) return;

    onUpdateAdmin(evaluatingAdmin);
    setIsEvalModalOpen(false);
    setEvaluatingAdmin(null);
  };

  const resetForm = () => {
    setNewWorkerId('');
    setNewBank('BCA');
    setNewAccNumber('');
    setNewAccHolder('');
    setNewAmount(0);
    setNewWorkSummary('');
    setNewStatus('pending');
    setNewAdminNotes('');
    setNewFeedback('');
    setNewProofUrl('');
  };

  // Copy WhatsApp format slip
  const handleCopyWhatsAppSlip = (pay: WorkerPayout) => {
    const slipText = `🧾 *[SLIP GAJI & TRANSFER WORKER BREAKOUTOPS]*
──────────────────────────
👤 *Nama Worker:* ${pay.workerName}
🆔 *Kode Transfer:* ${pay.payoutNumber}
📅 *Periode:* ${pay.period || '-'}
🎮 *Rincian Pengerjaan:* ${pay.workSummary}

🏦 *Rekening Tujuan:* ${pay.accountBank} - ${pay.accountNumber}
👤 *Atas Nama:* ${pay.accountHolderName}
💰 *TOTAL GAJI/TRANSFER:* *${formatRupiah(pay.amount)}*
📊 *Status:* ${
      pay.status === 'transferred'
        ? '✅ SUDAH DITRANSFER (LUNAS)'
        : pay.status === 'processing'
        ? '🔄 SEDANG DIPROSES TRANSFER'
        : pay.status === 'rejected'
        ? '❌ DITOLAK'
        : '⏳ MENUNGGU PENCAIRAN'
    }

${pay.adminNotes ? `📝 *Catatan CEO:* ${pay.adminNotes}\n` : ''}${pay.improvementFeedback ? `💡 *Evaluasi & Saran:* ${pay.improvementFeedback}\n` : ''}
──────────────────────────
_Terima kasih atas dedikasi dan kerja kerasnya menjaga winrate & kepuasan pelanggan BreakoutOps!_`;

    navigator.clipboard.writeText(slipText);
    setCopiedId(pay.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filtered Payouts
  const filteredPayouts = payouts.filter((p) => {
    const matchesSearch =
      p.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.payoutNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.accountNumber.includes(searchTerm) ||
      p.accountBank.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.workSummary.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesWorker = workerFilter === 'all' || p.workerId === workerFilter;

    return matchesSearch && matchesStatus && matchesWorker;
  });

  // Calculate Metrics
  const totalTransferredAmount = payouts
    .filter((p) => p.status === 'transferred')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPendingAmount = payouts
    .filter((p) => p.status === 'pending' || p.status === 'processing')
    .reduce((sum, p) => sum + p.amount, 0);

  const activeWorkerCount = admins.filter((a) => a.active).length;

  const totalCompletedOrders = orders.filter((o) => o.orderStatus === 'completed').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner & Stats */}
      <div className="bg-gradient-to-r from-zinc-900 via-amber-950/20 to-zinc-900 border border-amber-500/30 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 mb-1">
              <CreditCard className="w-5 h-5" />
              <span className="text-xs uppercase font-extrabold tracking-wider bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                CEO PAYROLL & TRANSFER CONSOLE
              </span>
            </div>
            <h2 className="font-tactical text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
              STATUS TRANSFER & GAJI WORKER
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mt-1">
              Kelola pencairan gaji worker, nomor rekening tujuan, rincian pengerjaan order, status transfer bank/e-wallet, serta evaluasi performa joki.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="flex items-center space-x-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-tactical font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>BUAT TRANSFER / GAJI BARU</span>
            </button>
          </div>
        </div>

        {/* 4 Quick Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <div className="bg-zinc-950/80 border border-emerald-500/30 rounded-xl p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-emerald-400 text-xs mb-1 font-semibold">
              <span>Total Gaji Ditransfer</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="font-tactical text-lg sm:text-2xl font-bold text-white">
              {formatRupiah(totalTransferredAmount)}
            </p>
            <span className="text-[10px] text-zinc-400">
              {payouts.filter((p) => p.status === 'transferred').length} Slip Transfer Sukses
            </span>
          </div>

          <div className="bg-zinc-950/80 border border-amber-500/30 rounded-xl p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-amber-400 text-xs mb-1 font-semibold">
              <span>Menunggu Transfer (Pending)</span>
              <Clock className="w-4 h-4" />
            </div>
            <p className="font-tactical text-lg sm:text-2xl font-bold text-amber-400">
              {formatRupiah(totalPendingAmount)}
            </p>
            <span className="text-[10px] text-zinc-400">
              {payouts.filter((p) => p.status === 'pending' || p.status === 'processing').length} Payout Dalam Antrean
            </span>
          </div>

          <div className="bg-zinc-950/80 border border-blue-500/30 rounded-xl p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-blue-400 text-xs mb-1 font-semibold">
              <span>Worker Aktif</span>
              <Users className="w-4 h-4" />
            </div>
            <p className="font-tactical text-lg sm:text-2xl font-bold text-white">
              {activeWorkerCount} Joki
            </p>
            <span className="text-[10px] text-zinc-400">Siap & Terdaftar di Sistem</span>
          </div>

          <div className="bg-zinc-950/80 border border-purple-500/30 rounded-xl p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-purple-400 text-xs mb-1 font-semibold">
              <span>Total Order Selesai</span>
              <Award className="w-4 h-4" />
            </div>
            <p className="font-tactical text-lg sm:text-2xl font-bold text-white">
              {totalCompletedOrders} Order
            </p>
            <span className="text-[10px] text-zinc-400">Akumulasi Seluruh Tim Joki</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari worker, bank, no rek, invoice..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-500"
            />
          </div>

          {/* Worker Filter Dropdown */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs text-zinc-400 font-semibold whitespace-nowrap">Filter Worker:</span>
            <select
              value={workerFilter}
              onChange={(e) => setWorkerFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:border-amber-500"
            >
              <option value="all">Semua Tim Worker</option>
              {admins.map((adm) => (
                <option key={adm.id} value={adm.id}>
                  {adm.name} ({adm.role === 'superadmin' ? 'CEO' : 'Worker'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-zinc-800/80">
          {[
            { id: 'all', label: 'Semua Status', count: payouts.length },
            { id: 'pending', label: 'Menunggu (Pending)', count: payouts.filter((p) => p.status === 'pending').length },
            { id: 'processing', label: 'Diproses Transfer', count: payouts.filter((p) => p.status === 'processing').length },
            { id: 'transferred', label: 'Selesai Ditransfer', count: payouts.filter((p) => p.status === 'transferred').length },
            { id: 'rejected', label: 'Ditolak', count: payouts.filter((p) => p.status === 'rejected').length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                statusFilter === tab.id
                  ? 'bg-amber-500 text-black font-bold shadow'
                  : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === tab.id ? 'bg-black/20 text-black font-extrabold' : 'bg-zinc-800 text-zinc-400'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* PAYOUTS LIST TABLE / CARDS */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-amber-400" />
            <h3 className="font-tactical font-bold text-sm text-white uppercase tracking-wider">
              DAFTAR STATUS GAJI & PENCAIRAN WORKER ({filteredPayouts.length})
            </h3>
          </div>
          <span className="text-[11px] text-zinc-400">
            Realtime Firestore Synchronized
          </span>
        </div>

        {filteredPayouts.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 space-y-3">
            <CreditCard className="w-12 h-12 mx-auto text-zinc-700 opacity-50" />
            <p className="text-sm font-semibold">Belum ada data transfer / gaji yang sesuai filter.</p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setWorkerFilter('all');
              }}
              className="text-xs text-amber-400 hover:underline"
            >
              Reset Filter Pencarian
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {filteredPayouts.map((pay) => {
              const matchedWorker = admins.find((a) => a.id === pay.workerId);

              return (
                <div key={pay.id} className="p-4 sm:p-5 hover:bg-zinc-800/30 transition-colors space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* 1. NAMA WORKER & AVATAR */}
                    <div className="flex items-start space-x-3 min-w-[240px]">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-tactical font-bold text-base shrink-0 overflow-hidden">
                        {matchedWorker?.avatar ? (
                          <img src={matchedWorker.avatar} alt={pay.workerName} className="w-full h-full object-cover" />
                        ) : (
                          pay.workerName.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-white text-sm hover:text-amber-300 transition-colors">
                            {pay.workerName}
                          </h4>
                          {matchedWorker?.workerTier && (
                            <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.2 rounded font-semibold">
                              {matchedWorker.workerTier}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 font-mono">
                          @{pay.workerUsername || matchedWorker?.username || 'worker'} • Kode: <strong className="text-zinc-300">{pay.payoutNumber}</strong>
                        </p>
                        <p className="text-[10px] text-zinc-500">
                          Dibuat: {formatDate(pay.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* 2. PENGERJAAN */}
                    <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 flex-1 min-w-[260px]">
                      <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                        <span className="font-semibold text-zinc-300">Rincian Pengerjaan</span>
                        <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-amber-400 font-mono">
                          {pay.period || 'Periode Berjalan'}
                        </span>
                      </div>
                      <p className="text-xs text-white font-medium line-clamp-2">
                        🎮 {pay.workSummary}
                      </p>
                      {pay.completedOrdersList && pay.completedOrdersList.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {pay.completedOrdersList.map((ord, idx) => (
                            <span key={idx} className="text-[10px] bg-zinc-800/80 text-zinc-300 px-1.5 py-0.5 rounded font-mono border border-zinc-700/50">
                              {ord.invoiceNumber}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 3. KE REKENING APA, BERAPA NOMINALNYA, STATUSNYA */}
                    <div className="bg-zinc-950/90 border border-amber-500/20 rounded-xl p-3 min-w-[240px] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <Building2 className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-xs font-bold text-amber-300 uppercase">
                            {pay.accountBank}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-zinc-200">
                          {pay.accountNumber}
                        </span>
                      </div>

                      <div className="text-[11px] text-zinc-400 truncate">
                        A/N: <strong className="text-white">{pay.accountHolderName}</strong>
                      </div>

                      <div className="pt-1 border-t border-zinc-800/80 flex items-center justify-between">
                        <span className="text-xs text-zinc-400 font-semibold">Nominal:</span>
                        <span className="font-tactical text-base font-extrabold text-emerald-400">
                          {formatRupiah(pay.amount)}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[10px] text-zinc-400">Status Transfer:</span>
                        {pay.status === 'transferred' ? (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>SUDAH DITRANSFER</span>
                          </span>
                        ) : pay.status === 'processing' ? (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full animate-pulse">
                            <Clock className="w-3 h-3" />
                            <span>SEDANG DIPROSES</span>
                          </span>
                        ) : pay.status === 'rejected' ? (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
                            <X className="w-3 h-3" />
                            <span>DITOLAK</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" />
                            <span>MENUNGGU TRANSFER</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ACTIONS BUTTONS */}
                    <div className="flex lg:flex-col items-center justify-end gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPayout(pay);
                          setIsEditModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1"
                        title="Update status transfer, nomor referensi atau bukti bayar"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Update Status</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyWhatsAppSlip(pay)}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-emerald-600/30 text-zinc-300 hover:text-emerald-300 border border-zinc-700 hover:border-emerald-500/40 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1"
                        title="Salin rincian slip transfer format WhatsApp"
                      >
                        {copiedId === pay.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin Slip WA</span>
                          </>
                        )}
                      </button>

                      {matchedWorker && (
                        <button
                          type="button"
                          onClick={() => {
                            setEvaluatingAdmin(matchedWorker);
                            setIsEvalModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-blue-600/30 text-zinc-300 hover:text-blue-300 border border-zinc-700 hover:border-blue-500/40 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1"
                          title="Beri catatan evaluasi & perbaikan performa worker"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Evaluasi Worker</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Hapus slip transfer ${pay.payoutNumber} untuk ${pay.workerName}?`)) {
                            onDeletePayout(pay.id);
                          }
                        }}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg transition-all cursor-pointer"
                        title="Hapus Slip"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                  {/* Catatan & Evaluasi CEO jika ada */}
                  {(pay.adminNotes || pay.improvementFeedback || pay.transferProofUrl) && (
                    <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3 text-xs space-y-1.5">
                      {pay.adminNotes && (
                        <div className="text-zinc-300">
                          <strong className="text-amber-400">Catatan CEO:</strong> {pay.adminNotes}
                        </div>
                      )}
                      {pay.improvementFeedback && (
                        <div className="text-blue-300">
                          <strong className="text-blue-400">💡 Evaluasi & Improve:</strong> {pay.improvementFeedback}
                        </div>
                      )}
                      {pay.transferProofUrl && (
                        <div className="text-emerald-400 flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Bukti Transfer Tersedia:</span>
                          <a
                            href={pay.transferProofUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-amber-400 underline hover:text-amber-300 ml-1 flex items-center gap-0.5"
                          >
                            Lihat Gambar Bukti <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: BUAT TRANSFER / GAJI WORKER BARU                */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-zinc-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <h3 className="font-tactical text-lg font-bold text-white uppercase">
                  BUAT STATUS TRANSFER / GAJI WORKER
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePayout} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar text-xs sm:text-sm">
              
              {/* 1. Pilih Worker */}
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                  1. Pilih Worker / Admin Penerima:
                </label>
                <select
                  required
                  value={newWorkerId}
                  onChange={(e) => handleSelectWorker(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-amber-500"
                >
                  <option value="">-- Pilih Worker / Joki --</option>
                  {workerList.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.name} (@{worker.username}) - {worker.role === 'superadmin' ? 'CEO' : 'Worker'} {worker.bankName ? `[${worker.bankName} - ${worker.bankAccountNumber}]` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Rincian Rekening Tujuan */}
              <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Rekening Tujuan Pencairan
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1 font-semibold">Bank / E-Wallet:</label>
                    <select
                      value={newBank}
                      onChange={(e) => setNewBank(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500"
                    >
                      {['BCA', 'Mandiri', 'BRI', 'BNI', 'DANA', 'GoPay', 'OVO', 'ShopeePay', 'Seabank', 'BSI', 'CIMB Niaga'].map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1 font-semibold">No. Rekening / No. E-Wallet:</label>
                    <input
                      type="text"
                      required
                      value={newAccNumber}
                      onChange={(e) => setNewAccNumber(e.target.value)}
                      placeholder="Contoh: 5420918231"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1 font-semibold">Atas Nama (A/N):</label>
                    <input
                      type="text"
                      required
                      value={newAccHolder}
                      onChange={(e) => setNewAccHolder(e.target.value)}
                      placeholder="Contoh: Rafi Ahmad"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Nominal & Periode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                    Nominal Transfer (Rp):
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={newAmount || ''}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    placeholder="Contoh: 150000"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-tactical text-lg text-emerald-400 focus:border-amber-500"
                  />
                  {newAmount > 0 && (
                    <p className="text-[11px] text-zinc-400 mt-1 font-mono">
                      Terbaca: <strong className="text-emerald-400">{formatRupiah(newAmount)}</strong>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                    Periode / Judul Slip:
                  </label>
                  <input
                    type="text"
                    value={newPeriod}
                    onChange={(e) => setNewPeriod(e.target.value)}
                    placeholder="Contoh: Pekan 4 - Agustus 2026"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-amber-500"
                  />
                </div>
              </div>

              {/* 4. Rincian Pengerjaan */}
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                  2. Rincian Pengerjaan Order:
                </label>
                <textarea
                  rows={2}
                  value={newWorkSummary}
                  onChange={(e) => setNewWorkSummary(e.target.value)}
                  placeholder="Contoh: 4 Order Selesai (2x 5M Koen Farm + 2x Mandor Armory Solo)"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-amber-500 text-xs"
                />
              </div>

              {/* 5. Status Transfer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                    3. Status Transfer:
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-amber-500 font-semibold"
                  >
                    <option value="pending">⏳ Menunggu Transfer (Pending)</option>
                    <option value="processing">🔄 Sedang Diproses</option>
                    <option value="transferred">✅ Sudah Ditransfer (Selesai)</option>
                    <option value="rejected">❌ Ditolak</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                    Link / Catatan Bukti Transfer (Opsional):
                  </label>
                  <input
                    type="text"
                    value={newProofUrl}
                    onChange={(e) => setNewProofUrl(e.target.value)}
                    placeholder="URL gambar bukti transfer atau No Reff Bank"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-amber-500"
                  />
                </div>
              </div>

              {/* 6. Catatan & Feedback Evaluasi CEO */}
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                  Catatan Evaluasi / Saran Improve untuk Worker:
                </label>
                <input
                  type="text"
                  value={newFeedback}
                  onChange={(e) => setNewFeedback(e.target.value)}
                  placeholder="Contoh: Sangat cepat, tolong tingkatkan update screenshot hasil raid"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-amber-500 text-xs"
                />
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-tactical font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20"
                >
                  SIMPAN SLIP TRANSFER
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: UPDATE STATUS TRANSFER & BUKTI BAYAR            */}
      {/* ======================================================== */}
      {isEditModalOpen && editingPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-zinc-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h3 className="font-tactical text-lg font-bold text-white uppercase">
                  UPDATE STATUS TRANSFER ({editingPayout.payoutNumber})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingPayout(null);
                }}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatusAndProof} className="p-6 space-y-4 text-xs sm:text-sm">
              
              <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Penerima:</span>
                  <span className="font-bold text-white">{editingPayout.workerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Rekening:</span>
                  <span className="font-mono text-amber-300 font-semibold">{editingPayout.accountBank} - {editingPayout.accountNumber} (a/n {editingPayout.accountHolderName})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Nominal:</span>
                  <span className="font-tactical text-base font-bold text-emerald-400">{formatRupiah(editingPayout.amount)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                  Status Transfer Terkini:
                </label>
                <select
                  value={editingPayout.status}
                  onChange={(e) => setEditingPayout({ ...editingPayout, status: e.target.value as any })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-semibold focus:border-amber-500"
                >
                  <option value="pending">⏳ Menunggu Transfer (Pending)</option>
                  <option value="processing">🔄 Sedang Diproses</option>
                  <option value="transferred">✅ Sudah Ditransfer (Lunas)</option>
                  <option value="rejected">❌ Ditolak</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                  Nominal Transfer (Dapat Disesuaikan):
                </label>
                <input
                  type="number"
                  required
                  value={editingPayout.amount}
                  onChange={(e) => setEditingPayout({ ...editingPayout, amount: Number(e.target.value) })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-tactical text-lg text-emerald-400 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                  Bukti Transfer / No. Referensi Transaksi:
                </label>
                <input
                  type="text"
                  value={editingPayout.transferProofUrl || ''}
                  onChange={(e) => setEditingPayout({ ...editingPayout, transferProofUrl: e.target.value })}
                  placeholder="Contoh: Reff BCA 9928371 atau URL Bukti Foto"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                  Catatan CEO / Admin Finance:
                </label>
                <textarea
                  rows={2}
                  value={editingPayout.adminNotes || ''}
                  onChange={(e) => setEditingPayout({ ...editingPayout, adminNotes: e.target.value })}
                  placeholder="Catatan transfer atau info pemotongan/bonus..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                  Evaluasi & Saran Perbaikan (Improve):
                </label>
                <input
                  type="text"
                  value={editingPayout.improvementFeedback || ''}
                  onChange={(e) => setEditingPayout({ ...editingPayout, improvementFeedback: e.target.value })}
                  placeholder="Beri masukan kerja ke worker..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-amber-500 text-xs"
                />
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingPayout(null);
                  }}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-tactical font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20"
                >
                  UPDATE STATUS TRANSFER
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: EVALUASI WORKER & KOMISI                        */}
      {/* ======================================================== */}
      {isEvalModalOpen && evaluatingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-zinc-900 border border-blue-500/40 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <h3 className="font-tactical text-lg font-bold text-white uppercase">
                  EVALUASI & KOMISI: {evaluatingAdmin.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEvalModalOpen(false);
                  setEvaluatingAdmin(null);
                }}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvaluation} className="p-6 space-y-4 text-xs sm:text-sm">
              
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                  Spesialisasi Joki:
                </label>
                <input
                  type="text"
                  value={evaluatingAdmin.speciality || ''}
                  onChange={(e) => setEvaluatingAdmin({ ...evaluatingAdmin, speciality: e.target.value })}
                  placeholder="Contoh: Joki Koen Speedrunner / Mandor Armory"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                  Pangkat / Tier Worker:
                </label>
                <select
                  value={evaluatingAdmin.workerTier || 'Pro Joki (Tier 2)'}
                  onChange={(e) => setEvaluatingAdmin({ ...evaluatingAdmin, workerTier: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-amber-500 font-semibold"
                >
                  <option value="Senior Worker (Tier 1)">Senior Worker (Tier 1 - Komisi 75%)</option>
                  <option value="Pro Joki (Tier 2)">Pro Joki (Tier 2 - Komisi 70%)</option>
                  <option value="Junior Joki (Trial)">Junior Joki (Trial - Komisi 60%)</option>
                  <option value="CEO / Founder">CEO / Founder</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                    Rate Komisi (%):
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={evaluatingAdmin.commissionRatePercent || 70}
                    onChange={(e) => setEvaluatingAdmin({ ...evaluatingAdmin, commissionRatePercent: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold text-amber-400 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                    Rating Skor (1.0 - 5.0):
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    min={1.0}
                    max={5.0}
                    value={evaluatingAdmin.ratingScore || 4.8}
                    onChange={(e) => setEvaluatingAdmin({ ...evaluatingAdmin, ratingScore: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold text-emerald-400 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                  Catatan Poin yang Perlu Di-Improve (1 per baris):
                </label>
                <textarea
                  rows={3}
                  value={(evaluatingAdmin.improvementFeedback || []).join('\n')}
                  onChange={(e) =>
                    setEvaluatingAdmin({
                      ...evaluatingAdmin,
                      improvementFeedback: e.target.value.split('\n').filter((line) => line.trim() !== ''),
                    })
                  }
                  placeholder="Tulis saran improve:&#10;- Tingkatkan kecepatan konfirmasi di chat&#10;- Upload screenshot bukti loot tiap raid"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-amber-500 text-xs"
                />
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEvalModalOpen(false);
                    setEvaluatingAdmin(null);
                  }}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-500 hover:bg-blue-400 text-white font-tactical font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/20"
                >
                  SIMPAN EVALUASI
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
