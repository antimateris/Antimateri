export type OrderStatus = 
  | 'unpaid' 
  | 'verifying' 
  | 'queued' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled';

export type ServiceType = 'joki_koen' | 'joki_mandor';

export type PaymentMethod = 
  | 'qris' 
  | 'gopay' 
  | 'ovo' 
  | 'dana' 
  | 'shopeepay' 
  | 'bca' 
  | 'mandiri' 
  | 'bni' 
  | 'bri';

export type PaymentStatus = 'pending' | 'paid' | 'expired' | 'failed';

export type UserRole = 'superadmin' | 'admin';

export type PayoutStatus = 'pending' | 'processing' | 'transferred' | 'rejected';

export interface CompletedOrderItemSummary {
  orderId: string;
  invoiceNumber: string;
  serviceName: string;
  packageName: string;
  totalPrice: number;
  workerCommission: number;
  completedAt?: string;
  gameNickname?: string;
}

export interface WorkerPayout {
  id: string;
  payoutNumber: string; // e.g. "TRF-2026-001"
  workerId: string;
  workerName: string;
  workerUsername?: string;
  
  // Rekening & Nominal
  accountBank: string; // "BCA", "BRI", "Mandiri", "BNI", "DANA", "GoPay", "OVO", "ShopeePay", "Seabank", dll
  accountNumber: string;
  accountHolderName: string;
  amount: number; // Nominal Transfer (Rp)
  
  // Pengerjaan
  period?: string; // e.g. "Pekan 4 Agustus 2026"
  workSummary: string; // e.g. "5 Order Koen Selesai (25M Koen) + 2 Mandor Armory"
  completedOrdersCount: number;
  completedOrdersList?: CompletedOrderItemSummary[];
  
  // Status & Timestamps
  status: PayoutStatus;
  createdAt: string;
  processedAt?: string;
  transferredAt?: string;
  
  // Catatan & Bukti
  transferProofUrl?: string;
  adminNotes?: string;
  improvementFeedback?: string; // Catatan evaluasi & improve dari CEO
}

export interface AdminUser {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  avatar?: string;
  
  // Bank & Payout Information
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  commissionRatePercent?: number; // e.g. 70%
  speciality?: string; // e.g. "Joki Koen Speedrunner", "Mandor Armory/TV Specialist"
  workerTier?: string; // e.g. "Senior Worker (Tier 1)", "Pro Joki", "Junior Joki"
  ratingScore?: number; // e.g. 4.9
  improvementFeedback?: string[]; // Catatan evaluasi performa dari CEO
}

export interface ProgressProof {
  id: string;
  timestamp: string;
  note: string;
  imageUrl?: string;
  workerName: string;
  progressPercent: number;
  koenAccumulated?: number;
  raidsCompleted?: number;
}

export interface Order {
  id: string;
  invoiceNumber: string;
  serviceType: ServiceType;
  serviceName: string;
  packageName: string;
  
  // Specific details
  koenAmountMillion?: number; // e.g. 5 for 5 Juta Koen
  mandorPackageType?: 'per_raid' | 'per_jam';
  mandorRaidsCount?: number;
  mandorHoursCount?: number;
  mandorMap?: string; // Farm, Valley, Northridge, Armory, Port, TV Station
  mandorPlayMode?: 'solo_escort' | 'mabar_squad'; // Joki pegang akun vs mabar dibimbing
  
  // Account details
  gameNickname: string;
  loginMethod: 'Level Infinite' | 'Facebook' | 'Google' | 'VK';
  gameUserId?: string;
  accountNotes?: string;
  
  // Customer details
  customerName: string;
  customerWhatsApp: string;
  
  // Financials
  basePrice: number;
  discount: number;
  uniqueCode: number;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidAt?: string;
  
  // Execution details
  orderStatus: OrderStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  assignedWorker?: string;
  currentProgressPercent: number;
  progressHistory: ProgressProof[];
  
