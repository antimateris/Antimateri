import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Coins, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  MessageCircle, 
  Edit3, 
  Send, 
  UserCheck, 
  ExternalLink,
  ChevronDown,
  X,
  Sparkles,
  ShieldAlert,
  Bot,
  Copy,
  Check,
  ShieldCheck
} from 'lucide-react';
import { 
  Order, 
  OrderStatus, 
  AdminUser, 
  SystemSettings, 
  ProgressProof 
} from '../../types';
import { 
  formatRupiah, 
  formatDate, 
  getStatusBadge, 
  buildWhatsAppMessage, 
  buildWorkerAnonymousMessage,
  getWhatsAppDirectUrl 
} from '../../utils/helpers';

interface AdminOrdersTabProps {
  orders: Order[];
  currentUser: AdminUser;
  settings: SystemSettings;
  onUpdateOrder: (updatedOrder: Order) => void;
  onSendWhatsAppNotification: (order: Order, templateKey: any, note?: string) => void;
}

export const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({
  orders,
  currentUser,
  settings,
  onUpdateOrder,
  onSendWhatsAppNotification,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');

  // Modal states
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('in_progress');
  const [newProgressPercent, setNewProgressPercent] = useState<number>(50);
  const [assignedWorker, setAssignedWorker] = useState<string>('');
  const [progressNote, setProgressNote] = useState<string>('');
  const [proofImageUrl, setProofImageUrl] = useState<string>('');
  const [autoSendWA, setAutoSendWA] = useState<boolean>(true);

  // WhatsApp quick sender modal
  const [waModalOrder, setWaModalOrder] = useState<Order | null>(null);
  const [waTargetMode, setWaTargetMode] = useState<'customer' | 'worker_group'>('customer');
  const [waTemplateKey, setWaTemplateKey] = useState<any>('progressUpdate');
  const [waCustomNote, setWaCustomNote] = useState<string>('');
  const [copiedBriefing, setCopiedBriefing] = useState<boolean>(false);

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.gameNickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerWhatsApp.includes(searchTerm);

    const matchStatus = statusFilter === 'all' || o.orderStatus === statusFilter;
    const matchService = serviceFilter === 'all' || o.serviceType === serviceFilter;

    return matchSearch && matchStatus && matchService;
  });

  // Open Edit Modal
  const handleOpenEdit = (order: Order) => {
    setEditingOrder(order);
    setNewStatus(order.orderStatus);
    setNewProgressPercent(order.currentProgressPercent);
    setAssignedWorker(order.assignedWorker || currentUser.name);
    setProgressNote('');
    setProofImageUrl('');
    setAutoSendWA(true);
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    const now = new Date().toISOString();
    let updatedHistory = [...(editingOrder.progressHistory || [])];

    if (progressNote.trim() || proofImageUrl.trim()) {
      const newProof: ProgressProof = {
        id: `prf_${Date.now()}`,
        timestamp: now,
        note: progressNote.trim() || `Update progress ${newProgressPercent}% oleh ${assignedWorker}`,
        imageUrl: proofImageUrl.trim() || undefined,
        workerName: assignedWorker || currentUser.name,
        progressPercent: newProgressPercent,
      };
      updatedHistory.push(newProof);
    }

    const updated: Order = {
      ...editingOrder,
      orderStatus: newStatus,
      currentProgressPercent: newProgressPercent,
      assignedWorker: assignedWorker || editingOrder.assignedWorker,
      startedAt: newStatus === 'in_progress' && !editingOrder.startedAt ? now : editingOrder.startedAt,
      completedAt: newStatus === 'completed' && !editingOrder.completedAt ? now : editingOrder.completedAt,
      progressHistory: updatedHistory,
    };

    onUpdateOrder(updated);

    // Auto send WA notification if checked
    if (autoSendWA) {
      let tKey: any = 'progressUpdate';
      if (newStatus === 'completed') tKey = 'orderCompleted';
      else if (newStatus === 'in_progress' && editingOrder.orderStatus !== 'in_progress') tKey = 'jokiStarted';

      onSendWhatsAppNotification(updated, tKey, progressNote);
    }

    setEditingOrder(null);
  };

  // Open Direct WA Sender for Customer
  const handleOpenWaModal = (order: Order, defaultTarget: 'customer' | 'worker_group' = 'customer') => {
    setWaModalOrder(order);
    setWaTargetMode(defaultTarget);
    if (defaultTarget === 'worker_group') {
      setWaTemplateKey('workerMissionBroadcast');
    } else {
      if (order.orderStatus === 'completed') setWaTemplateKey('orderCompleted');
      else if (order.orderStatus === 'in_progress') setWaTemplateKey('progressUpdate');
      else if (order.orderStatus === 'unpaid') setWaTemplateKey('orderCreated');
      else setWaTemplateKey('paymentReceived');
    }
    setWaCustomNote('');
    setCopiedBriefing(false);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBriefing(true);
    setTimeout(() => setCopiedBriefing(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Filter & Search Bar */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          <input
            type="text"
            id="admin-search-orders"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari Invoice, Nickname, No WA..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            id="admin-filter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Semua Status ({orders.length})</option>
            <option value="unpaid">Menunggu Bayar</option>
            <option value="queued">Dalam Antrean</option>
            <option value="in_progress">Sedang Dikerjakan</option>
            <option value="completed">Selesai 100%</option>
            <option value="cancelled">Dibatalkan</option>
          </select>

          {/* Service Filter */}
          <select
            id="admin-filter-service"
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Semua Layanan</option>
            <option value="joki_koen">Joki Koen</option>
            <option value="joki_mandor">Joki Mandor Raid</option>
          </select>
        </div>

      </div>

      {/* Orders Table List */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-tactical text-lg font-bold text-white uppercase">
              DAFTAR PESANAN JOKI AKTIF
            </span>
            <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded">
              {filteredOrders.length} Pesanan
            </span>
          </div>
          <span className="text-xs text-zinc-400">
            Login sebagai: <strong className="text-white">{currentUser.name}</strong> ({currentUser.role})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 border-b border-zinc-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Invoice & Tanggal</th>
                <th className="px-4 py-3">Layanan & Target</th>
                <th className="px-4 py-3">Data Akun Pelanggan</th>
                <th className="px-4 py-3">Total & Bayar</th>
                <th className="px-4 py-3">Status & Progres</th>
                <th className="px-4 py-3 text-right">Aksi Joki</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
              {filteredOrders.map((ord) => {
                const badge = getStatusBadge(ord.orderStatus);
                return (
                  <tr key={ord.id} className="hover:bg-zinc-950/40 transition-colors">
                    
                    {/* Invoice & Date */}
                    <td className="px-4 py-3.5">
                      <div className="font-mono font-bold text-amber-400 text-sm">
                        {ord.invoiceNumber}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        {formatDate(ord.createdAt)}
                      </div>
                    </td>

                    {/* Service & Package */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center space-x-1.5">
                        {ord.serviceType === 'joki_koen' ? (
                          <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        ) : (
                          <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        )}
                        <span className="font-bold text-white">{ord.packageName}</span>
                      </div>
                      {ord.mandorMap && (
                        <span className="text-[10px] text-blue-400 font-semibold block mt-0.5">
                          Map: {ord.mandorMap} ({ord.mandorPlayMode === 'mabar_squad' ? 'Mabar' : 'Joki Akun'})
                        </span>
                      )}
                    </td>

                    {/* Account Info */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-white font-tactical text-sm">
                        {ord.gameNickname}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        Login: <span className="text-amber-400 font-semibold">{ord.loginMethod}</span> • WA: {ord.customerWhatsApp}
                      </div>
                      {ord.accountNotes && (
                        <div className="text-[10px] text-zinc-500 italic truncate max-w-xs mt-0.5">
                          Note: "{ord.accountNotes}"
                        </div>
                      )}
                    </td>

                    {/* Price & Payment */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-white text-sm">
                        {formatRupiah(ord.totalPrice)}
                      </div>
                      <div className="flex items-center space-x-1 mt-0.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          ord.paymentStatus === 'paid'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {ord.paymentStatus === 'paid' ? 'Lunas' : 'Belum Bayar'}
                        </span>
                        <span className="text-[10px] text-zinc-500 uppercase">{ord.paymentMethod}</span>
                      </div>
                    </td>

                    {/* Status & Progress */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-block px-2 py-0.5 rounded-full border text-[11px] font-bold ${badge.bg} ${badge.text} ${badge.border}`}>
                        {badge.label}
                      </span>
                      <div className="flex items-center space-x-2 mt-1.5">
                        <div className="w-20 h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                          <div
                            className="h-full bg-amber-500"
                            style={{ width: `${ord.currentProgressPercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-zinc-400 font-bold">
                          {ord.currentProgressPercent}%
                        </span>
                      </div>
                      {ord.assignedWorker && (
                        <span className="text-[10px] text-zinc-500 block mt-0.5">
                          Joki: {ord.assignedWorker}
                        </span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(ord)}
                        className="px-2.5 py-1.5 bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/40 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center space-x-1"
                        title="Update Status & Progres"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Update</span>
                      </button>

                      <button
                        onClick={() => handleOpenWaModal(ord, 'customer')}
                        className="px-2.5 py-1.5 bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white border border-green-500/40 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center space-x-1"
                        title="Kirim Pesan ke Pelanggan"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WA User</span>
                      </button>

                      <button
                        onClick={() => handleOpenWaModal(ord, 'worker_group')}
                        className="px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/40 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center space-x-1"
                        title="Broadcast Anonim ke Bot / Grup Worker"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Bot/Worker</span>
                      </button>
                    </td>

                  </tr>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-zinc-500 text-xs">
                    Tidak ada data pesanan yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Update Progress / Status */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-tactical text-lg font-bold text-white uppercase">
                  UPDATE STATUS & PROGRES JOKI
                </h3>
                <p className="text-xs text-amber-400 font-mono">
                  {editingOrder.invoiceNumber} ({editingOrder.gameNickname})
                </p>
              </div>
              <button
                onClick={() => setEditingOrder(null)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs sm:text-sm">
              
              <div className="grid grid-cols-2 gap-3">
                {/* Status Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                    Status Pesanan:
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-amber-500"
                  >
                    <option value="unpaid">Menunggu Pembayaran</option>
                    <option value="verifying">Verifikasi Pembayaran</option>
                    <option value="queued">Dalam Antrean Joki</option>
                    <option value="in_progress">Sedang Dikerjakan (In-Progress)</option>
                    <option value="completed">Selesai 100%</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>
                </div>

                {/* Progress Percent Slider / Input */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                    Progres (% Selesai): <strong className="text-amber-400">{newProgressPercent}%</strong>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={newProgressPercent}
                    onChange={(e) => setNewProgressPercent(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500 mt-2"
                  />
                </div>
              </div>

              {/* Joki Worker Assigned */}
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                  Nama Joki yang Mengerjakan:
                </label>
                <input
                  type="text"
                  value={assignedWorker}
                  onChange={(e) => setAssignedWorker(e.target.value)}
                  placeholder="Contoh: Pro Joki Alpha (Raid Master)"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-amber-500"
                />
              </div>

              {/* Progress Note */}
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                  Catatan Progres (Ditampilkan di Lacak Pesanan):
                </label>
                <textarea
                  rows={2}
                  value={progressNote}
                  onChange={(e) => setProgressNote(e.target.value)}
                  placeholder="Contoh: Raid 2 Farm Lockdown selesai, brankas Motel terbuka, +2M Koen aman di Stash..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-amber-500"
                />
              </div>

              {/* Proof Image URL */}
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                  URL Screenshot Bukti (Opsional):
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={proofImageUrl}
                    onChange={(e) => setProofImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... atau paste link screenshot"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setProofImageUrl('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80')}
                    className="px-2.5 py-1 bg-zinc-800 text-amber-300 rounded-xl border border-zinc-700 text-xs font-semibold shrink-0"
                  >
                    Sample Bukti
                  </button>
                </div>
              </div>

              {/* Auto send WhatsApp checkbox */}
              <label className="flex items-center space-x-2.5 bg-green-950/30 border border-green-500/30 p-3 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSendWA}
                  onChange={(e) => setAutoSendWA(e.target.checked)}
                  className="w-4 h-4 rounded text-green-500 bg-zinc-900 border-zinc-700"
                />
                <span className="text-xs text-green-300 font-semibold">
                  Otomatis kirim notifikasi WhatsApp pembaruan status ke <strong className="text-white">{editingOrder.customerWhatsApp}</strong>
                </span>
              </label>

              {/* Buttons */}
              <div className="flex gap-2.5 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold font-tactical uppercase tracking-wider rounded-xl shadow-lg"
                >
                  Simpan Perubahan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: WhatsApp Notification Direct Dispatcher */}
      {waModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-zinc-900 border border-green-500/40 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className={`px-6 py-4 border-b border-zinc-800 flex items-center justify-between ${
              waTargetMode === 'worker_group'
                ? 'bg-gradient-to-r from-blue-950 via-zinc-900 to-zinc-950'
                : 'bg-gradient-to-r from-green-950 via-zinc-900 to-zinc-950'
            }`}>
              <div className="flex items-center space-x-2">
                {waTargetMode === 'worker_group' ? (
                  <Bot className="w-5 h-5 text-blue-400" />
                ) : (
                  <MessageCircle className="w-5 h-5 text-green-400" />
                )}
                <h3 className="font-tactical text-lg font-bold text-white uppercase">
                  {waTargetMode === 'worker_group' 
                    ? 'DISPATCH PESANAN KE BOT / GRUP WORKER' 
                    : 'KIRIM NOTIFIKASI WHATSAPP KE PELANGGAN'}
                </h3>
              </div>
              <button
                onClick={() => setWaModalOrder(null)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              
              {/* Recipient Mode Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setWaTargetMode('customer');
                    if (waModalOrder.orderStatus === 'completed') setWaTemplateKey('orderCompleted');
                    else if (waModalOrder.orderStatus === 'in_progress') setWaTemplateKey('progressUpdate');
                    else if (waModalOrder.orderStatus === 'unpaid') setWaTemplateKey('orderCreated');
                    else setWaTemplateKey('paymentReceived');
                  }}
                  className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center space-x-2 transition-all ${
                    waTargetMode === 'customer'
                      ? 'bg-green-600 text-white shadow'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Ke Pelanggan (Personal)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setWaTargetMode('worker_group');
                    setWaTemplateKey('workerMissionBroadcast');
                  }}
                  className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center space-x-2 transition-all ${
                    waTargetMode === 'worker_group'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                  <span>Ke Bot / Grup Joki (Anonim)</span>
                </button>
              </div>

              {/* Recipient Info Card */}
              {waTargetMode === 'customer' ? (
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex justify-between items-center">
                  <div>
                    <span className="text-zinc-400 block text-[11px]">Tujuan Penerima (Pelanggan):</span>
                    <span className="font-bold text-white text-sm">{waModalOrder.customerName}</span>
                  </div>
                  <span className="font-mono text-green-400 font-bold bg-green-500/10 px-2.5 py-1 rounded border border-green-500/20">
                    {waModalOrder.customerWhatsApp}
                  </span>
                </div>
              ) : (
                <div className="bg-blue-950/20 p-3 rounded-xl border border-blue-500/30 space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-blue-300 block text-[11px] font-semibold">Tujuan Penerima (Bot / Worker Group):</span>
                      <span className="font-bold text-white text-sm">Grup Dispatch Joki Arena Breakout</span>
                    </div>
                    <span className="font-mono text-blue-400 font-bold bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/30">
                      {settings.workerGroupWhatsApp || '6281299887766'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400 font-medium bg-emerald-950/30 p-2 rounded-lg border border-emerald-500/20">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span><strong>Privasi Terproteksi:</strong> Nama, kontak nomor WA, dan login akun pelanggan disembunyikan. Hanya mengabarkan jenis joki apa & targetnya.</span>
                  </div>
                </div>
              )}

              {/* Template selector (Only for customer mode) */}
              {waTargetMode === 'customer' ? (
                <div>
                  <label className="block font-semibold uppercase text-zinc-300 mb-1">
                    Pilih Template Notifikasi Pelanggan:
                  </label>
                  <select
                    value={waTemplateKey}
                    onChange={(e) => setWaTemplateKey(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-green-500"
                  >
                    <option value="orderCreated">1. Pesanan Dibuat (Menunggu Bayar)</option>
                    <option value="paymentReceived">2. Pembayaran Diterima (Masuk Antrean)</option>
                    <option value="jokiStarted">3. Joki Dimulai (In-Progress)</option>
                    <option value="progressUpdate">4. Update Progres / Raid Extraction</option>
                    <option value="orderCompleted">5. Joki Selesai 100% (Akun Sukses)</option>
                  </select>
                </div>
              ) : (
                <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-400 font-semibold text-[11px]">Format: Briefing Order Anonim (Joki Apa, Berapa, Mode)</span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded">
                    Auto-Formatted
                  </span>
                </div>
              )}

              {/* Custom note for update */}
              {waTargetMode === 'customer' && (
                <div>
                  <label className="block font-semibold uppercase text-zinc-300 mb-1">
                    Tambahan Catatan Khusus (Opsional):
                  </label>
                  <input
                    type="text"
                    value={waCustomNote}
                    onChange={(e) => setWaCustomNote(e.target.value)}
                    placeholder="Contoh: Evakuasi raid Armory sukses mengamankan T6 Helmet..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-green-500"
                  />
                </div>
              )}

              {/* Preview Message */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold uppercase text-zinc-400">
                    Preview Pesan WhatsApp yang Dikirim:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const msg = waTargetMode === 'worker_group'
                        ? buildWorkerAnonymousMessage(waModalOrder, settings, window.location.origin)
                        : buildWhatsAppMessage(
                            settings.notificationTemplates[waTemplateKey as keyof typeof settings.notificationTemplates] || '',
                            waModalOrder,
                            settings,
                            window.location.origin,
                            waCustomNote
                          );
                      handleCopyText(msg);
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1 cursor-pointer bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700"
                  >
                    {copiedBriefing ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Salin Teks</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 text-zinc-300 font-mono text-[11px] whitespace-pre-line max-h-48 overflow-y-auto">
                  {waTargetMode === 'worker_group'
                    ? buildWorkerAnonymousMessage(waModalOrder, settings, window.location.origin)
                    : buildWhatsAppMessage(
                        settings.notificationTemplates[waTemplateKey as keyof typeof settings.notificationTemplates] || '',
                        waModalOrder,
                        settings,
                        window.location.origin,
                        waCustomNote
                      )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onSendWhatsAppNotification(waModalOrder, waTemplateKey, waCustomNote);
                    setWaModalOrder(null);
                  }}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl"
                >
                  Simpan Log Notif
                </button>

                <a
                  href={getWhatsAppDirectUrl(
                    waTargetMode === 'worker_group'
                      ? (settings.workerGroupWhatsApp || '6281299887766')
                      : waModalOrder.customerWhatsApp,
                    waTargetMode === 'worker_group'
                      ? buildWorkerAnonymousMessage(waModalOrder, settings, window.location.origin)
                      : buildWhatsAppMessage(
                          settings.notificationTemplates[waTemplateKey as keyof typeof settings.notificationTemplates] || '',
                          waModalOrder,
                          settings,
                          window.location.origin,
                          waCustomNote
                        )
                  )}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => {
                    onSendWhatsAppNotification(waModalOrder, waTemplateKey, waCustomNote);
                    setWaModalOrder(null);
                  }}
                  className={`flex-1 py-3 text-white font-bold text-center rounded-xl flex items-center justify-center space-x-1.5 shadow-lg ${
                    waTargetMode === 'worker_group'
                      ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
                      : 'bg-green-600 hover:bg-green-500 shadow-green-600/20'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>{waTargetMode === 'worker_group' ? 'Kirim ke Bot / Grup WA' : 'Kirim ke WhatsApp'}</span>
                </a>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
