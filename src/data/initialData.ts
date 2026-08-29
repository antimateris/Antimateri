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
    id: 'usr_superadmin',
    username: 'superadmin',
    password: 'superadmin123',
    name: 'Chief Operasional (CEO & Superadmin)',
    role: 'superadmin',
    active: true,
    createdAt: '2026-01-10T08:00:00.000Z',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bankName: 'BCA',
    bankAccountNumber: '8820192837',
    bankAccountHolder: 'Chief Operasional BreakoutOps',
    commissionRatePercent: 100,
    speciality: 'Operational Lead & System CEO',
    workerTier: 'CEO / Founder',
    ratingScore: 5.0
  },
  {
    id: 'usr_admin1',
    username: 'admin1',
    password: 'admin123',
    name: 'Admin Shift Pagi (Rafi)',
    role: 'admin',
    active: true,
    createdAt: '2026-02-01T09:30:00.000Z',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bankName: 'BCA',
    bankAccountNumber: '5420918231',
    bankAccountHolder: 'Rafi Ahmad Fauzi',
    commissionRatePercent: 70,
    speciality: 'Joki Koen Speedrunner',
    workerTier: 'Senior Worker (Tier 1)',
    ratingScore: 4.9,
    improvementFeedback: [
      'Respon awal sangat cepat dan tertib melaporkan progres setiap 1M koen.',
      'Saran: Pastikan customer selalu diingatkan untuk ganti password setelah pengerjaan selesai.'
    ]
  },
  {
    id: 'usr_admin2',
    username: 'joki_alpha',
    password: 'admin123',
    name: 'Pro Joki Alpha (Raid Master Dimas)',
    role: 'admin',
    active: true,
    createdAt: '2026-02-15T14:20:00.000Z',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bankName: 'DANA',
    bankAccountNumber: '081299887766',
    bankAccountHolder: 'Dimas Prasetyo',
    commissionRatePercent: 75,
    speciality: 'Mandor Armory & TV Station Specialist',
    workerTier: 'Pro Joki (Tier 2)',
    ratingScore: 4.8,
    improvementFeedback: [
      'Gameplay extract rate di Armory sangat tinggi (92%).',
      'Perlu di-improve: Upload screenshot loot berharga langsung ke sistem tanpa menunggu order selesai.'
    ]
  },
  {
    id: 'usr_admin3',
    username: 'joki_bravo',
    password: 'admin123',
    name: 'Joki Bravo (Squad Escort Aldi)',
    role: 'admin',
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
  maintenanceMode: false,
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

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord_9821',
    invoiceNumber: 'ABO-2026-9821',
    serviceType: 'joki_koen',
    serviceName: 'Joki Koen Arena Breakout',
    packageName: '5 Juta Koen (5M)',
    koenAmountMillion: 5,
    gameNickname: 'GhostOperator99',
    loginMethod: 'Level Infinite',
    gameUserId: 'AB-99281740',
    accountNotes: 'Stash ada di tab 2, senjata bebas pakai di stash jika butuh',
    customerName: 'Bima Satria',
    customerWhatsApp: '081234567890',
    basePrice: 110000,
    discount: 0,
    uniqueCode: 421,
    totalPrice: 110421,
    paymentMethod: 'qris',
    paymentStatus: 'paid',
    paidAt: '2026-08-28T04:15:00.000Z',
    orderStatus: 'in_progress',
    createdAt: '2026-08-28T04:10:00.000Z',
    startedAt: '2026-08-28T04:30:00.000Z',
    assignedWorker: 'Pro Joki Alpha (Raid Master)',
    currentProgressPercent: 75,
    isPrioritySpeed: true,
    isSafeLootOnly: true,
    progressHistory: [
      {
        id: 'prf_1',
        timestamp: '2026-08-28T04:30:00.000Z',
        note: 'Login sukses, saldo awal 240.000 Koen tercatat aman. Memulai Raid 1 Farm Lockdown.',
        imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
        workerName: 'Pro Joki Alpha',
        progressPercent: 10,
        koenAccumulated: 240000
      },
      {
        id: 'prf_2',
        timestamp: '2026-08-28T05:10:00.000Z',
        note: 'Raid 1 & 2 Clear extraction! Membuka Motel Main Bedroom & Villa safe. Koen bertambah +2.6M.',
        imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
        workerName: 'Pro Joki Alpha',
        progressPercent: 55,
        koenAccumulated: 2840000
      },
      {
        id: 'prf_3',
        timestamp: '2026-08-28T05:45:00.000Z',
        note: 'Raid 3 Farm Lockdown Clear, dapat Dokumen Rahasia & Gold Items. Total terkumpul 4.1M Koen (80%). Menuju raid terakhir.',
        imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
        workerName: 'Pro Joki Alpha',
        progressPercent: 75,
        koenAccumulated: 4100000
      }
    ]
  },
  {
    id: 'ord_9820',
    invoiceNumber: 'ABO-2026-9820',
    serviceType: 'joki_mandor',
    serviceName: 'Joki Mandor Escort Raid',
    packageName: 'Mandor 3 Raids Lockdown',
    mandorPackageType: 'per_raid',
    mandorRaidsCount: 3,
    mandorMap: 'Armory Lockdown',
    mandorPlayMode: 'mabar_squad',
    gameNickname: 'ShadowViper_ID',
    loginMethod: 'Google',
    gameUserId: 'AB-55829102',
    accountNotes: 'Mabar bareng joki via Voice Discord / In-game mic',
    customerName: 'Deni Kurniawan',
    customerWhatsApp: '085711223344',
    basePrice: 95000,
    discount: 10000,
    uniqueCode: 120,
    totalPrice: 85120,
    paymentMethod: 'dana',
    paymentStatus: 'paid',
    paidAt: '2026-08-28T02:00:00.000Z',
    orderStatus: 'completed',
    createdAt: '2026-08-28T01:50:00.000Z',
    startedAt: '2026-08-28T02:15:00.000Z',
    completedAt: '2026-08-28T03:45:00.000Z',
    assignedWorker: 'Joki Bravo (Armory Specialist)',
    currentProgressPercent: 100,
    progressHistory: [
      {
        id: 'prf_m1',
        timestamp: '2026-08-28T02:15:00.000Z',
        note: 'Sesi mabar dimulai di lobby Armory.',
        workerName: 'Joki Bravo',
        progressPercent: 20,
        raidsCompleted: 0
      },
      {
        id: 'prf_m2',
        timestamp: '2026-08-28T03:00:00.000Z',
        note: 'Raid 1 & 2 Berhasil evakuasi selamat melalui bunker! Customer mengamankan T6 Helmet & Golden Lion statue.',
        imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
        workerName: 'Joki Bravo',
        progressPercent: 70,
        raidsCompleted: 2
      },
      {
        id: 'prf_m3',
        timestamp: '2026-08-28T03:45:00.000Z',
        note: 'Raid 3 Armory Selesai! Wipe squad musuh di Command Room. Total loot customer tembus 2.1 Juta Koen! Selesai 100%.',
        imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
        workerName: 'Joki Bravo',
        progressPercent: 100,
        raidsCompleted: 3
      }
    ]
  },
  {
    id: 'ord_9819',
    invoiceNumber: 'ABO-2026-9819',
    serviceType: 'joki_koen',
    serviceName: 'Joki Koen Arena Breakout',
    packageName: '10 Juta Koen (10M)',
    koenAmountMillion: 10,
    gameNickname: 'KamonaSniper',
    loginMethod: 'Facebook',
    customerName: 'Reza Pratama',
    customerWhatsApp: '089612345678',
    basePrice: 200000,
    discount: 0,
    uniqueCode: 819,
    totalPrice: 200819,
    paymentMethod: 'bca',
    paymentStatus: 'paid',
    paidAt: '2026-08-28T00:30:00.000Z',
    orderStatus: 'queued',
    createdAt: '2026-08-28T00:25:00.000Z',
    assignedWorker: 'Admin Shift Pagi',
    currentProgressPercent: 0,
    progressHistory: []
  },
  {
    id: 'ord_9818',
    invoiceNumber: 'ABO-2026-9818',
    serviceType: 'joki_mandor',
    serviceName: 'Joki Mandor Escort Raid',
    packageName: 'Mandor Waktu 4 Jam',
    mandorPackageType: 'per_jam',
    mandorHoursCount: 4,
    mandorMap: 'TV Station Lockdown',
    mandorPlayMode: 'solo_escort',
    gameNickname: 'ValkyrieDelta',
    loginMethod: 'Level Infinite',
    customerName: 'Fahri Ramadhan',
    customerWhatsApp: '087812903456',
    basePrice: 150000,
    discount: 0,
    uniqueCode: 180,
    totalPrice: 150180,
    paymentMethod: 'qris',
    paymentStatus: 'pending',
    orderStatus: 'unpaid',
    createdAt: '2026-08-28T06:40:00.000Z',
    currentProgressPercent: 0,
    progressHistory: []
  },
  {
    id: 'ord_9817',
    invoiceNumber: 'ABO-2026-9817',
    serviceType: 'joki_koen',
    serviceName: 'Joki Koen Arena Breakout',
    packageName: '3 Juta Koen (3M)',
    koenAmountMillion: 3,
    gameNickname: 'TacticalRanger',
    loginMethod: 'Level Infinite',
    customerName: 'Arya Dimas',
    customerWhatsApp: '081399887766',
    basePrice: 70000,
    discount: 0,
    uniqueCode: 317,
    totalPrice: 70317,
    paymentMethod: 'gopay',
    paymentStatus: 'paid',
    paidAt: '2026-08-27T18:00:00.000Z',
    orderStatus: 'completed',
    createdAt: '2026-08-27T17:50:00.000Z',
    startedAt: '2026-08-27T18:15:00.000Z',
    completedAt: '2026-08-27T19:20:00.000Z',
    assignedWorker: 'Pro Joki Alpha',
    currentProgressPercent: 100,
    progressHistory: [
      {
        id: 'prf_k1',
        timestamp: '2026-08-27T19:20:00.000Z',
        note: 'Selesai 3M Koen aman bersih di Stash. Akun telah logout dengan aman.',
        imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
        workerName: 'Pro Joki Alpha',
        progressPercent: 100,
        koenAccumulated: 3150000
      }
    ]
  }
];

