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
    <footer className="bg-zinc-950 border-t border-zinc-900 text-zinc-400 text-xs">
      {/* Top Footer highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Bio */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <span className="font-tactical text-2xl font-black text-white tracking-wider">
                BREAKOUT<span className="text-amber-500">OPS</span>
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30">
                PRO JOKI
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Penyedia layanan joki spesialis <strong>Joki Koen</strong> dan <strong>Joki Mandor Raid</strong> Arena Breakout nomor 1 di Indonesia. Aman, 100% manual tanpa cheat, terpercaya & garansi evakuasi.
            </p>
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4" />
              <span>Garansi 100% Anti-Banned & Anti-Minus</span>
            </div>
          </div>

          {/* Col 2: Layanan Utama */}
          <div className="space-y-3">
            <h4 className="font-tactical text-sm font-bold text-white uppercase tracking-wider">
              LAYANAN UTAMA
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('order')}
                  className="hover:text-amber-400 flex items-center space-x-1.5 transition-colors"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>Joki Koen (Farm/Valley/Northridge/TV)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('order')}
                  className="hover:text-blue-400 flex items-center space-x-1.5 transition-colors"
                >
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>Joki Mandor Raid (Lockdown & Armory)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog')}
                  className="hover:text-amber-400 flex items-center space-x-1.5 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Katalog Daftar Harga Resmi</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('track')}
                  className="hover:text-amber-400 flex items-center space-x-1.5 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Pelacakan Pesanan Real-Time</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Integrasi Pembayaran */}
          <div className="space-y-3">
            <h4 className="font-tactical text-sm font-bold text-white uppercase tracking-wider">
              METODE PEMBAYARAN OTOMATIS
            </h4>
            <p className="text-[11px] text-zinc-500">
              Mendukung QRIS instan seluruh e-wallet & transfer virtual account bank lokal:
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
              <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-1 rounded">QRIS Otomatis</span>
              <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-1 rounded">GoPay</span>
              <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-1 rounded">OVO</span>
              <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-1 rounded">DANA</span>
              <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-1 rounded">ShopeePay</span>
              <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-1 rounded">BCA</span>
              <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-1 rounded">Mandiri</span>
              <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-1 rounded">BRI</span>
              <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-1 rounded">BNI</span>
            </div>
          </div>

          {/* Col 4: Customer Service WA */}
          <div className="space-y-3">
            <h4 className="font-tactical text-sm font-bold text-white uppercase tracking-wider">
              CUSTOMER SERVICE RESMI
            </h4>
            <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
              <div className="flex items-center space-x-2 text-green-400 font-bold">
                <MessageCircle className="w-4 h-4" />
                <span>WA: +{settings.whatsappCSNumber}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-[11px] text-zinc-400">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>Jam: {settings.csWorkingHours}</span>
              </div>
              <a
                href={getWhatsAppDirectUrl(settings.whatsappCSNumber, 'Halo CS BreakoutOps, saya butuh bantuan')}
                target="_blank"
                rel="noreferrer"
                className="block w-full text-center py-2 bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white font-bold rounded-lg border border-green-500/30 transition-all text-xs"
              >
                Chat WhatsApp CS
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500">
          <div>
            © {new Date().getFullYear()} BreakoutOps Gaming Services. All Rights Reserved. Arena Breakout is a trademark of MoreFun Studios / Tencent Games.
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => onNavigate('cs')}
              className="hover:text-zinc-300 transition-colors"
            >
              Pusat Bantuan
            </button>
            <span className="text-zinc-700">•</span>
            <button
              id="footer-admin-login-btn"
              onClick={onOpenAdminLogin}
              className="text-amber-500 hover:text-amber-400 font-semibold transition-colors flex items-center space-x-1"
            >
              <span>Portal Admin & Superadmin</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