  // Add-ons
  isPrioritySpeed?: boolean;
  isStreamDiscord?: boolean;
  isSafeLootOnly?: boolean;
}

export interface KoenPackagePrice {
  id: string;
  amountMillion: number;
  title: string;
  price: number;
  originalPrice: number;
  popular?: boolean;
  description: string;
}

export interface MandorPackagePrice {
  id: string;
  type: 'per_raid' | 'per_jam';
  quantity: number; // e.g. 3 raids or 2 hours
  title: string;
  price: number;
  originalPrice: number;
  popular?: boolean;
  description: string;
  maps: string[];
}

export interface PriceConfig {
  koenPerMillionRate: number; // Base rate for custom slider (e.g. Rp 25.000 / 1M)
  koenPackages: KoenPackagePrice[];
  mandorPackages: MandorPackagePrice[];
  prioritySpeedFee: number;
  streamDiscordFee: number;
  safeLootGuaranteeFee: number;
}

export interface SystemSettings {
  storeName: string;
  storeTagline: string;
  whatsappCSNumber: string; // e.g. "6282198765432"
  workerGroupWhatsApp?: string; // e.g. "6281299887766" or group bot WA
  csWorkingHours: string;
  autoVerifyPayment: boolean;
  maintenanceMode: boolean;
  announcementText: string;
  runningTicker: string;
  whatsappGatewayApiKey: string;
  whatsappGatewayWebhook: string;
  notificationTemplates: {
    orderCreated: string;
    paymentReceived: string;
    jokiStarted: string;
    progressUpdate: string;
    orderCompleted: string;
    workerMissionBroadcast?: string; // Format pesan anonim khusus ke grup worker / bot
  };
}

export interface WhatsAppNotificationLog {
  id: string;
  orderId: string;
  invoiceNumber: string;
  customerPhone: string;
  customerName: string;
  templateKey: 'orderCreated' | 'paymentReceived' | 'jokiStarted' | 'progressUpdate' | 'orderCompleted' | 'workerMissionBroadcast';
  message: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'read';
}

// ============================================
// CUSTOMER MEMBERSHIP & GAMIFICATION TYPES
// ============================================

export type CustomerTier = 'recruit' | 'operative' | 'elite' | 'warlord' | 'mythic';

export interface CustomerRedeemedReward {
  id: string;
  rewardId: string;
  code: string;
  title: string;
  rewardType: 'discount_voucher' | 'free_koen' | 'free_mandor' | 'free_addon';
  discountAmount?: number;
  freeKoenAmountMillion?: number;
  freeMandorHours?: number;
  addonType?: 'priority' | 'stream' | 'safeloot';
  redeemedAt: string;
  isUsed: boolean;
  usedInInvoice?: string;
}

export interface CustomerUser {
  id: string;
  username: string;
  password?: string;
  name: string;
  whatsapp: string;
  gameNickname?: string;
  gameUserId?: string;
  opsCoins: number;
  exp: number;
  tier: CustomerTier;
  totalSpent: number;
  totalOrders: number;
  totalKoenFarmedMillion: number;
  totalRaidHours: number;
  avatar?: string;
  createdAt: string;
  redeemedRewards?: CustomerRedeemedReward[];
  isAnonymizedInLeaderboard?: boolean;
}

export interface RewardItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  coinCost: number;
  rewardType: 'discount_voucher' | 'free_koen' | 'free_mandor' | 'free_addon';
  discountAmount?: number;
  freeKoenAmountMillion?: number;
  freeMandorHours?: number;
  addonType?: 'priority' | 'stream' | 'safeloot';
  badge: string;
  minTier?: CustomerTier;
  popular?: boolean;
}

export interface TierConfig {
  id: CustomerTier;
  name: string;
  title: string;
  minExp: number;
  coinMultiplier: number; // e.g. 1.05 for +5% coin bonus
  color: string;
  badgeBg: string;
  borderBg: string;
  perks: string[];
}
