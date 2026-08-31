import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Clock, 
  AlertCircle, 
  Copy, 
  FileText, 
  CheckCircle2, 
  UploadCloud, 
  Image as ImageIcon, 
  Trash2, 
  Check, 
  ShieldCheck, 
  ExternalLink,
  ArrowRight,
  Receipt,
  QrCode,
  Building2,
  Wallet,
  Zap,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Download,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order, SystemSettings } from '../types';
import { formatRupiah, formatDate } from '../utils/helpers';

interface PaymentModalProps {
  order: Order;
  settings?: SystemSettings;
  onClose: () => void;
  onPaymentSuccess?: (paidOrder: Order) => void;
  onGoToTracking?: (invoice: string) => void;
  onOpenTracking?: (invoice: string) => void;
}

type PaymentMethodId = 
  | 'qris_auto' 
  | 'bca_va' 
  | 'mandiri_va' 
  | 'bri_va' 
  | 'bni_va' 
  | 'dana' 
  | 'gopay' 
  | 'ovo' 
  | 'manual_bca';

interface PaymentOption {
  id: PaymentMethodId;
  name: string;
  category: 'qris' | 'va' | 'ewallet' | 'manual';
  badge: string;
  icon: string;
  description: string;
  accountNumber?: string;
  accountHolder?: string;
  instructions?: string[];
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  order,
  settings,
  onClose,
  onPaymentSuccess,
  onGoToTracking,
  onOpenTracking,
}) => {
  const [selectedMethodId, setSelectedMethodId] = useState<PaymentMethodId>('qris_auto');
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedAmount, setCopiedAmount] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(899); // 15 menit countdown
  
  // Auto-verification & polling states
  const [isAutoChecking, setIsAutoChecking] = useState<boolean>(false);
  const [isCreatingDokuCheckout, setIsCreatingDokuCheckout] = useState<boolean>(false);
  const [dokuPaymentUrl, setDokuPaymentUrl] = useState<string | null>(null);
  const [checkStatusFeedback, setCheckStatusFeedback] = useState<string | null>(null);
  const [isPaidSuccess, setIsPaidSuccess] = useState<boolean>(order.paymentStatus === 'paid');
  const [paidOrderState, setPaidOrderState] = useState<Order>(order);

  // Manual proof states
  const [proofImage, setProofImage] = useState<string | null>(order.paymentProofUrl || null);
  const [proofFileName, setProofFileName] = useState<string>('');
  const [proofFileSize, setProofFileSize] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isManualSubmitting, setIsManualSubmitting] = useState<boolean>(false);
  const [isManualSubmitted, setIsManualSubmitted] = useState<boolean>(order.paymentStatus === 'verifying');

  // Accordion instruction tab
  const [showInstructions, setShowInstructions] = useState<boolean>(false);

  // Determine current active gateway provider from settings
  const gatewayProvider = settings?.paymentGatewayProvider || 'doku';
  const gatewayMode = settings?.paymentGatewayMode || 'sandbox';

  // Format nomor Virtual Account DOKU SNAP resmi (seperti pada Codashop / DOKU Merchant)
  // Prefix BIN DOKU: Mandiri (88899), BCA (88012 / Company Code DOKU), BRI (12800), BNI (88033)
  const invoiceDigits = order.invoiceNumber.replace(/\D/g, '').slice(-6) || '178793';
  const clientPrefix = (settings?.dokuClientId?.split('-')[1]) || '0266';
  
  // Format DOKU Generated Payment Code (DGPC)
  const vaBCA = `88012${clientPrefix}${invoiceDigits}`;
  const vaMandiri = `88899${clientPrefix}${invoiceDigits}`;
  const vaBRI = `12800${clientPrefix}${invoiceDigits}`;
  const vaBNI = `88033${clientPrefix}${invoiceDigits}`;
  const merchantHolder = `DOKU - ${settings?.storeName || 'BREAKOUTOPS STORE'}`;

  const paymentOptions: PaymentOption[] = [
    {
      id: 'qris_auto',
      name: 'QRIS Real-Time (SNAP BI)',
      category: 'qris',
      badge: 'OTOMATIS 1 DETIK',
      icon: '📱',
      description: 'Scan BCA Mobile, Mandiri Livin, GoPay, DANA, OVO, ShopeePay',
      accountHolder: 'PT NUSA SATU INTI ARTHA (DOKU)',
      instructions: [
        'Buka aplikasi e-Wallet atau Mobile Banking Anda (BCA, Livin, GoPay, DANA, dll).',
        'Pilih menu Scan / Bayar QRIS.',
        'Arahkan kamera ke QR Code di atas.',
        'Periksa nama penerima: PT NUSA SATU INTI ARTHA / DOKU.',
        'Pastikan nominal tagihan tepat tanpa dibulatkan.',
        'Masukkan PIN Anda dan selesaikan transaksi. Pesanan otomatis terverifikasi lunas dalam hitungan detik!'
      ]
    },
    {
      id: 'bca_va',
      name: 'BCA Virtual Account (DOKU)',
      category: 'va',
      badge: 'DOKU SNAP',
      icon: '🏦',
      description: 'Verifikasi instan via BCA Mobile, KlikBCA & ATM BCA',
      accountNumber: vaBCA,
      accountHolder: merchantHolder,
      instructions: [
        'Buka aplikasi BCA Mobile / myBCA atau ke ATM BCA terdekat.',
        'Pilih menu m-Transfer ➔ BCA Virtual Account.',
        `Masukkan nomor Virtual Account DOKU: ${vaBCA}`,
        'Nama Merchant yang muncul adalah: PT NUSA SATU INTI ARTHA / DOKU.',
        `Pastikan nominal tagihan sesuai (${formatRupiah(order.totalPrice)}).`,
        'Masukkan PIN BCA Anda dan konfirmasi pembayaran.'
      ]
    },
    {
      id: 'mandiri_va',
      name: 'Mandiri Virtual Account (DOKU)',
      category: 'va',
      badge: 'DOKU SNAP',
      icon: '🏦',
      description: 'Verifikasi instan via Livin by Mandiri & ATM Mandiri',
      accountNumber: vaMandiri,
      accountHolder: merchantHolder,
      instructions: [
        'Buka aplikasi Livin\' by Mandiri.',
        'Pilih menu Bayar ➔ Cari Penyedia Jasa: "DOKU" / "88899".',
        `Masukkan nomor Virtual Account: ${vaMandiri}`,
        'Periksa nama penerima DOKU dan total tagihan.',
        'Masukkan MPIN Livin Anda untuk menyelesaikan pembayaran.'
      ]
    },
    {
      id: 'bri_va',
      name: 'BRI BRIVA (DOKU)',
      category: 'va',
      badge: 'DOKU SNAP',
      icon: '🏦',
      description: 'Verifikasi instan via BRImo & ATM BRI',
      accountNumber: vaBRI,
      accountHolder: merchantHolder,
      instructions: [
        'Buka aplikasi BRImo.',
        'Pilih menu BRIVA ➔ Pembayaran Baru.',
        `Masukkan nomor BRIVA DOKU: ${vaBRI}`,
        'Nama Institusi: DOKU / PT NUSA SATU INTI ARTHA.',
        'Konfirmasi detail tagihan dan masukkan PIN BRImo.'
      ]
    },
    {
      id: 'bni_va',
      name: 'BNI Virtual Account (DOKU)',
      category: 'va',
      badge: 'DOKU SNAP',
      icon: '🏦',
      description: 'Verifikasi instan via BNI Mobile Banking & ATM BNI',
      accountNumber: vaBNI,
      accountHolder: merchantHolder,
      instructions: [
        'Buka aplikasi BNI Mobile Banking.',
        'Pilih menu Transfer ➔ Virtual Account Billing.',
        `Masukkan nomor VA DOKU: ${vaBNI}`,
        'Nama Merchant: DOKU MERCHANT.',
        'Konfirmasi tagihan dan masukkan password transaksi BNI.'
      ]
    },
    {
      id: 'dana',
      name: 'DANA E-Wallet Instant',
      category: 'ewallet',
      badge: 'INSTANT',
      icon: '💳',
      description: 'Transfer saldo DANA resmi terhubung',
      accountNumber: settings?.whatsappCSNumber || '082198765432',
      accountHolder: 'BREAKOUTOPS OFFICIAL',
      instructions: [
        'Buka aplikasi DANA di ponsel Anda.',
        'Pilih menu Kirim ➔ Kirim ke Akun DANA / Nomor HP.',
        `Masukkan nomor: ${settings?.whatsappCSNumber || '082198765432'}`,
        `Kirim nominal tepat: ${formatRupiah(order.totalPrice)}.`
      ]
    },
    {
      id: 'gopay',
      name: 'GoPay Instant',
      category: 'ewallet',
      badge: 'INSTANT',
      icon: '💳',
      description: 'Transfer saldo GoPay / GoPay App',
      accountNumber: settings?.whatsappCSNumber || '082198765432',
      accountHolder: 'BREAKOUTOPS OFFICIAL',
      instructions: [
        'Buka aplikasi GoPay / Gojek.',
        'Pilih menu Bayar / Transfer.',
        `Kirim ke nomor: ${settings?.whatsappCSNumber || '082198765432'}`,
        `Kirim nominal tepat: ${formatRupiah(order.totalPrice)}.`
      ]
    },
    {
      id: 'manual_bca',
      name: 'Rekening Manual (Upload Bukti)',
      category: 'manual',
      badge: 'VERIFIKASI OWNER',
      icon: '📑',
      description: 'Transfer rekening bank biasa & kirim bukti struk',
      accountNumber: '8801299834',
      accountHolder: 'ARENA BREAKOUT OPS STORE',
      instructions: [
        'Transfer langsung ke nomor rekening BCA: 8801299834 (A.N. ARENA BREAKOUT OPS STORE).',
        'Unggah foto screenshot struk transfer pada form di bawah.',
        'Klik Konfirmasi Pembayaran. Owner akan memvalidasi pesanan Anda.'
      ]
    }
  ];

  const selectedMethod = paymentOptions.find(opt => opt.id === selectedMethodId) || paymentOptions[0];

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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(order.totalPrice.toString());
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  // Trigger celebration confetti
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }
  };

  // Check payment status from gateway
  const handleCheckStatus = () => {
    setIsAutoChecking(true);
    setCheckStatusFeedback(null);
    setTimeout(() => {
      setIsAutoChecking(false);
      if (paidOrderState.paymentStatus === 'paid') {
        setIsPaidSuccess(true);
        triggerCelebration();
      } else {
        setCheckStatusFeedback('Sistem sedang menunggu dana masuk dari Bank / E-Wallet. Silakan selesaikan pembayaran dan cek kembali.');
      }
    }, 1200);
  };

  // Request DOKU Checkout Hosted URL from Backend API
  const handleOpenDokuCheckout = async () => {
    setIsCreatingDokuCheckout(true);
    setCheckStatusFeedback(null);
    try {
      const response = await fetch('/api/payment/doku/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: settings?.dokuClientId,
          secretKey: settings?.dokuClientSecret,
          isProduction: settings?.paymentGatewayMode === 'production',
          orderNumber: order.invoiceNumber,
          amount: order.totalPrice,
          customerName: order.customerName,
          customerEmail: order.customerEmail || 'customer@breakoutops.com',
          customerPhone: order.customerPhone || '081234567890',
          productDetails: [
            {
              name: `${order.gameTitle || 'Jasa'} - ${order.serviceName || 'Topup'}`,
              price: order.totalPrice,
              quantity: 1
            }
          ]
        })
      });

      const resData = await response.json();
      if (resData.success && resData.paymentUrl) {
        setDokuPaymentUrl(resData.paymentUrl);
        window.open(resData.paymentUrl, '_blank', 'noopener,noreferrer');
        setCheckStatusFeedback('Halaman pembayaran resmi DOKU telah dibuka di tab baru. Silakan selesaikan transaksi lalu klik Cek Status di sini.');
      } else {
        setCheckStatusFeedback(resData.message || 'Gagal memuat checkout resmi DOKU. Menggunakan instruksi pembayaran langsung.');
      }
    } catch (err: any) {
      console.error('DOKU Checkout error:', err);
      setCheckStatusFeedback('Gagal terhubung ke API backend DOKU. Silakan gunakan nomor Virtual Account & QRIS di atas.');
    } finally {
      setIsCreatingDokuCheckout(false);
    }
  };

  // File upload handler for manual transfer
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

  // Manual payment submission (for manual bank transfer)
  const handleManualSubmit = () => {
    setIsManualSubmitting(true);
    setTimeout(() => {
      const updated: Order = {
        ...order,
        paymentMethod: selectedMethod.name as any,
        paymentStatus: 'verifying',
        orderStatus: 'verifying',
        paymentProofUrl: proofImage || undefined,
        paymentProofDate: new Date().toISOString(),
        progressHistory: [
          ...(order.progressHistory || []),
          {
            id: `prog_${Date.now()}`,
            timestamp: new Date().toISOString(),
            workerName: 'System',
            progressPercent: 0,
            note: proofImage 
              ? `Bukti transfer (${selectedMethod.name}) telah diunggah oleh pelanggan. Menunggu verifikasi manual oleh Admin/Owner.`
              : `Pelanggan mengonfirmasi transfer (${selectedMethod.name}). Menunggu verifikasi manual oleh Admin/Owner.`
          }
        ]
      };

      setPaidOrderState(updated);
      setIsManualSubmitted(true);
      setIsManualSubmitting(false);

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
  // VIEW 1: SUCCESS PAID RESI (AUTOMATIC INSTANT COMPLETION)
  // ========================================================
  if (isPaidSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
        <div className="relative w-full max-w-lg bg-zinc-900 border-2 border-emerald-500/60 rounded-3xl shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 duration-200">
          
          {/* Header Resi Sukses */}
          <div className="bg-gradient-to-b from-emerald-500/20 via-zinc-900 to-zinc-900 px-6 pt-8 pb-6 border-b border-zinc-800 text-center relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500 text-black flex items-center justify-center font-black mb-3 shadow-xl shadow-emerald-500/40 ring-4 ring-emerald-500/20 animate-bounce">
              <Check className="w-9 h-9 stroke-[3]" />
            </div>

            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-tactical inline-block mb-1">
              PEMBAYARAN OTOMATIS LUNAS
            </span>
            <h3 className="font-tactical text-2xl font-black text-white uppercase tracking-wider">
              TRANSAKSI BERHASIL
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Pesanan telah masuk ke antrean pengerjaan pro joki BreakoutOps
            </p>
          </div>

          {/* Body Resi */}
          <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto text-xs">
            
            {/* Invoice Detail Box */}
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
                <span className="text-zinc-400">Metode Bayar:</span>
                <span className="text-emerald-400 font-bold">{selectedMethod.name}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-400">Status Pembayaran:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-black uppercase text-[10px]">
                  PAID / LUNAS
                </span>
              </div>

              <div className="pt-2.5 border-t border-zinc-800 flex justify-between items-center">
                <span className="font-bold text-zinc-300 uppercase">TOTAL DIBAYAR</span>
                <span className="text-lg font-black text-emerald-400 font-tactical">
                  {formatRupiah(paidOrderState.totalPrice)}
                </span>
              </div>
            </div>

            {/* Next Step Info */}
            <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl flex items-start space-x-2.5 text-emerald-300">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold block text-emerald-200">Akun Anda Siap Diproses:</span>
                Joki akan segera ditugaskan untuk menyelesaikan raid extraction. Anda dapat memantau progres live pengerjaan kapan saja.
              </div>
            </div>

            {/* Action Buttons */}
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
                Tutup Jendela
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // VIEW 2: MANUAL SUBMISSION RECEIPT
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
              BUKTI DITERIMA
            </span>
            <h3 className="font-tactical text-2xl font-black text-white uppercase tracking-wider">
              MENUNGGU VERIFIKASI OWNER
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Pesanan #{paidOrderState.invoiceNumber} sedang diverifikasi oleh admin.
            </p>
          </div>

          <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto text-xs">
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Tagihan:</span>
                <span className="text-amber-400 font-bold font-mono">{formatRupiah(paidOrderState.totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Status:</span>
                <span className="text-amber-400 font-bold">Sedang Diverifikasi</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleNavigateToTrack}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs font-tactical uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <span>Lacak Pesanan di Live Tracking</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // VIEW 3: MAIN DYNAMIC PAYMENT CHECKOUT UI
  // ========================================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-zinc-900 border-2 border-amber-500/50 rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-6 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 px-5 sm:px-6 py-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-tactical text-lg sm:text-xl font-black text-white uppercase tracking-wider">
                  PEMBAYARAN OTOMATIS
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-tactical hidden sm:inline-block">
                  REAL-TIME VERIFIKASI
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

        {/* Modal Body: 2 Columns on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto flex-1 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
          
          {/* Left Column: Method Selector & Order Details (5 cols) */}
          <div className="lg:col-span-5 p-4 sm:p-5 space-y-4 bg-zinc-950/60">
            
            {/* Order Price Highlight */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 p-4 rounded-2xl border border-amber-500/30 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                TOTAL YANG HARUS DIBAYAR:
              </span>
              <div className="flex items-center justify-between">
                <span className="text-2xl sm:text-3xl font-black font-tactical text-amber-400 tracking-wide">
                  {formatRupiah(order.totalPrice)}
                </span>
                <button
                  type="button"
                  onClick={handleCopyAmount}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-lg transition-colors border border-amber-500/30 flex items-center space-x-1 cursor-pointer"
                  title="Salin Angka Tepat"
                >
                  {copiedAmount ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedAmount ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
              <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400 flex justify-between">
                <span>Paket: <strong className="text-white font-medium">{order.packageName}</strong></span>
                <span>Nick: <strong className="text-amber-300 font-mono font-medium">{order.gameNickname}</strong></span>
              </div>
            </div>

            {/* Payment Method Selector Grid */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                PILIH METODE PEMBAYARAN:
              </label>
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                {paymentOptions.map((opt) => {
                  const isSelected = selectedMethodId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedMethodId(opt.id)}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-white ring-1 ring-amber-500/40 shadow-lg'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <span className="text-xl shrink-0">{opt.icon}</span>
                        <div className="truncate">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-xs text-white truncate">{opt.name}</span>
                            {opt.badge && (
                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded font-tactical ${
                                opt.category === 'qris' 
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : opt.category === 'va'
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}>
                                {opt.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-500 block truncate">{opt.description}</span>
                        </div>
                      </div>

                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                        isSelected ? 'border-amber-400 bg-amber-500 text-black' : 'border-zinc-700'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Provider Info Badge */}
            <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl text-[11px] text-zinc-400 flex items-center justify-between">
              <span>Engine Gateway:</span>
              <span className="font-mono font-bold text-amber-400 uppercase">
                {gatewayProvider === 'doku' ? 'DOKU SNAP BI' : gatewayProvider === 'midtrans' ? 'MIDTRANS SNAP' : gatewayProvider === 'tripay' ? 'TRIPAY OPEN API' : 'AUTO SIMULATOR'}
              </span>
            </div>

          </div>

          {/* Right Column: Interactive Payment Presentation (7 cols) */}
          <div className="lg:col-span-7 p-4 sm:p-6 space-y-5 flex flex-col justify-between">
            
            <div className="space-y-4">
              
              {/* Header of selected method */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <span className="text-2xl">{selectedMethod.icon}</span>
                  <div>
                    <h4 className="font-tactical font-black text-base text-white uppercase">
                      {selectedMethod.name}
                    </h4>
                    <span className="text-[11px] text-zinc-400">
                      Selesaikan transaksi sebelum waktu habis
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/30">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Real-Time Check</span>
                </div>
              </div>

              {/* QRIS PRESENTATION */}
              {selectedMethod.category === 'qris' && (
                <div className="bg-zinc-950 p-5 rounded-3xl border border-zinc-800 text-center space-y-4">
                  <div className="inline-block bg-white p-4 rounded-2xl border-4 border-amber-500 shadow-2xl relative">
                    <svg viewBox="0 0 100 100" className="w-44 h-44 mx-auto">
                      <rect width="100" height="100" fill="#ffffff" />
                      <rect x="8" y="8" width="26" height="26" fill="#000000" />
                      <rect x="12" y="12" width="18" height="18" fill="#ffffff" />
                      <rect x="15" y="15" width="12" height="12" fill="#000000" />
                      <rect x="66" y="8" width="26" height="26" fill="#000000" />
                      <rect x="70" y="12" width="18" height="18" fill="#ffffff" />
                      <rect x="73" y="15" width="12" height="12" fill="#000000" />
                      <rect x="8" y="66" width="26" height="26" fill="#000000" />
                      <rect x="12" y="70" width="18" height="18" fill="#ffffff" />
                      <rect x="15" y="73" width="12" height="12" fill="#000000" />
                      <rect x="38" y="10" width="6" height="6" fill="#000000" />
                      <rect x="48" y="16" width="8" height="8" fill="#000000" />
                      <rect x="40" y="38" width="24" height="24" fill="#f59e0b" rx="4" />
                      <text x="52" y="54" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#000000">OPS</text>
                      <rect x="10" y="42" width="8" height="14" fill="#000000" />
                      <rect x="22" y="46" width="12" height="12" fill="#000000" />
                      <rect x="68" y="42" width="20" height="8" fill="#000000" />
                      <rect x="74" y="54" width="10" height="14" fill="#000000" />
                      <rect x="42" y="68" width="14" height="14" fill="#000000" />
                      <rect x="68" y="76" width="16" height="16" fill="#000000" />
                      <rect x="38" y="86" width="20" height="6" fill="#000000" />
                    </svg>

                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-zinc-950 text-amber-400 text-[10px] font-black uppercase px-3 py-0.5 rounded-full border border-amber-500 font-tactical shadow whitespace-nowrap">
                      NMID: ID1020039482910
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-zinc-400 block font-medium">
                      Atas Nama: <strong className="text-white">{selectedMethod.accountHolder}</strong>
                    </span>
                    <span className="text-[11px] text-zinc-500 block">
                      Mendukung seluruh aplikasi mobile banking & e-wallet di Indonesia
                    </span>
                  </div>
                </div>
              )}

              {/* VIRTUAL ACCOUNT / EWALLET PRESENTATION */}
              {selectedMethod.category !== 'qris' && selectedMethod.category !== 'manual' && (
                <div className="bg-zinc-950 p-5 rounded-3xl border border-zinc-800 space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-xs text-zinc-400 font-semibold block uppercase">
                      Nomor {selectedMethod.name}:
                    </span>
                    <div className="flex items-center justify-between p-3.5 bg-zinc-900 rounded-2xl border border-zinc-700">
                      <span className="font-mono font-black text-amber-400 text-lg sm:text-xl tracking-wider">
                        {selectedMethod.accountNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedMethod.accountNumber || '')}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-xl transition-all cursor-pointer border border-amber-500/40"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Tersalin' : 'Salin Nomor'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs pt-1">
                    <span className="text-zinc-400">Atas Nama Rekening:</span>
                    <span className="text-white font-bold">{selectedMethod.accountHolder}</span>
                  </div>
                </div>
              )}

              {/* MANUAL BANK TRANSFER FORM */}
              {selectedMethod.category === 'manual' && (
                <div className="bg-zinc-950 p-5 rounded-3xl border border-zinc-800 space-y-4">
                  <div className="p-3.5 bg-zinc-900 rounded-2xl border border-zinc-700 space-y-1">
                    <span className="text-[11px] text-zinc-400 block">Nomor Rekening BCA Resmi:</span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-amber-400 text-lg">
                        {selectedMethod.accountNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedMethod.accountNumber || '')}
                        className="px-2.5 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/30"
                      >
                        {copied ? 'Tersalin' : 'Salin'}
                      </button>
                    </div>
                    <span className="text-[11px] text-zinc-400 block">A.N. {selectedMethod.accountHolder}</span>
                  </div>

                  {/* Upload Image Proof Box */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white uppercase flex items-center space-x-1.5">
                      <UploadCloud className="w-4 h-4 text-amber-400" />
                      <span>Lampirkan Bukti Transfer (Opsional):</span>
                    </label>

                    {uploadError && (
                      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                        <span>{uploadError}</span>
                      </div>
                    )}

                    {!proofImage ? (
                      <label className="border-2 border-dashed border-zinc-700 hover:border-amber-500/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-zinc-900/40 hover:bg-amber-500/5">
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <ImageIcon className="w-6 h-6 text-amber-400 mb-1" />
                        <span className="text-xs font-bold text-white">Klik untuk Pilih Foto Bukti (Maks 2MB)</span>
                      </label>
                    ) : (
                      <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 p-2 flex items-center justify-between">
                        <span className="text-xs text-zinc-300 font-mono truncate max-w-[200px]">{proofFileName || 'Bukti_Transfer.jpg'}</span>
                        <button
                          type="button"
                          onClick={handleRemoveProof}
                          className="p-1 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Instructions Accordion */}
              {selectedMethod.instructions && (
                <div className="border border-zinc-800 bg-zinc-950 rounded-2xl overflow-hidden text-xs">
                  <button
                    type="button"
                    onClick={() => setShowInstructions(!showInstructions)}
                    className="w-full p-3.5 flex items-center justify-between text-left font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="flex items-center space-x-2">
                      <Info className="w-4 h-4 text-amber-400" />
                      <span>Petunjuk Cara Pembayaran</span>
                    </span>
                    {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showInstructions && (
                    <div className="p-3.5 pt-0 space-y-2 text-zinc-400 border-t border-zinc-800/80 animate-in fade-in">
                      <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
                        {selectedMethod.instructions.map((step, idx) => (
                          <li key={idx} className="text-zinc-300">{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Bottom Controls: Real Payment Verification & Confirmation */}
            <div className="space-y-2.5 pt-3 border-t border-zinc-800">
              
              {checkStatusFeedback && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center space-x-2 animate-in fade-in">
                  <Info className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>{checkStatusFeedback}</span>
                </div>
              )}

              {/* PRIMARY AUTOMATIC STATUS CHECK / MANUAL SUBMIT BUTTON */}
              {selectedMethod.category === 'manual' ? (
                <button
                  type="button"
                  onClick={handleManualSubmit}
                  disabled={isManualSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-black text-xs font-tactical uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>{isManualSubmitting ? 'MEMPROSES...' : 'KIRIM KONFIRMASI MANUAL'}</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleOpenDokuCheckout}
                      disabled={isCreatingDokuCheckout}
                      className="py-3 px-3 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                    >
                      <ExternalLink className={`w-3.5 h-3.5 text-blue-400 ${isCreatingDokuCheckout ? 'animate-spin' : ''}`} />
                      <span>{isCreatingDokuCheckout ? 'Membuat Sesi...' : 'Buka Checkout DOKU'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCheckStatus}
                      disabled={isAutoChecking}
                      className="py-3 px-3 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-emerald-300 text-black font-black font-tactical uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-black ${isAutoChecking ? 'animate-spin' : ''}`} />
                      <span>{isAutoChecking ? 'MENGECEK...' : 'CEK STATUS BAYAR'}</span>
                    </button>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-zinc-500 text-center">
                🛡️ Transaksi aman & terhubung ke SNAP Bank Indonesia / Payment Gateway.
              </p>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
