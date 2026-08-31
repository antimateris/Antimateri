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
  getWhatsAppDirectUrl,
  maskPhoneNumber 
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

  // Auto search when initial query is passed or when orders sync from Firestore
  useEffect(() => {
    const query = initialInvoice || initialQuery || searchQuery;
    if (query && query.trim()) {
      setSearchQuery(query);
      handleSearch(query);
    }
  }, [initialInvoice, initialQuery, orders]);

  const handleSearch = (queryToUse?: string) => {
    const rawQ = (queryToUse !== undefined ? queryToUse : searchQuery).trim();
    setHasSearched(true);

    if (!rawQ) {
      setSelectedOrder(null);
      return;
    }

    const q = rawQ.toLowerCase();
    const cleanQ = rawQ.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const phoneQ = rawQ.replace(/\D/g, '');

    // Combine prop orders with cached local orders for instant resilience
    let allOrders = [...orders];
    try {
      const activeOrderStr = localStorage.getItem('breakoutops_active_order');
      if (activeOrderStr) {
        const activeOrder: Order = JSON.parse(activeOrderStr);
        if (activeOrder && !allOrders.some(o => o.id === activeOrder.id || o.invoiceNumber === activeOrder.invoiceNumber)) {
          allOrders.unshift(activeOrder);
        }
      }
      const savedOrdersStr = localStorage.getItem('breakoutops_orders');
      if (savedOrdersStr) {
        const savedOrders: Order[] = JSON.parse(savedOrdersStr);
        if (Array.isArray(savedOrders)) {
          for (const s of savedOrders) {
            if (!allOrders.some(o => o.id === s.id || o.invoiceNumber === s.invoiceNumber)) {
              allOrders.push(s);
            }
          }
        }
      }
    } catch {}

    const found = allOrders.find((o) => {
      if (!o || !o.invoiceNumber) return false;
      const oInvClean = o.invoiceNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const oInvLower = o.invoiceNumber.toLowerCase();
      const oPhoneClean = (o.customerWhatsApp || '').replace(/\D/g, '');
      const oNickLower = (o.gameNickname || '').toLowerCase();

      // 1. Direct Invoice Match (with or without hyphens)
      if (oInvLower === q || oInvClean === cleanQ) return true;
      if (cleanQ.length >= 4 && (oInvClean.includes(cleanQ) || cleanQ.includes(oInvClean))) return true;

      // 2. WhatsApp Number Match
      if (phoneQ.length >= 5 && oPhoneClean.includes(phoneQ)) return true;

      // 3. Nickname Match
      if (q.length >= 3 && (oNickLower === q || oNickLower.includes(q))) return true;

      return false;
    });

    setSelectedOrder(found || null);
  };

  const statusBadge = selectedOrder ? getStatusBadge(selectedOrder.orderStatus) : null;

  return (
    <div id="tracking-page-container" className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
          <Search className="w-3.5 h-3.5 text-blue-600" />
          <span>Pelacakan Pesanan Real-Time (Tanpa Login)</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold font-tactical text-slate-900 uppercase tracking-wider">
          CEK STATUS PENGERJAAN & BUKTI JOKI
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Masukkan Nomor Invoice (contoh: <code className="text-amber-700 font-bold bg-amber-50 px-1 py-0.5 rounded border border-amber-200">ABO-2026-9821</code>) atau Nomor WhatsApp untuk memantau progres raid akun Anda.
        </p>
      </div>

      {/* Search Bar Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm mb-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row gap-2.5"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              id="input-tracking-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Masukkan No. Invoice / No. WhatsApp / Nickname..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            id="btn-submit-tracking-search"
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold font-tactical uppercase tracking-wider text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Lacak Sekarang</span>
          </button>
        </form>

        {/* Clean Search Input - No Demo Chips */}
      </div>

      {/* Result Display */}
      {selectedOrder ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Main Order Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
            
            {/* Top Bar: Invoice & Status Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xl sm:text-2xl font-black text-amber-600">
                    {selectedOrder.invoiceNumber}
                  </span>
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium border border-slate-200">
                    {selectedOrder.serviceType === 'joki_koen' ? 'Joki Koen' : 'Joki Mandor'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
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

            {/* Tactical Pipeline Stepper - Langsung Verifikasi Pembayaran */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                STATUS ALUR PENGERJAAN:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                {[
                  { key: 'verifying', label: '1. Verifikasi Pembayaran', step: 1 },
                  { key: 'queued', label: '2. Masuk Antrean Joki', step: 2 },
                  { key: 'in_progress', label: '3. Sedang Dimainkan (Raid)', step: 3 },
                  { key: 'completed', label: '4. Selesai 100%', step: 4 },
                ].map((st) => {
                  const getStepRank = (s: string) => {
                    if (s === 'unpaid' || s === 'verifying') return 1;
                    if (s === 'queued') return 2;
                    if (s === 'in_progress') return 3;
                    if (s === 'completed') return 4;
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
                          ? 'border-amber-500 bg-amber-50 text-amber-800 font-bold shadow-sm'
                          : isPassed
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700 font-medium'
                          : 'border-slate-200 bg-slate-50 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-1">
                        {isPassed && !isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        <span>{st.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Verifying Status Information Banner */}
            {(selectedOrder.orderStatus === 'verifying' || selectedOrder.orderStatus === 'unpaid') && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <ShieldCheck className="w-6 h-6 text-amber-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-900">Tahap: Verifikasi Pembayaran oleh Superadmin</h4>
                    <p className="text-xs text-slate-600">
                      Pesanan Anda sebesar <span className="font-bold text-slate-900">{formatRupiah(selectedOrder.totalPrice)}</span> sedang dalam proses verifikasi manual oleh Superadmin untuk menjamin keamanan transaksi.
                    </p>
                  </div>
                </div>

                <div className="px-3 py-1.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-mono font-bold shrink-0">
                  Sedang Dicek Superadmin
                </div>
              </div>
            )}

            {/* Live Progress Bar Card */}
            <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    PROGRES PENGERJAAN REAL-TIME
                  </span>
                </div>
                <span className="text-lg font-black font-tactical text-amber-600">
                  {selectedOrder.currentProgressPercent}% SELESAI
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${selectedOrder.currentProgressPercent}%` }}
                />
              </div>

              <div className="flex flex-wrap justify-between text-xs text-slate-600 pt-1">
                <span>
                  Joki Bertugas: <strong className="text-slate-900">{selectedOrder.assignedWorker || 'Pro Joki Squad'}</strong>
                </span>
                <span>
                  Target: <strong className="text-amber-700 font-bold">{selectedOrder.packageName}</strong>
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block mb-1">Nickname In-Game:</span>
                <span className="font-bold text-sm text-slate-900 font-tactical tracking-wide">
                  {selectedOrder.gameNickname}
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block mb-1">Metode Login:</span>
                <span className="font-bold text-sm text-amber-700">
                  {selectedOrder.loginMethod}
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block mb-1">Nomor WhatsApp Pelanggan:</span>
                <span className="font-bold text-sm text-slate-900 font-mono">
                  {maskPhoneNumber(selectedOrder.customerWhatsApp)}
                </span>
              </div>

              {selectedOrder.mandorMap && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block mb-1">Target Map Mandor:</span>
                  <span className="font-bold text-sm text-blue-600">
                    {selectedOrder.mandorMap}
                  </span>
                </div>
              )}

              {selectedOrder.mandorPlayMode && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block mb-1">Metode Mandor:</span>
                  <span className="font-bold text-sm text-emerald-600">
                    {selectedOrder.mandorPlayMode === 'mabar_squad' ? 'Mabar Bareng Pro Joki' : 'Joki Akun'}
                  </span>
                </div>
              )}

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block mb-1">Garansi Keamanan:</span>
                <span className="font-bold text-sm text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> 100% Anti-Banned Manual
                </span>
              </div>
            </div>

            {/* Timeline of Proof Screenshots & Notes */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-amber-600" />
                <h3 className="font-tactical text-lg font-bold text-slate-900 uppercase tracking-wider">
                  LOG & BUKTI SCREENSHOT PENGERJAAN
                </h3>
              </div>

              {selectedOrder.progressHistory && selectedOrder.progressHistory.length > 0 ? (
                <div className="space-y-3">
                  {selectedOrder.progressHistory.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-4"
                    >
                      {item.imageUrl && (
                        <div className="sm:w-48 h-32 rounded-lg overflow-hidden border border-slate-200 shrink-0 relative group">
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
                          <span className="font-bold text-amber-700">
                            {item.workerName} • Progress {item.progressPercent}%
                          </span>
                          <span className="text-slate-500 font-mono">
                            {formatDate(item.timestamp)}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                          {item.note}
                        </p>

                        {item.koenAccumulated && (
                          <div className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                            <Coins className="w-3.5 h-3.5" />
                            Koen Terkumpul: {formatRupiah(item.koenAccumulated)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                  <Clock className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  Belum ada log pengerjaan yang diunggah joki. Log dan tangkapan layar akan otomatis muncul di sini saat proses raid berjalan.
                </div>
              )}
            </div>

            {/* Direct WhatsApp Contact Button for this Order */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500 text-center sm:text-left">
                Butuh bantuan atau ingin konfirmasi akun dengan joki?
              </span>

              <a
                href={getWhatsAppDirectUrl(
                  settings.whatsappCSNumber,
                  `Halo CS BreakoutOps, saya ingin menanyakan progres pesanan invoice ${selectedOrder.invoiceNumber} (${selectedOrder.packageName}) untuk akun ${selectedOrder.gameNickname}.`
                )}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-md transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat Admin / Joki di WhatsApp</span>
              </a>
            </div>

          </div>
        </div>
      ) : hasSearched ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-md mx-auto space-y-3 shadow-sm">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold font-tactical text-slate-900 uppercase">
            PESANAN TIDAK DITEMUKAN
          </h3>
          <p className="text-xs text-slate-600">
            Tidak ditemukan data pesanan dengan kata kunci <code className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">"{searchQuery}"</code>. Pastikan nomor invoice atau no WhatsApp sudah benar.
          </p>
        </div>
      ) : null}

    </div>
  );
};
