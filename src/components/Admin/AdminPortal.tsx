import React, { useState } from 'react';
import { 
  Package, 
  TrendingUp, 
  Tag, 
  Users, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Lock, 
  MessageCircle, 
  ArrowLeft,
  ChevronRight,
  Flame,
  UserCheck,
  UserCog,
  Key,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  Order, 
  AdminUser, 
  PriceConfig, 
  SystemSettings, 
  WhatsAppNotificationLog,
  CustomerUser,
  WorkerPayout
} from '../../types';
import { CreditCard, DollarSign } from 'lucide-react';
import { AdminOrdersTab } from './AdminOrdersTab';
import { AdminAnalyticsTab } from './AdminAnalyticsTab';
import { AdminCustomersTab } from './AdminCustomersTab';
import { AdminPriceSettingsTab } from './AdminPriceSettingsTab';
import { AdminUsersTab } from './AdminUsersTab';
import { AdminSystemSettingsTab } from './AdminSystemSettingsTab';
import { AdminWaLogsTab } from './AdminWaLogsTab';
import { AdminPayoutsTab } from './AdminPayoutsTab';
import { AdminWorkerSalaryTab } from './AdminWorkerSalaryTab';

interface AdminPortalProps {
  currentUser: AdminUser;
  orders: Order[];
  admins: AdminUser[];
  customers: CustomerUser[];
  priceConfig: PriceConfig;
  settings: SystemSettings;
  waLogs: WhatsAppNotificationLog[];
  payouts: WorkerPayout[];
  onLogout: () => void;
  onBackToCustomerSite: () => void;
  onUpdateOrder: (updatedOrder: Order) => void;
  onSavePriceConfig: (newConfig: PriceConfig) => void;
  onAddAdmin: (newAdmin: AdminUser) => void;
  onUpdateAdmin: (updatedAdmin: AdminUser) => void;
  onDeleteAdmin: (adminId: string) => void;
  onUpdateCustomer: (updatedCustomer: CustomerUser) => void;
  onDeleteCustomer: (customerId: string) => void;
  onSaveSettings: (newSettings: SystemSettings) => void;
  onSendWhatsAppNotification: (order: Order, templateKey: any, note?: string) => void;
  onAddPayout: (payout: WorkerPayout) => void;
  onUpdatePayout: (payout: WorkerPayout) => void;
  onDeletePayout: (payoutId: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentUser,
  orders,
  admins,
  customers,
  priceConfig,
  settings,
  waLogs,
  payouts,
  onLogout,
  onBackToCustomerSite,
  onUpdateOrder,
  onSavePriceConfig,
  onAddAdmin,
  onUpdateAdmin,
  onDeleteAdmin,
  onUpdateCustomer,
  onDeleteCustomer,
  onSaveSettings,
  onSendWhatsAppNotification,
  onAddPayout,
  onUpdatePayout,
  onDeletePayout,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<
    'orders' | 'payouts' | 'salary' | 'analytics' | 'customers' | 'walogs' | 'prices' | 'users' | 'settings'
  >('orders');

  // Self Profile & Password Modal
  const [isSelfEditOpen, setIsSelfEditOpen] = useState<boolean>(false);
  const [selfName, setSelfName] = useState<string>(currentUser.name);
  const [selfUsername, setSelfUsername] = useState<string>(currentUser.username);
  const [selfPassword, setSelfPassword] = useState<string>(
    currentUser.password || (currentUser.role === 'superadmin' ? 'superadmin123' : 'admin123')
  );
  const [showSelfPassword, setShowSelfPassword] = useState<boolean>(false);
  const [selfErrorMsg, setSelfErrorMsg] = useState<string | null>(null);
  const [selfSuccessMsg, setSelfSuccessMsg] = useState<string | null>(null);

  const isSuperadmin = currentUser.role === 'superadmin';

  const handleOpenSelfEdit = () => {
    setSelfName(currentUser.name);
    setSelfUsername(currentUser.username);
    setSelfPassword(currentUser.password || (currentUser.role === 'superadmin' ? 'superadmin123' : 'admin123'));
    setShowSelfPassword(false);
    setSelfErrorMsg(null);
    setIsSelfEditOpen(true);
  };

  const handleSaveSelfEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setSelfErrorMsg(null);

    const cleanName = selfName.trim();
    const cleanUsername = selfUsername.trim().toLowerCase();
    const cleanPassword = selfPassword.trim();

    if (!cleanName || !cleanUsername) {
      setSelfErrorMsg('Nama dan Username tidak boleh kosong');
      return;
    }

    if (!cleanPassword) {
      setSelfErrorMsg('Password tidak boleh kosong');
      return;
    }

    // Check duplicate username
    if (admins.some((a) => a.id !== currentUser.id && a.username.toLowerCase() === cleanUsername)) {
      setSelfErrorMsg('Username tersebut sudah digunakan oleh akun lain');
      return;
    }

    const updatedUser: AdminUser = {
      ...currentUser,
      name: cleanName,
      username: cleanUsername,
      password: cleanPassword,
    };

    onUpdateAdmin(updatedUser);
    setSelfSuccessMsg('Profil dan Password Anda berhasil diperbarui!');
    setTimeout(() => {
      setSelfSuccessMsg(null);
      setIsSelfEditOpen(false);
    }, 1500);
  };

