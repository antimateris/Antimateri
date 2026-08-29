import React, { useState, useEffect } from 'react';
import { 
  X, 
  QrCode, 
  CheckCircle2, 
  Copy, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  ExternalLink,
  MessageCircle,
  RefreshCw,
  Wallet,
  Building2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order, SystemSettings } from '../types';
import { formatRupiah, getPaymentMethodLabel, getWhatsAppDirectUrl } from '../utils/helpers';

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
  const handleTracking = (invoice: string) => {
    if (onGoToTracking) {
      onGoToTracking(invoice);
    } else if (onOpenTracking) {
      onOpenTracking(invoice);
    }
  };
  const [copied, setCopied] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isPaid, setIsPaid] = useState<boolean>(order.paymentStatus === 'paid');
  const [timeLeft, setTimeLeft] = useState<number>(899); // 15 mins countdown

  // Countdown timer
  useEffect(() => {
    if (isPaid) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaid]);

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

  // Simulate payment confirmation
  const handleSimulatePayment = () => {
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      setIsPaid(true);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      const updatedOrder: Order = {
        ...order,
        paymentStatus: 'paid',
        orderStatus: 'queued',
        paidAt: new Date().toISOString(),
      };

      onPaymentSuccess(updatedOrder);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-tactical font-black">
              💰
            </div>
            <div>
              <h3 className="font-tactical text-lg font-bold text-white uppercase tracking-wider">
                {isPaid ? 'PEMBAYARAN BERHASIL' : 'GERBANG PEMBAYARAN OTOMATIS'}
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                Invoice: <span className="text-amber-400 font-bold">{order.invoiceNumber}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* If already paid */}
          {isPaid ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/20 animate-bounce">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div>
                <h4 className="text-xl font-bold font-tactical text-white uppercase">
                  PEMBAYARAN DITERIMA & TERVERIFIKASI!
                </h4>
                <p className="text-xs text-zinc-300 mt-1 max-w-sm mx-auto">
                  Pesanan Anda telah masuk ke dalam antrean joki. Notifikasi konfirmasi dan link pelacakan real-time telah dikirimkan ke WhatsApp Anda.
                </p>
              </div>

              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-left space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Layanan:</span>
                  <span className="text-white font-semibold">{order.packageName}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Nickname Game:</span>
                  <span className="text-amber-400 font-bold">{order.gameNickname}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Total Terbayar:</span>
                  <span className="text-emerald-400 font-bold">{formatRupiah(order.totalPrice)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Status Joki:</span>
                  <span className="text-purple-400 font-bold">Dalam Antrean Pro Joki</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  onClick={() => handleTracking(order.invoiceNumber)}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold font-tactical uppercase text-sm rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Lacak Progres Joki Live
                </button>

                <a
                  href={getWhatsAppDirectUrl(
                    settings?.whatsappCSNumber || '6282198765432',
                    `Halo CS BreakoutOps, saya sudah bayar pesanan invoice ${order.invoiceNumber} (${order.packageName}) untuk nickname ${order.gameNickname}. Mohon segera diproses ya!`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center space-x-1.5 px-4 py-3 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Konfirmasi WA</span>
                </a>
              </div>
            </div>
          ) : (
            <>
              {/* Payment Countdown & Amount Box */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-400">Total Nominal Pembayaran:</span>
                  <div className="text-2xl font-black font-tactical text-amber-400">
                    {formatRupiah(order.totalPrice)}
                  </div>
                  <span className="text-[11px] text-zinc-500">
                    Metode: {getPaymentMethodLabel(order.paymentMethod)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Sisa Waktu Bayar:</span>
                  <div className="inline-flex items-center space-x-1 text-rose-400 font-mono font-bold text-sm bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTimer(timeLeft)}</span>
                  </div>
                </div>
              </div>

              {/* QRIS / Virtual Account Display */}
              {order.paymentMethod === 'qris' ? (
                <div className="bg-white text-zinc-950 p-5 rounded-2xl border-4 border-amber-500 text-center space-y-3">
                  <div className="flex items-center justify-between border-b pb-2 text-xs font-bold text-zinc-700">
                    <span>QRIS STANDAR PEMBAYARAN NASIONAL</span>
                    <span className="text-amber-600">BREAKOUTOPS STORE</span>
                  </div>

                  {/* QR Code Graphic Generator Simulation */}
                  <div className="bg-zinc-100 p-4 rounded-xl inline-block border-2 border-zinc-800 shadow-inner">
                    <svg viewBox="0 0 100 100" className="w-44 h-44 mx-auto">
                      <rect width="100" height="100" fill="#ffffff" />
                      {/* Top Left Marker */}
                      <rect x="10" y="10" width="25" height="25" fill="#000000" />
                      <rect x="15" y="15" width="15" height="15" fill="#ffffff" />
                      <rect x="18" y="18" width="9" height="9" fill="#000000" />
                      {/* Top Right Marker */}
                      <rect x="65" y="10" width="25" height="25" fill="#000000" />
                      <rect x="70" y="15" width="15" height="15" fill="#ffffff" />
                      <rect x="73" y="18" width="9" height="9" fill="#000000" />
                      {/* Bottom Left Marker */}
                      <rect x="10" y="65" width="25" height="25" fill="#000000" />
                      <rect x="15" y="70" width="15" height="15" fill="#ffffff" />
                      <rect x="18" y="73" width="9" height="9" fill="#000000" />
                      {/* Random Data matrix modules */}
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

                  <p className="text-xs text-zinc-600 font-medium">
                    Buka BCA Mobile, GoPay, OVO, DANA, ShopeePay, atau Livin Mandiri lalu scan QRIS di atas.
                  </p>
                </div>
              ) : (
                /* Bank VA / E-wallet Number */
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400 font-medium">
                      Nomor Virtual Account / Rekening:
                    </span>
                    <span className="text-[11px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded">
                      Cek Otomatis 24 Jam
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-zinc-900 p-3 rounded-lg border border-zinc-700">
                    <span className="font-mono text-base sm:text-lg font-bold text-white tracking-wider">
                      {order.paymentMethod === 'bca' ? '88012998349102' :
                       order.paymentMethod === 'mandiri' ? '89920188291039' :
                       order.paymentMethod === 'bni' ? '98801928371029' :
                       order.paymentMethod === 'dana' ? '082198765432' : '88701928374650'}
                    </span>
                    <button
                      onClick={() => handleCopy(
                        order.paymentMethod === 'bca' ? '88012998349102' : '89920188291039'
                      )}
                      className="flex items-center space-x-1 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? 'Tersalin!' : 'Salin'}</span>
                    </button>
                  </div>

                  <div className="text-[11px] text-zinc-400 bg-zinc-900/50 p-2.5 rounded border border-zinc-800">
                    ⚠️ Pastikan transfer tepat hingga 3 digit terakhir (<span className="text-amber-400 font-bold">+{order.uniqueCode}</span>) agar transaksi langsung diverifikasi otomatis oleh sistem API kami.
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  id="btn-simulate-pay-success"
                  disabled={isVerifying}
                  onClick={handleSimulatePayment}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-extrabold font-tactical uppercase text-sm rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi Mutasi Bank / QRIS...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Simulasi Selesaikan Pembayaran (Instant Auto-Verify)</span>
                    </>
                  )}
                </button>

                <div className="flex justify-between items-center text-xs text-zinc-500 px-1">
                  <span>🔒 Enkripsi API Pembayaran Terintegrasi</span>
                  <button
                    onClick={onClose}
                    className="text-zinc-400 hover:text-white underline cursor-pointer"
                  >
                    Bayar Nanti (Simpan Invoice)
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
