import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { OrderForm } from './components/OrderForm';
import { TrackingPage } from './components/TrackingPage';
import { PriceCatalogPage } from './components/PriceCatalogPage';
import { CustomerServicePage } from './components/CustomerServicePage';
import { CustomerServiceWidget } from './components/CustomerServiceWidget';
import { PaymentModal } from './components/PaymentModal';
import { AdminLoginModal } from './components/Admin/AdminLoginModal';
import { AdminPortal } from './components/Admin/AdminPortal';
import { Footer } from './components/Footer';

// Customer Gamification Components
import { CustomerAuthModal } from './components/Customer/CustomerAuthModal';
import { CustomerProfileModal } from './components/Customer/CustomerProfileModal';
import { RewardsStoreModal } from './components/Customer/RewardsStoreModal';
import { LeaderboardPage } from './components/LeaderboardPage';

import { 
  Order, 
  PriceConfig, 
  AdminUser, 
  SystemSettings, 
  WhatsAppNotificationLog,
  ServiceType,
  CustomerUser,
  CustomerRedeemedReward,
  WorkerPayout
} from './types';
import { 
  INITIAL_ORDERS, 
  INITIAL_PRICE_CONFIG, 
  INITIAL_ADMINS, 
  INITIAL_SYSTEM_SETTINGS, 
  INITIAL_WA_LOGS,
  INITIAL_CUSTOMERS,
  INITIAL_PAYOUTS,
  calculateTierFromExp,
  calculateCoinsEarned
} from './data/initialData';
import { 
  buildWhatsAppMessage, 
  buildWorkerAnonymousMessage,
  getWhatsAppDirectUrl 
} from './utils/helpers';
import { 
  subscribeToOrders, 
  saveOrderToFirestore, 
  subscribeToSettings, 
  saveSettingsToFirestore, 
  subscribeToPriceConfig, 
  savePriceConfigToFirestore, 
  saveWaLogToFirestore,
  subscribeToAdmins,
  saveAdminToFirestore,
  deleteAdminFromFirestore,
  subscribeToCustomers,
  saveCustomerToFirestore,
  deleteCustomerFromFirestore,
  subscribeToPayouts,
  savePayoutToFirestore,
  deletePayoutFromFirestore
} from './lib/firebase';

