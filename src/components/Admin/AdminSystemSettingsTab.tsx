import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  MessageCircle, 
  ShieldCheck, 
  Bell, 
  CheckCircle2, 
  Globe, 
  Radio, 
  Lock,
  Sparkles,
  Smartphone,
  Bot,
  Shield
} from 'lucide-react';
import { SystemSettings } from '../../types';

interface AdminSystemSettingsTabProps {
  settings: SystemSettings;
  onSaveSettings: (newSettings: SystemSettings) => void;
}

export const AdminSystemSettingsTab: React.FC<AdminSystemSettingsTabProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [form, setForm] = useState<SystemSettings>(JSON.parse(JSON.stringify(settings)));
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [activeTemplateTab, setActiveTemplateTab] = useState<keyof typeof form.notificationTemplates>('orderCreated');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const templateLabels: Record<keyof typeof form.notificationTemplates, string> = {
    orderCreated: '1. Pesanan Dibuat (Menunggu Bayar)',
    paymentReceived: '2. Pembayaran Diterima (Antrean)',
    jokiStarted: '3. Joki Mulai Dimainkan (In-Progress)',
    progressUpdate: '4. Update Progres / Raid Extraction',
    orderCompleted: '5. Joki Selesai 100% (Akun Sukses)',
    workerMissionBroadcast: '🤖 6. Broadcast Bot / Grup Worker (Anonim)',
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30">
              SUPERADMIN EXCLUSIVE
            </span>
            <h2 className="text-xl font-bold font-tactical text-white uppercase tracking-wider">
              PENGATURAN SISTEM & WHATSAPP GATEWAY
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Konfigurasi gateway notifikasi WhatsApp, bot broadcast worker joki (anonim), nomor CS, teks pengumuman, dan integrasi API.
          </p>
        </div>

        <button
          type="submit"
          className="flex items-center space-x-1.5 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold font-tactical uppercase tracking-wider text-xs rounded-xl shadow-lg transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Pengaturan</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-emerald-400 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Pengaturan sistem dan gateway WhatsApp berhasil diperbarui!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: General & CS (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Store Info Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
            <div className="flex items-center space-x-2 text-white font-tactical font-bold text-base uppercase border-b border-zinc-800 pb-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>INFORMASI TOKO & CS</span>
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold mb-1">Nama Toko Joki:</label>
              <input
                type="text"
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold mb-1">Nomor WhatsApp CS (Tanpa +, Contoh: 6282198765432):</label>
              <input
                type="text"
                value={form.whatsappCSNumber}
                onChange={(e) => setForm({ ...form, whatsappCSNumber: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-green-400 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold mb-1">Jam Operasional CS:</label>
              <input
                type="text"
                value={form.csWorkingHours}
                onChange={(e) => setForm({ ...form, csWorkingHours: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200"
              />
            </div>
          </div>

          {/* Running Ticker & Announcement Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
            <div className="flex items-center space-x-2 text-white font-tactical font-bold text-base uppercase border-b border-zinc-800 pb-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              <span>RUNNING TICKER & PENGUMUMAN</span>
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold mb-1">Teks Marquee Header Atas:</label>
              <input
                type="text"
                value={form.runningTicker}
                onChange={(e) => setForm({ ...form, runningTicker: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold mb-1">Teks Banner Promo:</label>
              <textarea
                rows={2}
                value={form.announcementText}
                onChange={(e) => setForm({ ...form, announcementText: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200"
              />
            </div>
          </div>

          {/* Gateway API Token & Worker Bot Config */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-3 text-xs">
            <div className="flex items-center space-x-2 text-white font-tactical font-bold text-base uppercase border-b border-zinc-800 pb-2">
              <Smartphone className="w-4 h-4 text-blue-400" />
              <span>INTEGRASI WHATSAPP & BOT WORKER</span>
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold mb-1 flex items-center justify-between">
                <span>Nomor WA Bot / ID Grup Joki Worker:</span>
                <span className="text-amber-400 text-[10px] font-bold">Anonim</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: 6281299887766"
                value={form.workerGroupWhatsApp || ''}
                onChange={(e) => setForm({ ...form, workerGroupWhatsApp: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 font-mono text-blue-400 font-bold text-xs"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                Tujuan pesan briefing order yang aman tanpa mencantumkan identitas pribadi pelanggan.
              </p>
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold mb-1">Gateway API Key / Token:</label>
              <input
                type="text"
                value={form.whatsappGatewayApiKey}
                onChange={(e) => setForm({ ...form, whatsappGatewayApiKey: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 font-mono text-zinc-400 text-xs"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold mb-1">Webhook Endpoint URL:</label>
              <input
                type="text"
                value={form.whatsappGatewayWebhook}
                onChange={(e) => setForm({ ...form, whatsappGatewayWebhook: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 font-mono text-zinc-400 text-xs"
              />
            </div>

            <div className="bg-emerald-950/20 border border-emerald-500/30 p-2.5 rounded-lg flex items-center space-x-2 text-[11px] text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Status Gateway: Terkoneksi & Siap Mengirim Pesan Realtime</span>
            </div>
          </div>

        </div>

        {/* Right Column: WhatsApp Notification Template Editor (7 cols) */}
        <div className="lg:col-span-7 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-green-400" />
              <h3 className="font-tactical text-lg font-bold text-white uppercase">
                EDITOR TEMPLATE NOTIFIKASI WHATSAPP & BOT
              </h3>
            </div>
            <span className="text-[11px] bg-green-500/20 text-green-300 font-bold px-2 py-0.5 rounded">
              Real-Time WA
            </span>
          </div>

          <p className="text-xs text-zinc-400">
            Kustomisasi format pesan WhatsApp pelanggan dan pesan briefing bot ke grup worker tanpa membocorkan privasi pelanggan.
          </p>

          {/* Template Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1.5 bg-zinc-950 rounded-xl border border-zinc-800">
            {(Object.keys(templateLabels) as Array<keyof typeof form.notificationTemplates>).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTemplateTab(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTemplateTab === key
                    ? key === 'workerMissionBroadcast'
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-green-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {templateLabels[key]}
              </button>
            ))}
          </div>

          {/* Template Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase text-zinc-300">
                Isi Template Pesan ({templateLabels[activeTemplateTab]}):
              </label>
              {activeTemplateTab === 'workerMissionBroadcast' && (
                <span className="text-[11px] text-amber-400 font-semibold flex items-center space-x-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Format Anonim (Tanpa Kontak/Nama Pelanggan)</span>
                </span>
              )}
            </div>
            <textarea
              rows={12}
              value={form.notificationTemplates[activeTemplateTab] || ''}
              onChange={(e) => {
                const updated = { ...form.notificationTemplates, [activeTemplateTab]: e.target.value };
                setForm({ ...form, notificationTemplates: updated });
              }}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 font-mono text-xs text-zinc-200 focus:outline-none focus:border-green-500 leading-relaxed"
            />
          </div>

          {/* Dynamic Placeholder Tag Cheatsheet */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2 text-xs">
            <span className="font-bold text-amber-400 uppercase tracking-wider block text-[11px]">
              Daftar Tag Dinamis yang Dapat Digunakan:
            </span>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
              <code className="bg-zinc-900 text-amber-300 px-2 py-0.5 rounded border border-zinc-800">{`{{INVOICE_NUMBER}}`}</code>
              <code className="bg-zinc-900 text-amber-300 px-2 py-0.5 rounded border border-zinc-800">{`{{SERVICE_NAME}}`}</code>
              <code className="bg-zinc-900 text-amber-300 px-2 py-0.5 rounded border border-zinc-800">{`{{PACKAGE_NAME}}`}</code>
              <code className="bg-zinc-900 text-amber-300 px-2 py-0.5 rounded border border-zinc-800">{`{{GAME_MODE_INFO}}`}</code>
              <code className="bg-zinc-900 text-amber-300 px-2 py-0.5 rounded border border-zinc-800">{`{{ADDONS_INFO}}`}</code>
              <code className="bg-zinc-900 text-amber-300 px-2 py-0.5 rounded border border-zinc-800">{`{{CUSTOMER_NAME}}`}</code>
              <code className="bg-zinc-900 text-amber-300 px-2 py-0.5 rounded border border-zinc-800">{`{{TOTAL_PRICE}}`}</code>
              <code className="bg-zinc-900 text-amber-300 px-2 py-0.5 rounded border border-zinc-800">{`{{PAYMENT_METHOD}}`}</code>
              <code className="bg-zinc-900 text-amber-300 px-2 py-0.5 rounded border border-zinc-800">{`{{GAME_NICKNAME}}`}</code>
              <code className="bg-zinc-900 text-amber-300 px-2 py-0.5 rounded border border-zinc-800">{`{{ASSIGNED_WORKER}}`}</code>
              <code className="bg-zinc-900 text-amber-300 px-2 py-0.5 rounded border border-zinc-800">{`{{PROGRESS_PERCENT}}`}</code>
              <code className="bg-zinc-900 text-amber-300 px-2 py-0.5 rounded border border-zinc-800">{`{{TRACKING_URL}}`}</code>
            </div>
          </div>
        </div>

      </div>

    </form>
  );
};
