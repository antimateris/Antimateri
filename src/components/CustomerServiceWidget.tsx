import React, { useState } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Coins, 
  Users, 
  Search, 
  ShieldCheck,
  ChevronRight,
  Headphones
} from 'lucide-react';
import { SystemSettings } from '../types';
import { getWhatsAppDirectUrl } from '../utils/helpers';

interface CustomerServiceWidgetProps {
  settings: SystemSettings;
  onNavigateTrack?: () => void;
}

export const CustomerServiceWidget: React.FC<CustomerServiceWidgetProps> = ({
  settings,
  onNavigateTrack,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const quickActions = [
    {
      title: 'Tanya Paket Joki Koen',
      desc: 'Konsultasi harga & estimasi beres',
      icon: Coins,
      color: 'text-amber-400',
      text: 'Halo CS BreakoutOps, saya mau tanya paket Joki Koen Arena Breakout yang ready saat ini.',
    },
    {
      title: 'Booking Joki Mandor Raid',
      desc: 'Kawal Lockdown & Armory squad',
      icon: Users,
      color: 'text-blue-400',
      text: 'Halo CS BreakoutOps, saya mau booking slot Joki Mandor Raid untuk map Lockdown/Armory.',
    },
    {
      title: 'Cek Status Pesanan Saya',
      desc: 'Cek progres pengerjaan akun',
      icon: Search,
      color: 'text-emerald-400',
      text: 'Halo CS BreakoutOps, saya ingin cek status progres pesanan joki akun saya.',
    },
    {
      title: 'Live Chat CS WhatsApp',
      desc: 'Langsung hubungi admin bertugas',
      icon: Headphones,
      color: 'text-green-400',
      text: 'Halo Admin BreakoutOps, saya butuh bantuan informasi joki.',
    },
  ];

  const handleActionClick = (text: string) => {
    const url = getWhatsAppDirectUrl(settings.whatsappCSNumber, text);
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded Popover Card */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-zinc-900 border border-green-500/40 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-700 to-green-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">Customer Service WA</h4>
                <span className="text-[11px] text-green-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                  Online • Siap Membantu
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Menu */}
          <div className="p-3.5 space-y-2 bg-zinc-950/90">
            <p className="text-[11px] text-zinc-400 font-semibold px-1 uppercase tracking-wider">
              PILIH BANTUAN CEPAT:
            </p>

            {quickActions.map((act, idx) => {
              const Icon = act.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleActionClick(act.text)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800 hover:border-green-500/40 flex items-center justify-between text-left transition-all group"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 group-hover:border-green-500/30">
                      <Icon className={`w-4 h-4 ${act.color}`} />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-zinc-100 group-hover:text-green-400">
                        {act.title}
                      </h5>
                      <p className="text-[10px] text-zinc-400">{act.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-green-400" />
                </button>
              );
            })}

            <div className="pt-2 text-center text-[10px] text-zinc-500">
              Operasional: {settings.csWorkingHours}
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        id="btn-floating-whatsapp-cs"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold text-xs rounded-full shadow-2xl shadow-green-600/40 transition-all hover:scale-105 cursor-pointer border border-green-400/40"
      >
        <MessageCircle className="w-5 h-5 fill-white text-white group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline">WhatsApp CS</span>
        
        {/* Pulsing online ping badge */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-zinc-950" />
        </span>
      </button>
    </div>
  );
};
