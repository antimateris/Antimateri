import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShieldCheck, 
  Clock, 
  Coins, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  MessageCircle, 
  ExternalLink, 
  ArrowRight,
  TrendingUp,
  Flame,
  FileText,
  UserCheck,
  RefreshCw,
  QrCode
} from 'lucide-react';
import { Order, SystemSettings } from '../types';
import { 
  formatRupiah, 
  formatDate, 
  getStatusBadge, 
  getWhatsAppDirectUrl 
} from '../utils/helpers';

interface TrackingPageProps {
  orders: Order[];
  settings?: SystemSettings;
  initialInvoice?: string;
  initialQuery?: string;
  onPayUnpaidOrder?: (order: Order) => void;
  onOpenPaymentModal?: (order: Order) => void;
}

export const TrackingPage: React.FC<TrackingPageProps> = ({
  orders = [],
  settings,
  initialInvoice = '',
  initialQuery = '',
  onPayUnpaidOrder,
  onOpenPaymentModal,
}) => {
  const initialInv = initialInvoice || initialQuery || '';
  const [searchQuery, setSearchQuery] = useState<string>(initialInv);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const handlePay = (order: Order) => {
    if (onPayUnpaidOrder) {
      onPayUnpaidOrder(order);
    } else if (onOpenPaymentModal) {
      onOpenPaymentModal(order);
    }
  };

  // Auto search on initial invoice prop
  useEffect(() => {
    const query = initialInvoice || initialQuery;
    if (query) {
      setSearchQuery(query);
      handleSearch(query);
    } else if (orders.length > 0 && !selectedOrder) {
      // default select the latest active order
      setSelectedOrder(orders[0]);
    }
  }, [initialInvoice, initialQuery, orders]);

  const handleSearch = (queryToUse?: string) => {
    const q = (queryToUse || searchQuery).trim().toLowerCase();
    setHasSearched(true);

    if (!q) {
      setSelectedOrder(null);
      return;
    }

    const found = orders.find(
      (o) =>
        o.invoiceNumber.toLowerCase().includes(q) ||
        o.customerWhatsApp.includes(q) ||
        o.gameNickname.toLowerCase().includes(q)
    );

    setSelectedOrder(found || null);
  };

  const statusBadge = selectedOrder ? getStatusBadge(selectedOrder.orderStatus) : null;

  return (
    <div id="tracking-page-container" className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold">
          <Search className="w-3.5 h-3.5 text-blue-400" />
          <span>Pelacakan Pesanan Real-Time (Tanpa Login)</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold font-tactical text-white uppercase tracking-wider">
          CEK STATUS PENGERJAAN & BUKTI JOKI
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Masukkan Nomor Invoice (contoh: <code className="text-amber-400">ABO-2026-9821</code>) atau Nomor WhatsApp untuk memantau progres raid akun Anda.
        </p>
      </div>

      {/* Search Bar Card */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xl mb-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row gap-2.5"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-zinc-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              id="input-tracking-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Masukkan No. Invoice / No. WhatsApp / Nickname..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            id="btn-submit-tracking-search"
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold font-tactical uppercase tracking-wider text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Lacak Sekarang</span>
          </button>
        </form>

        {/* Quick Search Chips from existing orders */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-zinc-800/80 text-xs text-zinc-400">
          <span className="text-[11px] font-semibold text-zinc-500">Coba Demo Invoice:</span>
          {orders.slice(0, 4).map((ord) => (
            <button
              key={ord.id}
              type="button"
              onClick={() => {
                setSearchQuery(ord.invoiceNumber);
                handleSearch(ord.invoiceNumber);
              }}
              className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 text-zinc-300 hover:text-amber-400 rounded-lg text-[11px] font-mono transition-colors"
            >
              {ord.invoiceNumber} ({ord.gameNickname})
            </button>
          ))}
        </div>
      </div>

      {/* Result Display */}
      {selectedOrder ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Main Order Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 sm:p-7 shadow-xl space-y-6">
            
            {/* Top Bar: Invoice & Status Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-800">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xl sm:text-2xl font-black text-amber-400">
                    {selectedOrder.invoiceNumber}
                  </span>
                  <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-medium">
                    {selectedOrder.serviceType === 'joki_koen' ? 'Joki Koen' : 'Joki Mandor'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Dibuat pada: {formatDate(selectedOrder.createdAt)}
                </p>
              </div>

              {statusBadge && (
                <div className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  <span>{statusBadge.label}</span>
                </div>
              )}
            </div>

            {/* Tactical Pipeline Stepper */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                STATUS ALUR PENGERJAAN:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                {[
                  { key: 'unpaid', label: '1. Menunggu Bayar', step: 1 },
                  { key: 'verifying', label: '2. Verifikasi Bayar', step: 2 },
                  { key: 'queued', label: '3. Masuk Antrean', step: 3 },
                  { key: 'in_progress', label: '4. Sedang Dimainkan', step: 4 },
                  { key: 'completed', label: '5. Selesai 100%', step: 5 },
                ].map((st) => {
                  const getStepRank = (s: string) => {
                    if (s === 'unpaid') return 1;
                    if (s === 'verifying') return 2;
                    if (s === 'queued') return 3;
                    if (s === 'in_progress') return 4;
                    if (s === 'completed') return 5;
                    return 0;
                  };

                  const currentRank = getStepRank(selectedOrder.orderStatus);
                  const isPassed = currentRank >= st.step;
                  const isCurrent = currentRank === st.step;

                  return (
                    <div
                      key={st.key}
                      className={`p-2.5 rounded-xl border transition-all ${
                        isCurrent
                          ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold shadow-md'
                          : isPassed
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-medium'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-600'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-1">
                        {isPassed && !isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        <span>{st.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Unpaid Alert & Action */}
            {selectedOrder.orderStatus === 'unpaid' && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-300">Menunggu Pembayaran</h4>
                    <p className="text-xs text-zinc-300">
                      Silakan selesaikan pembayaran sebesar <span className="font-bold text-white">{formatRupiah(selectedOrder.totalPrice)}</span> untuk memulai antrean joki.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handlePay(selectedOrder)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-md shrink-0 cursor-pointer"
                >
                  Bayar Sekarang
                </button>
              </div>
            )}

            {/* Live Progress Bar Card */}
            <div className="bg-zinc-950 p-4 sm:p-5 rounded-xl border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-bold text-white uppercase tracking-wider">
                    PROGRES PENGERJAAN REAL-TIME
                  </span>
                </div>
                <span className="text-lg font-black font-tactical text-amber-400">
                  {selectedOrder.currentProgressPercent}% SELESAI
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${selectedOrder.currentProgressPercent}%` }}
                />
              </div>

              <div className="flex flex-wrap justify-between text-xs text-zinc-400 pt-1">
                <span>
                  Joki Bertugas: <strong className="text-white">{selectedOrder.assignedWorker || 'Pro Joki Squad'}</strong>
                </span>
                <span>
                  Target: <strong className="text-amber-400">{selectedOrder.packageName}</strong>
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 block mb-1">Nickname In-Game:</span>
                <span className="font-bold text-sm text-white font-tactical tracking-wide">
                  {selectedOrder.gameNickname}
                </span>
              </div>

              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 block mb-1">Metode Login:</span>
                <span className="font-bold text-sm text-amber-400">
                  {selectedOrder.loginMethod}
                </span>
              </div>

              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 block mb-1">Nomor WhatsApp Pelanggan:</span>
                <span className="font-bold text-sm text-white font-mono">
                  {selectedOrder.customerWhatsApp}
                </span>
              </div>

              {selectedOrder.mandorMap && (
                <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80">
                  <span className="text-zinc-500 block mb-1">Target Map Mandor:</span>
                  <span className="font-bold text-sm text-blue-400">
                    {selectedOrder.mandorMap}
                  </span>
                </div>
              )}

              {selectedOrder.mandorPlayMode && (
                <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80">
                  <span className="text-zinc-500 block mb-1">Metode Mandor:</span>
                  <span className="font-bold text-sm text-emerald-400">
                    {selectedOrder.mandorPlayMode === 'mabar_squad' ? 'Mabar Bareng Pro Joki' : 'Joki Akun'}
                  </span>
                </div>
              )}

              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 block mb-1">Garansi Keamanan:</span>
                <span className="font-bold text-sm text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> 100% Anti-Banned Manual
                </span>
              </div>
            </div>

            {/* Timeline of Proof Screenshots & Notes */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-amber-400" />
                <h3 className="font-tactical text-lg font-bold text-white uppercase tracking-wider">
                  LOG & BUKTI SCREENSHOT PENGERJAAN
                </h3>
              </div>

              {selectedOrder.progressHistory && selectedOrder.progressHistory.length > 0 ? (
                <div className="space-y-3">
                  {selectedOrder.progressHistory.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex flex-col sm:flex-row gap-4"
                    >
                      {item.imageUrl && (
                        <div className="sm:w-48 h-32 rounded-lg overflow-hidden border border-zinc-800 shrink-0 relative group">
                          <img
                            src={item.imageUrl}
                            alt="Bukti Joki Arena Breakout"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] text-amber-400 px-1.5 py-0.5 rounded font-mono font-bold">
                            Bukti Raid
                          </span>
                        </div>
                      )}

                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                          <span className="font-bold text-amber-400">
                            {item.workerName} • Progress {item.progressPercent}%
                          </span>
                          <span className="text-zinc-500 font-mono">
                            {formatDate(item.timestamp)}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/60">
                          {item.note}
                        </p>

                        {item.koenAccumulated && (
                          <div className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                            <Coins className="w-3.5 h-3.5" />
                            Koen Terkumpul: {formatRupiah(item.koenAccumulated)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 text-center text-xs text-zinc-500">
                  <Clock className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
                  Belum ada log pengerjaan yang diunggah joki. Log dan tangkapan layar akan otomatis muncul di sini saat proses raid berjalan.
                </div>
              )}
            </div>

            {/* Direct WhatsApp Contact Button for this Order */}
            <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-zinc-400 text-center sm:text-left">
                Butuh bantuan atau ingin konfirmasi akun dengan joki?
              </span>

              <a
                href={getWhatsAppDirectUrl(
                  settings.whatsappCSNumber,
                  `Halo CS BreakoutOps, saya ingin menanyakan progres pesanan invoice ${selectedOrder.invoiceNumber} (${selectedOrder.packageName}) untuk akun ${selectedOrder.gameNickname}.`
                )}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-lg transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat Admin / Joki di WhatsApp</span>
              </a>
            </div>

          </div>
        </div>
      ) : hasSearched ? (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 text-center max-w-md mx-auto space-y-3">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold font-tactical text-white uppercase">
            PESANAN TIDAK DITEMUKAN
          </h3>
          <p className="text-xs text-zinc-400">
            Tidak ditemukan data pesanan dengan kata kunci <code className="text-amber-400">"{searchQuery}"</code>. Pastikan nomor invoice atau no WhatsApp sudah benar.
          </p>
        </div>
      ) : null}

    </div>
  );
};
