import React, { useState, useEffect } from 'react';
import { 
  X, 
  QrCode, 
  Clock, 
  AlertCircle, 
  MessageCircle,
  Copy,
  FileText
} from 'lucide-react';
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
  const [timeLeft, setTimeLeft] = useState<number>(899); // 15 mins countdown

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
                INSTRUKSI PEMBAYARAN
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
          
          {/* Payment Status Card */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-amber-500/30 space-y-3">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">Status Pembayaran: Menunggu Konfirmasi</h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Pesanan Anda telah dibuat. Silakan transfer sesuai instruksi di bawah, lalu hubungi owner untuk verifikasi pembayaran.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
            <h4 className="text-sm font-bold text-white">Ringkasan Pesanan</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Layanan:</span>
                <span className="text-white font-semibold">{order.packageName}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Nickname Game:</span>
                <span className="text-amber-400 font-bold">{order.gameNickname}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Metode Pembayaran:</span>
                <span className="text-white font-semibold">{getPaymentMethodLabel(order.paymentMethod)}</span>
              </div>
              <div className="border-t border-zinc-800 pt-2 flex justify-between">
                <span className="text-zinc-300 font-medium">Total Pembayaran:</span>
                <span className="text-xl font-black text-amber-400">{formatRupiah(order.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
            <h4 className="text-sm font-bold text-white">Instruksi Pembayaran</h4>
            
            {order.paymentMethod === 'qris' ? (
              <div className="space-y-3">
                <p className="text-xs text-zinc-400">
                  Scan QR Code di bawah menggunakan aplikasi e-wallet Anda (GoPay, OVO, DANA, ShopeePay, atau Livin).
                </p>
                
                {/* QR Code Graphic */}
                <div className="bg-white p-4 rounded-xl inline-block border-2 border-amber-500 shadow-lg shadow-amber-500/20 mx-auto block">
                  <svg viewBox="0 0 100 100" className="w-40 h-40 mx-auto">
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
                    {/* Data matrix modules */}
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

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 text-xs text-amber-200">
                  <p className="font-semibold">💡 Tip: Scan QR Code untuk kemudahan pembayaran instan.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-zinc-400">
                  Transfer ke nomor rekening / Virtual Account di bawah:
                </p>

                <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-700 space-y-2">
                  <div className="text-xs">
                    <div className="text-zinc-400 mb-1">Nomor Rekening / VA:</div>
                    <div className="flex items-center justify-between bg-zinc-800 p-2.5 rounded border border-zinc-600">
                      <span className="font-mono text-sm font-bold text-white">
                        {order.paymentMethod === 'bca' ? '88012998349102' :
                         order.paymentMethod === 'mandiri' ? '89920188291039' :
                         order.paymentMethod === 'bni' ? '98801928371029' :
                         order.paymentMethod === 'dana' ? '082198765432' : '88701928374650'}
                      </span>
                      <button
                        onClick={() => handleCopy(
                          order.paymentMethod === 'bca' ? '88012998349102' :
                          order.paymentMethod === 'mandiri' ? '89920188291039' : '88701928374650'
                        )}
                        className="flex items-center space-x-1 px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copied ? '✓' : 'Salin'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-zinc-400 bg-zinc-950 p-2 rounded border border-zinc-700">
                    ⚠️ Penting: Pastikan 3 digit akhir adalah <span className="text-amber-400 font-bold">+{order.uniqueCode}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 space-y-2">
            <h4 className="text-sm font-bold text-blue-300">Langkah Selanjutnya</h4>
            <ol className="text-xs text-blue-200 space-y-1 ml-3 list-decimal">
              <li>Lakukan pembayaran sesuai instruksi di atas</li>
              <li>Hubungi Owner/CS untuk verifikasi pembayaran</li>
              <li>Tunggu konfirmasi bahwa pembayaran sudah diterima</li>
              <li>Pesanan akan diproses setelah verifikasi selesai</li>
            </ol>
          </div>

          {/* Contact Owner Button */}
          <div className="space-y-2">
            <a
              href={getWhatsAppDirectUrl(
                settings?.whatsappCSNumber || '6282198765432',
                `Halo Owner BreakoutOps, saya ingin melakukan pembayaran untuk pesanan:\n\n📋 Invoice: ${order.invoiceNumber}\n📦 Paket: ${order.packageName}\n💰 Total: ${formatRupiah(order.totalPrice)}\n🎮 Nickname: ${order.gameNickname}\n\nMohon instruksi pembayaran lebih lanjut. Terima kasih!`
              )}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-500 text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-lg shadow-green-600/20"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Hubungi Owner via WhatsApp</span>
            </a>

            <button
              onClick={() => handleTracking(order.invoiceNumber)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm rounded-xl transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Lihat Detail Pesanan</span>
            </button>

            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-zinc-400 hover:text-white text-sm transition-colors"
            >
              Tutup
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-xs text-zinc-400 space-y-1">
            <p>⏱️ Waktu kadaluarsa pembayaran: <span className="text-amber-400 font-bold">{formatTimer(timeLeft)}</span></p>
            <p>📞 CS BreakoutOps siap membantu Anda 24/7</p>
          </div>
        </div>
      </div>
    </div>
  );
};
