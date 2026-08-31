import React, { useState } from 'react';
import { 
  Headphones, 
  MessageCircle, 
  Clock, 
  ShieldCheck, 
  HelpCircle, 
  Send, 
  CheckCircle2, 
  ChevronDown, 
  ExternalLink,
  PhoneCall,
  Sparkles,
  Award
} from 'lucide-react';
import { SystemSettings } from '../types';
import { getWhatsAppDirectUrl } from '../utils/helpers';

interface CustomerServicePageProps {
  settings: SystemSettings;
}

export const CustomerServicePage: React.FC<CustomerServicePageProps> = ({ settings }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('konsultasi');
  const [userQuery, setUserQuery] = useState<string>('');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const topics = [
    { id: 'konsultasi', label: 'Konsultasi Joki Koen / Mandor' },
    { id: 'status', label: 'Cek Status & Estimasi Selesai' },
    { id: 'login', label: 'Bantuan Login Level Infinite / Akun' },
    { id: 'payment', label: 'Kendala Pembayaran & Verifikasi' },
    { id: 'custom', label: 'Request Khusus / Sultan Package' },
  ];

  const handleOpenWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const topicLabel = topics.find(t => t.id === selectedTopic)?.label || 'Bantuan CS';
    const text = `Halo CS BreakoutOps!\n\nSaya ingin bertanya seputar *${topicLabel}*:\n"${userQuery || 'Halo, saya butuh bantuan joki Arena Breakout'}"\n\nMohon dibantu ya, terima kasih!`;
    const url = getWhatsAppDirectUrl(settings.whatsappCSNumber, text);
    window.open(url, '_blank');
  };

  const faqs = [
    {
      q: 'Apakah akun saya dijamin 100% aman dan tidak akan terkena Banned?',
      a: 'Sangat aman 100%. Tim joki kami bermain secara murni manual tanpa menggunakan cheat, script, bot, atau modifikasi apapun. Kami bermain menggunakan device resmi dan koneksi lokal Indonesia yang aman.'
    },
    {
      q: 'Apa perbedaan antara Joki Koen dan Joki Mandor?',
      a: 'Joki Koen adalah layanan di mana akun Anda dimainkan oleh joki untuk mengumpulkan nominal Koen target (misal 5 Juta Koen). Sedangkan Joki Mandor adalah layanan pengawalan raid (bisa mabar bareng squad joki atau akun dimainkan joki) untuk membuka brankas emas, membersihkan boss, dan menjamin evakuasi selamat.'
    },
    {
      q: 'Bagaimana cara memantau progres joki saat akun saya sedang dikerjakan?',
      a: 'Anda dapat membuka menu "Lacak Pesanan (Cek Resi)" tanpa perlu login. Masukkan nomor invoice atau no WhatsApp Anda untuk melihat persentase selesai, tangkapan layar bukti evakuasi, dan status joki secara real-time.'
    },
    {
      q: 'Berapa lama estimasi pengerjaan pesanan saya?',
      a: 'Untuk paket Koen 1M - 5M estimasi selesai 15 - 45 menit. Untuk paket 10M+ atau paket Mandor jam/raid berkisar antara 1 - 3 jam tergantung mode map dan antrean.'
    },
    {
      q: 'Apakah saya boleh login ke game saat joki sedang berjalan?',
      a: 'Sangat disarankan TIDAK login saat joki sedang raid aktif agar sesi game joki tidak disconnect yang dapat menyebabkan raid gugur. Joki akan mengirim notifikasi WhatsApp otomatis saat selesai.'
    }
  ];

  return (
    <div id="cs-page-container" className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      
      {/* Top Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <Headphones className="w-3.5 h-3.5 text-emerald-600" />
          <span>Layanan Pelanggan WhatsApp 24/7 Terintegrasi</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-tactical text-slate-900 uppercase tracking-wider">
          PUSAT BANTUAN & CS WHATSAPP LANGSUNG
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Tim support dan admin joki kami siap membantu kebutuhan konsultasi, pertanyaan, dan konfirmasi akun Anda via WhatsApp resmi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Interactive Quick Chat Launcher */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-tactical uppercase tracking-wider">
                KIRIM PESAN LANGSUNG KE WHATSAPP ADMIN
              </h2>
              <p className="text-xs text-slate-500">
                Pilih topik di bawah untuk membuka template chat otomatis
              </p>
            </div>
          </div>

          <form onSubmit={handleOpenWhatsApp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-2">
                Pilih Topik Konsultasi:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {topics.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTopic(t.id)}
                    className={`p-2.5 rounded-xl text-left text-xs font-medium border transition-all cursor-pointer ${
                      selectedTopic === t.id
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                Tuliskan Pertanyaan / Pesan Anda:
              </label>
              <textarea
                rows={3}
                id="input-cs-query"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Contoh: Halo min, mau tanya slot joki Mandor Armory malam ini apakah ready squad?..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              id="btn-submit-cs-whatsapp"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold font-tactical uppercase tracking-wider text-sm rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Buka Chat WhatsApp Sekarang</span>
            </button>
          </form>

          {/* Quick CS Stats Info */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Jam Operasional:</span>
              <span className="font-bold text-slate-800">{settings.csWorkingHours}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Kecepatan Respon:</span>
              <span className="font-bold text-emerald-600">~1 - 3 Menit (Fast Response)</span>
            </div>
          </div>
        </div>

        {/* Right: Guarantee & FAQ accordion */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2.5 text-amber-600 font-tactical font-bold text-base uppercase">
              <ShieldCheck className="w-5 h-5" />
              <span>GARANSI & KEAMANAN BREAKOUTOPS</span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Garansi Anti-Minus:</strong> Jika terjadi lose gear yang tidak sesuai perjanjian, joki siap ganti rugi.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Privasi Terjaga:</strong> Password & credential tidak disimpan di database publik.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>No Cheat / Mod:</strong> 100% manual gameplay oleh player pro tier Legend.</span>
              </li>
            </ul>
          </div>

          {/* FAQ Accordion */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-slate-900 font-tactical font-bold text-base uppercase mb-2">
              <HelpCircle className="w-5 h-5 text-amber-600" />
              <span>PERTANYAAN SERING DITANYAKAN (FAQ)</span>
            </div>

            {faqs.map((faq, idx) => {
              const isOpen = faqOpen === idx;
              return (
                <div
                  key={idx}
                  className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setFaqOpen(isOpen ? null : idx)}
                    className="w-full p-3.5 text-left text-xs font-bold text-slate-800 hover:text-amber-700 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-amber-600' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-3.5 pb-3.5 text-xs text-slate-600 leading-relaxed border-t border-slate-200 pt-2">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
