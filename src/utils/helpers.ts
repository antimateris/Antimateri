import { Order, SystemSettings } from '../types';

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
};

export const generateInvoiceNumber = (): string => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `ABO-${year}-${randomNum}`;
};

export const generateUniqueCode = (): number => {
  return Math.floor(100 + Math.random() * 899);
};

export const buildWhatsAppMessage = (
  template: string,
  order: Order,
  settings: SystemSettings,
  appUrl: string,
  customNote?: string
): string => {
  const trackingUrl = `${appUrl || (typeof window !== 'undefined' ? window.location.origin : '')}/?tab=track&invoice=${order.invoiceNumber}`;
  
  // Format game mode info
  let gameModeInfo = 'Solo Joki Akun';
  if (order.serviceType === 'joki_mandor') {
    gameModeInfo = `${order.mandorPlayMode === 'mabar_squad' ? 'Mabar Bareng Squad' : 'Solo Joki Pegang Akun'}${order.mandorMap ? ` • Map: ${order.mandorMap}` : ''}`;
  }

  // Format addons info
  const addons: string[] = [];
  if (order.isPrioritySpeed) addons.push('⚡ Prioritas Kilat (+15rb)');
  if (order.isStreamDiscord) addons.push('🎥 Live Stream Discord (+20rb)');
  if (order.isSafeLootOnly) addons.push('🛡️ Safe Loot Guarantee (+10rb)');
  const addonsInfo = addons.length > 0 ? addons.join(' | ') : 'Standar (Tanpa Add-on)';

  // Format payment badge
  const paymentBadge = order.paymentStatus === 'paid' ? '✅ LUNAS (Verified)' : '⏳ MENUNGGU PEMBAYARAN';

  let msg = template
    .replace(/{{CUSTOMER_NAME}}/g, order.customerName || 'Pelanggan')
    .replace(/{{INVOICE_NUMBER}}/g, order.invoiceNumber)
    .replace(/{{SERVICE_NAME}}/g, order.serviceName)
    .replace(/{{PACKAGE_NAME}}/g, order.packageName)
    .replace(/{{TOTAL_PRICE}}/g, formatRupiah(order.totalPrice))
    .replace(/{{PAYMENT_METHOD}}/g, (order.paymentMethod || 'qris').toUpperCase())
    .replace(/{{GAME_NICKNAME}}/g, order.gameNickname)
    .replace(/{{ASSIGNED_WORKER}}/g, order.assignedWorker || 'Pro Joki Team')
    .replace(/{{PROGRESS_PERCENT}}/g, String(order.currentProgressPercent || 0))
    .replace(/{{PROGRESS_NOTE}}/g, customNote || 'Progress berjalan lancar & aman')
    .replace(/{{GAME_MODE_INFO}}/g, gameModeInfo)
    .replace(/{{ADDONS_INFO}}/g, addonsInfo)
    .replace(/{{PAYMENT_STATUS_BADGE}}/g, paymentBadge)
    .replace(/{{GAMEPLAY_NOTES}}/g, order.accountNotes || 'Tidak ada catatan khusus, mainkan sesuai SOP aman')
    .replace(/{{TRACKING_URL}}/g, trackingUrl);

  return msg;
};

// Builder khusus pesan anonim ke Bot WA / Grup Worker (HANYA Jenis Joki & Berapa / Detail Order, TANPA Identitas Pembeli)
export const buildWorkerAnonymousMessage = (
  order: Order,
  settings: SystemSettings,
  appUrl?: string
): string => {
  const template = settings?.notificationTemplates?.workerMissionBroadcast || 
    `🚨 *[ORDER MASUK - BRIEFING JOKI]* 🚨\n\n📋 *Kode Order:* {{INVOICE_NUMBER}}\n🎯 *Jenis Joki:* {{SERVICE_NAME}}\n📦 *Target / Paket:* {{PACKAGE_NAME}}\n🎮 *Mode / Map:* {{GAME_MODE_INFO}}\n⚡ *Add-ons:* {{ADDONS_INFO}}\n💰 *Status Bayar:* {{PAYMENT_STATUS_BADGE}}\n\n📝 *Instruksi Gameplay:* {{GAMEPLAY_NOTES}}\n\n_⚠️ Catatan: Identitas & nomor kontak pelanggan dirahasiakan oleh sistem demi keamanan privasi. Silakan worker yang ready ambil tugas di dashboard admin!_`;

  return buildWhatsAppMessage(template, order, settings, appUrl || (typeof window !== 'undefined' ? window.location.origin : ''));
};

export const getWhatsAppDirectUrl = (phone: string, text: string): string => {
  // normalize phone (e.g. 0812 -> 62812)
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1);
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
};

export const getPaymentMethodLabel = (method: string): string => {
  const map: Record<string, string> = {
    qris: 'QRIS (Semua E-Wallet & Bank)',
    gopay: 'GoPay Auto Pay',
    ovo: 'OVO Payment',
    dana: 'DANA Digital Wallet',
    shopeepay: 'ShopeePay',
    bca: 'BCA Virtual Account / Transfer',
    mandiri: 'Mandiri Virtual Account',
    bni: 'BNI Virtual Account',
    bri: 'BRI Virtual Account',
  };
  return map[method] || method.toUpperCase();
};

export const getStatusBadge = (status: string): { label: string; bg: string; text: string; border: string } => {
  switch (status) {
    case 'unpaid':
      return { label: 'Menunggu Pembayaran', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' };
    case 'verifying':
      return { label: 'Verifikasi Pembayaran', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' };
    case 'queued':
      return { label: 'Dalam Antrean Joki', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' };
    case 'in_progress':
      return { label: 'Sedang Dikerjakan', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' };
    case 'completed':
      return { label: 'Selesai 100%', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    case 'cancelled':
      return { label: 'Dibatalkan', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' };
    default:
      return { label: status, bg: 'bg-zinc-800', text: 'text-zinc-400', border: 'border-zinc-700' };
  }
};
