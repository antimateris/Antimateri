import React from 'react';
import { 
  ShieldCheck, 
  MessageCircle, 
  Coins, 
  Users, 
  Clock, 
  Headphones, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { SystemSettings } from '../types';
import { getWhatsAppDirectUrl } from '../utils/helpers';

interface FooterProps {
  settings: SystemSettings;
  onNavigate: (tab: 'order' | 'catalog' | 'track' | 'cs' | 'admin') => void;
  onOpenAdminLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onNavigate,
  onOpenAdminLogin,
}) => {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 text-xs">
      {/* Top Footer highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Bio */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <span className="font-tactical text-2xl font-black text-slate-950 tracking-wider">
                BREAKOUT<span className="text-amber-600">OPS</span>
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-300">
                PRO JOKI
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Penyedia layanan joki spesialis <strong>Joki Koen</strong> dan <strong>Joki Mandor Raid</strong> Arena Breakout nomor 1 di Indonesia. Aman, 100% manual tanpa cheat, terpercaya & garansi evakuasi.
            </p>
            <div className="flex items-center space-x-2 text-emerald-600 font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4" />
              <span>Garansi 100% Anti-Banned & Anti-Minus</span>
            </div>
          </div>

          {/* Col 2: Layanan Utama */}
          <div className="space-y-3">
            <h4 className="font-tactical text-sm font-bold text-slate-900 uppercase tracking-wider">
              LAYANAN UTAMA
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('order')}
                  className="hover:text-amber-600 flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  <span>Joki Koen (Farm/Valley/Northridge/TV)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('order')}
                  className="hover:text-blue-600 flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>Joki Mandor Raid (Lockdown & Armory)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog')}
                  className="hover:text-amber-600 flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span>Katalog Daftar Harga Resmi</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('track')}
                  className="hover:text-amber-600 flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span>Pelacakan Pesanan Real-Time</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Integrasi Pembayaran */}
          <div className="space-y-3">
            <h4 className="font-tactical text-sm font-bold text-slate-900 uppercase tracking-wider">
              METODE PEMBAYARAN OTOMATIS
            </h4>
            <p className="text-[11px] text-slate-500">
              Mendukung QRIS instan seluruh e-wallet & transfer virtual account bank lokal:
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
              <span className="bg-slate-50 border border-slate-200 text-slate-700 px-2 py-1 rounded">QRIS Otomatis</span>
              <span className="bg-slate-50 border border-slate-200 text-slate-700 px-2 py-1 rounded">GoPay</span>
              <span className="bg-slate-50 border border-slate-200 text-slate-700 px-2 py-1 rounded">OVO</span>
              <span className="bg-slate-50 border border-slate-200 text-slate-700 px-2 py-1 rounded">DANA</span>
              <span className="bg-slate-50 border border-slate-200 text-slate-700 px-2 py-1 rounded">ShopeePay</span>
              <span className="bg-slate-50 border border-slate-200 text-slate-700 px-2 py-1 rounded">BCA</span>
              <span className="bg-slate-50 border border-slate-200 text-slate-700 px-2 py-1 rounded">Mandiri</span>
              <span className="bg-slate-50 border border-slate-200 text-slate-700 px-2 py-1 rounded">BRI</span>
              <span className="bg-slate-50 border border-slate-200 text-slate-700 px-2 py-1 rounded">BNI</span>
            </div>
          </div>

          {/* Col 4: Customer Service WA */}
          <div className="space-y-3">
            <h4 className="font-tactical text-sm font-bold text-slate-900 uppercase tracking-wider">
              CUSTOMER SERVICE RESMI
            </h4>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-700 font-bold">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WA: +{settings.whatsappCSNumber}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-600">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Jam: {settings.csWorkingHours}</span>
              </div>
              <a
                href={getWhatsAppDirectUrl(settings.whatsappCSNumber, 'Halo CS BreakoutOps, saya butuh bantuan')}
                target="_blank"
                rel="noreferrer"
                className="block w-full text-center py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all text-xs shadow-sm"
              >
                Chat WhatsApp CS
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} BreakoutOps Gaming Services. All Rights Reserved. Arena Breakout is a trademark of MoreFun Studios / Tencent Games.
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => onNavigate('cs')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Pusat Bantuan
            </button>
            <span className="text-slate-300">•</span>
            <button
              id="footer-admin-login-btn"
              onClick={onOpenAdminLogin}
              className="text-amber-600 hover:text-amber-700 font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <span>Portal Admin & Superadmin</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
