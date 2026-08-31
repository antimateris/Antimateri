import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Wrench, 
  Clock, 
  MessageCircle, 
  Search, 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  Headphones,
  X
} from 'lucide-react';
import { Order, SystemSettings } from '../types';
import { getWhatsAppDirectUrl } from '../utils/helpers';
import { TrackingPage } from './TrackingPage';

interface MaintenanceScreenProps {
  settings: SystemSettings;
  orders: Order[];
  onOpenAdminLogin: () => void;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({
  settings,
  orders = [],
  onOpenAdminLogin,
}) => {
  const [invoiceQuery, setInvoiceQuery] = useState('');
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [activeTrackingQuery, setActiveTrackingQuery] = useState('');

  const csUrl = getWhatsAppDirectUrl(
    settings.whatsappCSNumber,
    `Halo CS ${settings.storeName}, saya pengunjung website. Saya ingin menanyakan estimasi pemeliharaan server atau bantuan pesanan saya.`
  );

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveTrackingQuery(invoiceQuery.trim());
    setIsTrackingModalOpen(true);
  };

  const handleOpenTrackingModal = () => {
    setActiveTrackingQuery(invoiceQuery.trim());
    setIsTrackingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-amber-500 selection:text-black">
      {/* Tactical Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Ambient Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[540px] h-96 sm:h-[540px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-72 h-72 bg-amber-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Bar Header */}
      <header className="relative z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-tactical font-black text-sm shadow-md">
            BO
          </div>
          <div>
            <span className="font-tactical font-black text-sm sm:text-base tracking-wider text-slate-900">
              {settings.storeName.toUpperCase()}
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-300">
              SYSTEM MAINTENANCE
            </span>
          </div>
        </div>

        {/* Superadmin / Staff Login Shortcut */}
        <button
          type="button"
          onClick={onOpenAdminLogin}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-amber-400 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs"
        >
          <Lock className="w-3.5 h-3.5 text-amber-600" />
          <span>Login Staff / Admin</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-2xl bg-white border border-amber-300 rounded-3xl p-6 sm:p-10 shadow-xl backdrop-blur-xl text-center space-y-6">
          
          {/* Animated Tactical Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-amber-50 border border-amber-300 rounded-full text-amber-800 text-xs font-bold font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span>PEMELIHARAAN SISTEM TERJADWAL</span>
          </div>

          {/* Central Icon Graphics */}
          <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-3xl bg-amber-500/20 blur-xl animate-pulse" />
            <div className="relative w-full h-full rounded-3xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-600 shadow-inner">
              <Wrench className="w-10 h-10 sm:w-12 sm:h-12 animate-bounce" style={{ animationDuration: '2.5s' }} />
            </div>
          </div>

          {/* Title & Message */}
          <div className="space-y-3">
            <h1 className="font-tactical text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-wide uppercase">
              {settings.maintenanceTitle || 'PEMELIHARAAN SISTEM SEDANG BERLANGSUNG'}
            </h1>
            
            <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
              {settings.maintenanceMessage || 
                'Kami sedang melakukan optimasi server dan pembaruan sistem antrean joki Arena Breakout. Pembuatan pesanan baru dihentikan sementara demi keamanan transaksi.'}
            </p>
          </div>

          {/* Estimated Time Badge */}
          {settings.maintenanceEstimatedEnd && (
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-700 font-medium">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{settings.maintenanceEstimatedEnd}</span>
            </div>
          )}

          {/* Status Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">Order Sedang Jalan Tetap Aman</span>
                <span className="text-slate-500">Joki yang sedang raid di Kamona tetap diproses sampai target tuntas.</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start space-x-3">
              <Headphones className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">CS WhatsApp Selalu Siaga</span>
                <span className="text-slate-500">Jam operasional: {settings.csWorkingHours}</span>
              </div>
            </div>
          </div>

          {/* Interactive Fast-Track Search Form */}
          <form onSubmit={handleTrackSubmit} className="pt-2 text-left">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 uppercase tracking-wider">
                <Search className="w-3.5 h-3.5 text-amber-600" />
                <span>Lacak Status Resi Pesanan Aktif</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={invoiceQuery}
                  onChange={(e) => setInvoiceQuery(e.target.value)}
                  placeholder="Ketik Nomor Invoice (ABO-...) atau No. WhatsApp"
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-tactical font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shrink-0 flex items-center space-x-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Lacak</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                💡 Anda tetap bisa melihat live progres raid worker meskipun server sedang mode maintenance.
              </p>
            </div>
          </form>

          {/* Contact CS WhatsApp Button */}
          <div className="pt-2 border-t border-slate-200">
            <a
              href={csUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-tactical font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Hubungi CS WhatsApp ({settings.whatsappCSNumber})</span>
            </a>
          </div>

        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-500 border-t border-slate-200">
        <p>© 2026 {settings.storeName}. All Tactical Operations Reserved.</p>
      </footer>

      {/* FULL TRACKING MODAL OVERLAY IN MAINTENANCE MODE */}
      {isTrackingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md overflow-y-auto overscroll-contain animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
            {/* Modal Header */}
            <div className="bg-slate-50 px-4 sm:px-6 py-3.5 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-2">
                <Search className="w-5 h-5 text-amber-600" />
                <h3 className="font-tactical text-base sm:text-lg font-bold text-slate-900 uppercase tracking-wider">
                  Live Tracking Pesanan Joki
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTrackingModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Tutup Pelacakan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with TrackingPage */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-2 sm:p-4 custom-scrollbar">
              <TrackingPage
                orders={orders}
                settings={settings}
                initialQuery={activeTrackingQuery}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