  const pendingPayoutsCount = payouts.filter((p) => p.status === 'pending' || p.status === 'processing').length;
  const myPendingPayoutsCount = payouts.filter(
    (p) =>
      (p.workerId === currentUser.id ||
        p.workerUsername?.toLowerCase() === currentUser.username.toLowerCase()) &&
      (p.status === 'pending' || p.status === 'processing')
  ).length;

  const menuItems = [
    {
      id: 'orders',
      label: 'Manajemen Pesanan',
      icon: Package,
      badge: orders.length,
      superOnly: false,
    },
    {
      id: 'payouts',
      label: 'Status Gaji Worker (CEO)',
      icon: CreditCard,
      badge: isSuperadmin ? pendingPayoutsCount : undefined,
      superOnly: true,
    },
    {
      id: 'salary',
      label: isSuperadmin ? 'Gaji & Pendapatan Saya' : 'Gaji & Evaluasi Saya',
      icon: DollarSign,
      badge: !isSuperadmin && myPendingPayoutsCount > 0 ? myPendingPayoutsCount : undefined,
      superOnly: false,
    },
    {
      id: 'customers',
      label: 'Data Pelanggan & Member',
      icon: Users,
      badge: isSuperadmin ? customers.length : undefined,
      superOnly: true,
    },
    {
      id: 'analytics',
      label: 'Analitik Bulanan & Omset',
      icon: TrendingUp,
      superOnly: false,
    },
    {
      id: 'walogs',
      label: 'Log Notifikasi WhatsApp',
      icon: MessageCircle,
      badge: waLogs.length,
      superOnly: false,
    },
    {
      id: 'prices',
      label: 'Atur Harga Joki',
      icon: Tag,
      superOnly: true,
    },
    {
      id: 'users',
      label: 'Manajemen Tim Admin',
      icon: ShieldCheck,
      badge: admins.length,
      superOnly: true,
    },
    {
      id: 'settings',
      label: 'Pengaturan Sistem & Gateway',
      icon: Settings,
      superOnly: true,
    },
  ];

