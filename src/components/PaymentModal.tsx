import React, { useState, useEffect } from 'react';
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
  Wallet
} from 'lucide-react';
import { Order, SystemSettings } from '../types';
import { formatRupiah, formatDate, getWhatsAppDirectUrl } from '../utils/helpers';

interface PaymentModalProps {
  order: Order;
  settings?: SystemSettings;
  onClose: () => void;
  onPaymentSuccess?: (paidOrder: Order) => void;
  onGoToTracking?: (invoice: string) => void;
  onOpenTracking?: (invoice: string) => void;
}

type PaymentMethodType = 'qris' | 'bca' | 'mandiri' | 'bni' | 'dana' | 'gopay' | 'ovo';

interface PaymentOption {
  id: PaymentMethodType;
  name: string;
  category: 'qris' | 'bank' | 'ewallet';
  icon: string;
  description: string;
  accountNumber?: string;
  accountHolder?: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  order,
  settings,
  onClose,
  onPaymentSuccess,
  onGoToTracking,
  onOpenTracking,
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(899);
  
  // File upload state for Payment Proof
  const [proofImage, setProofImage] = useState<string | null>(order.paymentProofUrl || null);
  const [proofFileName, setProofFileName] = useState<string>('');
  const [proofFileSize, setProofFileSize] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(order.paymentStatus === 'verifying');
  const [submittedOrder, setSubmittedOrder] = useState<Order>(order);

  const paymentOptions: PaymentOption[] = [
    {
      id: 'qris',
      name: 'QRIS Real-Time',
      category: 'qris',
      icon: '📱',
      description: 'Scan BCA, Mandiri, GoPay, OVO, Dana, ShopeePay',
      accountNumber: 'NMID: ID1020039482910',
      accountHolder: 'ARENA BREAKOUT OPS STORE'
    },
    {
      id: 'bca',
      name: 'BCA Transfer',
      category: 'bank',
      icon: '🏦',
      description: 'Bank Central Asia',
      accountNumber: '8801299834',
      accountHolder: 'OPS STORE OFFICIAL'
    },
    {
      id: 'mandiri',
      name: 'Mandiri Transfer',
      category: 'bank',
      icon: '🏦',
      description: 'Bank Mandiri Indonesia',
      accountNumber: '8992018829103',
      accountHolder: 'OPS STORE OFFICIAL'
    },
    {
      id: 'bni',
      name: 'BNI Transfer',
      category: 'bank',
      icon: '🏦',
      description: 'Bank Negara Indonesia',
      accountNumber: '9880192837',
      accountHolder: 'OPS STORE OFFICIAL'
    },
    {
      id: 'dana',
      name: 'DANA E-Wallet',
      category: 'ewallet',
      icon: '💳',
      description: 'Transfer Saldo DANA',
      accountNumber: '082198765432',
      accountHolder: 'OPS STORE OFFICIAL'
    },
    {
      id: 'gopay',
      name: 'GoPay',
      category: 'ewallet',
      icon: '💳',
      description: 'Transfer Saldo GoPay',
      accountNumber: '082198765432',
      accountHolder: 'OPS STORE OFFICIAL'
    },
    {
      id: 'ovo',
      name: 'OVO Cash',
      category: 'ewallet',
      icon: '💳',
      description: 'Transfer Saldo OVO',
      accountNumber: '082198765432',
      accountHolder: 'OPS STORE OFFICIAL'
    }
  ];

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

  const getSelectedMethodDetails = () => {
    return paymentOptions.find(opt => opt.id === selectedPaymentMethod);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setUploadError('File harus berupa foto/gambar (JPG, PNG, WEBP).');
      return;
    }

    // Check file size (max 2MB = 2 * 1024 * 1024 bytes)
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

