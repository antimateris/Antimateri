import { 
  Order, 
  AdminUser, 
  PriceConfig, 
  SystemSettings, 
  WhatsAppNotificationLog,
  CustomerUser,
  CustomerTier,
  RewardItem,
  TierConfig,
  WorkerPayout
} from '../types';

export const INITIAL_ADMINS: AdminUser[] = [
  {
    id: 'usr_owner',
    username: 'owner',
    password: 'owner123',
    name: 'Chief Operasional (OWNER & CEO)',
    role: 'owner',
    active: true,
    createdAt: '2026-01-10T08:00:00.000Z',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bankName: 'BCA',
    bankAccountNumber: '8820192837',
    bankAccountHolder: 'Chief Operasional BreakoutOps',
    commissionRatePercent: 100,
    speciality: 'Operational Lead & System Owner',
    workerTier: 'OWNER / CEO',
    ratingScore: 5.0
  },
  {
    id: 'usr_admin1',
    username: 'admin',
    password: 'admin123',
    name: 'Admin Operasional (Rafi)',
    role: 'admin',
    active: true,
    createdAt: '2026-02-01T09:30:00.000Z',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bankName: 'BCA',
    bankAccountNumber: '5420918231',
    bankAccountHolder: 'Rafi Ahmad Fauzi',
    commissionRatePercent: 70,
    speciality: 'Manajemen Pesanan & Verifikasi',
    workerTier: 'Admin Operasional',
    ratingScore: 4.9,
    improvementFeedback: [
      'Respon awal sangat cepat dan tertib memverifikasi pembayaran serta update pesanan.',
      'Saran: Pastikan customer selalu diingatkan untuk ganti password setelah pengerjaan selesai.'
    ]
  },
  {
    id: 'usr_worker1',
    username: 'joki_alpha',
    password: 'worker123',
    name: 'Pro Joki Alpha (Raid Master Dimas)',
    role: 'worker',
    active: true,
    createdAt: '2026-02-15T14:20:00.000Z',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bankName: 'DANA',
    bankAccountNumber: '081299887766',
    bankAccountHolder: 'Dimas Prasetyo',
    commissionRatePercent: 75,
    speciality: 'Mandor Armory & TV Station Specialist',
    workerTier: 'Pro Joki (Tier 1)',
    ratingScore: 4.8,
    improvementFeedback: [
      'Gameplay extract rate di Armory sangat tinggi (92%).',
      'Perlu di-improve: Upload screenshot loot berharga langsung ke sistem tanpa menunggu order selesai.'
    ]
  },
  {
    id: 'usr_worker2',
    username: 'joki_bravo',
    password: 'worker123',
    name: 'Joki Bravo (Squad Escort Aldi)',
    role: 'worker',
    active: true,
    createdAt: '2026-03-01T10:00:00.000Z',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bankName: 'Mandiri',
    bankAccountNumber: '1370019283746',
    bankAccountHolder: 'Aldi Saputra',
    commissionRatePercent: 70,
    speciality: 'Mandor Mabar Squad Bimbingan',
    workerTier: 'Pro Joki (Tier 2)',
    ratingScore: 4.7,
    improvementFeedback: [
      'Customer sangat puas dengan arahan voice di Discord/In-game.',
      'Perlu di-improve: Konfirmasi kesiapan customer minimal 10 menit sebelum jam mabar dimulai.'
    ]
  }
];