  return (
    <div id="admin-portal-root" className="min-h-screen bg-zinc-950 text-zinc-100 pb-16">
      
      {/* Top Admin Navigation Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-30 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Brand & Back to User Store */}
            <div className="flex items-center space-x-3">
              <button
                onClick={onBackToCustomerSite}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Lihat Web Pelanggan</span>
              </button>

              <div className="hidden sm:block h-5 w-px bg-zinc-700" />

              <div className="flex items-center space-x-2">
                <span className="font-tactical text-xl font-bold tracking-wider text-white">
                  BREAKOUT<span className="text-amber-400">OPS</span>
                </span>
                <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-amber-400">
                  {isSuperadmin ? 'SUPERADMIN CONSOLE' : 'ADMIN CONSOLE'}
                </span>
              </div>
            </div>

            {/* Right: Current Admin Info & Edit Profile & Logout */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                type="button"
                onClick={handleOpenSelfEdit}
                className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-amber-500/40 rounded-xl text-left transition-all cursor-pointer group"
                title="Klik untuk Edit Nama & Ganti Password Akun Anda"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-tactical font-bold text-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-bold text-white block leading-tight group-hover:text-amber-300 transition-colors">
                      {currentUser.name}
                    </span>
                    <UserCog className="w-3 h-3 text-zinc-400 group-hover:text-amber-400" />
                  </div>
                  <span className="text-[10px] text-zinc-400 uppercase font-mono">
                    Role: <strong className={isSuperadmin ? 'text-amber-400' : 'text-blue-400'}>{currentUser.role}</strong>
                  </span>
                </div>
              </button>

              <button
                onClick={onLogout}
                className="flex items-center space-x-1.5 px-3 py-2 bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="Keluar dari sesi admin"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Role Notice Banner */}
      {!isSuperadmin && (
        <div className="bg-blue-950/40 border-b border-blue-500/20 py-2 px-4 text-center text-xs text-blue-300">
          ℹ️ Anda login sebagai <strong>Admin Biasa</strong>. Anda memiliki akses untuk memantau pesanan dan memperbarui progres pengerjaan akun. Menu <strong>Data Pelanggan & Member</strong>, harga, tim admin, dan setelan sistem hanya dapat diakses khusus oleh <strong>Superadmin</strong>.
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap gap-2 mb-8 bg-zinc-900/80 p-2 rounded-2xl border border-zinc-800">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isBlocked = item.superOnly && !isSuperadmin;
            const isActive = activeAdminTab === item.id;

            return (
              <button
                key={item.id}
                id={`admin-tab-${item.id}`}
                onClick={() => {
                  if (isBlocked) {
                    alert('Menu ini terkunci khusus level akun Superadmin!');
                    return;
                  }
                  setActiveAdminTab(item.id as any);
                }}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-tactical text-sm'
                    : isBlocked
                    ? 'text-zinc-600 bg-zinc-950/40 opacity-60 cursor-not-allowed'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-sans ${
                    isActive ? 'bg-black/20 text-black font-extrabold' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isBlocked && <Lock className="w-3 h-3 text-zinc-600 ml-1" />}
              </button>
            );
          })}
        </div>

        {/* Tab Views */}
        {activeAdminTab === 'orders' && (
          <AdminOrdersTab
            orders={orders}
            currentUser={currentUser}
            settings={settings}
            onUpdateOrder={onUpdateOrder}
            onSendWhatsAppNotification={onSendWhatsAppNotification}
          />
        )}

        {activeAdminTab === 'payouts' && isSuperadmin && (
          <AdminPayoutsTab
            payouts={payouts}
            admins={admins}
            orders={orders}
            currentUser={currentUser}
            onAddPayout={onAddPayout}
            onUpdatePayout={onUpdatePayout}
            onDeletePayout={onDeletePayout}
            onUpdateAdmin={onUpdateAdmin}
          />
        )}

        {activeAdminTab === 'salary' && (
          <AdminWorkerSalaryTab
            currentUser={currentUser}
            payouts={payouts}
            orders={orders}
            onUpdateAdmin={onUpdateAdmin}
          />
        )}

        {activeAdminTab === 'customers' && isSuperadmin && (
          <AdminCustomersTab
            customers={customers}
            orders={orders}
            currentUser={currentUser}
            onUpdateCustomer={onUpdateCustomer}
            onDeleteCustomer={onDeleteCustomer}
          />
        )}

        {activeAdminTab === 'analytics' && (
          <AdminAnalyticsTab orders={orders} />
        )}

        {activeAdminTab === 'walogs' && (
          <AdminWaLogsTab logs={waLogs} />
        )}

        {activeAdminTab === 'prices' && isSuperadmin && (
          <AdminPriceSettingsTab
            priceConfig={priceConfig}
            onSavePriceConfig={onSavePriceConfig}
          />
        )}

        {activeAdminTab === 'users' && isSuperadmin && (
          <AdminUsersTab
            admins={admins}
            currentUser={currentUser}
            onAddAdmin={onAddAdmin}
            onUpdateAdmin={onUpdateAdmin}
            onDeleteAdmin={onDeleteAdmin}
          />
        )}

        {activeAdminTab === 'settings' && isSuperadmin && (
          <AdminSystemSettingsTab
            settings={settings}
            onSaveSettings={onSaveSettings}
          />
        )}

      </div>

      {/* MODAL: EDIT PROFIL & PASSWORD AKUN SAYA */}
      {isSelfEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-zinc-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserCog className="w-5 h-5 text-amber-400" />
                <h3 className="font-tactical text-lg font-bold text-white uppercase">
                  EDIT PROFIL & GANTI PASSWORD
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSelfEditOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSelfEdit} className="p-6 space-y-4 text-xs sm:text-sm">
              {selfErrorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2 text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{selfErrorMsg}</span>
                </div>
              )}

              {selfSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-emerald-400 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{selfSuccessMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                  Nama Lengkap / Nickname Anda:
                </label>
                <input
                  type="text"
                  required
                  value={selfName}
                  onChange={(e) => setSelfName(e.target.value)}
                  placeholder="Contoh: Superadmin Operasional"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                  Username Login:
                </label>
                <input
                  type="text"
                  required
                  value={selfUsername}
                  onChange={(e) => setSelfUsername(e.target.value)}
                  placeholder="Contoh: superadmin"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase text-zinc-300">
                    Password Baru / Ganti Password:
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSelfPassword(!showSelfPassword)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1"
                  >
                    {showSelfPassword ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Sembunyikan</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Password</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type={showSelfPassword ? 'text' : 'password'}
                    required
                    value={selfPassword}
                    onChange={(e) => setSelfPassword(e.target.value)}
                    placeholder="Ketik password baru..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-white focus:border-amber-500 font-mono"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">
                  *Kata sandi baru akan otomatis tersimpan di Cloud Firestore dan digunakan saat login berikutnya.
                </p>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsSelfEditOpen(false)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold font-tactical uppercase tracking-wider rounded-xl shadow-lg cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