export default function App() {
  // App Core State with Firebase Real-Time Firestore Synchronization
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('breakoutops_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load orders from localStorage', e);
    }
    return INITIAL_ORDERS;
  });

  const [priceConfig, setPriceConfig] = useState<PriceConfig>(() => {
    try {
      const saved = localStorage.getItem('breakoutops_price_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...INITIAL_PRICE_CONFIG, ...parsed };
        }
      }
    } catch (e) {
      console.warn('Failed to load price config from localStorage', e);
    }
    return INITIAL_PRICE_CONFIG;
  });

  const [admins, setAdmins] = useState<AdminUser[]>(() => {
    try {
      const saved = localStorage.getItem('breakoutops_admins');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load admins from localStorage', e);
    }
    return INITIAL_ADMINS;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem('breakoutops_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            ...INITIAL_SYSTEM_SETTINGS,
            ...parsed,
            notificationTemplates: {
              ...INITIAL_SYSTEM_SETTINGS.notificationTemplates,
              ...(parsed.notificationTemplates || {}),
            },
          };
        }
      }
    } catch (e) {
      console.warn('Failed to load settings from localStorage', e);
    }
    return INITIAL_SYSTEM_SETTINGS;
  });

  const [waLogs, setWaLogs] = useState<WhatsAppNotificationLog[]>(() => {
    try {
      const saved = localStorage.getItem('breakoutops_wa_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load wa logs from localStorage', e);
    }
    return INITIAL_WA_LOGS;
  });

  // Worker Payouts & Transfer Status State
  const [payouts, setPayouts] = useState<WorkerPayout[]>(() => {
    try {
      const saved = localStorage.getItem('breakoutops_payouts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load payouts from localStorage', e);
    }
    return INITIAL_PAYOUTS;
  });

  // Customer Gamification & Accounts State
  const [customers, setCustomers] = useState<CustomerUser[]>(() => {
    try {
      const saved = localStorage.getItem('breakoutops_customers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load customers from localStorage', e);
    }
    return INITIAL_CUSTOMERS;
  });

  const [currentCustomer, setCurrentCustomer] = useState<CustomerUser | null>(() => {
    try {
      const saved = localStorage.getItem('breakoutops_current_customer');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load current customer', e);
    }
    return null;
  });

  // Current Navigation Tab ('order' | 'catalog' | 'track' | 'prices' | 'cs' | 'admin' | 'leaderboard' | 'rewards')
  const [activeTab, setActiveTab] = useState<'order' | 'catalog' | 'track' | 'prices' | 'cs' | 'admin' | 'leaderboard' | 'rewards'>('order');
  
  // Logged in Admin Session
  const [currentAdminUser, setCurrentAdminUser] = useState<AdminUser | null>(null);

  // Modals
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
  const [isCustomerAuthOpen, setIsCustomerAuthOpen] = useState<boolean>(false);
  const [isCustomerProfileOpen, setIsCustomerProfileOpen] = useState<boolean>(false);
  const [isRewardsStoreOpen, setIsRewardsStoreOpen] = useState<boolean>(false);

  // Active Applied Voucher for Order
  const [appliedVoucher, setAppliedVoucher] = useState<CustomerRedeemedReward | null>(null);

  // Search invoice prefilled for Tracking page
  const [trackingInitialQuery, setTrackingInitialQuery] = useState<string>('');

  // 1. Subscribe to Firebase Firestore on Mount
  useEffect(() => {
    const unsubscribeOrders = subscribeToOrders((cloudOrders) => {
      if (cloudOrders && cloudOrders.length > 0) {
        setOrders(cloudOrders);
      }
    });

    const unsubscribeSettings = subscribeToSettings((cloudSettings) => {
      if (cloudSettings) {
        setSettings(cloudSettings);
      }
    });

    const unsubscribePrices = subscribeToPriceConfig((cloudPrices) => {
      if (cloudPrices) {
        setPriceConfig(cloudPrices);
      }
    });

    const unsubscribeAdmins = subscribeToAdmins((cloudAdmins) => {
      if (cloudAdmins && cloudAdmins.length > 0) {
        setAdmins(cloudAdmins);
        // Also update current admin user session if it was modified
        setCurrentAdminUser((curr) => {
          if (!curr) return null;
          const match = cloudAdmins.find((a) => a.id === curr.id);
          return match || curr;
        });
      }
    });

    const unsubscribeCustomers = subscribeToCustomers((cloudCustomers) => {
      if (cloudCustomers && cloudCustomers.length > 0) {
        setCustomers(cloudCustomers);
        // Sync current customer state
        setCurrentCustomer((curr) => {
          if (!curr) return null;
          const match = cloudCustomers.find((c) => c.id === curr.id);
          return match || curr;
        });
      }
    });

    const unsubscribePayouts = subscribeToPayouts((cloudPayouts) => {
      if (cloudPayouts && cloudPayouts.length > 0) {
        setPayouts(cloudPayouts);
      }
    });

    return () => {
      unsubscribeOrders();
      unsubscribeSettings();
      unsubscribePrices();
      unsubscribeAdmins();
      unsubscribeCustomers();
      unsubscribePayouts();
    };
  }, []);

  // Save to localStorage when state changes as instant cache
  useEffect(() => {
    try {
      localStorage.setItem('breakoutops_orders', JSON.stringify(orders));
    } catch (e) {
      console.warn('Failed to save orders', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('breakoutops_payouts', JSON.stringify(payouts));
    } catch (e) {
      console.warn('Failed to save payouts', e);
    }
  }, [payouts]);

  useEffect(() => {
    try {
      localStorage.setItem('breakoutops_price_config', JSON.stringify(priceConfig));
    } catch (e) {
      console.warn('Failed to save price config', e);
    }
  }, [priceConfig]);

  useEffect(() => {
    try {
      localStorage.setItem('breakoutops_admins', JSON.stringify(admins));
    } catch (e) {
      console.warn('Failed to save admins', e);
    }
  }, [admins]);

  useEffect(() => {
    try {
      localStorage.setItem('breakoutops_customers', JSON.stringify(customers));
    } catch (e) {
      console.warn('Failed to save customers', e);
    }
  }, [customers]);

  useEffect(() => {
    try {
      if (currentCustomer) {
        localStorage.setItem('breakoutops_current_customer', JSON.stringify(currentCustomer));
      } else {
        localStorage.removeItem('breakoutops_current_customer');
      }
    } catch (e) {
      console.warn('Failed to save current customer', e);
    }
  }, [currentCustomer]);

  useEffect(() => {
    try {
      localStorage.setItem('breakoutops_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('breakoutops_wa_logs', JSON.stringify(waLogs));
    } catch (e) {
      console.warn('Failed to save wa logs', e);
    }
  }, [waLogs]);

  // Handler: Order Placed from Order Form
  const handleOrderCreated = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);

    // Save to Firestore Realtime
    saveOrderToFirestore(newOrder);

    // If customer used a voucher in this order, mark it as used
    if (appliedVoucher && currentCustomer) {
      const updatedRewards = (currentCustomer.redeemedRewards || []).map((r) =>
        r.id === appliedVoucher.id ? { ...r, isUsed: true, usedInInvoice: newOrder.invoiceNumber } : r
      );
      const updatedCust: CustomerUser = {
        ...currentCustomer,
        redeemedRewards: updatedRewards,
      };
      handleCustomerUpdate(updatedCust);
      setAppliedVoucher(null);
    }

    // Create automated WhatsApp notification log for Customer
    const waText = buildWhatsAppMessage(
      settings?.notificationTemplates?.orderCreated || INITIAL_SYSTEM_SETTINGS.notificationTemplates.orderCreated,
      newOrder,
      settings || INITIAL_SYSTEM_SETTINGS,
      window.location.origin
    );

    const newLog: WhatsAppNotificationLog = {
      id: `walog_${Date.now()}`,
      orderId: newOrder.id,
      invoiceNumber: newOrder.invoiceNumber,
      customerPhone: newOrder.customerWhatsApp,
      customerName: newOrder.customerName,
      templateKey: 'orderCreated',
      message: waText,
      status: 'delivered',
      sentAt: new Date().toISOString(),
    };

    setWaLogs((prev) => [newLog, ...prev]);
    saveWaLogToFirestore(newLog);

    // Automatically create Anonymous Mission Briefing for Worker Bot
    const workerAnonymousText = buildWorkerAnonymousMessage(newOrder, settings || INITIAL_SYSTEM_SETTINGS, window.location.origin);
    const workerLog: WhatsAppNotificationLog = {
      id: `walog_worker_${Date.now()}`,
      orderId: newOrder.id,
      invoiceNumber: newOrder.invoiceNumber,
      customerPhone: settings?.workerGroupWhatsApp || 'BOT_WORKER_GROUP',
      customerName: 'Grup Worker / Bot WA (Anonim)',
      templateKey: 'workerMissionBroadcast',
      message: workerAnonymousText,
      status: 'delivered',
      sentAt: new Date().toISOString(),
    };
    setWaLogs((prev) => [workerLog, ...prev]);
    saveWaLogToFirestore(workerLog);

    // Automatically open the Payment Gateway Modal
    setPaymentOrder(newOrder);
  };

  // Handler: Payment Completed in Payment Modal
  const handlePaymentSuccess = (paidOrderOrId: string | Order, paymentRef = 'AUTO_PAY_VERIFIED') => {
    const paidId = typeof paidOrderOrId === 'string' ? paidOrderOrId : paidOrderOrId.id;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === paidId) {
          const updated: Order = {
            ...ord,
            orderStatus: 'queued',
            paymentStatus: 'paid',
            paidAt: new Date().toISOString(),
            currentProgressPercent: 5,
            progressHistory: [
              ...(ord.progressHistory || []),
              {
                id: `prf_pay_${Date.now()}`,
                timestamp: new Date().toISOString(),
                note: `Pembayaran ${ord.paymentMethod.toUpperCase()} Terverifikasi Otomatis. Pesanan telah dimasukkan ke antrean prioritas joki. Ref: ${paymentRef}`,
                workerName: 'Sistem Pembayaran Otomatis',
                progressPercent: 5,
              },
            ],
          };

          // Save to Firestore
          saveOrderToFirestore(updated);

          // Trigger WhatsApp log for payment received
          const waText = buildWhatsAppMessage(
            settings?.notificationTemplates?.paymentReceived || INITIAL_SYSTEM_SETTINGS.notificationTemplates.paymentReceived,
            updated,
            settings || INITIAL_SYSTEM_SETTINGS,
            window.location.origin
          );

          const newLog: WhatsAppNotificationLog = {
            id: `walog_${Date.now()}`,
            orderId: updated.id,
            invoiceNumber: updated.invoiceNumber,
            customerPhone: updated.customerWhatsApp,
            customerName: updated.customerName,
            templateKey: 'paymentReceived',
            message: waText,
            status: 'delivered',
            sentAt: new Date().toISOString(),
          };

          setWaLogs((logs) => [newLog, ...logs]);
          saveWaLogToFirestore(newLog);

          return updated;
        }
        return ord;
      })
    );
  };

  // Reward calculation helper when an order reaches 'completed'
  const grantCustomerOrderCompletionRewards = (completedOrder: Order) => {
    // Find matching customer by WhatsApp or Name
    const targetCust = customers.find(
      (c) =>
        c.whatsapp === completedOrder.customerWhatsApp ||
        (currentCustomer && currentCustomer.id === c.id)
    );

    if (targetCust) {
      const addedExp = completedOrder.totalPrice || completedOrder.basePrice || 0;
      const newExp = targetCust.exp + addedExp;
      const newTotalSpent = targetCust.totalSpent + addedExp;
      const newTotalOrders = targetCust.totalOrders + 1;
      const newTier = calculateTierFromExp(newExp);
      const earnedCoins = calculateCoinsEarned(addedExp, newTier);
      const newCoins = targetCust.opsCoins + earnedCoins;

      const addedKoen = completedOrder.koenAmountMillion || 0;
      const addedHours = completedOrder.mandorRaidsCount || 0;

      const updatedCustomer: CustomerUser = {
        ...targetCust,
        exp: newExp,
        totalSpent: newTotalSpent,
        totalOrders: newTotalOrders,
        tier: newTier,
        opsCoins: newCoins,
        totalKoenFarmedMillion: targetCust.totalKoenFarmedMillion + addedKoen,
        totalRaidHours: targetCust.totalRaidHours + addedHours,
      };

      setCustomers((prev) => prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c)));
      saveCustomerToFirestore(updatedCustomer);

      if (currentCustomer && currentCustomer.id === targetCust.id) {
        setCurrentCustomer(updatedCustomer);
      }
    }
  };

  // Handler: Update Order from Admin
  const handleUpdateOrder = (updatedOrder: Order) => {
    const previousOrder = orders.find((o) => o.id === updatedOrder.id);
    
    setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
    saveOrderToFirestore(updatedOrder);

    // If order was just marked 'completed', grant customer gamification rewards & EXP!
    if (updatedOrder.orderStatus === 'completed' && previousOrder?.orderStatus !== 'completed') {
      grantCustomerOrderCompletionRewards(updatedOrder);
    }
  };

  // Handler: Save Settings from Admin
  const handleSaveSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
    saveSettingsToFirestore(newSettings);
  };

  // Handler: Save Prices from Admin
  const handleSavePriceConfig = (newPrices: PriceConfig) => {
    setPriceConfig(newPrices);
    savePriceConfigToFirestore(newPrices);
  };

  // Handler: Dispatch WA Notification
  const handleSendWhatsAppNotification = (
    order: Order,
    templateKey: keyof typeof settings.notificationTemplates,
    note?: string
  ) => {
    let msg = '';
    let targetPhone = order.customerWhatsApp;
    let targetName = order.customerName;

    if (templateKey === 'workerMissionBroadcast') {
      msg = buildWorkerAnonymousMessage(order, settings || INITIAL_SYSTEM_SETTINGS, window.location.origin);
      targetPhone = settings?.workerGroupWhatsApp || 'BOT_WORKER_GROUP';
      targetName = 'Grup Worker / Bot WA (Anonim)';
    } else {
      const template = settings?.notificationTemplates?.[templateKey] || settings?.notificationTemplates?.progressUpdate || INITIAL_SYSTEM_SETTINGS.notificationTemplates.progressUpdate;
      msg = buildWhatsAppMessage(template, order, settings || INITIAL_SYSTEM_SETTINGS, window.location.origin, note);
    }

    const newLog: WhatsAppNotificationLog = {
      id: `walog_${Date.now()}`,
      orderId: order.id,
      invoiceNumber: order.invoiceNumber,
      customerPhone: targetPhone,
      customerName: targetName,
      templateKey: templateKey as any,
      message: msg,
      status: 'delivered',
      sentAt: new Date().toISOString(),
    };

    setWaLogs((prev) => [newLog, ...prev]);
    saveWaLogToFirestore(newLog);
  };

  // Handler: Add Admin
  const handleAddAdmin = (newAdm: AdminUser) => {
    setAdmins((prev) => [...prev, newAdm]);
    saveAdminToFirestore(newAdm);
  };

  // Handler: Update Admin (Change Name, Password, Role, Status)
  const handleUpdateAdmin = (updatedAdm: AdminUser) => {
    setAdmins((prev) => prev.map((a) => (a.id === updatedAdm.id ? updatedAdm : a)));
    saveAdminToFirestore(updatedAdm);
    if (currentAdminUser && currentAdminUser.id === updatedAdm.id) {
      setCurrentAdminUser(updatedAdm);
    }
  };

  // Handler: Delete Admin
  const handleDeleteAdmin = (id: string) => {
    setAdmins((prev) => prev.filter((a) => a.id !== id));
    deleteAdminFromFirestore(id);
  };

  // Handler: Admin Login Success
  const handleAdminLoginSuccess = (user: AdminUser) => {
    setCurrentAdminUser(user);
    setIsAdminLoginOpen(false);
    setActiveTab('admin');
  };

  // Handler: Admin Logout
  const handleAdminLogout = () => {
    setCurrentAdminUser(null);
    setActiveTab('order');
  };

  // Customer Authentication Handlers
  const handleCustomerLoginSuccess = (cust: CustomerUser) => {
    setCurrentCustomer(cust);
    setIsCustomerAuthOpen(false);
  };

  const handleCustomerRegisterSuccess = (cust: CustomerUser) => {
    setCustomers((prev) => [cust, ...prev]);
    setCurrentCustomer(cust);
    saveCustomerToFirestore(cust);
    setIsCustomerAuthOpen(false);
  };

  const handleCustomerUpdate = (cust: CustomerUser) => {
    setCustomers((prev) => prev.map((c) => (c.id === cust.id ? cust : c)));
    if (currentCustomer && currentCustomer.id === cust.id) {
      setCurrentCustomer(cust);
    }
    saveCustomerToFirestore(cust);
  };

  const handleDeleteCustomer = (customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    if (currentCustomer && currentCustomer.id === customerId) {
      setCurrentCustomer(null);
    }
    deleteCustomerFromFirestore(customerId);
  };

  const handleCustomerLogout = () => {
    setCurrentCustomer(null);
    setIsCustomerProfileOpen(false);
  };

  // Customer Rewards Redeemed Handler
  const handleRedeemSuccess = (updatedCustomer: CustomerUser, newReward: CustomerRedeemedReward) => {
    handleCustomerUpdate(updatedCustomer);
  };

  // Handler: Apply Voucher from Rewards store directly into order form
  const handleApplyVoucherToOrder = (voucher: CustomerRedeemedReward) => {
    setAppliedVoucher(voucher);
    setActiveTab('order');
    setTimeout(() => {
      document.getElementById('order-form-card')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Handler: Navigate to Tracking with Invoice
  const handleTrackInvoice = (invoice: string) => {
    setTrackingInitialQuery(invoice);
    setActiveTab('track');
  };

  // Worker Payout handlers
  const handleAddPayout = async (newPayout: WorkerPayout) => {
    setPayouts((prev) => [newPayout, ...prev]);
    await savePayoutToFirestore(newPayout);
  };

  const handleUpdatePayout = async (updatedPayout: WorkerPayout) => {
    setPayouts((prev) => prev.map((p) => (p.id === updatedPayout.id ? updatedPayout : p)));
    await savePayoutToFirestore(updatedPayout);
  };

  const handleDeletePayout = async (payoutId: string) => {
    setPayouts((prev) => prev.filter((p) => p.id !== payoutId));
    await deletePayoutFromFirestore(payoutId);
  };

  // Handler: Select package from Catalog directly into Order Form
  const handleSelectCatalogPackage = (type: ServiceType) => {
    setActiveTab('order');
    setTimeout(() => {
      document.getElementById('order-form-card')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      
      {/* If inside Admin Console, render full Admin Portal */}
      {activeTab === 'admin' && currentAdminUser ? (
        <AdminPortal
          currentUser={currentAdminUser}
          orders={orders}
          admins={admins}
          customers={customers}
          priceConfig={priceConfig}
          settings={settings}
          waLogs={waLogs}
          payouts={payouts}
          onLogout={handleAdminLogout}
          onBackToCustomerSite={() => setActiveTab('order')}
          onUpdateOrder={handleUpdateOrder}
          onSavePriceConfig={handleSavePriceConfig}
          onAddAdmin={handleAddAdmin}
          onUpdateAdmin={handleUpdateAdmin}
          onDeleteAdmin={handleDeleteAdmin}
          onUpdateCustomer={handleCustomerUpdate}
          onDeleteCustomer={handleDeleteCustomer}
          onSaveSettings={handleSaveSettings}
          onSendWhatsAppNotification={handleSendWhatsAppNotification}
          onAddPayout={handleAddPayout}
          onUpdatePayout={handleUpdatePayout}
          onDeletePayout={handleDeletePayout}
        />
      ) : (
        /* Customer-Facing Experience */
        <>
          {/* Main Navigation Bar */}
          <Navbar
            activeTab={activeTab}
            settings={settings}
            runningTicker={settings?.runningTicker}
            activeOrdersCount={orders.filter((o) => o.orderStatus === 'in_progress').length}
            adminLoggedIn={!!currentAdminUser}
            adminRole={currentAdminUser?.role}
            currentCustomer={currentCustomer}
            onOpenCustomerAuth={() => setIsCustomerAuthOpen(true)}
            onOpenCustomerProfile={() => setIsCustomerProfileOpen(true)}
            onOpenRewardsStore={() => setIsRewardsStoreOpen(true)}
            onNavigate={(tab) => {
              if (tab === 'admin' && !currentAdminUser) {
                setIsAdminLoginOpen(true);
              } else if (tab === 'rewards') {
                setIsRewardsStoreOpen(true);
              } else {
                setActiveTab(tab as any);
              }
            }}
            setActiveTab={(tab) => {
              if (tab === 'admin' && !currentAdminUser) {
                setIsAdminLoginOpen(true);
              } else if (tab === 'rewards') {
                setIsRewardsStoreOpen(true);
              } else {
                setActiveTab(tab as any);
              }
            }}
            onOpenAdmin={() => {
              if (!currentAdminUser) {
                setIsAdminLoginOpen(true);
              } else {
                setActiveTab('admin');
              }
            }}
            onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          />

          {/* Main Body per Tab */}
          <main className="flex-grow">
            {activeTab === 'order' && (
              <div className="space-y-12 pb-16">
                {/* Hero Section with Quick CTA */}
                <HeroSection
                  settings={settings}
                  onOrderClick={() => {
                    document.getElementById('order-form-card')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onSelectService={() => {
                    document.getElementById('order-form-card')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onTrackClick={() => setActiveTab('track')}
                  onTrackOrder={() => setActiveTab('track')}
                  onOpenPriceCatalog={() => setActiveTab('catalog')}
                />

                {/* Core Order Form (Koen & Mandor Joki) */}
                <div id="order-form-card" className="max-w-5xl mx-auto px-4 sm:px-6">
                  <OrderForm
                    priceConfig={priceConfig}
                    settings={settings}
                    onOrderCreated={handleOrderCreated}
                    onOrderSubmitted={handleOrderCreated}
                    currentCustomer={currentCustomer}
                    onOpenCustomerAuth={() => setIsCustomerAuthOpen(true)}
                    activeAppliedVoucher={appliedVoucher}
                    onClearAppliedVoucher={() => setAppliedVoucher(null)}
                  />
                </div>
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="pb-16">
                <LeaderboardPage
                  customers={customers}
                  orders={orders}
                  onOpenOrder={() => {
                    setActiveTab('order');
                    setTimeout(() => {
                      document.getElementById('order-form-card')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  onOpenAuth={() => setIsCustomerAuthOpen(true)}
                  onOpenRewards={() => setIsRewardsStoreOpen(true)}
                  currentCustomer={currentCustomer}
                />
              </div>
            )}

            {activeTab === 'catalog' && (
              <div className="pb-16">
                <PriceCatalogPage
                  priceConfig={priceConfig}
                  onSelectService={handleSelectCatalogPackage}
                  onSelectPackage={handleSelectCatalogPackage}
                />
              </div>
            )}

            {activeTab === 'track' && (
              <div className="pb-16">
                <TrackingPage
                  orders={orders}
                  settings={settings}
                  initialInvoice={trackingInitialQuery}
                  initialQuery={trackingInitialQuery}
                  onPayUnpaidOrder={(ord) => setPaymentOrder(ord)}
                  onOpenPaymentModal={(ord) => setPaymentOrder(ord)}
                />
              </div>
            )}

            {activeTab === 'cs' && (
              <div className="pb-16">
                <CustomerServicePage settings={settings} />
              </div>
            )}
          </main>

          {/* Tactical Customer Footer */}
          <Footer
            settings={settings}
            onNavigate={(tab) => {
              if (tab === 'admin' && !currentAdminUser) {
                setIsAdminLoginOpen(true);
              } else if (tab === 'rewards') {
                setIsRewardsStoreOpen(true);
              } else {
                setActiveTab(tab as any);
              }
            }}
            onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          />

          {/* Floating Customer Service WhatsApp Widget */}
          <CustomerServiceWidget
            settings={settings}
            onNavigateTrack={() => setActiveTab('track')}
          />
        </>
      )}

      {/* Global Modals */}

      {/* 1. Payment Modal (QRIS, E-Wallet, Bank VA automatic simulation) */}
      {paymentOrder && (
        <PaymentModal
          order={paymentOrder}
          settings={settings}
          onClose={() => setPaymentOrder(null)}
          onPaymentSuccess={(paidOrd) => handlePaymentSuccess(paidOrd)}
          onGoToTracking={(inv) => {
            setPaymentOrder(null);
            handleTrackInvoice(inv);
          }}
          onOpenTracking={(inv) => {
            setPaymentOrder(null);
            handleTrackInvoice(inv);
          }}
        />
      )}

      {/* 2. Admin & Superadmin Login Modal */}
      {isAdminLoginOpen && (
        <AdminLoginModal
          admins={admins}
          onLoginSuccess={handleAdminLoginSuccess}
          onClose={() => setIsAdminLoginOpen(false)}
        />
      )}

      {/* 3. Customer Authentication Modal (Login / Register / Member Perks) */}
      {isCustomerAuthOpen && (
        <CustomerAuthModal
          isOpen={isCustomerAuthOpen}
          onClose={() => setIsCustomerAuthOpen(false)}
          customers={customers}
          onLoginSuccess={handleCustomerLoginSuccess}
          onRegisterSuccess={handleCustomerRegisterSuccess}
        />
      )}

      {/* 4. Customer Profile & Tier Progress Modal */}
      {isCustomerProfileOpen && currentCustomer && (
        <CustomerProfileModal
          isOpen={isCustomerProfileOpen}
          onClose={() => setIsCustomerProfileOpen(false)}
          customer={currentCustomer}
          onUpdateCustomer={handleCustomerUpdate}
          onLogout={handleCustomerLogout}
          onOpenRewardsStore={() => {
            setIsCustomerProfileOpen(false);
            setIsRewardsStoreOpen(true);
          }}
          onUseVoucher={(voucher) => {
            setIsCustomerProfileOpen(false);
            handleApplyVoucherToOrder(voucher);
          }}
        />
      )}

      {/* 5. Rewards Store Modal (Exchange OpsCoins for Free Joki, Mandor, Vouchers) */}
      {isRewardsStoreOpen && (
        <RewardsStoreModal
          isOpen={isRewardsStoreOpen}
          onClose={() => setIsRewardsStoreOpen(false)}
          customer={currentCustomer}
          onOpenAuth={() => setIsCustomerAuthOpen(true)}
          onRedeemSuccess={handleRedeemSuccess}
          onApplyVoucherToOrder={(voucher) => {
            handleApplyVoucherToOrder(voucher);
          }}
        />
      )}

    </div>
  );
}