export const INITIAL_PRICE_CONFIG: PriceConfig = {
  koenPerMillionRate: 25000,
  prioritySpeedFee: 15000,
  streamDiscordFee: 20000,
  safeLootGuaranteeFee: 10000,
  koenPackages: [
    {
      id: 'koen_1m',
      amountMillion: 1,
      title: '1 Juta Koen (1M)',
      price: 25000,
      originalPrice: 30000,
      popular: false,
      description: 'Cocok untuk modal gear awal & modif senjata T3/T4'
    },
    {
      id: 'koen_3m',
      amountMillion: 3,
      title: '3 Juta Koen (3M)',
      price: 70000,
      originalPrice: 85000,
      popular: false,
      description: 'Paling pas untuk stock peluru gold & armor T5'
    },
    {
      id: 'koen_5m',
      amountMillion: 5,
      title: '5 Juta Koen (5M)',
      price: 110000,
      originalPrice: 140000,
      popular: true,
      description: 'Best Seller! Hemat 30rb, bonus 1x safe raid extraction'
    },
    {
      id: 'koen_10m',
      amountMillion: 10,
      title: '10 Juta Koen (10M)',
      price: 200000,
      originalPrice: 270000,
      popular: false,
      description: 'Super Sultan Pack! Bebas beli Thermal & Full Mod Weapon'
    },
    {
      id: 'koen_20m',
      amountMillion: 20,
      title: '20 Juta Koen (20M)',
      price: 380000,
      originalPrice: 520000,
      popular: false,
      description: 'Mega Stash Whale Pack! Langsung kaya mendadak di Kamona'
    }
  ],
  mandorPackages: [
    {
      id: 'mandor_1raid',
      type: 'per_raid',
      quantity: 1,
      title: 'Mandor 1 Raid Lockdown',
      price: 35000,
      originalPrice: 45000,
      popular: false,
      description: '1x Game Lockdown dikawal pro player, estimasi loot 300k - 800k Koen',
      maps: ['Farm Lockdown', 'Valley Lockdown', 'Northridge Lockdown']
    },
    {
      id: 'mandor_3raid',
      type: 'per_raid',
      quantity: 3,
      title: 'Mandor 3 Raids Lockdown',
      price: 95000,
      originalPrice: 125000,
      popular: true,
      description: '3x Game Lockdown / Armory, garansi evakuasi selamat & clear boss squad',
      maps: ['Farm Lockdown', 'Valley Lockdown', 'Northridge Lockdown', 'Armory']
    },
    {
      id: 'mandor_5raid',
      type: 'per_raid',
      quantity: 5,
      title: 'Mandor 5 Raids Sultan Tour',
      price: 150000,
      originalPrice: 200000,
      popular: false,
      description: '5x Game Bebas Pilih Map (Termasuk TV Station & Armory) + Full Carry Loot',
      maps: ['Farm Lockdown', 'Valley Lockdown', 'Northridge Lockdown', 'Armory', 'TV Station', 'Port']
    },
    {
      id: 'mandor_2jam',
      type: 'per_jam',
      quantity: 2,
      title: 'Mandor Waktu 2 Jam',
      price: 80000,
      originalPrice: 100000,
      popular: false,
      description: 'Mabar bareng Joki Mandor sepuasnya selama 2 jam non-stop',
      maps: ['Semua Map Tersedia']
    },
    {
      id: 'mandor_4jam',
      type: 'per_jam',
      quantity: 4,
      title: 'Mandor Waktu 4 Jam (Half-Day)',
      price: 150000,
      originalPrice: 190000,
      popular: true,
      description: 'Puas looting room kunci emas & wipe lobby bareng squad pro joki',
      maps: ['Semua Map Bebas Pilih']
    }
  ]
};

