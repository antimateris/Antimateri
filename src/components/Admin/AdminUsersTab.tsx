import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Lock, 
  Trash2, 
  CheckCircle2, 
  X, 
  Key, 
  User, 
  AlertCircle,
  Edit3,
  Eye,
  EyeOff,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';
import { AdminUser, UserRole } from '../../types';
import { formatDate } from '../../utils/helpers';

interface AdminUsersTabProps {
  admins: AdminUser[];
  currentUser: AdminUser;
  onAddAdmin: (newAdmin: AdminUser) => void;
  onUpdateAdmin: (updatedAdmin: AdminUser) => void;
  onDeleteAdmin: (adminId: string) => void;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  admins,
  currentUser,
  onAddAdmin,
  onUpdateAdmin,
  onDeleteAdmin,
}) => {
  // Add Admin Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<UserRole>('admin');
  const [showAddPassword, setShowAddPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Edit Admin Modal State
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editUsername, setEditUsername] = useState<string>('');
  const [editPassword, setEditPassword] = useState<string>('');
  const [editRole, setEditRole] = useState<UserRole>('admin');
  const [editActive, setEditActive] = useState<boolean>(true);
  const [showEditPassword, setShowEditPassword] = useState<boolean>(false);
  const [editErrorMsg, setEditErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleOpenEdit = (adm: AdminUser) => {
    setEditingAdmin(adm);
    setEditName(adm.name);
    setEditUsername(adm.username);
    setEditPassword(adm.password || (adm.role === 'superadmin' ? 'superadmin123' : 'admin123'));
    setEditRole(adm.role);
    setEditActive(adm.active);
    setShowEditPassword(false);
    setEditErrorMsg(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setEditErrorMsg(null);

    const cleanUsername = editUsername.trim().toLowerCase();
    const cleanName = editName.trim();
    const cleanPassword = editPassword.trim();

    if (!cleanUsername || !cleanName) {
      setEditErrorMsg('Username dan Nama lengkap wajib diisi');
      return;
    }

    if (!cleanPassword) {
      setEditErrorMsg('Password tidak boleh kosong');
      return;
    }

    // Check if username taken by another admin
    if (admins.some((a) => a.id !== editingAdmin.id && a.username.toLowerCase() === cleanUsername)) {
      setEditErrorMsg('Username tersebut sudah digunakan oleh admin lain');
      return;
    }

    const updatedAdmin: AdminUser = {
      ...editingAdmin,
      name: cleanName,
      username: cleanUsername,
      password: cleanPassword,
      role: editRole,
      active: editActive,
    };

    onUpdateAdmin(updatedAdmin);
    setEditingAdmin(null);
    setSuccessMsg(`Berhasil memperbarui data akun & password "${cleanName}"!`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUsername = username.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPassword = password.trim() || 'admin123';

    if (!cleanUsername || !cleanName) {
      setErrorMsg('Username dan Nama lengkap wajib diisi');
      return;
    }

    if (admins.some((a) => a.username.toLowerCase() === cleanUsername)) {
      setErrorMsg('Username tersebut sudah digunakan oleh admin lain');
      return;
    }

    const newAdmin: AdminUser = {
      id: `usr_${Date.now()}`,
      username: cleanUsername,
      name: cleanName,
      password: cleanPassword,
      role,
      active: true,
      createdAt: new Date().toISOString(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    };

    onAddAdmin(newAdmin);
    setIsAddModalOpen(false);
    setUsername('');
    setName('');
    setPassword('');
    setRole('admin');
    setSuccessMsg(`Admin baru "${cleanName}" berhasil ditambahkan!`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleToggleActive = (adm: AdminUser) => {
    if (adm.id === currentUser.id) {
      alert('Anda tidak dapat menonaktifkan akun sendiri');
      return;
    }
    onUpdateAdmin({ ...adm, active: !adm.active });
  };

  const handleDelete = (adm: AdminUser) => {
    if (adm.id === currentUser.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri');
      return;
    }
    if (window.confirm(`Yakin ingin menghapus akses admin "${adm.name}" (${adm.username})?`)) {
      onDeleteAdmin(adm.id);
    }
  };

  const handleCopyPassword = (adm: AdminUser) => {
    const pwd = adm.password || (adm.role === 'superadmin' ? 'superadmin123' : 'admin123');
    navigator.clipboard.writeText(pwd);
    setCopiedId(adm.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30">
              SUPERADMIN CONSOLE
            </span>
            <h2 className="text-xl font-bold font-tactical text-white uppercase tracking-wider">
              MANAJEMEN AKUN ADMIN & GANTI PASSWORD
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Ganti nama tampilan, atur username login, perbarui password Admin & Superadmin, serta kelola hak akses tim joki.
          </p>
        </div>

        <button
          onClick={() => {
            setIsAddModalOpen(true);
            setPassword('');
            setShowAddPassword(false);
            setErrorMsg(null);
          }}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold font-tactical uppercase tracking-wider text-xs rounded-xl shadow-lg transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Admin Baru</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-emerald-400 text-xs font-semibold animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Admin List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {admins.map((adm) => {
          const isMe = adm.id === currentUser.id;
          const currentPassword = adm.password || (adm.role === 'superadmin' ? 'superadmin123' : 'admin123');

          return (
            <div
              key={adm.id}
              className={`bg-zinc-900/80 border rounded-2xl p-5 shadow-xl space-y-4 relative flex flex-col justify-between ${
                adm.role === 'superadmin' 
                  ? 'border-amber-500/40 bg-zinc-900/95 ring-1 ring-amber-500/20' 
                  : 'border-zinc-800'
              }`}
            >
              <div>
                {/* Header Profile */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center font-tactical font-black text-lg ${
                      adm.role === 'superadmin'
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                        : 'bg-zinc-800 border-zinc-700 text-blue-400'
                    }`}>
                      {adm.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm flex items-center space-x-1.5">
                        <span>{adm.name}</span>
                        {isMe && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-1.5 py-0.2 rounded border border-amber-500/30">
                            Anda
                          </span>
                        )}
                      </h3>
                      <p className="text-xs font-mono text-zinc-400">@{adm.username}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    adm.role === 'superadmin'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  }`}>
                    {adm.role}
                  </span>
                </div>

                {/* Details & Password Box */}
                <div className="space-y-2 text-xs text-zinc-400 border-t border-zinc-800/80 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span>Level Akses:</span>
                    <span className="text-white font-medium">
                      {adm.role === 'superadmin' ? 'Superadmin (Full Akses)' : 'Admin Joki (Update Order)'}
                    </span>
                  </div>

                  {/* Password Info Box */}
                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Password Login:</span>
                      <span className="font-mono text-xs font-bold text-amber-300">
                        {currentPassword}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyPassword(adm)}
                      className="p-1 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded border border-zinc-700 transition-colors cursor-pointer"
                      title="Salin Password"
                    >
                      {copiedId === adm.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex justify-between pt-1">
                    <span>Status Akun:</span>
                    <span className={`font-bold ${adm.active ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {adm.active ? '● Aktif' : '○ Non-Aktif'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-zinc-500">
                    <span>Dibuat Pada:</span>
                    <span>{formatDate(adm.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(adm)}
                  className="flex-1 py-1.5 px-3 bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Nama & Password</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleActive(adm)}
                  disabled={isMe}
                  className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border transition-colors ${
                    adm.active
                      ? 'bg-zinc-800 text-zinc-300 hover:text-rose-400 border-zinc-700'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  } ${isMe ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                  title={adm.active ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                >
                  {adm.active ? 'Nonaktif' : 'Aktifkan'}
                </button>

                {!isMe && (
                  <button
                    type="button"
                    onClick={() => handleDelete(adm)}
                    className="p-2 text-zinc-500 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer border border-transparent hover:border-rose-500/30"
                    title="Hapus Admin"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: EDIT ADMIN & CHANGE PASSWORD */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-zinc-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-amber-400" />
                <h3 className="font-tactical text-lg font-bold text-white uppercase">
                  EDIT AKUN & GANTI PASSWORD
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingAdmin(null)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs sm:text-sm">
              {editErrorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2 text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editErrorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                  Nama Lengkap Admin / Nickname Joki:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Contoh: Chief Operasional (Superadmin)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-white focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                  Username Login:
                </label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
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
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1"
                  >
                    {showEditPassword ? (
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
                    type={showEditPassword ? 'text' : 'password'}
                    required
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Masukkan password baru..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-white focus:border-amber-500 font-mono"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">
                  *Ketik password baru yang diinginkan untuk akun ini.
                </p>
              </div>

              {/* Role & Status (Only if superadmin or editing others) */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800/80">
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                    Level Role:
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-amber-500 text-xs"
                  >
                    <option value="admin">Admin Biasa</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                    Status Akun:
                  </label>
                  <select
                    value={editActive ? 'active' : 'inactive'}
                    onChange={(e) => setEditActive(e.target.value === 'active')}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-amber-500 text-xs"
                  >
                    <option value="active">● Aktif</option>
                    <option value="inactive">○ Non-Aktif</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2.5 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
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

      {/* MODAL: TAMBAH ADMIN BARU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <h3 className="font-tactical text-lg font-bold text-white uppercase">
                  TAMBAH AKUN ADMIN BARU
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="p-6 space-y-4 text-xs sm:text-sm">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2 text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                  Nama Lengkap Admin / Nickname Joki:
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Joki Bravo (Armory Specialist)"
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
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: joki_bravo"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase text-zinc-300">
                    Password Akun:
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1"
                  >
                    {showAddPassword ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Sembunyikan</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  type={showAddPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                  Level Akses (Role):
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-amber-500"
                >
                  <option value="admin">Admin Biasa (Hanya Lihat & Update Order)</option>
                  <option value="superadmin">Superadmin (Akses Penuh Kelola Harga & Sistem)</option>
                </select>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold font-tactical uppercase tracking-wider rounded-xl shadow-lg cursor-pointer"
                >
                  Simpan Admin
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

