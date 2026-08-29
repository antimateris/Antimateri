import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  Key, 
  X, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { AdminUser } from '../../types';

interface AdminLoginModalProps {
  admins: AdminUser[];
  onLoginSuccess: (user: AdminUser) => void;
  onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  admins,
  onLoginSuccess,
  onClose,
}) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const user = admins.find(
      (a) => a.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!user) {
      setErrorMsg('Username admin tidak ditemukan dalam sistem');
      return;
    }

    if (!user.active) {
      setErrorMsg('Akun admin ini dinonaktifkan oleh Superadmin');
      return;
    }

    // Check actual password from user object or fallback
    const expectedPassword = user.password || (user.role === 'superadmin' ? 'superadmin123' : 'admin123');
    if (password !== expectedPassword) {
      setErrorMsg('Password salah! Silakan periksa kembali kata sandi akun Anda.');
      return;
    }

    onLoginSuccess(user);
  };

  // Find sample superadmin and admin for quick login helper
  const superadminUser = admins.find((a) => a.role === 'superadmin' && a.active) || admins[0];
  const regularAdminUser = admins.find((a) => a.role === 'admin' && a.active) || admins[1];

  // Quick fill for testing
  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-tactical text-lg font-bold text-white uppercase tracking-wider">
                PORTAL LOGIN ADMIN & CEO
              </h3>
              <p className="text-[11px] text-zinc-400">
                Akses manajemen pesanan & pengaturan sistem
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  id="admin-login-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="superadmin atau admin1"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  id="admin-login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              id="btn-admin-submit-login"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold font-tactical uppercase tracking-wider text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <span>Masuk ke Dasbor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-zinc-800/80 space-y-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              PILIH AKUN TESTING DEMO:
            </span>
            
            <div className="grid grid-cols-2 gap-2">
              {superadminUser && (
                <button
                  type="button"
                  id="btn-quick-superadmin"
                  onClick={() => handleQuickFill(superadminUser.username, superadminUser.password || 'superadmin123')}
                  className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-amber-500/40 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 truncate max-w-[90px]">{superadminUser.name}</span>
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">SUPER</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5 font-mono truncate">
                    {superadminUser.username} / {superadminUser.password || 'superadmin123'}
                  </p>
                </button>
              )}

              {regularAdminUser && (
                <button
                  type="button"
                  id="btn-quick-admin1"
                  onClick={() => handleQuickFill(regularAdminUser.username, regularAdminUser.password || 'admin123')}
                  className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400 truncate max-w-[90px]">{regularAdminUser.name}</span>
                    <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-bold">ADMIN</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5 font-mono truncate">
                    {regularAdminUser.username} / {regularAdminUser.password || 'admin123'}
                  </p>
                </button>
              )}
            </div>

            <p className="text-[10px] text-zinc-500 text-center pt-1">
              *Admin biasa hanya bisa melihat & memperbarui status orderan. Superadmin dapat mengatur harga, menambah admin & setelan sistem.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