  const handleConfirmPayment = () => {
    setUploadError(null);

    // Anti-spam cooldown check
    const lastSubmitTime = localStorage.getItem('breakoutops_last_payment_submit');
    if (lastSubmitTime) {
      const elapsed = Math.floor((Date.now() - parseInt(lastSubmitTime, 10)) / 1000);
      if (elapsed < 8) {
        setUploadError('Mohon tunggu beberapa detik sebelum mengirim konfirmasi ulang.');
        return;
      }
    }

    setIsSubmitting(true);
    localStorage.setItem('breakoutops_last_payment_submit', Date.now().toString());

    setTimeout(() => {
      const updated: Order = {
        ...order,
        paymentMethod: selectedPaymentMethod || 'manual',
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
              ? `Bukti transfer (${selectedMethod?.name || 'Transfer'}) telah diunggah oleh pelanggan. Menunggu verifikasi asli/tidaknya oleh Superadmin.`
              : `Pelanggan mengonfirmasi pembayaran (${selectedMethod?.name || 'Transfer'}) tanpa bukti gambar. Menunggu verifikasi asli/tidaknya oleh Superadmin.`
          }
        ]
      };

      setSubmittedOrder(updated);
      setIsSubmitted(true);
      setIsSubmitting(false);

      if (onPaymentSuccess) {
        onPaymentSuccess(updated);
      }
    }, 500);
  };

  const handleNavigateToTrack = () => {
    onClose();
    if (onGoToTracking) {
      onGoToTracking(submittedOrder.invoiceNumber);
    } else if (onOpenTracking) {
      onOpenTracking(submittedOrder.invoiceNumber);
    }
  };

  const selectedMethod = getSelectedMethodDetails();

  // ==========================================
  // VIEW 3: RESI & DETAIL TRANSAKSI RESMI
  // ==========================================
  if (isSubmitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <div className="relative w-full max-w-xl bg-zinc-900 border-2 border-amber-500/50 rounded-3xl shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 duration-200">
          
          {/* Header Resi */}
          <div className="bg-gradient-to-r from-amber-500/20 via-zinc-900 to-amber-500/20 px-6 py-6 border-b border-zinc-800 text-center relative">
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
              BUKTI PEMBAYARAN DITERIMA
            </span>
            <h3 className="font-tactical text-2xl font-black text-white uppercase tracking-wider">
              RESI TRANSAKSI RESMI
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Pesanan telah masuk ke antrean verifikasi manual Owner
            </p>
          </div>

          {/* Body Resi */}
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            
            {/* Status Banner */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center space-x-3.5">
              <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping shrink-0" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Status: Menunggu Verifikasi Manual Owner
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Owner sedang memeriksa bukti transfer Anda. Pesanan akan segera diproses setelah dana terkonfirmasi.
                </p>
              </div>
            </div>

            {/* Resi Invoice Box */}
            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <span className="text-zinc-400">Nomor Invoice Resi</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-black text-amber-400 text-sm">
                    {submittedOrder.invoiceNumber}
                  </span>
                  <button
                    onClick={() => handleCopy(submittedOrder.invoiceNumber)}
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                    title="Salin Invoice"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-400">Waktu Order</span>
                <span className="text-zinc-200 font-mono">{formatDate(submittedOrder.createdAt)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-400">Layanan & Paket</span>
                <span className="text-white font-bold">{submittedOrder.packageName}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-400">Nickname Game</span>
                <span className="text-amber-300 font-bold font-mono">{submittedOrder.gameNickname}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-400">Metode Login</span>
                <span className="text-zinc-200">{submittedOrder.loginMethod}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-400">Nomor WhatsApp</span>
                <span className="text-zinc-200 font-mono">{submittedOrder.customerWhatsApp}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-400">Metode Pembayaran</span>
                <span className="text-amber-400 font-semibold">{selectedMethod?.name || 'Transfer Bank / E-Wallet'}</span>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-between items-center">
                <span className="text-xs uppercase font-bold text-zinc-300">TOTAL PEMBAYARAN</span>
                <span className="text-lg font-black text-amber-400 font-tactical">
                  {formatRupiah(submittedOrder.totalPrice)}
                </span>
              </div>
            </div>

            {/* Bukti Transaksi Attachment Preview */}
            {submittedOrder.paymentProofUrl && (
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-semibold flex items-center space-x-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Bukti Transfer Terlampir</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">✓ Terunggah (Maks 2MB)</span>
                </div>
                <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 flex items-center justify-center max-h-48">
                  <img
                    src={submittedOrder.paymentProofUrl}
                    alt="Bukti Transfer"
                    className="object-contain max-h-48 w-full"
                  />
                </div>
              </div>
            )}

            {/* Security Guarantee Note */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-[11px] text-emerald-300 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Keamanan Terjamin 100%:</span> Resi ini dapat Anda gunakan untuk melacak status pengerjaan joki secara real-time kapan saja di menu Lacak Pesanan.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleNavigateToTrack}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-sm font-tactical uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <span>Lacak Pesanan di Live Tracking</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                Tutup & Selesai
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 1: PILIH METODE PEMBAYARAN
  // ==========================================
  if (!selectedPaymentMethod) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
        <div className="relative w-full max-w-2xl bg-zinc-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="font-tactical text-xl font-bold text-white uppercase tracking-wider">
                Pilih Metode Pembayaran
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Invoice: <span className="text-amber-400 font-bold font-mono">{order.invoiceNumber}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Order Summary */}
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-sm space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Paket:</span>
                <span className="text-white font-semibold">{order.packageName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Nickname:</span>
                <span className="text-amber-400 font-bold font-mono">{order.gameNickname}</span>
              </div>
              <div className="border-t border-zinc-800 pt-2 flex justify-between font-bold">
                <span className="text-zinc-300 text-xs">Total Pembayaran:</span>
                <span className="text-amber-400 text-lg font-tactical">{formatRupiah(order.totalPrice)}</span>
              </div>
            </div>

            {/* Payment Methods Grid */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3">
                PILIH SALURAN PEMBAYARAN RESMI:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {paymentOptions.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    className="p-4 rounded-xl border-2 border-zinc-800 bg-zinc-950/60 hover:border-amber-500 hover:bg-amber-500/10 transition-all text-center space-y-2 group cursor-pointer"
                  >
                    <div className="text-3xl group-hover:scale-110 transition-transform">{method.icon}</div>
                    <div className="text-xs font-bold text-white">{method.name}</div>
                    <div className="text-[10px] text-zinc-400 line-clamp-2">{method.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-xs text-blue-200 flex items-center justify-between">
              <span>⏱️ Selesaikan pembayaran dalam:</span>
              <span className="font-mono font-bold text-amber-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                {formatTimer(timeLeft)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: INSTRUKSI PEMBAYARAN & FORM KONFIRMASI (BUKTI FOTO <= 2MB)
  // ==========================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="font-tactical text-xl font-bold text-white uppercase tracking-wider">
              Instruksi & Konfirmasi Pembayaran
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              {selectedMethod?.name} • Invoice: <span className="text-amber-400 font-bold font-mono">{order.invoiceNumber}</span>
            </p>
          </div>
          <button
            onClick={() => setSelectedPaymentMethod(null)}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Order Summary */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Total Yang Harus Ditransfer:</span>
              <span className="text-amber-400 font-black text-xl font-tactical">{formatRupiah(order.totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Metode Pilihan:</span>
              <span className="text-white font-semibold">{selectedMethod?.name}</span>
            </div>
          </div>

          {/* Transfer Instruction Box */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Detail Akun Tujuan Transfer</span>
            </h4>
            
            {selectedMethod?.id === 'qris' ? (
              <div className="space-y-3 text-center py-2">
                <p className="text-xs text-zinc-400">
                  Scan QR Code resmi dengan GoPay, OVO, Dana, BCA, atau Mobile Banking lainnya:
                </p>
                <div className="bg-white p-4 rounded-2xl inline-block border-4 border-amber-500 shadow-xl">
                  <svg viewBox="0 0 100 100" className="w-36 h-36">
                    <rect width="100" height="100" fill="#ffffff" />
                    <rect x="10" y="10" width="25" height="25" fill="#000000" />
                    <rect x="15" y="15" width="15" height="15" fill="#ffffff" />
                    <rect x="18" y="18" width="9" height="9" fill="#000000" />
                    <rect x="65" y="10" width="25" height="25" fill="#000000" />
                    <rect x="70" y="15" width="15" height="15" fill="#ffffff" />
                    <rect x="73" y="18" width="9" height="9" fill="#000000" />
                    <rect x="10" y="65" width="25" height="25" fill="#000000" />
                    <rect x="15" y="70" width="15" height="15" fill="#ffffff" />
                    <rect x="18" y="73" width="9" height="9" fill="#000000" />
                    <rect x="40" y="12" width="6" height="6" fill="#000000" />
                    <rect x="50" y="18" width="6" height="6" fill="#000000" />
                    <rect x="42" y="30" width="16" height="16" fill="#f59e0b" />
                    <rect x="12" y="42" width="6" height="16" fill="#000000" />
                    <rect x="25" y="45" width="10" height="10" fill="#000000" />
                    <rect x="70" y="45" width="18" height="6" fill="#000000" />
                    <rect x="75" y="55" width="8" height="12" fill="#000000" />
                    <rect x="45" y="65" width="12" height="12" fill="#000000" />
                    <rect x="65" y="75" width="15" height="15" fill="#000000" />
                    <rect x="40" y="82" width="18" height="8" fill="#000000" />
                  </svg>
                </div>
                <div className="text-[11px] text-zinc-400 font-mono">
                  A.N. <span className="text-white font-bold">{selectedMethod.accountHolder}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="bg-zinc-900 p-3.5 rounded-xl border border-zinc-700/80 space-y-1">
                  <div className="text-[11px] text-zinc-400">Nomor Rekening / Nomor E-Wallet:</div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-amber-400 text-base sm:text-lg tracking-wider">
                      {selectedMethod?.accountNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedMethod?.accountNumber || '')}
                      className="flex items-center space-x-1 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-lg transition-colors cursor-pointer border border-amber-500/30"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>
                  <div className="text-[11px] text-zinc-400 pt-1">
                    Atas Nama: <span className="text-white font-bold">{selectedMethod?.accountHolder}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Unggah Bukti Transaksi (Opsional) */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-1.5">
                <UploadCloud className="w-4 h-4 text-amber-400" />
                <span>UNGGAH BUKTI TRANSFER <span className="text-zinc-400 font-normal lowercase">(opsional)</span></span>
              </label>
              <span className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                Verifikasi Manual Superadmin
              </span>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{uploadError}</span>
              </div>
            )}

            {!proofImage ? (
              <label className="border-2 border-dashed border-zinc-700 hover:border-amber-500/60 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-zinc-900/40 hover:bg-amber-500/5">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-amber-400 mb-2">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-white">
                  Klik untuk Memilih Foto Bukti Transfer (Opsional)
                </span>
                <span className="text-[11px] text-zinc-500 mt-1">
                  Format JPG, PNG, atau WEBP • Ukuran maksimal 2MB (Bisa konfirmasi tanpa upload)
                </span>
              </label>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 flex items-center justify-center max-h-48 p-2">
                  <img
                    src={proofImage}
                    alt="Preview Bukti Transfer"
                    className="max-h-44 object-contain rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveProof}
                    className="absolute top-3 right-3 p-1.5 bg-black/80 hover:bg-rose-600 text-white rounded-lg transition-colors cursor-pointer"
                    title="Hapus / Ganti Foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-lg">
                  <span className="truncate max-w-[200px] font-mono text-zinc-300">{proofFileName || 'Bukti_Transfer.jpg'}</span>
                  <span className="text-amber-400 font-semibold">{proofFileSize || '< 2 MB'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            {/* Tombol KONFIRMASI PEMBAYARAN */}
            <button
              type="button"
              id="btn-confirm-payment"
              onClick={handleConfirmPayment}
              disabled={isSubmitting}
              className={`w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-black text-sm font-tactical uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 text-black" />
              <span>{isSubmitting ? 'MEMPROSES KONFIRMASI...' : 'KONFIRMASI PEMBAYARAN'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPaymentMethod(null)}
              className="w-full px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              Pilih Metode Pembayaran Lain
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-2 text-zinc-500 hover:text-zinc-300 text-xs transition-colors text-center"
            >
              Batal & Tutup
            </button>
          </div>

          {/* Timer footer */}
          <div className="text-center text-[11px] text-zinc-500 pt-1">
            ⏱️ Batas waktu pembayaran: <span className="text-amber-400 font-mono font-bold">{formatTimer(timeLeft)}</span>
          </div>

        </div>
      </div>
    </div>
  );
};
