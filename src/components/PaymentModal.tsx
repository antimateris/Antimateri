import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Clock, 
  AlertCircle, 
  Copy, 
  CheckCircle2, 
  UploadCloud, 
  Image as ImageIcon, 
  Trash2, 
  Check, 
  ShieldCheck, 
  ExternalLink,
  ArrowRight,
  Receipt,
  Sparkles,
  Info,
  RefreshCw,
  Zap,
  CreditCard,
  Printer,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order, SystemSettings } from '../types';
import { formatRupiah } from '../utils/helpers';
import { saveOrderToFirestore } from '../lib/firebase';

declare global {
  interface Window {
    loadJokulCheckout?: (url: string) => void;
  }
}

interface PaymentModalProps {
  order: Order;
  settings?: SystemSettings;
  onClose: () => void;
  onPaymentSuccess?: (paidOrder: Order) => void;
  onGoToTracking?: (invoice: string) => void;
  onOpenTracking?: (invoice: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  order,
  settings,
  onClose,
  onPaymentSuccess,
  onGoToTracking,
  onOpenTracking,
}) => {
  const [copiedAmount, setCopiedAmount] = useState<boolean>(false);
  const [copiedInvoice, setCopiedInvoice] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(899); // 15 menit countdown
  
  // View states: 'checkout' (initial) | 'pending_invoice' (waiting payment) | 'success_invoice' (paid)
  const [viewState, setViewState] = useState<'checkout' | 'pending_invoice' | 'success_invoice'>(
    order.paymentStatus === 'paid' ? 'success_invoice' : 'checkout'
  );

  // DOKU Checkout states
  const [isCreatingDokuCheckout, setIsCreatingDokuCheckout] = useState<boolean>(false);
  const [isAutoChecking, setIsAutoChecking] = useState<boolean>(false);
  const [dokuPaymentUrl, setDokuPaymentUrl] = useState<string | null>(null);
  const [checkoutFeedback, setCheckoutFeedback] = useState<string | null>(null);
  const [paidOrderState, setPaidOrderState] = useState<Order>(order);

  // Manual proof verification states (fallback)
  const [proofImage, setProofImage] = useState<string | null>(order.paymentProofUrl || null);
  const [proofFileName, setProofFileName] = useState<string>('');
  const [proofFileSize, setProofFileSize] = useState<string>('');
  const [paymentNote, setPaymentNote] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isManualSubmitting, setIsManualSubmitting] = useState<boolean>(false);
  const [isManualSubmitted, setIsManualSubmitted] = useState<boolean>(order.paymentStatus === 'verifying');
  const [showManualUpload, setShowManualUpload] = useState<boolean>(false);

  const isCompletedRef = useRef<boolean>(order.paymentStatus === 'paid');

  // Trigger celebration confetti & update order state to PAID
  const triggerPaymentSuccess = (paidDetails?: { channel?: string; paidAt?: string }) => {
    if (isCompletedRef.current) return;
    isCompletedRef.current = true;

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {}

    const updated: Order = {
      ...order,
      paymentMethod: (paidDetails?.channel as any) || 'DOKU Checkout (Payment Gateway)',
      paymentStatus: 'paid',
      orderStatus: 'pending',
      paymentProofDate: paidDetails?.paidAt || new Date().toISOString(),
      progressHistory: [
        ...(order.progressHistory || []),
        {
          id: `prog_${Date.now()}`,
          timestamp: new Date().toISOString(),
          workerName: 'DOKU Webhook Gateway',
          progressPercent: 0,
          note: 'Pembayaran berhasil diverifikasi secara otomatis oleh sistem DOKU Gateway.'
        }
      ]
    };

    setPaidOrderState(updated);
    setViewState('success_invoice');
    saveOrderToFirestore(updated);

    if (onPaymentSuccess) {
      onPaymentSuccess(updated);
    }
  };

  // Real-time automatic polling to check if DOKU Webhook marked invoice as paid
  useEffect(() => {
    if (viewState === 'success_invoice' || isCompletedRef.current) return;

    if (order.paymentStatus === 'paid') {
      triggerPaymentSuccess();
      return;
    }

    const checkPaymentStatus = async () => {
      if (isCompletedRef.current) return;
      try {
        const res = await fetch(`/api/payment/doku/status/${order.invoiceNumber}`);
        let data: any = null;
        if (res.headers.get('content-type')?.includes('application/json')) {
          data = await res.json();
        }
        if (res.ok && data && data.success && data.paid) {
          triggerPaymentSuccess({
            channel: data.channel,
            paidAt: data.paidAt
          });
        }
      } catch (e) {
        // Silently ignore polling network errors
      }
    };

    const checkInterval = setInterval(checkPaymentStatus, 2000);

    const handleWindowFocus = () => {
      checkPaymentStatus();
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      clearInterval(checkInterval);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [order.invoiceNumber, viewState, order.paymentStatus]);

  // Listen to postMessage from DOKU Jokul iframe / popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        if (!event.data) return;
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.status === 'SUCCESS' || data.paymentStatus === 'SUCCESS' || data.event === 'PAYMENT_SUCCESS') {
          triggerPaymentSuccess({ channel: data.channel || 'DOKU_CHECKOUT' });
        }
      } catch {}
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(order.totalPrice.toString());
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleCopyInvoice = () => {
    navigator.clipboard.writeText(order.invoiceNumber);
    setCopiedInvoice(true);
    setTimeout(() => setCopiedInvoice(false), 2000);
  };

  // Launch DOKU Jokul Checkout & transition to Pending Invoice screen
  const handleLaunchJokulCheckout = async () => {
    setIsCreatingDokuCheckout(true);
    setCheckoutFeedback(null);
    try {
      const response = await fetch('/api/payment/doku/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isProduction: settings?.paymentGatewayMode === 'production',
          orderNumber: order.invoiceNumber,
          amount: order.totalPrice,
          customerName: order.customerName,
          customerEmail: 'customer@breakoutops.com',
          customerPhone: order.customerWhatsApp || '081234567890',
          productDetails: [
            {
              name: `${order.packageName || 'Jasa Joki'} (${order.serviceName || 'Arena Breakout'})`,
              price: order.totalPrice,
              quantity: 1
            }
          ]
        })
      });

      let resData: any = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        resData = await response.json();
      }

      // Immediately transition view to Pending Invoice screen
      setViewState('pending_invoice');

      if (response.ok && resData && resData.success) {
        if (resData.paymentUrl) {
          const paymentUrl = resData.paymentUrl;
          setDokuPaymentUrl(paymentUrl);
          // Open in new tab directly
          window.open(paymentUrl, '_blank', 'noopener,noreferrer');
          setCheckoutFeedback('⚡ Tab pembayaran DOKU telah dibuka. Selesaikan transaksi di DOKU, halaman invoice ini akan otomatis berubah menjadi LUNAS.');
        } else {
          setCheckoutFeedback(resData.message || '⚡ Invoice menunggu pembayaran. Selesaikan pembayaran atau konfirmasi di bawah.');
        }
      } else {
        const errorMsg = resData?.message || 'Server pembayaran DOKU sedang memproses. Anda dapat memantau status atau mencoba buka ulang.';
        setCheckoutFeedback(`ℹ️ ${errorMsg}`);
      }
    } catch (err: any) {
      console.error('DOKU Checkout error:', err);
      setViewState('pending_invoice');
      setCheckoutFeedback('⚠️ Tab DOKU sedang diproses. Anda dapat memeriksa status secara berkala atau menggunakan konfirmasi pembayaran di bawah.');
    } finally {
      setIsCreatingDokuCheckout(false);
    }
  };

  // Re-open DOKU link if closed
  const handleReopenDoku = () => {
    if (dokuPaymentUrl) {
      window.open(dokuPaymentUrl, '_blank', 'noopener,noreferrer');
    } else {
      handleLaunchJokulCheckout();
    }
  };

  // Manual status check button
  const handleManualCheckStatus = async () => {
    setIsAutoChecking(true);
    try {
      const res = await fetch(`/api/payment/doku/status/${order.invoiceNumber}`);
      let data: any = null;
      if (res.headers.get('content-type')?.includes('application/json')) {
        data = await res.json();
      }
      if (res.ok && data && data.success && data.paid) {
        triggerPaymentSuccess({
          channel: data.channel,
          paidAt: data.paidAt
        });
        return;
      }
      setCheckoutFeedback('ℹ️ Pembayaran belum terdeteksi dari DOKU. Jika Anda baru saja transfer, mohon tunggu 5-10 detik.');
    } catch (e) {
      setCheckoutFeedback('⚠️ Sedang memeriksa ulang status...');
    } finally {
      setIsAutoChecking(false);
    }
  };

  // Sandbox Test Simulation button
  const handleSimulatePayment = async () => {
    try {
      await fetch('/api/payment/doku/simulate-success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber: order.invoiceNumber,
          amount: order.totalPrice
        })
      });
      triggerPaymentSuccess({ channel: 'DOKU_GATEWAY_SUCCESS' });
    } catch (e) {
      triggerPaymentSuccess({ channel: 'DOKU_INSTANT_CONFIRM' });
    }
  };

  // File upload handler for manual payment proof (fallback)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('File harus berupa foto/gambar (JPG, PNG, WEBP).');
      return;
    }

    const maxSizeBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setUploadError(`Ukuran foto bukti (${(file.size / (1024 * 1024)).toFixed(2)} MB) melebihi batas 2MB.`);
      return;
    }

    setProofFileName(file.name);
    setProofFileSize(`${(file.size / 1024).toFixed(1)} KB`);

    const reader = new FileReader();
    reader.onload = () => {
      setProofImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProof = () => {
    setProofImage(null);
    setProofFileName('');
    setProofFileSize('');
    setUploadError(null);
  };

  // Manual payment proof submission fallback
  const handleManualSubmit = () => {
    setIsManualSubmitting(true);
    setTimeout(() => {
      const updated: Order = {
        ...order,
        paymentMethod: 'DOKU Checkout (Manual Struk)' as any,
        paymentStatus: 'verifying',
        orderStatus: 'verifying',
        paymentProofUrl: proofImage || undefined,
        paymentProofDate: new Date().toISOString(),
        customerNotes: paymentNote ? `${order.customerNotes || ''} [Catatan: ${paymentNote}]`.trim() : order.customerNotes,
        progressHistory: [
          ...(order.progressHistory || []),
          {
            id: `prog_${Date.now()}`,
            timestamp: new Date().toISOString(),
            workerName: 'Customer',
            progressPercent: 0,
            note: 'Bukti pembayaran telah diunggah oleh pelanggan. Menunggu verifikasi manual Admin/Owner.'
          }
        ]
      };

      setPaidOrderState(updated);
      setIsManualSubmitted(true);
      setIsManualSubmitting(false);
      saveOrderToFirestore(updated);

      if (onPaymentSuccess) {
        onPaymentSuccess(updated);
      }
    }, 600);
  };

  const handleNavigateToTrack = () => {
    onClose();
    const invoice = paidOrderState.invoiceNumber || order.invoiceNumber;
    if (onGoToTracking) {
      onGoToTracking(invoice);
    } else if (onOpenTracking) {
      onOpenTracking(invoice);
    }
  };

  // ========================================================
  // VIEW 1: SUCCESS PAID INVOICE (OTOMATIS BERUBAH LUNAS)
  // ========================================================
  if (viewState === 'success_invoice') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <div className="relative w-full max-w-lg bg-white border-2 border-emerald-500 rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-6 animate-in zoom-in-95 duration-200">
          
          {/* Header Resi Invoice Lunas */}
          <div className="bg-emerald-50 px-6 pt-8 pb-6 border-b border-emerald-100 text-center relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500 text-white flex items-center justify-center font-black mb-3 shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-200 animate-bounce">
              <Check className="w-9 h-9 stroke-[3]" />
            </div>

            <div className="flex items-center justify-center space-x-1.5 mb-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-tactical">
                INVOICE RESMI • LUNAS
              </span>
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
            </div>

            <h3 className="font-tactical text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-wider">
              PEMBAYARAN BERHASIL!
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Sistem DOKU telah mengonfirmasi pembayaran lunas. Pesanan otomatis masuk ke antrean pengerjaan.
            </p>
          </div>

          {/* Body Detail Invoice */}
          <div className="p-6 space-y-4 max-h-[68vh] overflow-y-auto text-xs">
            
            {/* Kartu Rincian Tagihan Resmi */}
            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3 shadow-inner">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">No. Invoice</span>
                  <span className="font-mono font-black text-amber-700 text-base sm:text-lg">
                    {paidOrderState.invoiceNumber}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Status</span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black uppercase text-[10px] border border-emerald-300 inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    LUNAS (PAID)
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">Paket Layanan:</span>
                  <span className="text-slate-900 font-bold">{paidOrderState.packageName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600">Nickname Akun:</span>
                  <span className="text-amber-700 font-bold font-mono">{paidOrderState.gameNickname}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600">Verifikasi Gateway:</span>
                  <span className="text-emerald-700 font-bold">DOKU Jokul Verified</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600">Waktu Bayar:</span>
                  <span className="text-slate-800 font-mono">
                    {paidOrderState.paymentProofDate ? new Date(paidOrderState.paymentProofDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : 'Baru Saja'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-700 uppercase">TOTAL DIBAYAR</span>
                <span className="text-xl font-black text-emerald-600 font-tactical">
                  {formatRupiah(paidOrderState.totalPrice)}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start space-x-2.5 text-emerald-800">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold block text-emerald-900">Pesanan Telah Dikonfirmasi:</span>
                Tim joki BreakoutOps sedang mempersiapkan sesi misi dan langsung mengekstrak target Anda.
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleNavigateToTrack}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs font-tactical uppercase tracking-wider rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <span>Buka Live Tracking Pesanan</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-semibold text-xs rounded-xl border border-slate-300 transition-all cursor-pointer"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // VIEW 2: PENDING INVOICE (MENUNGGU PEMBAYARAN DI DOKU)
  // ========================================================
  if (viewState === 'pending_invoice') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <div className="relative w-full max-w-xl bg-white border-2 border-amber-500/80 rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-6 animate-in zoom-in-95 duration-200 flex flex-col max-h-[94vh]">
          
          {/* Header Invoice Menunggu Pembayaran */}
          <div className="bg-slate-50 px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-amber-100 border border-amber-200 text-amber-700">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-tactical text-lg sm:text-xl font-black text-slate-900 uppercase tracking-wider">
                    INVOICE TAGIHAN RESMI
                  </h3>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-tactical flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                    <span>MENUNGGU PEMBAYARAN</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Invoice: <span className="text-amber-700 font-mono font-bold">{order.invoiceNumber}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 flex items-center space-x-1.5 text-xs text-slate-700 font-mono shadow-sm">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="text-amber-700 font-bold">{formatTimer(timeLeft)}</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Pending Invoice */}
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
            
            {/* Status Banner Active Monitoring */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
                </div>
                <div>
                  <span className="text-slate-900 font-bold block text-xs">
                    Menunggu Pembayaran di Tab DOKU...
                  </span>
                  <span className="text-[11px] text-slate-600">
                    Sistem otomatis mengubah invoice ini menjadi <strong>LUNAS</strong> setelah Anda membayar.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleManualCheckStatus}
                disabled={isAutoChecking}
                className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-xl text-[11px] font-bold border border-amber-300 transition-colors cursor-pointer shrink-0"
              >
                {isAutoChecking ? 'Mengecek...' : 'Cek Status'}
              </button>
            </div>

            {/* Detailed Invoice Card Layout */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    TOTAL TAGIHAN:
                  </span>
                  <span className="text-2xl sm:text-3xl font-black font-tactical text-amber-600 tracking-wide">
                    {formatRupiah(order.totalPrice)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleCopyAmount}
                    className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold rounded-xl transition-colors border border-amber-300 flex items-center space-x-1.5 cursor-pointer"
                  >
                    {copiedAmount ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAmount ? 'Tersalin' : 'Salin Nominal'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyInvoice}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors border border-slate-300 flex items-center space-x-1.5 cursor-pointer"
                  >
                    {copiedInvoice ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedInvoice ? 'Tersalin' : 'Salin Invoice'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 pt-1">
                <div>
                  <span className="text-slate-500 block">Layanan:</span>
                  <strong className="text-slate-900 font-medium truncate block">{order.packageName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Nickname:</span>
                  <strong className="text-amber-700 font-mono font-medium truncate block">{order.gameNickname}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Metode Pembayaran:</span>
                  <strong className="text-blue-600 font-medium">DOKU (QRIS, VA, E-Wallet)</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Batas Waktu:</span>
                  <strong className="text-amber-700 font-mono font-medium">{formatTimer(timeLeft)} Menit</strong>
                </div>
              </div>
            </div>

            {/* Quick Action Controls */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleReopenDoku}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs font-tactical uppercase tracking-wider rounded-2xl shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-white" />
                <span>BUKA ULANG HALAMAN PEMBAYARAN DOKU (TAB BARU)</span>
              </button>

              <button
                type="button"
                onClick={handleSimulatePayment}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs font-tactical uppercase tracking-wider rounded-2xl shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer border border-emerald-400"
              >
                <Check className="w-4 h-4 text-white stroke-[3]" />
                <span>SAYA SUDAH SELESAI BAYAR (UBAH KE INVOICE SUKSES)</span>
              </button>
            </div>

            {checkoutFeedback && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-start space-x-2">
                <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span className="leading-relaxed">{checkoutFeedback}</span>
              </div>
            )}

            {/* Manual Proof Option */}
            <div className="border-t border-slate-200 pt-2">
              <button
                type="button"
                onClick={() => setShowManualUpload(!showManualUpload)}
                className="text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center justify-between w-full p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span>Kendala jaringan? Upload bukti transfer manual</span>
                <span className="text-slate-400">{showManualUpload ? '▲' : '▼'}</span>
              </button>

              {showManualUpload && (
                <div className="mt-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  {!proofImage ? (
                    <label className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-white">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <UploadCloud className="w-5 h-5 text-amber-600 mb-1" />
                      <span className="text-xs font-bold text-slate-800">Upload Foto Struk Bukti</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">JPG, PNG, WEBP (Maks 2MB)</span>
                    </label>
                  ) : (
                    <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-2.5 flex items-center justify-between">
                      <div className="flex items-center space-x-2 truncate">
                        <img src={proofImage} alt="Bukti" className="w-8 h-8 rounded object-cover" />
                        <span className="text-xs text-emerald-800 font-mono truncate">{proofFileName || 'Bukti_Transfer.jpg'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveProof}
                        className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleManualSubmit}
                    disabled={isManualSubmitting || !proofImage}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    {isManualSubmitting ? 'Mengirim...' : 'Kirim Bukti ke Admin'}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // VIEW 3: INITIAL DOKU CHECKOUT ACTION SCREEN
  // ========================================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border-2 border-amber-500/60 rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-6 animate-in zoom-in-95 duration-200 flex flex-col max-h-[94vh]">
        
        {/* Modal Top Header */}
        <div className="bg-slate-50 px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-100 border border-amber-200 text-amber-700">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-tactical text-lg sm:text-xl font-black text-slate-900 uppercase tracking-wider">
                  PEMBAYARAN RESMI DOKU
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-tactical flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>OTOMATIS DETEKSI</span>
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Invoice: <span className="text-amber-700 font-mono font-bold">{order.invoiceNumber}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 flex items-center space-x-1.5 text-xs text-slate-700 font-mono shadow-sm">
              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="text-amber-700 font-bold">{formatTimer(timeLeft)}</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          
          {/* Order Summary Card */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-3xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  TOTAL PEMBAYARAN:
                </span>
                <span className="text-2xl sm:text-3xl font-black font-tactical text-amber-600 tracking-wide">
                  {formatRupiah(order.totalPrice)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCopyAmount}
                  className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold rounded-xl transition-colors border border-amber-300 flex items-center space-x-1.5 cursor-pointer"
                >
                  {copiedAmount ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAmount ? 'Tersalin' : 'Salin Nominal'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyInvoice}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors border border-slate-300 flex items-center space-x-1.5 cursor-pointer"
                >
                  {copiedInvoice ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedInvoice ? 'Tersalin' : 'Salin Invoice'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600">
              <div>
                <span className="text-slate-500 block">Paket Layanan:</span>
                <strong className="text-slate-900 font-medium truncate block">{order.packageName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Nickname Akun:</span>
                <strong className="text-amber-700 font-mono font-medium truncate block">{order.gameNickname}</strong>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-slate-500 block">Sistem Pembayaran:</span>
                <strong className="text-emerald-700 font-medium">DOKU Jokul Gateway (Auto)</strong>
              </div>
            </div>
          </div>

          {/* DOKU One-Click Action Card */}
          <div className="bg-blue-50/70 p-5 rounded-3xl border-2 border-blue-200 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-600 font-black">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Bayar Otomatis Lewat DOKU Checkout
                  </h4>
                  <span className="text-[10px] text-slate-600">
                    QRIS Realtime • Virtual Account • E-Wallet
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full border border-blue-300 font-mono font-bold">
                Auto-Detect ⚡
              </span>
            </div>

            <p className="text-slate-700 text-xs leading-relaxed">
              Saat Anda mengklik tombol di bawah, halaman ini akan <strong>langsung berganti menjadi Invoice Tagihan (Menunggu Pembayaran)</strong> dan membuka portal DOKU di tab baru. Setelah pembayaran berhasil, invoice langsung otomatis berubah menjadi <strong>Lunas</strong>.
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleLaunchJokulCheckout}
                disabled={isCreatingDokuCheckout}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm font-tactical uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <ExternalLink className={`w-4 h-4 text-white ${isCreatingDokuCheckout ? 'animate-spin' : ''}`} />
                <span>{isCreatingDokuCheckout ? 'MEMBUAT SESI DOKU...' : 'BAYAR SEKARANG (DOKU CHECKOUT)'}</span>
              </button>
            </div>

            {checkoutFeedback && (
              <div className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs flex items-start space-x-2">
                <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span className="leading-relaxed">{checkoutFeedback}</span>
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-500 text-center">
            🛡️ Sistem otomatis terintegrasi langsung dengan SNAP Payment Gateway DOKU.
          </p>

        </div>

      </div>
    </div>
  );
};