export const INITIAL_WA_LOGS: WhatsAppNotificationLog[] = [
  {
    id: 'wal_1',
    orderId: 'ord_9821',
    invoiceNumber: 'ABO-2026-9821',
    customerPhone: '081234567890',
    customerName: 'Bima Satria',
    templateKey: 'orderCreated',
    message: 'Halo Bima Satria! Pesanan Joki 5M Koen ABO-2026-9821 telah dibuat. Total Rp 110.421 via QRIS.',
    sentAt: '2026-08-28T04:10:05.000Z',
    status: 'read'
  },
  {
    id: 'wal_2',
    orderId: 'ord_9821',
    invoiceNumber: 'ABO-2026-9821',
    customerPhone: '081234567890',
    customerName: 'Bima Satria',
    templateKey: 'paymentReceived',
    message: 'Pembayaran invoice ABO-2026-9821 terverifikasi sukses! Ditugaskan ke Pro Joki Alpha.',
    sentAt: '2026-08-28T04:15:10.000Z',
    status: 'read'
  },
  {
    id: 'wal_3',
    orderId: 'ord_9821',
    invoiceNumber: 'ABO-2026-9821',
    customerPhone: '081234567890',
    customerName: 'Bima Satria',
    templateKey: 'jokiStarted',
    message: 'Joki pesanan ABO-2026-9821 saat ini SEDANG DIMULAI oleh Pro Joki Alpha. Mohon tidak login ke game.',
    sentAt: '2026-08-28T04:30:12.000Z',
    status: 'read'
  },
  {
    id: 'wal_4',
    orderId: 'ord_9821',
    invoiceNumber: 'ABO-2026-9821',
    customerPhone: '081234567890',
    customerName: 'Bima Satria',
    templateKey: 'progressUpdate',
    message: 'Update Progress 75%: Raid 3 Farm Lockdown Clear, Koen terkumpul 4.1M / 5M.',
    sentAt: '2026-08-28T05:45:00.000Z',
    status: 'delivered'
  }
];

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

