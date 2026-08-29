import React, { useState } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Target, 
  ShieldCheck, 
  Award, 
  Building2, 
  Edit3, 
  Receipt, 
  HelpCircle, 
  ExternalLink,
  ChevronRight,
  Flame,
  Zap,
  Check,
  Star,
  FileCheck2
} from 'lucide-react';
import { WorkerPayout, AdminUser, Order } from '../../types';
import { formatRupiah, formatDate } from '../../utils/helpers';

interface AdminWorkerSalaryTabProps {
  currentUser: AdminUser;
  payouts: WorkerPayout[];
  orders: Order[];
  onUpdateAdmin: (admin: AdminUser) => void;
}

export const AdminWorkerSalaryTab: React.FC<AdminWorkerSalaryTabProps> = ({
  currentUser,
  payouts,
  orders,
  onUpdateAdmin,
}) => {
  const [isEditBankOpen, setIsEditBankOpen] = useState<boolean>(false);
  const [bankName, setBankName] = useState<string>(currentUser.bankName || 'BCA');
  const [bankAccNumber, setBankAccNumber] = useState<string>(currentUser.bankAccountNumber || '');
  const [bankAccHolder, setBankAccHolder] = useState<string>(currentUser.bankAccountHolder || currentUser.name);

  const [selectedSlip, setSelectedSlip] = useState<WorkerPayout | null>(null);

  // Worker commission rate
  const commissionRate = (currentUser.commissionRatePercent || 70) / 100;

  // Filter payouts belonging to current worker
  const myPayouts = payouts.filter(
    (p) =>
      p.workerId === currentUser.id ||
      p.workerUsername?.toLowerCase() === currentUser.username.toLowerCase() ||
      p.workerName.toLowerCase().includes(currentUser.name.toLowerCase())
  );

  // Total transferred (Lunas)
  const totalTransferred = myPayouts
    .filter((p) => p.status === 'transferred')
    .reduce((sum, p) => sum + p.amount, 0);

  // Total pending payout
  const totalPending = myPayouts
    .filter((p) => p.status === 'pending' || p.status === 'processing')
    .reduce((sum, p) => sum + p.amount, 0);

  // Orders assigned to this worker
  const myOrders = orders.filter((o) => {
    const assigned = o.assignedWorker?.toLowerCase() || '';
    const myName = currentUser.name.toLowerCase();
    const myUser = currentUser.username.toLowerCase();
    return assigned.includes(myName) || assigned.includes(myUser);
  });

  const myCompletedOrders = myOrders.filter((o) => o.orderStatus === 'completed');
  const myActiveOrders = myOrders.filter((o) => o.orderStatus === 'in_progress' || o.orderStatus === 'queued');

  // Realtime Estimated Earnings:
  // Calculated from all completed orders + in-progress orders multiplied by commission rate
  const estimatedEarnedFromCompleted = myCompletedOrders.reduce(
    (sum, o) => sum + Math.round(o.totalPrice * commissionRate),
    0
  );

  const estimatedEarnedFromActive = myActiveOrders.reduce(
    (sum, o) => sum + Math.round(o.totalPrice * commissionRate),
    0
  );

  const totalEstimatedIncome = estimatedEarnedFromCompleted + estimatedEarnedFromActive;

  // Calculate total koen & hours completed
  const totalKoenCompleted = myCompletedOrders.reduce((sum, o) => sum + (o.koenAmountMillion || 0), 0);
  const totalMandorHours = myCompletedOrders.reduce((sum, o) => sum + (o.mandorHoursCount || o.mandorRaidsCount || 0), 0);

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankAccNumber.trim() || !bankAccHolder.trim()) {
      alert('Mohon isi nomor rekening dan nama pemilik rekening!');
      return;
    }

    const updatedUser: AdminUser = {
      ...currentUser,
      bankName,
      bankAccountNumber: bankAccNumber.trim(),
      bankAccountHolder: bankAccHolder.trim(),
    };

    onUpdateAdmin(updatedUser);
    setIsEditBankOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. HERO WORKER SALARY & REKENING CARD */}
      <div className="bg-gradient-to-r from-zinc-900 via-amber-950/25 to-zinc-900 border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-tactical font-extrabold text-2xl shrink-0 overflow-hidden shadow-inner">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                currentUser.name.charAt(0)
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[11px] uppercase font-extrabold tracking-wider bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                  {currentUser.role === 'superadmin' ? 'PORTAL GAJI & PENDAPATAN CEO' : 'PORTAL GAJI & KOMISI WORKER'}
                </span>
                <span className="text-[11px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-semibold border border-zinc-700">
                  {currentUser.workerTier || 'Senior Worker (Tier 1)'}
                </span>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                  Score: {currentUser.ratingScore || 4.9} / 5.0
                </span>
              </div>

              <h2 className="font-tactical text-2xl sm:text-3xl font-extrabold text-white">
                {currentUser.name}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Rate Komisi: <strong className="text-amber-400 font-mono">{currentUser.commissionRatePercent || 70}% per Order</strong> • Spesialisasi: <span className="text-zinc-300">{currentUser.speciality || 'Joki Koen & Mandor Specialist'}</span>
              </p>
            </div>
          </div>

          {/* Rekening Card Widget */}
          <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-4 min-w-[280px] shadow-lg">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
              <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
                <Building2 className="w-4 h-4 text-amber-400" />
                Rekening Pencairan Saya
              </span>
              <button
                type="button"
                onClick={() => setIsEditBankOpen(true)}
                className="text-amber-400 hover:text-amber-300 font-bold text-[11px] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Ubah</span>
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase">
                  {currentUser.bankName || 'BCA'}
                </span>
                <span className="text-xs font-mono font-bold text-white tracking-wider">
                  {currentUser.bankAccountNumber || 'Belum diisi'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 truncate">
                A/N: <strong className="text-zinc-200">{currentUser.bankAccountHolder || currentUser.name}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* 4 CORE STAT CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          
          {/* Card 1: Gaji Sudah Ditransfer (Cair) */}
          <div className="bg-zinc-950/85 border border-emerald-500/30 rounded-xl p-3.5 sm:p-4 shadow-lg">
            <div className="flex items-center justify-between text-emerald-400 text-xs mb-1 font-semibold">
              <span>Gaji Sudah Cair</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="font-tactical text-xl sm:text-2xl font-bold text-white">
              {formatRupiah(totalTransferred)}
            </p>
            <span className="text-[10px] text-emerald-400/80 font-medium">
              ✅ {myPayouts.filter((p) => p.status === 'transferred').length} Slip Transfer Lunas
            </span>
          </div>

          {/* Card 2: Menunggu Pencairan (Pending) */}
          <div className="bg-zinc-950/85 border border-amber-500/30 rounded-xl p-3.5 sm:p-4 shadow-lg">
            <div className="flex items-center justify-between text-amber-400 text-xs mb-1 font-semibold">
              <span>Menunggu Pencairan</span>
              <Clock className="w-4 h-4" />
            </div>
            <p className="font-tactical text-xl sm:text-2xl font-bold text-amber-400">
              {formatRupiah(totalPending)}
            </p>
            <span className="text-[10px] text-zinc-400">
              {myPayouts.filter((p) => p.status === 'pending' || p.status === 'processing').length} Payout Dalam Proses CEO
            </span>
          </div>

          {/* Card 3: Estimasi Pendapatan Realtime */}
          <div className="bg-zinc-950/85 border border-blue-500/30 rounded-xl p-3.5 sm:p-4 shadow-lg">
            <div className="flex items-center justify-between text-blue-400 text-xs mb-1 font-semibold">
              <span>Estimasi Pendapatan Total</span>
              <TrendingUp className="w-4 h-4" />
            </div>
            <p className="font-tactical text-xl sm:text-2xl font-bold text-white">
              {formatRupiah(totalEstimatedIncome)}
            </p>
            <span className="text-[10px] text-blue-400 font-medium">
              {myOrders.length} Order Akun ({myActiveOrders.length} Aktif, {myCompletedOrders.length} Selesai)
            </span>
          </div>

          {/* Card 4: Statistik Pengerjaan */}
          <div className="bg-zinc-950/85 border border-purple-500/30 rounded-xl p-3.5 sm:p-4 shadow-lg">
            <div className="flex items-center justify-between text-purple-400 text-xs mb-1 font-semibold">
              <span>Pengerjaan Selesai</span>
              <Award className="w-4 h-4" />
            </div>
            <p className="font-tactical text-xl sm:text-2xl font-bold text-white">
              {myCompletedOrders.length} Selesai
            </p>
            <span className="text-[10px] text-zinc-400">
              {totalKoenCompleted > 0 ? `${totalKoenCompleted}M Koen` : ''} {totalMandorHours > 0 ? `• ${totalMandorHours} Sesi Mandor` : ''}
            </span>
          </div>

        </div>
      </div>

      {/* 2. SECTION: ESTIMASI PENDAPATAN & RINCIAN ORDER AKTIF */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-tactical font-bold text-base text-white uppercase tracking-wider">
                ESTIMASI PENDAPATAN DARI ORDER DIKERJAKAN
              </h3>
              <p className="text-xs text-zinc-400">
                Kalkulasi otomatis estimasi komisi {currentUser.commissionRatePercent || 70}% berdasarkan order yang di-assign ke akun Anda.
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-xs text-zinc-400">Potensi Komisi Berjalan:</span>
            <p className="font-tactical font-bold text-base text-emerald-400">{formatRupiah(totalEstimatedIncome)}</p>
          </div>
        </div>

        {myOrders.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-xs">
            Belum ada order yang di-assign ke nama atau username Anda. Silakan ambil order di tab "Semua Order".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {myOrders.map((ord) => {
              const myEstCommission = Math.round(ord.totalPrice * commissionRate);
              return (
                <div
                  key={ord.id}
                  className="bg-zinc-950 border border-zinc-800 hover:border-blue-500/40 rounded-xl p-3.5 space-y-2 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-400">{ord.invoiceNumber}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        ord.orderStatus === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : ord.orderStatus === 'in_progress'
                          ? 'bg-blue-500/20 text-blue-300 animate-pulse'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {ord.orderStatus === 'completed' ? 'Selesai' : ord.orderStatus === 'in_progress' ? 'Dikerjakan' : 'Antrean'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white truncate">{ord.packageName}</h4>
                    <p className="text-[11px] text-zinc-400">Nickname: <span className="text-zinc-200">{ord.gameNickname}</span></p>
                  </div>

                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-400 block">Total Order</span>
                      <span className="font-semibold text-zinc-300">{formatRupiah(ord.totalPrice)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-blue-400 font-semibold block">Estimasi Komisi ({currentUser.commissionRatePercent || 70}%)</span>
                      <span className="font-tactical font-bold text-sm text-emerald-400">{formatRupiah(myEstCommission)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. SECTION: STATUS TRANSFER & SLIP GAJI SAYA */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-amber-400" />
            <h3 className="font-tactical font-bold text-base text-white uppercase tracking-wider">
              RIWAYAT SLIP GAJI & STATUS TRANSFER SAYA ({myPayouts.length})
            </h3>
          </div>
          <span className="text-xs text-zinc-400">
            Dikelola langsung oleh CEO BreakoutOps
          </span>
        </div>

        {myPayouts.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 space-y-2">
            <Receipt className="w-10 h-10 mx-auto text-zinc-700" />
            <p className="text-sm font-semibold">Belum ada slip gaji yang dibuat oleh CEO untuk akun Anda.</p>
            <p className="text-xs text-zinc-500">Slip transfer akan otomatis dibuat setelah batch pengerjaan order Anda diverifikasi.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {myPayouts.map((pay) => (
              <div key={pay.id} className="p-4 sm:p-5 hover:bg-zinc-800/30 transition-colors space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Left: Info Pengerjaan & Kode Transfer */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {pay.payoutNumber}
                      </span>
                      <span className="text-xs font-semibold text-zinc-300">
                        {pay.period || 'Periode Berjalan'}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        • {formatDate(pay.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-medium text-white">
                      🎮 <strong className="text-zinc-200">Pengerjaan:</strong> {pay.workSummary}
                    </p>

                    <p className="text-[11px] text-zinc-400 flex items-center gap-1 font-mono">
                      <Building2 className="w-3 h-3 text-amber-400" />
                      Tujuan: <strong className="text-zinc-200">{pay.accountBank} {pay.accountNumber}</strong> (a/n {pay.accountHolderName})
                    </p>
                  </div>

                  {/* Right: Nominal & Status */}
                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 block font-semibold">Nominal Transfer:</span>
                      <span className="font-tactical text-xl sm:text-2xl font-extrabold text-emerald-400">
                        {formatRupiah(pay.amount)}
                      </span>
                    </div>

                    <div className="space-y-1 text-right">
                      {pay.status === 'transferred' ? (
                        <span className="inline-flex items-center space-x-1 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>SUDAH DITRANSFER</span>
                        </span>
                      ) : pay.status === 'processing' ? (
                        <span className="inline-flex items-center space-x-1 text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full animate-pulse">
                          <Clock className="w-3.5 h-3.5" />
                          <span>SEDANG DIPROSES</span>
                        </span>
                      ) : pay.status === 'rejected' ? (
                        <span className="inline-flex items-center space-x-1 text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>DITOLAK</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full">
                          <Clock className="w-3.5 h-3.5" />
                          <span>MENUNGGU PENCAIRAN</span>
                        </span>
                      )}

                      {pay.transferProofUrl && (
                        <a
                          href={pay.transferProofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-[11px] text-amber-400 hover:underline font-semibold"
                        >
                          Lihat Bukti Transfer ↗
                        </a>
                      )}
                    </div>
                  </div>

                </div>

                {/* Catatan CEO & Feedback */}
                {(pay.adminNotes || pay.improvementFeedback) && (
                  <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 text-xs space-y-1">
                    {pay.adminNotes && (
                      <p className="text-zinc-300">
                        <strong className="text-amber-400">Catatan CEO:</strong> {pay.adminNotes}
                      </p>
                    )}
                    {pay.improvementFeedback && (
                      <p className="text-blue-300">
                        <strong className="text-blue-400">💡 Evaluasi & Masukan:</strong> {pay.improvementFeedback}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. SECTION: EVALUASI PERFORMA & IMPROVE YANG KURANG (USER INTENT REQUIREMENT) */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-blue-500/30 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className="font-tactical text-xl font-bold text-white uppercase tracking-wide">
                AREA EVALUASI & HAL YANG PERLU DI-IMPROVE
              </h3>
              <p className="text-xs text-zinc-400">
                Poin evaluasi langsung dari CEO dan standar operasional untuk memaksimalkan winrate, kecepatan pengerjaan, dan kenaikan tier komisi.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-lg border border-blue-500/30 font-bold">
            <Zap className="w-3.5 h-3.5" /> Joki SOP Target
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* Card Kiri: Catatan Evaluasi Langsung dari CEO */}
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Catatan Evaluasi Khusus Akun Anda
            </h4>

            {currentUser.improvementFeedback && currentUser.improvementFeedback.length > 0 ? (
              <div className="space-y-2">
                {currentUser.improvementFeedback.map((fb, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800 text-zinc-200">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <p className="pt-0.5 leading-relaxed">{fb}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-zinc-900/50 rounded-lg text-zinc-400 text-xs leading-relaxed">
                ✨ Kinerja Anda sejauh ini dinilai sangat baik oleh CEO! Pertahankan kecepatan pengerjaan dan tertib update bukti progres raid ke customer.
              </div>
            )}

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300/90 flex items-center justify-between">
              <span>Target Kenaikan Komisi ke Tier 1 (75%):</span>
              <strong className="text-white font-mono">10 Order / Bulan (Score &gt; 4.8)</strong>
            </div>
          </div>

          {/* Card Kanan: Checklist SOP & Tips Perbaikan Kinerja */}
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-4 h-4 text-blue-400" /> Standar Mutu & Tips Menghindari Minus / Teguran
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-start space-x-2.5 p-2 bg-zinc-900/60 rounded-lg">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">1. Waktu Respon Cepat (&lt; 15 Menit)</strong>
                  <span className="text-zinc-400 text-[11px]">Segera ubah status order ke "Dikerjakan" dan mulai login akun setelah order di-assign.</span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5 p-2 bg-zinc-900/60 rounded-lg">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">2. Upload Bukti Screenshot Progres Berkala</strong>
                  <span className="text-zinc-400 text-[11px]">Ambil tangkapan layar saat extraction berhasil atau saldo Koen bertambah +2M per checkpoint.</span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5 p-2 bg-zinc-900/60 rounded-lg">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">3. Keamanan Akun & Protokol Anti-Banned</strong>
                  <span className="text-zinc-400 text-[11px]">Gunakan koneksi bersih (IP Indonesia stabil), dilarang otak-atik sensitivitas/loadout tanpa izin, dan selalu logout bersih.</span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5 p-2 bg-zinc-900/60 rounded-lg">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">4. Pengingat Ganti Password ke Customer</strong>
                  <span className="text-zinc-400 text-[11px]">Setelah order selesai 100%, ingatkan customer via chat untuk segera mengganti password demi keamanan.</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: UBAH DATA REKENING SAYA                          */}
      {/* ======================================================== */}
      {isEditBankOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-zinc-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-tactical text-lg font-bold text-white uppercase">
                  ATUR REKENING PENCAIRAN SAYA
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditBankOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBank} className="p-6 space-y-4 text-xs sm:text-sm">
              <p className="text-xs text-zinc-400">
                Pastikan nomor rekening atau nomor e-wallet benar agar CEO dapat melakukan transfer gaji tanpa kendala.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                  Nama Bank / E-Wallet:
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-semibold focus:border-amber-500"
                >
                  {['BCA', 'Mandiri', 'BRI', 'BNI', 'DANA', 'GoPay', 'OVO', 'ShopeePay', 'Seabank', 'BSI', 'CIMB Niaga'].map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                  Nomor Rekening / No. E-Wallet (DANA/GoPay):
                </label>
                <input
                  type="text"
                  required
                  value={bankAccNumber}
                  onChange={(e) => setBankAccNumber(e.target.value)}
                  placeholder="Contoh: 5420918231 atau 081299887766"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                  Nama Pemilik Rekening (Sesuai Buku Tabungan / KTP):
                </label>
                <input
                  type="text"
                  required
                  value={bankAccHolder}
                  onChange={(e) => setBankAccHolder(e.target.value)}
                  placeholder="Contoh: Rafi Ahmad Fauzi"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-amber-500"
                />
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditBankOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-tactical font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20"
                >
                  SIMPAN REKENING
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
