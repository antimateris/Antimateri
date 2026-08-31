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
  CreditCard
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
  
  // DOKU Checkout states
  const [isCreatingDokuCheckout, setIsCreatingDokuCheckout] = useState<boolean>(false);
  const [isAutoChecking, setIsAutoChecking] = useState<boolean>(false);
  const [dokuPaymentUrl, setDokuPaymentUrl] = useState<string | null>(null);
  const [checkoutFeedback, setCheckoutFeedback] = useState<string | null>(null);
  const [isPaidSuccess, setIsPaidSuccess] = useState<boolean>(order.paymentStatus === 'paid');
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

  const isCompletedRef = useRef<boolean>(isPaidSuccess);

  // Trigger celebration confetti & update order state
  const triggerPaymentSuccess = (paidDetails?: { channel?: string; paidAt?: string }) => {
    if (isCompletedRef.current) return;
    isCompletedRef.current = true;

    try {
      confetti({
        particleCount: 100,
        spread: 70,
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
    setIsPaidSuccess(true);
    saveOrderToFirestore(updated);

    if (onPaymentSuccess) {
      onPaymentSuccess(updated);
    }
  };

  // Real-time automatic polling to check if DOKU Webhook marked invoice as paid
  useEffect(() => {
    if (isPaidSuccess || isCompletedRef.current) return;

    // Check if order prop itself changed to paid via Firestore onSnapshot
    if (order.paymentStatus === 'paid') {
      triggerPaymentSuccess();
      return;
    }

    const checkPaymentStatus = async () => {
      if (isCompletedRef.current) return;
      try {
        const res = await fetch(`/api/payment/doku/status/${order.invoiceNumber}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.paid) {
            triggerPaymentSuccess({
              channel: data.channel,
              paidAt: data.paidAt
            });
          }
        }
      } catch (e) {
        // Silently ignore polling network errors
      }
    };

    const checkInterval = setInterval(checkPaymentStatus, 2000);

    // Also check immediately when user switches back to this tab from DOKU
    const handleWindowFocus = () => {
      checkPaymentStatus();
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      clearInterval(checkInterval);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [order.invoiceNumber, isPaidSuccess, order.paymentStatus]);

  // Listen to postMessage from DOKU Jokul iframe
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

  // Launch DOKU Jokul Checkout (Embedded in modal without opening new tab)
  const handleLaunchJokulCheckout = async () => {
    setIsCreatingDokuCheckout(true);
    setCheckoutFeedback(null);
    try {
      const response = await fetch('/api/payment/doku/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isProduction: settings?.paymentGatewayMode === 'production',
          clientId: settings?.dokuClientId,
          secretKey: settings?.dokuClientSecret || settings?.dokuApiKey,
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

      const resData = await response.json();
      if (resData.success) {
        if (resData.paymentUrl) {
          const paymentUrl = resData.paymentUrl;
          setDokuPaymentUrl(paymentUrl);

          // 1. First priority: load Jokul Checkout official popup directly inside current page
          if (typeof window.loadJokulCheckout === 'function') {
            try {
              window.loadJokulCheckout(paymentUrl);
              setCheckoutFeedback('⚡ Sesi pembayaran DOKU aktif. Selesaikan pembayaran di popup atau frame di bawah.');
              return;
            } catch (e) {
              console.warn('loadJokulCheckout popup failed, using in-modal frame:', e);
            }
          }

          setCheckoutFeedback('⚡ Sesi pembayaran DOKU siap. Selesaikan transaksi di frame di bawah.');
        } else {
          // Sandbox simulation or fallback mode
          setCheckoutFeedback('⚡ Mode Sandbox DOKU Aktif: Anda dapat memindai QRIS simulasi atau langsung klik "Konfirmasi Lunas" di bawah.');
        }
      } else {
        setCheckoutFeedback(`⚠️ ${resData.message || 'Gagal membuat sesi pembayaran DOKU.'}`);
      }
    } catch (err: any) {
      console.error('DOKU Checkout error:', err);
      setCheckoutFeedback('⚠️ Terjadi kendala jaringan saat menghubungkan ke DOKU. Anda dapat menggunakan tombol konfirmasi simulasi atau upload bukti manual.');
    } finally {
      setIsCreatingDokuCheckout(false);
    }
  };

  // Manual status check button
  const handleManualCheckStatus = async () => {
    setIsAutoChecking(true);
    try {
      const res = await fetch(`/api/payment/doku/status/${order.invoiceNumber}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.paid) {
          triggerPaymentSuccess({
            channel: data.channel,
            paidAt: data.paidAt
          });
          return;
        }
      }
      setCheckoutFeedback('ℹ️ Pembayaran belum terdeteksi dari DOKU. Pastikan Anda telah menyelesaikan transaksi di aplikasi e-wallet/bank.');
    } catch (e) {
      setCheckoutFeedback('⚠️ Gagal memeriksa status pembayaran.');
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
      triggerPaymentSuccess({ channel: 'DOKU_SANDBOX_SIMULATION' });
    } catch (e) {
      console.error('Simulate payment failed:', e);
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
      setUploadError(`Ukuran foto bukti transfer (${(file.size / (1024 * 1024)).toFixed(2)} MB) melebihi batas maksimal 2MB.`);
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
  // VIEW 1: SUCCESS PAID RESI (AUTOMATIC TRIGGER)
  // ========================================================
  if (isPaidSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
        <div className="relative w-full max-w-lg bg-zinc-900 border-2 border-emerald-500/80 rounded-3xl shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 duration-200">
          
          <div className="bg-gradient-to-b from-emerald-500/25 via-zinc-900 to-zinc-900 px-6 pt-8 pb-6 border-b border-zinc-800 text-center relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500 text-black flex items-center justify-center font-black mb-3 shadow-xl shadow-emerald-500/40 ring-4 ring-emerald-500/20 animate-bounce">
              <Check className="w-9 h-9 stroke-[3]" />
            </div>

            <div className="flex items-center justify-center space-x-1.5 mb-1">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-tactical">
                OTOMATIS TERVERIFIKASI
              </span>
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>

            <h3 className="font-tactical text-2xl font-black text-white uppercase tracking-wider">
              PEMBAYARAN DOKU BERHASIL!
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Sistem telah mendeteksi pembayaran lunas. Pesanan otomatis masuk ke antrean pengerjaan.
            </p>
          </div>

          <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto text-xs">
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
                <span className="text-zinc-400">Nomor Invoice:</span>
                <span className="font-mono font-black text-amber-400 text-sm">
                  {paidOrderState.invoiceNumber}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-400">Paket Layanan:</span>
                <span className="text-white font-bold">{paidOrderState.packageName}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-400">Nickname Akun:</span>
                <span className="text-amber-300 font-bold font-mono">{paidOrderState.gameNickname}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-400">Gateway:</span>
                <span className="text-emerald-400 font-bold">DOKU Webhook Verified</span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-400">Status Transaksi:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-black uppercase text-[10px]">
                  LUNAS / PAID (AUTOMATIC)
                </span>
              </div>

              <div className="pt-2.5 border-t border-zinc-800 flex justify-between items-center">
                <span className="font-bold text-zinc-300 uppercase">TOTAL DIBAYAR</span>
                <span className="text-lg font-black text-emerald-400 font-tactical">
                  {formatRupiah(paidOrderState.totalPrice)}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl flex items-start space-x-2.5 text-emerald-300">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold block text-emerald-200">Akun Anda Siap Diproses:</span>
                Pro joki BreakoutOps akan segera ditugaskan untuk mengekstrak misi dan mengamankan target pesanan Anda.
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleNavigateToTrack}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-emerald-300 text-black font-black text-xs font-tactical uppercase tracking-wider rounded-xl shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <span>Buka Live Tracking Pesanan</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // VIEW 2: MANUAL SUBMITTED SCREEN (FALLBACK)
  // ========================================================
  if (isManualSubmitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
        <div className="relative w-full max-w-lg bg-zinc-900 border-2 border-amber-500/60 rounded-3xl shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 duration-200">
          
          <div className="bg-gradient-to-b from-amber-500/20 via-zinc-900 to-zinc-900 px-6 pt-8 pb-6 border-b border-zinc-800 text-center relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400 mb-3 shadow-lg shadow-amber-500/20">
              <Receipt className="w-7 h-7" />
            </div>

            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-tactical inline-block mb-1">
              BUKTI BERHASIL DIKIRIM
            </span>
            <h3 className="font-tactical text-2xl font-black text-white uppercase tracking-wider">
              MENUNGGU VERIFIKASI ADMIN
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Pesanan #{paidOrderState.invoiceNumber} sedang diverifikasi manual oleh Admin.
            </p>
          </div>

          <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto text-xs">
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-400">Nomor Invoice:</span>
                <span className="text-amber-400 font-bold font-mono">{paidOrderState.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Tagihan:</span>
                <span className="text-white font-bold font-mono">{formatRupiah(paidOrderState.totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Status:</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-black uppercase text-[10px]">
                  VERIFIKASI MANUAL
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleNavigateToTrack}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs font-tactical uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <span>Lacak Status di Live Tracking</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // VIEW 3: MAIN DOKU CHECKOUT WITH AUTOMATIC REALTIME DETECTION
  // ========================================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-900 border-2 border-amber-500/60 rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-6 animate-in zoom-in-95 duration-200 flex flex-col max-h-[94vh]">
        
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 px-5 sm:px-6 py-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-tactical text-lg sm:text-xl font-black text-white uppercase tracking-wider">
                  PEMBAYARAN RESMI DOKU
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-tactical flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>OTOMATIS DETEKSI</span>
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Invoice: <span className="text-amber-400 font-mono font-bold">{order.invoiceNumber}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800 flex items-center space-x-1.5 text-xs text-zinc-300 font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-amber-400 font-bold">{formatTimer(timeLeft)}</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          
          {/* Order Summary Card */}
          <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 p-4 sm:p-5 rounded-3xl border border-amber-500/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  TOTAL PEMBAYARAN:
                </span>
                <span className="text-2xl sm:text-3xl font-black font-tactical text-amber-400 tracking-wide">
                  {formatRupiah(order.totalPrice)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCopyAmount}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-xl transition-colors border border-amber-500/30 flex items-center space-x-1.5 cursor-pointer"
                >
                  {copiedAmount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAmount ? 'Tersalin' : 'Salin Nominal'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyInvoice}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl transition-colors border border-zinc-700 flex items-center space-x-1.5 cursor-pointer"
                >
                  {copiedInvoice ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedInvoice ? 'Tersalin' : 'Salin Invoice'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-zinc-400">
              <div>
                <span className="text-zinc-500 block">Paket Layanan:</span>
                <strong className="text-white font-medium truncate block">{order.packageName}</strong>
              </div>
              <div>
                <span className="text-zinc-500 block">Nickname Akun:</span>
                <strong className="text-amber-300 font-mono font-medium truncate block">{order.gameNickname}</strong>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-zinc-500 block">Sistem Pembayaran:</span>
                <strong className="text-emerald-400 font-medium">DOKU Jokul Gateway (Auto)</strong>
              </div>
            </div>
          </div>

          {/* DOKU One-Click Action Card */}
          <div className="bg-gradient-to-b from-blue-950/40 via-zinc-950 to-zinc-950 p-5 rounded-3xl border-2 border-blue-500/40 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-blue-400 font-black">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">
                    Bayar Otomatis Lewat DOKU Checkout
                  </h4>
                  <span className="text-[10px] text-zinc-400">
                    QRIS Realtime • Virtual Account • E-Wallet
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-blue-300 bg-blue-500/20 px-2.5 py-1 rounded-full border border-blue-500/30 font-mono font-bold">
                Auto-Detect ⚡
              </span>
            </div>

            <p className="text-zinc-300 text-xs leading-relaxed">
              Klik tombol di bawah untuk membuka popup pembayaran DOKU. Setelah Anda membayar di aplikasi bank/e-wallet Anda, <strong>halaman ini akan langsung otomatis berubah menjadi Lunas</strong> tanpa perlu upload foto bukti.
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleLaunchJokulCheckout}
                disabled={isCreatingDokuCheckout}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm font-tactical uppercase tracking-wider rounded-2xl shadow-xl shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer ring-2 ring-blue-400/30"
              >
                <ExternalLink className={`w-4 h-4 text-white ${isCreatingDokuCheckout ? 'animate-spin' : ''}`} />
                <span>{isCreatingDokuCheckout ? 'MEMBUAT SESI DOKU...' : (dokuPaymentUrl ? 'BUKA ULANG HALAMAN DOKU' : 'BAYAR SEKARANG (DOKU CHECKOUT)')}</span>
              </button>

              {/* Instant Paid Confirmation Button */}
              <button
                type="button"
                onClick={handleSimulatePayment}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs font-tactical uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer border border-emerald-400/40"
              >
                <Check className="w-4 h-4 text-emerald-200 stroke-[3]" />
                <span>SAYA SUDAH SELESAI BAYAR (KONFIRMASI LUNAS)</span>
              </button>
            </div>

            {/* Realtime listener status indicator */}
            <div className="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-zinc-300">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                <span className="text-[11px]">Memantau pembayaran otomatis secara live...</span>
              </div>
              <button
                type="button"
                onClick={handleManualCheckStatus}
                disabled={isAutoChecking}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg text-[10px] font-bold border border-zinc-700 transition-colors cursor-pointer shrink-0"
              >
                {isAutoChecking ? 'Mengecek...' : 'Cek Status'}
              </button>
            </div>

            {/* Embedded In-Page DOKU Payment Frame */}
            {dokuPaymentUrl && (
              <div className="space-y-2 pt-1 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between text-xs text-zinc-400 pb-1">
                  <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Portal Pembayaran DOKU (Langsung di Web)
                  </span>
                  <button
                    type="button"
                    onClick={() => setDokuPaymentUrl(null)}
                    className="text-zinc-500 hover:text-zinc-300 text-[11px] underline cursor-pointer"
                  >
                    Tutup Frame
                  </button>
                </div>
                <div className="w-full h-[520px] rounded-2xl overflow-hidden border border-blue-500/40 bg-zinc-900 shadow-2xl relative">
                  <iframe
                    src={dokuPaymentUrl}
                    title="DOKU Checkout Gateway"
                    className="w-full h-full border-0"
                    allow="payment"
                  />
                </div>
              </div>
            )}

            {checkoutFeedback && !dokuPaymentUrl && (
              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs flex items-start space-x-2">
                <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <span className="leading-relaxed">{checkoutFeedback}</span>
              </div>
            )}

            {/* Sandbox Simulation Button for Testing */}
            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
              <span>Mode Pengujian Sandbox:</span>
              <button
                type="button"
                onClick={handleSimulatePayment}
                className="text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
              >
                Simulasi Bayar Berhasil (Test)
              </button>
            </div>
          </div>

          {/* Optional Fallback: Manual Upload */}
          <div className="border-t border-zinc-800 pt-3">
            <button
              type="button"
              onClick={() => setShowManualUpload(!showManualUpload)}
              className="text-zinc-400 hover:text-zinc-200 text-xs font-semibold flex items-center justify-between w-full p-2 rounded-xl hover:bg-zinc-800/50 transition-colors cursor-pointer"
            >
              <span>Kendala koneksi? Buka opsi upload bukti manual</span>
              <span className="text-zinc-500">{showManualUpload ? '▲' : '▼'}</span>
            </button>

            {showManualUpload && (
              <div className="mt-3 bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-3 animate-in fade-in duration-200">
                <p className="text-zinc-400 text-[11px]">
                  Jika pembayaran tidak terdeteksi otomatis karena masalah jaringan, lampirkan struk pembayaran di sini:
                </p>

                {uploadError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {!proofImage ? (
                  <label className="border-2 border-dashed border-zinc-700 hover:border-amber-500/60 rounded-xl p-3.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-zinc-900/40 hover:bg-amber-500/5">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <UploadCloud className="w-5 h-5 text-amber-400 mb-1" />
                    <span className="text-xs font-bold text-zinc-200">Upload Foto Bukti Manual</span>
                    <span className="text-[10px] text-zinc-500 mt-0.5">JPG, PNG, WEBP (Maks 2MB)</span>
                  </label>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-emerald-500/40 bg-zinc-900/90 p-2.5 flex items-center justify-between">
                    <div className="flex items-center space-x-2 truncate">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700">
                        <img src={proofImage} alt="Bukti" className="w-full h-full object-cover" />
                      </div>
                      <div className="truncate">
                        <span className="text-xs text-emerald-300 font-mono block truncate max-w-[200px]">{proofFileName || 'Bukti_Transfer.jpg'}</span>
                        <span className="text-[10px] text-zinc-500">{proofFileSize}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveProof}
                      className="p-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Catatan transfer opsional..."
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/60"
                />

                <button
                  type="button"
                  onClick={handleManualSubmit}
                  disabled={isManualSubmitting}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  {isManualSubmitting ? 'Mengirim...' : 'Kirim Bukti Manual ke Admin'}
                </button>
              </div>
            )}
          </div>

          <p className="text-[11px] text-zinc-500 text-center">
            🛡️ Sistem otomatis terintegrasi langsung dengan SNAP Payment Gateway DOKU.
          </p>

        </div>

      </div>
    </div>
  );
};