export const INITIAL_CUSTOMERS: CustomerUser[] = [
  {
    id: 'cust_sultan1',
    username: 'sultan_kamona',
    password: 'user123',
    name: 'Dimas Rayhan (Sultan Armory)',
    whatsapp: '081298877665',
    gameNickname: 'GhostRider_AB',
    gameUserId: '98812039',
    opsCoins: 1250,
    exp: 4250000,
    tier: 'mythic',
    totalSpent: 4250000,
    totalOrders: 18,
    totalKoenFarmedMillion: 120,
    totalRaidHours: 35,
    createdAt: '2026-01-15T10:00:00.000Z',
    isAnonymizedInLeaderboard: false,
    redeemedRewards: [
      {
        id: 'red_1',
        rewardId: 'rew_disc_35k',
        code: 'REW-DISC35-8912',
        title: 'Voucher Diskon Rp 35.000',
        rewardType: 'discount_voucher',
        discountAmount: 35000,
        redeemedAt: '2026-08-25T12:00:00.000Z',
        isUsed: true,
        usedInInvoice: 'ABO-2026-9821'
      }
    ]
  },
  {
    id: 'cust_bima',
    username: 'bimasatria',
    password: 'user123',
    name: 'Bima Satria',
    whatsapp: '081234567890',
    gameNickname: 'Vanguard_Bima',
    gameUserId: '10992812',
    opsCoins: 480,
    exp: 1850000,
    tier: 'warlord',
    totalSpent: 1850000,
    totalOrders: 9,
    totalKoenFarmedMillion: 45,
    totalRaidHours: 14,
    createdAt: '2026-02-01T14:30:00.000Z',
    isAnonymizedInLeaderboard: false,
    redeemedRewards: []
  },
  {
    id: 'cust_reza',
    username: 'rezanight',
    password: 'user123',
    name: 'Reza Pratama',
    whatsapp: '085711223344',
    gameNickname: 'NightStalker_99',
    gameUserId: '88721990',
    opsCoins: 210,
    exp: 750000,
    tier: 'elite',
    totalSpent: 750000,
    totalOrders: 4,
    totalKoenFarmedMillion: 20,
    totalRaidHours: 6,
    createdAt: '2026-02-18T16:00:00.000Z',
    isAnonymizedInLeaderboard: false,
    redeemedRewards: []
  },
  {
    id: 'cust_fajar',
    username: 'fajarhunter',
    password: 'user123',
    name: 'Fajar Gunawan',
    whatsapp: '087855667788',
    gameNickname: 'KamonaHunter',
    gameUserId: '65431289',
    opsCoins: 90,
    exp: 280000,
    tier: 'operative',
    totalSpent: 280000,
    totalOrders: 2,
    totalKoenFarmedMillion: 8,
    totalRaidHours: 2,
    createdAt: '2026-03-02T11:20:00.000Z',
    isAnonymizedInLeaderboard: false,
    redeemedRewards: []
  },
  {
    id: 'cust_aldy',
    username: 'aldy_raid',
    password: 'user123',
    name: 'Aldy Kurniawan',
    whatsapp: '081399887766',
    gameNickname: 'ArmoryBeast',
    gameUserId: '43219087',
    opsCoins: 35,
    exp: 70000,
    tier: 'recruit',
    totalSpent: 70000,
    totalOrders: 1,
    totalKoenFarmedMillion: 3,
    totalRaidHours: 0,
    createdAt: '2026-03-10T09:00:00.000Z',
    isAnonymizedInLeaderboard: false,
    redeemedRewards: []
  }
];

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
export const INITIAL_PAYOUTS: WorkerPayout[] = [
  {
    id: 'pay_101',
    payoutNumber: 'TRF-2026-001',
    workerId: 'usr_admin2',
    workerName: 'Pro Joki Alpha (Raid Master Dimas)',
    workerUsername: 'joki_alpha',
    accountBank: 'DANA',
    accountNumber: '081299887766',
    accountHolderName: 'Dimas Prasetyo',
    amount: 195000,
    period: 'Pekan 4 Agustus 2026',
    workSummary: '2 Order Selesai (10M Koen Farm + 5M Koen Lockdown)',
    completedOrdersCount: 2,
    completedOrdersList: [
      {
        orderId: 'ord_9815',
        invoiceNumber: 'ABO-2026-9815',
        serviceName: 'Joki Koen Arena Breakout',
        packageName: '10 Juta Koen (10M)',
        totalPrice: 200000,
        workerCommission: 140000,
        completedAt: '2026-08-27T18:30:00.000Z',
        gameNickname: 'HunterZero'
      },
      {
        orderId: 'ord_9816',
        invoiceNumber: 'ABO-2026-9816',
        serviceName: 'Joki Koen Arena Breakout',
        packageName: '5 Juta Koen (5M)',
        totalPrice: 110000,
        workerCommission: 55000,
        completedAt: '2026-08-27T22:15:00.000Z',
        gameNickname: 'GhostOperator'
      }
    ],
    status: 'transferred',
    createdAt: '2026-08-27T23:00:00.000Z',
    processedAt: '2026-08-28T00:15:00.000Z',
    transferredAt: '2026-08-28T00:30:00.000Z',
    transferProofUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
    adminNotes: 'Transfer via DANA Bisnis sukses. Reff: DANA-20260828-9921',
    improvementFeedback: 'Kinerja sangat cepat dan rapi. Pertahankan winrate raid di Armory.'
  },
  {
    id: 'pay_102',
    payoutNumber: 'TRF-2026-002',
    workerId: 'usr_admin3',
    workerName: 'Joki Bravo (Squad Escort Aldi)',
    workerUsername: 'joki_bravo',
    accountBank: 'Mandiri',
    accountNumber: '1370019283746',
    accountHolderName: 'Aldi Saputra',
    amount: 60000,
    period: 'Pekan 4 Agustus 2026',
    workSummary: '1 Order Selesai (Mandor 3 Raids Armory Lockdown)',
    completedOrdersCount: 1,
    completedOrdersList: [
      {
        orderId: 'ord_9820',
        invoiceNumber: 'ABO-2026-9820',
        serviceName: 'Joki Mandor Escort Raid',
        packageName: 'Mandor 3 Raids Lockdown',
        totalPrice: 85120,
        workerCommission: 60000,
        completedAt: '2026-08-28T03:45:00.000Z',
        gameNickname: 'ShadowViper_ID'
      }
    ],
    status: 'processing',
    createdAt: '2026-08-28T04:00:00.000Z',
    processedAt: '2026-08-28T04:15:00.000Z',
    adminNotes: 'Sedang diverifikasi oleh Finance / CEO untuk batch transfer pagi.',
    improvementFeedback: 'Pelanggan puas dengan panduan rute bunker. Mohon upload bukti screenshot loot lebih awal.'
  },
  {
    id: 'pay_103',
    payoutNumber: 'TRF-2026-003',
    workerId: 'usr_admin1',
    workerName: 'Admin Shift Pagi (Rafi)',
    workerUsername: 'admin1',
    accountBank: 'BCA',
    accountNumber: '5420918231',
    accountHolderName: 'Rafi Ahmad Fauzi',
    amount: 140000,
    period: 'Pekan 4 Agustus 2026',
    workSummary: '1 Order Standby (10 Juta Koen Farm Queued)',
    completedOrdersCount: 1,
    completedOrdersList: [
      {
        orderId: 'ord_9819',
        invoiceNumber: 'ABO-2026-9819',
        serviceName: 'Joki Koen Arena Breakout',
        packageName: '10 Juta Koen (10M)',
        totalPrice: 200819,
        workerCommission: 140000,
        gameNickname: 'KamonaSniper'
      }
    ],
    status: 'pending',
    createdAt: '2026-08-28T05:00:00.000Z',
    adminNotes: 'Menunggu order diselesaikan 100% dan dikonfirmasi customer.',
    improvementFeedback: 'Siap start shift pagi. Jangan lupa kirim notifikasi WhatsApp saat order mulai dimainkan.'
  }
];