export const INITIAL_SYSTEM_SETTINGS: SystemSettings = {
  storeName: 'BreakoutOps Arena Services',
  storeTagline: 'Layanan Joki Koen & Mandor Arena Breakout #1 Terpercaya di Indonesia',
  whatsappCSNumber: '6282198765432',
  workerGroupWhatsApp: '6281299887766',
  csWorkingHours: '08:00 - 02:00 WIB (Setiap Hari)',
  autoVerifyPayment: true,
  
  // Payment Gateway Defaults
  paymentGatewayProvider: 'doku',
  paymentGatewayMode: 'sandbox',
  dokuClientId: 'BRN-0248-1788087931417',
  dokuApiKey: 'doku_key_sandbox_9f3cdc946a11409f8245f9c14b942234',
  dokuClientSecret: 'SK-GBHLCjkOQbzarOKoJLeM',
  dokuPrivateKey: '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA7zZz0iXIGw74iKc7DpI+rT6eVXajhqDZiZkZVY1u3RQZDXqibwqjCgV0df5Z9y1JBGN7Jf2Nyc2y1k3bYjr8T9U9qAojSgPQz5qhp+wWW58J+wFtPfFSjN1AwOvFQq7V1+dsZaNd07T79Sy1zFfnjY0DfdoV10LsEtqGoTlfOpKJh+svywmtkXwlb0Fk+HoWdXGsT0Vgj2y/D8lBDXJgA84Tkz8yH8BVG4PZDPz8GQj4zWBlbZnmDcf2IpJISD9KGA2KEEij7L5V60B4gVzZZEFz6EvF3p04PzZ1S1UxQcwbFzBv3MAxQDYJzT0Ep2hDzXZQh5V0R0ZaUHQJnKoK7wIDAQABAoIBAA6VxJX8xohA7KiV6gJx6BYO1sWo5YFEmngGm4WyXIGhLW6cH75mjovCwmBA/WF+5ypxR+XxL5/yP/mAGkVncbimfOtEOn+XH9p7SMCZhEkRDOXQOiKjcV4dxG4oTzVmX6OtTBLt6nI/O2eBpLQwFZaV38MGmrN9GdSHP5iT4YaFPfsGUKLFk7RSgKkPrZWeUoRBMZeJ9ctL5yS/TTSkTkIaT2ChM9RTjXQlkzLT8JjCUXe2zmxvsm/rtFLXxwbyZ7OzWf5IVG4dX8fQbwsOq71H6dh0hnDQHTkFMAoTV89xxZ+ZC7BFXtEV3rM0G4tDy4vFrskGeonVs8Z5QGbzFBECgYEA+K0h1OrTPy0gF\n-----END RSA PRIVATE KEY-----',
  dokuPublicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1LW7c28pjR2gbp3VTnGkCH4rGMiDElm9ms52EmyBiQmJMLq0+ebT1nSd+wo1aPr0O5b4lInvgmrfumLKIprL6fOVvbDv7UaAQS7DG5u2ZlYWvB9kRiijXJ7TDxokjIlGZuqxDQDYQnbJ6PvqAC0q9Ty9br/asq+4QwuLIclW9vW3obRhrMbS5ALYf6pVqNw1QBBJ5Wq9eZ8ZgqrDkQJn3IhgmUOL+6kLtAarfjcLmhjrN65HeY7QR0WZpboJ+fBji0bhgnndbRpDfUEtOqfsg6bZ1OpXg5AlTV9nNBMiYxnW0UcoIaDhk/J2RoH27tYHu8FlGeT868opd7lq8TQXpQIDAQAB\n-----END PUBLIC KEY-----',
  dokuPartnerId: 'BRN-0248-1788087931417',
  midtransClientKey: 'SB-Mid-client-88aJkl921a',
  midtransServerKey: 'SB-Mid-server-k9L01mzpq2',
  tripayMerchantCode: 'T19283',
  tripayApiKey: 'DEV-Tripay-9102839102',
  paymentWebhookSecret: 'WH_SEC_ARENA_BREAKOUT_2026',
  
  maintenanceMode: false,
  maintenanceTitle: 'Pemeliharaan Sistem & Sinkronisasi Server Sedang Berlangsung',
  maintenanceMessage: 'Kami sedang melakukan peningkatan infrastruktur server dan optimasi sistem antrean joki Arena Breakout untuk memberikan pelayanan yang lebih cepat dan aman. Semua pemesanan baru dihentikan sementara.',
  maintenanceEstimatedEnd: 'Estimasi Selesai: 30 - 60 Menit',
  announcementText: '🔥 PROMO SPESIAL SEASON: Dapatkan bonus 200k Koen untuk setiap order paket 5M ke atas! Garansi 100% Anti-Banned & Anti-Minus.',
  runningTicker: '⚡ UPDATE PENGERJAAN: 14 Joki Aktif Online | Estimasi Pengerjaan Joki Koen 15-45 Menit | Mandor Siap Squad!',
  whatsappGatewayApiKey: 'WAGW_ARENABREAKOUT_SECURE_TOKEN_2026',
  whatsappGatewayWebhook: 'https://api.breakoutops.com/webhook/wa-gateway',
  notificationTemplates: {
    orderCreated: `*BREAKOUTOPS - NOTIFIKASI PESANAN* 🎮\n\nHalo *{{CUSTOMER_NAME}}*!\nPesanan jasa joki Arena Breakout Anda telah dibuat:\n\n📋 *No. Invoice:* {{INVOICE_NUMBER}}\n🎯 *Layanan:* {{SERVICE_NAME}} - {{PACKAGE_NAME}}\n💰 *Total Pembayaran:* {{TOTAL_PRICE}}\n💳 *Metode Bayar:* {{PAYMENT_METHOD}}\n\nSilakan selesaikan pembayaran untuk memulai antrean pengerjaan.\n🔗 *Lacak Pesanan:* {{TRACKING_URL}}\n\n_Terima kasih telah mempercayai BreakoutOps!_`,
    paymentReceived: `*BREAKOUTOPS - PEMBAYARAN DITERIMA* 💰\n\nHalo *{{CUSTOMER_NAME}}*!\nPembayaran untuk invoice *{{INVOICE_NUMBER}}* sebesar *{{TOTAL_PRICE}}* telah terverifikasi sukses.\n\n⚙️ *Status Saat Ini:* Masuk Antrean Joki\n🎮 *Akun ID / Nickname:* {{GAME_NICKNAME}}\n👨‍✈️ *Joki Ditugaskan:* {{ASSIGNED_WORKER}}\n\nMohon pastikan akun tidak dimainkan / login selama proses joki berlangsung.\n🔗 *Cek Live Progress:* {{TRACKING_URL}}`,
    jokiStarted: `*BREAKOUTOPS - JOKI DIMULAI* 🚀\n\nHalo *{{CUSTOMER_NAME}}*!\nJoki untuk pesanan *{{INVOICE_NUMBER}}* saat ini *SEDANG DIMULAI* oleh pro joki *{{ASSIGNED_WORKER}}*.\n\n📍 *Layanan:* {{SERVICE_NAME}}\n🎯 *Target:* {{PACKAGE_NAME}}\n⏱️ *Estimasi Selesai:* 30 - 60 Menit\n\n📌 *PENTING:* Jangan login ke dalam game Arena Breakout agar proses raid tidak terputus.\n🔗 *Pantau Bukti Live:* {{TRACKING_URL}}`,
    progressUpdate: `*BREAKOUTOPS - UPDATE PROGRESS JOKI* 📊\n\nHalo *{{CUSTOMER_NAME}}*!\nAda update terbaru untuk pesanan *{{INVOICE_NUMBER}}*:\n\n📈 *Progress:* {{PROGRESS_PERCENT}}%\n📝 *Catatan Joki:* {{PROGRESS_NOTE}}\n\n🔗 *Lihat Screenshot Bukti:* {{TRACKING_URL}}`,
    orderCompleted: `*BREAKOUTOPS - JOKI SELESAI & SUKSES!* 🏆\n\nHalo *{{CUSTOMER_NAME}}*!\nKabar gembira! Pesanan Joki Arena Breakout Anda telah *SELESAI 100%* dengan aman dan sukses extraction!\n\n📋 *No. Invoice:* {{INVOICE_NUMBER}}\n🎮 *Nickname:* {{GAME_NICKNAME}}\n💰 *Hasil Akhir:* Sesuai Pesanan Target (Aman & Anti-Minus)\n\nSilakan login kembali ke game dan ganti kata sandi demi kenyamanan. Jangan lupa berikan ulasan ya!\n🔗 *Unduh Bukti Screenshot Akhir:* {{TRACKING_URL}}\n\n_Terima kasih, sampai jumpa di Kamona!_`,
    workerMissionBroadcast: `🚨 *[ORDER MASUK - BRIEFING JOKI]* 🚨\n\n📋 *Kode Order:* {{INVOICE_NUMBER}}\n🎯 *Jenis Joki:* {{SERVICE_NAME}}\n📦 *Target / Paket:* {{PACKAGE_NAME}}\n🎮 *Mode / Map:* {{GAME_MODE_INFO}}\n⚡ *Add-ons:* {{ADDONS_INFO}}\n💰 *Status Bayar:* {{PAYMENT_STATUS_BADGE}}\n\n📝 *Instruksi Gameplay:* {{GAMEPLAY_NOTES}}\n\n_⚠️ Catatan: Identitas & nomor kontak pelanggan dirahasiakan oleh sistem demi keamanan privasi. Silakan worker yang ready ambil tugas di dashboard admin!_`
  }
};

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_WA_LOGS: WhatsAppNotificationLog[] = [];

