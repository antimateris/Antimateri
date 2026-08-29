import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  AlertCircle, 
  MessageCircle,
  Copy,
  FileText,
  CheckCircle2
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

type PaymentMethodType = 'qris' | 'bca' | 'mandiri' | 'bni' | 'dana' | 'gopay' | 'ovo';

interface PaymentOption {
  id: PaymentMethodType;
  name: string;
  icon: string;
  description: string;
  accountNumber?: string;
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

  const paymentOptions: PaymentOption[] = [
    {
      id: 'qris',
      name: 'QRIS',
      icon: '📱',
      description: 'Scan dengan e-wallet apapun',
      accountNumber: 'QRIS_AUTO'
    },
    {
      id: 'bca',
      name: 'BCA Transfer',
      icon: '🏦',
      description: 'Transfer ke rekening BCA',
      accountNumber: '88012998349102'
    },
    {
      id: 'mandiri',
      name: 'Mandiri Transfer',
      icon: '🏦',
      description: 'Transfer ke rekening Mandiri',
      accountNumber: '89920188291039'
    },
    {
      id: 'bni',
      name: 'BNI Transfer',
      icon: '🏦',
      description: 'Transfer ke rekening BNI',
      accountNumber: '98801928371029'
    },
    {
      id: 'dana',
      name: 'DANA',
      icon: '💳',
      description: 'Transfer DANA ke nomor',
      accountNumber: '082198765432'
    },
    {
      id: 'gopay',
      name: 'GoPay',
      icon: '💳',
      description: 'Transfer GoPay',
      accountNumber: 'GOPAY_AUTO'
    },
    {
      id: 'ovo',
      name: 'OVO',
      icon: '💳',
      description: 'Transfer OVO',
      accountNumber: 'OVO_AUTO'
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

  const selectedMethod = getSelectedMethodDetails();

  // Step 1: Payment Method Selection
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
                Invoice: <span className="text-amber-400 font-bold">{order.invoiceNumber}</span>
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
              <div className="flex justify-between">
                <span className="text-zinc-400">Paket:</span>
                <span className="text-white font-semibold">{order.packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Nickname:</span>
                <span className="text-amber-400 font-bold">{order.gameNickname}</span>
              </div>
              <div className="border-t border-zinc-800 pt-2 flex justify-between font-bold">
                <span className="text-zinc-300">Total Pembayaran:</span>
                <span className="text-amber-400 text-lg">{formatRupiah(order.totalPrice)}</span>
              </div>
            </div>

            {/* Payment Methods Grid */}
            <div>
              <label className="block text-sm font-bold text-zinc-300 mb-3">
                Pilih Metode Pembayaran
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {paymentOptions.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    className="p-4 rounded-xl border-2 border-zinc-800 bg-zinc-950/60 hover:border-amber-500 hover:bg-amber-500/10 transition-all text-center space-y-2"
                  >
                    <div className="text-3xl">{method.icon}</div>
                    <div className="text-xs font-bold text-white">{method.name}</div>
                    <div className="text-[10px] text-zinc-400">{method.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-xs text-blue-200">
              ⏱️ Waktu kadaluarsa: <span className="font-bold">{formatTimer(timeLeft)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Payment Details
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="font-tactical text-xl font-bold text-white uppercase tracking-wider">
              Instruksi Pembayaran
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              {selectedMethod?.name} • Invoice: <span className="text-amber-400 font-bold">{order.invoiceNumber}</span>
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
        <div className="p-6 space-y-4">
          
          {/* Order Summary */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">Total Pembayaran:</span>
              <span className="text-amber-400 font-black text-lg">{formatRupiah(order.totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Metode:</span>
              <span className="text-white font-semibold">{selectedMethod?.name}</span>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
            <h4 className="text-sm font-bold text-white">Instruksi Transfer</h4>
            
            {selectedMethod?.id === 'qris' ? (
              <div className="space-y-3 text-center">
                <p className="text-xs text-zinc-400">
                  Scan QR Code dengan aplikasi e-wallet Anda
                </p>
                <div className="bg-white p-4 rounded-lg inline-block border-4 border-amber-500">
                  <svg viewBox="0 0 100 100" className="w-32 h-32">
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
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-zinc-400">
                  Transfer ke rekening di bawah:
                </p>
                <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-700 space-y-1">
                  <div className="text-xs text-zinc-400">Nomor Rekening / VA</div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white">{selectedMethod?.accountNumber}</span>
                    <button
                      onClick={() => handleCopy(selectedMethod?.accountNumber || '')}
                      className="flex items-center space-x-1 px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copied ? '✓' : 'Salin'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Important Info */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-200 space-y-1">
            <p className="font-semibold">⚠️ Penting!</p>
            <ul className="list-disc list-inside space-y-0.5 text-amber-100">
              <li>Lakukan transfer sesuai jumlah di atas</li>
              <li>Owner akan verifikasi secara manual</li>
              <li>Hubungi Owner jika ada kesalahan transfer</li>
            </ul>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-xs text-blue-200 space-y-2">
            <p className="font-semibold">✓ Langkah Selanjutnya</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Lakukan pembayaran</li>
              <li>Hubungi Owner via WhatsApp untuk verifikasi</li>
              <li>Tunggu konfirmasi dan pesanan dimulai</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <a
              href={getWhatsAppDirectUrl(
                settings?.whatsappCSNumber || '6282198765432',
                `Halo Owner, saya mau membayar pesanan:\n\n📋 Invoice: ${order.invoiceNumber}\n📦 Paket: ${order.packageName}\n💰 Total: ${formatRupiah(order.totalPrice)}\n💳 Metode: ${selectedMethod?.name}\n\nSudah saya transfer. Mohon verifikasi ya!`
              )}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-500 text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-lg shadow-green-600/20"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Hubungi Owner via WhatsApp</span>
            </a>

            <button
              onClick={() => setSelectedPaymentMethod(null)}
              className="w-full px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm rounded-xl transition-all"
            >
              Kembali Pilih Metode Lain
            </button>

            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-zinc-400 hover:text-white text-sm transition-colors"
            >
              Tutup
            </button>
          </div>

          {/* Timer */}
          <div className="text-center text-xs text-zinc-400">
            ⏱️ Waktu kadaluarsa: <span className="text-amber-400 font-bold">{formatTimer(timeLeft)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
