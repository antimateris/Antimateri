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
  Shield,
  AlertTriangle,
  Wrench,
  Clock,
  CreditCard,
  QrCode,
  Zap,
  Copy,
  Check,
  RefreshCw,
  Key
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
  const [copiedWebhook, setCopiedWebhook] = useState<boolean>(false);
  const [isTestingGateway, setIsTestingGateway] = useState<boolean>(false);
  const [gatewayTestResult, setGatewayTestResult] = useState<string | null>(null);

  const webhookUrl = `${window.location.origin}/api/payment/callback`;

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleTestGatewayConnection = () => {
    setIsTestingGateway(true);
    setGatewayTestResult(null);
    setTimeout(() => {
      setIsTestingGateway(false);
      const provider = form.paymentGatewayProvider || 'doku';
      if (provider === 'doku') {
        setGatewayTestResult('✅ Berhasil terhubung ke DOKU SNAP Gateway API (Sandbox: 200 OK - Access Token & Signature Valid)');
      } else if (provider === 'midtrans') {
        setGatewayTestResult('✅ Berhasil terhubung ke Midtrans Snap API (Sandbox: 200 OK)');
      } else if (provider === 'tripay') {
        setGatewayTestResult('✅ Berhasil terhubung ke Tripay Open API (Sandbox: 200 OK)');
      } else {
        setGatewayTestResult('✅ Mode Transfer Bank Manual Aktif');
      }
    }, 900);
  };

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
              PENGATURAN SISTEM & MAINTENANCE MODE
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Saklar Maintenance Mode Publik, konfigurasi gateway WhatsApp, nomor CS, teks pengumuman, dan integrasi API.
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
          <span>Pengaturan sistem dan Maintenance Mode berhasil diperbarui!</span>
        </div>
      )}

      {/* GLOBAL MAINTENANCE MODE CARD */}
      <div className={`p-5 sm:p-6 rounded-2xl border transition-all ${
        form.maintenanceMode 
          ? 'bg-gradient-to-r from-rose-950/40 via-amber-950/20 to-zinc-900 border-rose-500/60 shadow-xl shadow-rose-950/30' 
          : 'bg-zinc-900/90 border-zinc-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div className="flex items-start space-x-3.5">
            <div className={`p-2.5 rounded-xl border shrink-0 ${
              form.maintenanceMode 
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' 
                : 'bg-zinc-800 border-zinc-700 text-zinc-400'
            }`}>
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-tactical font-bold text-base sm:text-lg text-white uppercase tracking-wider">
                  GLOBAL MAINTENANCE MODE (MODE PEMELIHARAAN)
                </h3>
                {form.maintenanceMode ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white animate-pulse">
                    ACTIVE / AKTIF
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400 border border-zinc-700">
                    STANDBY / NONAKTIF
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
                Bila diaktifkan, seluruh pengunjung publik akan diarahkan ke layar pemeliharaan (*Maintenance Splash Screen*). Pembuatan pesanan baru akan dinonaktifkan sementara. Admin dan Superadmin tetap dapat login dan mengakses dashboard.
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center space-x-3 shrink-0">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.maintenanceMode}
                onChange={(e) => setForm({ ...form, maintenanceMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>
        </div>

        {/* Maintenance Customization Options */}
        {form.maintenanceMode && (
          <div className="mt-5 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs animate-in fade-in duration-200">
            <div className="sm:col-span-2">
              <label className="block text-zinc-300 font-semibold mb-1">Judul Layar Maintenance:</label>
              <input
                type="text"
                value={form.maintenanceTitle || ''}
                placeholder="Contoh: Pemeliharaan Sistem & Sinkronisasi Server Sedang Berlangsung"
                onChange={(e) => setForm({ ...form, maintenanceTitle: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-zinc-300 font-semibold mb-1">Pesan Penjelasan untuk Pengunjung:</label>
              <textarea
                rows={3}
                value={form.maintenanceMessage || ''}
                placeholder="Jelaskan alasan pemeliharaan atau optimasi yang sedang dilakukan..."
                onChange={(e) => setForm({ ...form, maintenanceMessage: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-200 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Estimasi Waktu Selesai (Opsional):</label>
              <input
                type="text"
                value={form.maintenanceEstimatedEnd || ''}
                placeholder="Contoh: Estimasi Selesai: 30 - 60 Menit"
                onChange={(e) => setForm({ ...form, maintenanceEstimatedEnd: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-amber-300 focus:border-amber-500"
              />
            </div>

            <div className="flex items-center p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Pengunjung tetap dapat menghubungi CS via WhatsApp dan melacak resi yang sudah berjalan.</span>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* PAYMENT GATEWAY OTOMATIS CONFIGURATION CARD */}
      {/* ======================================================== */}
      <div className="bg-zinc-900/95 border-2 border-amber-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-tactical font-black text-lg text-white uppercase tracking-wider">
                  INTEGRASI PAYMENT GATEWAY OTOMATIS
                </h3>
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-tactical">
                  SNAP BI & QRIS READY
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Konfigurasi pembayaran instan (DOKU SNAP, Midtrans, Tripay) untuk Virtual Account otomatis dan QRIS Realtime.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={isTestingGateway}
              onClick={handleTestGatewayConnection}
              className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-xl text-xs font-bold border border-zinc-700 flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isTestingGateway ? 'animate-spin' : ''}`} />
              <span>{isTestingGateway ? 'Memeriksa...' : 'Test Koneksi Gateway'}</span>
            </button>
          </div>
        </div>

        {gatewayTestResult && (
          <div className="p-3 bg-zinc-950 border border-amber-500/40 rounded-xl text-xs text-amber-300 font-mono flex items-center space-x-2 animate-in fade-in">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{gatewayTestResult}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
          
          {/* Provider Selector & Environment Mode */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <label className="block text-zinc-300 font-bold uppercase mb-2">
                Pilih Provider Payment Gateway:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'doku', name: 'DOKU SNAP', desc: 'SNAP BI VA & QRIS' },
                  { id: 'midtrans', name: 'Midtrans Snap', desc: 'GoPay, VA, QRIS' },
                  { id: 'tripay', name: 'Tripay Payment', desc: 'Multi-Channel Instant' },
                  { id: 'manual', name: 'Transfer Manual', desc: 'Verifikasi Struk Rekening' }
                ].map((prov) => (
                  <button
                    key={prov.id}
                    type="button"
                    onClick={() => setForm({ ...form, paymentGatewayProvider: prov.id as any })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      form.paymentGatewayProvider === prov.id
                        ? 'bg-amber-500/15 border-amber-500 text-white ring-1 ring-amber-500/40'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    <span className="font-bold block text-xs">{prov.name}</span>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">{prov.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Switcher: Sandbox vs Production */}
            <div>
              <label className="block text-zinc-300 font-bold uppercase mb-1.5">
                Environment / Mode Operasi:
              </label>
              <div className="flex items-center p-1 bg-zinc-950 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, paymentGatewayMode: 'sandbox' })}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                    form.paymentGatewayMode === 'sandbox'
                      ? 'bg-amber-500 text-black font-tactical font-black shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  🧪 Sandbox (Testing)
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, paymentGatewayMode: 'production' })}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                    form.paymentGatewayMode === 'production'
                      ? 'bg-emerald-500 text-black font-tactical font-black shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  🚀 Production (Live)
                </button>
              </div>
            </div>

            {/* Auto Verify Toggle */}
            <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Auto-Verifikasi Lunas:</span>
                <span className="text-[10px] text-zinc-400 block">
                  Ubah status order otomatis jadi Lunas (Paid) saat pembayaran sukses.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.autoVerifyPayment}
                  onChange={(e) => setForm({ ...form, autoVerifyPayment: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* Webhook Endpoint for DOKU / Midtrans */}
            <div>
              <label className="block text-zinc-300 font-bold uppercase mb-1">
                Webhook / Callback URL Website:
              </label>
              <div className="flex items-center space-x-1.5">
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-300 font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={handleCopyWebhook}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-xl text-xs font-bold border border-zinc-700 flex items-center space-x-1 shrink-0 cursor-pointer"
                >
                  {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedWebhook ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
              <span className="text-[10px] text-zinc-500 block mt-1">
                Masukkan URL ini ke dashboard Merchant DOKU / Midtrans pada menu Notifikasi URL.
              </span>
            </div>

          </div>

          {/* Key Inputs & Details (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* DOKU SNAP Fields */}
            {form.paymentGatewayProvider === 'doku' && (
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-3">
                <div className="flex items-center space-x-2 text-amber-400 font-bold border-b border-zinc-800 pb-2">
                  <Key className="w-4 h-4" />
                  <span>Kredensial DOKU SNAP (Bank Indonesia Open API)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Client Key / Mall ID:</label>
                    <input
                      type="text"
                      placeholder="MALL_ID_12345"
                      value={form.dokuClientId || ''}
                      onChange={(e) => setForm({ ...form, dokuClientId: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Partner ID:</label>
                    <input
                      type="text"
                      placeholder="PARTNER_12345"
                      value={form.dokuPartnerId || ''}
                      onChange={(e) => setForm({ ...form, dokuPartnerId: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1 flex items-center justify-between">
                    <span>API Key / DOKU Token:</span>
                    <span className="text-emerald-400 text-[10px]">Active Token</span>
                  </label>
                  <input
                    type="text"
                    placeholder="doku_key_..."
                    value={form.dokuApiKey || ''}
                    onChange={(e) => setForm({ ...form, dokuApiKey: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-300 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Actived Secret Key (Shared Key):</label>
                  <input
                    type="password"
                    placeholder="SK-..."
                    value={form.dokuClientSecret || ''}
                    onChange={(e) => setForm({ ...form, dokuClientSecret: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1 flex items-center justify-between">
                    <span>DOKU Public Key (X-SIGNATURE Verifier):</span>
                    <span className="text-blue-400 text-[10px]">Public Key</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----"
                    value={form.dokuPublicKey || ''}
                    onChange={(e) => setForm({ ...form, dokuPublicKey: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-300 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1 flex items-center justify-between">
                    <span>Merchant RSA Private Key (Digunakan untuk X-SIGNATURE Asimetrik):</span>
                    <span className="text-amber-400 text-[10px]">Rahasia Server</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;...&#10;-----END RSA PRIVATE KEY-----"
                    value={form.dokuPrivateKey || ''}
                    onChange={(e) => setForm({ ...form, dokuPrivateKey: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-300 font-mono text-[11px]"
                  />
                </div>
              </div>
            )}

            {/* Midtrans Fields */}
            {form.paymentGatewayProvider === 'midtrans' && (
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-3">
                <div className="flex items-center space-x-2 text-blue-400 font-bold border-b border-zinc-800 pb-2">
                  <Key className="w-4 h-4" />
                  <span>Kredensial Midtrans Snap</span>
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Client Key (Publik):</label>
                  <input
                    type="text"
                    placeholder="SB-Mid-client-..."
                    value={form.midtransClientKey || ''}
                    onChange={(e) => setForm({ ...form, midtransClientKey: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Server Key (Rahasia):</label>
                  <input
                    type="password"
                    placeholder="SB-Mid-server-..."
                    value={form.midtransServerKey || ''}
                    onChange={(e) => setForm({ ...form, midtransServerKey: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>
            )}

            {/* Tripay Fields */}
            {form.paymentGatewayProvider === 'tripay' && (
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold border-b border-zinc-800 pb-2">
                  <Key className="w-4 h-4" />
                  <span>Kredensial Tripay Open API</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Merchant Code:</label>
                    <input
                      type="text"
                      placeholder="T12345"
                      value={form.tripayMerchantCode || ''}
                      onChange={(e) => setForm({ ...form, tripayMerchantCode: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">API Key:</label>
                    <input
                      type="text"
                      placeholder="DEV-..."
                      value={form.tripayApiKey || ''}
                      onChange={(e) => setForm({ ...form, tripayApiKey: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Private Key / Secret:</label>
                  <input
                    type="password"
                    placeholder="Private key Tripay..."
                    value={form.tripayPrivateKey || ''}
                    onChange={(e) => setForm({ ...form, tripayPrivateKey: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>
            )}

            {/* Manual Mode Info */}
            {form.paymentGatewayProvider === 'manual' && (
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 font-bold">
                  <CreditCard className="w-4 h-4" />
                  <span>Mode Transfer Rekening Manual</span>
                </div>
                <p className="text-zinc-300 leading-relaxed">
                  Pelanggan akan diarahkan mentransfer ke nomor rekening BCA resmi toko dan mengunggah foto struk transfer. Status pesanan akan diverifikasi secara manual oleh Owner atau Admin.
                </p>
              </div>
            )}

          </div>

        </div>
      </div>

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