export const TIER_CONFIGS: Record<CustomerTier, TierConfig> = {
  recruit: {
    id: 'recruit',
    name: 'Recruit Contractor',
    title: 'Tier I: Rekrut Baru',
    minExp: 0,
    coinMultiplier: 1.0,
    color: 'text-zinc-400',
    badgeBg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    borderBg: 'border-zinc-700',
    perks: [
      'Cashback 1 OpsCoin setiap kelipatan Rp 1.000 belanja',
      'Akses Rewards Store & Tukar Kupon',
      'Tracking Real-time Pesanan di Akun'
    ]
  },
  operative: {
    id: 'operative',
    name: 'Operative Vanguard',
    title: 'Tier II: Agen Vanguard',
    minExp: 100000,
    coinMultiplier: 1.05, // +5% bonus coins
    color: 'text-blue-400',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    borderBg: 'border-blue-500/40',
    perks: [
      'Bonus Cashback OpsCoins +5% di setiap order',
      'Fast-Lane CS WhatsApp Prioritas',
      'Badge Eksklusif Vanguard di Leaderboard'
    ]
  },
  elite: {
    id: 'elite',
    name: 'Elite Raider',
    title: 'Tier III: Raider Elit',
    minExp: 500000,
    coinMultiplier: 1.10, // +10% bonus coins
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    borderBg: 'border-emerald-500/40',
    perks: [
      'Bonus Cashback OpsCoins +10% di setiap order',
      'Antrean Prioritas Otomatis (Queue Skip 1 Level)',
      'Akses Redeem Voucher Diskon Spesial',
      'Gratis Add-On Safe Loot Guarantee'
    ]
  },
  warlord: {
    id: 'warlord',
    name: 'Armory Warlord',
    title: 'Tier IV: Panglima Armory',
    minExp: 1500000,
    coinMultiplier: 1.15, // +15% bonus coins
    color: 'text-purple-400',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    borderBg: 'border-purple-500/40',
    perks: [
      'Bonus Cashback OpsCoins +15% di setiap order',
      'Penugasan Otomatis Pro Worker Senior (Winrate >99%)',
      'Gratis Add-On Live Stream Discord 1x / minggu',
      'Badge Sultan Ungu di Leaderboard'
    ]
  },
  mythic: {
    id: 'mythic',
    name: 'Mythic Operator (Sultan Kamona)',
    title: 'Tier V: Legenda Kamona',
    minExp: 4000000,
    coinMultiplier: 1.25, // +25% bonus coins
    color: 'text-amber-400',
    badgeBg: 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 text-amber-300 border-amber-500/60 shadow-amber-500/20 shadow-lg',
    borderBg: 'border-amber-500/60',
    perks: [
      'Bonus Cashback OpsCoins Super MAX +25%',
      'Layanan Dedicated WhatsApp Concierge & Custom Order',
      'Bebas Biaya Semua Add-On (Priority + Safe Loot + Discord Stream)',
      'Hadiah Bulanan Eksklusif Koen Pack untuk Top 1 Leaderboard'
    ]
  }
};

export const REWARD_CATALOG: RewardItem[] = [
  {
    id: 'rew_disc_15k',
    title: 'Voucher Diskon Rp 15.000',
    subtitle: 'Potongan langsung checkout order apa saja',
    description: 'Dapat digunakan untuk memotong harga pesanan Joki Koen maupun Mandor tanpa minimum pembelian.',
    coinCost: 150,
    rewardType: 'discount_voucher',
    discountAmount: 15000,
    badge: 'Diskon Langsung',
    popular: true
  },
  {
    id: 'rew_disc_35k',
    title: 'Voucher Diskon Rp 35.000',
    subtitle: 'Hemat Rp 35.000 saat order joki',
    description: 'Potongan harga spesial Rp 35.000 untuk transaksi joki koen paket 3M ke atas atau mandor per jam.',
    coinCost: 350,
    rewardType: 'discount_voucher',
    discountAmount: 35000,
    badge: 'Hemat Banget',
    popular: false
  },
  {
    id: 'rew_free_1m',
    title: 'GRATIS Joki 1 Juta Koen (1M)',
    subtitle: 'Joki 1M Koen Gratis 100%',
    description: 'Tukarkan koin kamu untuk mendapatkan 1 Juta Koen tanpa bayar sepeserpun! Worker kami yang carikan sampai Stash.',
    coinCost: 300,
    rewardType: 'free_koen',
    freeKoenAmountMillion: 1,
    badge: 'FREE KOEN',
    popular: true
  },
  {
    id: 'rew_free_3m',
    title: 'GRATIS Joki 3 Juta Koen (3M)',
    subtitle: 'Joki 3M Koen Full Gratis',
    description: 'Paket 3M Koen bersih di Stash secara gratis menggunakan 800 OpsCoins kamu.',
    coinCost: 800,
    rewardType: 'free_koen',
    freeKoenAmountMillion: 3,
    badge: 'FREE 3M KOEN',
    popular: true
  },
  {
    id: 'rew_free_mandor_1h',
    title: 'GRATIS 1 Jam Mandor / Mabar',
    subtitle: '1 Jam didampingi Pro Joki Arena Breakout',
    description: 'Main bareng pro player atau akun dijoki selama 1 jam penuh di map pilihanmu tanpa biaya tambahan.',
    coinCost: 600,
    rewardType: 'free_mandor',
    freeMandorHours: 1,
    badge: 'FREE MANDOR',
    popular: false
  },
  {
    id: 'rew_free_priority',
    title: 'GRATIS Priority Speed Pass',
    subtitle: 'Joki dikerjakan saat ini juga (Tanpa Antre)',
    description: 'Bypass antrean dan pesananmu langsung dieksekusi detik ini juga oleh tim worker siaga 24 jam.',
    coinCost: 120,
    rewardType: 'free_addon',
    addonType: 'priority',
    badge: 'FAST PASS',
    popular: false
  },
  {
    id: 'rew_free_discord_stream',
    title: 'GRATIS Live Stream Discord Pass',
    subtitle: 'Tonton live raid akunmu di private Discord',
    description: 'Akses link live stream 1080p 60fps melihat pro worker kami melakukan extract loot berharga di akunmu.',
    coinCost: 150,
    rewardType: 'free_addon',
    addonType: 'stream',
    badge: 'STREAM VIP',
    popular: false
  }
];

export const INITIAL_CUSTOMERS: CustomerUser[] = [];

// Helper to determine customer tier based on total spent / exp
export function calculateTierFromExp(exp: number): CustomerTier {
  if (exp >= TIER_CONFIGS.mythic.minExp) return 'mythic';
  if (exp >= TIER_CONFIGS.warlord.minExp) return 'warlord';
  if (exp >= TIER_CONFIGS.elite.minExp) return 'elite';
  if (exp >= TIER_CONFIGS.operative.minExp) return 'operative';
  return 'recruit';
}

// Helper to calculate coins earned from an order amount based on tier
export function calculateCoinsEarned(amountSpent: number, tier: CustomerTier): number {
  const baseCoins = Math.floor(amountSpent / 1000); // 1 coin per 1.000 IDR
  const multiplier = TIER_CONFIGS[tier]?.coinMultiplier || 1.0;
  return Math.floor(baseCoins * multiplier);
}

// Initial Worker Payouts & Transfer Status History for CEO & Worker Dashboards
export const INITIAL_PAYOUTS: WorkerPayout[] = [];
