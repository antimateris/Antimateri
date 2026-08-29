import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc,
  onSnapshot, 
  query, 
  orderBy,
  Firestore 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Order, PriceConfig, SystemSettings, WhatsAppNotificationLog, AdminUser, CustomerUser, WorkerPayout } from '../types';
import { INITIAL_ORDERS, INITIAL_PRICE_CONFIG, INITIAL_SYSTEM_SETTINGS, INITIAL_WA_LOGS, INITIAL_ADMINS, INITIAL_CUSTOMERS, INITIAL_PAYOUTS } from '../data/initialData';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with specified databaseId if present
let dbInstance: Firestore;
try {
  if (firebaseConfig.firestoreDatabaseId) {
    dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  } else {
    dbInstance = getFirestore(app);
  }
} catch (e) {
  console.warn('Fallback to default Firestore instance', e);
  dbInstance = getFirestore(app);
}

export const db = dbInstance;

// Helper to sanitize object for Firestore (remove undefined values)
export function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

// 1. Subscribe to Orders Collection in Real-Time
export function subscribeToOrders(callback: (orders: Order[]) => void) {
  try {
    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol);

    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          // If Firestore is empty initially, seed with initial orders
          seedInitialOrders();
          callback(INITIAL_ORDERS);
          return;
        }
        const loadedOrders: Order[] = [];
        snapshot.forEach((docSnap) => {
          loadedOrders.push(docSnap.data() as Order);
        });
        // Sort by createdAt descending
        loadedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(loadedOrders);
      },
      (error) => {
        console.warn('Firestore orders sync error, using local state:', error);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe to orders:', err);
    return () => {};
  }
}

// Save or Update an Order in Firestore
export async function saveOrderToFirestore(order: Order): Promise<void> {
  try {
    const docRef = doc(db, 'orders', order.id);
    await setDoc(docRef, sanitizeForFirestore(order), { merge: true });
  } catch (err) {
    console.warn('Failed to save order to Firestore, saving to localStorage:', err);
    try {
      const saved = localStorage.getItem('breakoutops_orders');
      const orders: Order[] = saved ? JSON.parse(saved) : [];
      const index = orders.findIndex((o) => o.id === order.id);
      if (index >= 0) {
        orders[index] = order;
      } else {
        orders.unshift(order);
      }
      localStorage.setItem('breakoutops_orders', JSON.stringify(orders));
    } catch {}
  }
}

// Seed initial orders if empty
async function seedInitialOrders() {
  try {
    for (const ord of INITIAL_ORDERS) {
      const docRef = doc(db, 'orders', ord.id);
      await setDoc(docRef, sanitizeForFirestore(ord), { merge: true });
    }
  } catch (e) {
    console.warn('Seeding initial orders failed:', e);
  }
}

// 2. Subscribe to System Settings
export function subscribeToSettings(callback: (settings: SystemSettings) => void) {
  try {
    const settingsDoc = doc(db, 'settings', 'system_settings');
    return onSnapshot(
      settingsDoc,
      (docSnap) => {
        if (docSnap.exists()) {
          const remote = docSnap.data() as SystemSettings;
          callback({
            ...INITIAL_SYSTEM_SETTINGS,
            ...remote,
            notificationTemplates: {
              ...INITIAL_SYSTEM_SETTINGS.notificationTemplates,
              ...(remote.notificationTemplates || {}),
            },
          });
        } else {
          // Initialize remote settings
          saveSettingsToFirestore(INITIAL_SYSTEM_SETTINGS);
          callback(INITIAL_SYSTEM_SETTINGS);
        }
      },
      (err) => {
        console.warn('Firestore settings error:', err);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe to settings:', err);
    return () => {};
  }
}

export async function saveSettingsToFirestore(settings: SystemSettings): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'system_settings');
    await setDoc(docRef, sanitizeForFirestore(settings), { merge: true });
  } catch (err) {
    console.warn('Failed to save settings to Firestore:', err);
  }
}

// 3. Subscribe to Price Config
export function subscribeToPriceConfig(callback: (prices: PriceConfig) => void) {
  try {
    const priceDoc = doc(db, 'prices', 'price_config');
    return onSnapshot(
      priceDoc,
      (docSnap) => {
        if (docSnap.exists()) {
          const remote = docSnap.data() as PriceConfig;
          callback({
            ...INITIAL_PRICE_CONFIG,
            ...remote,
          });
        } else {
          savePriceConfigToFirestore(INITIAL_PRICE_CONFIG);
          callback(INITIAL_PRICE_CONFIG);
        }
      },
      (err) => {
        console.warn('Firestore prices error:', err);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe to price config:', err);
    return () => {};
  }
}

export async function savePriceConfigToFirestore(prices: PriceConfig): Promise<void> {
  try {
    const docRef = doc(db, 'prices', 'price_config');
    await setDoc(docRef, sanitizeForFirestore(prices), { merge: true });
  } catch (err) {
    console.warn('Failed to save prices to Firestore:', err);
  }
}

// 4. Save Notification Log
export async function saveWaLogToFirestore(log: WhatsAppNotificationLog): Promise<void> {
  try {
    const docRef = doc(db, 'waLogs', log.id);
    await setDoc(docRef, sanitizeForFirestore(log), { merge: true });
  } catch (err) {
    console.warn('Failed to save waLog to Firestore:', err);
  }
}

// 5. Subscribe to Admins Collection
export function subscribeToAdmins(callback: (admins: AdminUser[]) => void) {
  try {
    const adminsCol = collection(db, 'admins');
    return onSnapshot(
      adminsCol,
      (snapshot) => {
        if (snapshot.empty) {
          seedInitialAdmins();
          callback(INITIAL_ADMINS);
          return;
        }
        const loadedAdmins: AdminUser[] = [];
        snapshot.forEach((docSnap) => {
          loadedAdmins.push(docSnap.data() as AdminUser);
        });
        callback(loadedAdmins);
      },
      (err) => {
        console.warn('Firestore admins sync error, fallback to local:', err);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe to admins:', err);
    return () => {};
  }
}

// Save or Update Admin User in Firestore
export async function saveAdminToFirestore(adminUser: AdminUser): Promise<void> {
  try {
    const docRef = doc(db, 'admins', adminUser.id);
    await setDoc(docRef, sanitizeForFirestore(adminUser), { merge: true });
  } catch (err) {
    console.warn('Failed to save admin to Firestore:', err);
  }
}

// Delete Admin User from Firestore
export async function deleteAdminFromFirestore(adminId: string): Promise<void> {
  try {
    const docRef = doc(db, 'admins', adminId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Failed to delete admin from Firestore:', err);
  }
}

async function seedInitialAdmins() {
  try {
    for (const adm of INITIAL_ADMINS) {
      const docRef = doc(db, 'admins', adm.id);
      await setDoc(docRef, sanitizeForFirestore(adm), { merge: true });
    }
  } catch (e) {
    console.warn('Seeding initial admins failed:', e);
  }
}

// 6. Subscribe to Customers Collection
export function subscribeToCustomers(callback: (customers: CustomerUser[]) => void) {
  try {
    const customersCol = collection(db, 'customers');
    return onSnapshot(
      customersCol,
      (snapshot) => {
        if (snapshot.empty) {
          seedInitialCustomers();
          callback(INITIAL_CUSTOMERS);
          return;
        }
        const loadedCustomers: CustomerUser[] = [];
        snapshot.forEach((docSnap) => {
          loadedCustomers.push(docSnap.data() as CustomerUser);
        });
        callback(loadedCustomers);
      },
      (err) => {
        console.warn('Firestore customers sync error, fallback to local:', err);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe to customers:', err);
    return () => {};
  }
}

// Save or Update Customer in Firestore
export async function saveCustomerToFirestore(customer: CustomerUser): Promise<void> {
  try {
    const docRef = doc(db, 'customers', customer.id);
    await setDoc(docRef, sanitizeForFirestore(customer), { merge: true });
  } catch (err) {
    console.warn('Failed to save customer to Firestore:', err);
  }
}

// Delete Customer from Firestore
export async function deleteCustomerFromFirestore(customerId: string): Promise<void> {
  try {
    const docRef = doc(db, 'customers', customerId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Failed to delete customer from Firestore:', err);
  }
}

async function seedInitialCustomers() {
  try {
    for (const cust of INITIAL_CUSTOMERS) {
      const docRef = doc(db, 'customers', cust.id);
      await setDoc(docRef, sanitizeForFirestore(cust), { merge: true });
    }
  } catch (e) {
    console.warn('Seeding initial customers failed:', e);
  }
}

// 7. Subscribe to Worker Payouts Collection
export function subscribeToPayouts(callback: (payouts: WorkerPayout[]) => void) {
  try {
    const payoutsCol = collection(db, 'payouts');
    return onSnapshot(
      payoutsCol,
      (snapshot) => {
        if (snapshot.empty) {
          seedInitialPayouts();
          callback(INITIAL_PAYOUTS);
          return;
        }
        const loadedPayouts: WorkerPayout[] = [];
        snapshot.forEach((docSnap) => {
          loadedPayouts.push(docSnap.data() as WorkerPayout);
        });
        // Sort by createdAt descending
        loadedPayouts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(loadedPayouts);
      },
      (err) => {
        console.warn('Firestore payouts sync error, fallback to local:', err);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe to payouts:', err);
    return () => {};
  }
}

// Save or Update Payout in Firestore
export async function savePayoutToFirestore(payout: WorkerPayout): Promise<void> {
  try {
    const docRef = doc(db, 'payouts', payout.id);
    await setDoc(docRef, sanitizeForFirestore(payout), { merge: true });
  } catch (err) {
    console.warn('Failed to save payout to Firestore, saving to localStorage:', err);
    try {
      const saved = localStorage.getItem('breakoutops_payouts');
      const payouts: WorkerPayout[] = saved ? JSON.parse(saved) : [];
      const index = payouts.findIndex((p) => p.id === payout.id);
      if (index >= 0) {
        payouts[index] = payout;
      } else {
        payouts.unshift(payout);
      }
      localStorage.setItem('breakoutops_payouts', JSON.stringify(payouts));
    } catch {}
  }
}

// Delete Payout from Firestore
export async function deletePayoutFromFirestore(payoutId: string): Promise<void> {
  try {
    const docRef = doc(db, 'payouts', payoutId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Failed to delete payout from Firestore:', err);
  }
}

async function seedInitialPayouts() {
  try {
    for (const pay of INITIAL_PAYOUTS) {
      const docRef = doc(db, 'payouts', pay.id);
      await setDoc(docRef, sanitizeForFirestore(pay), { merge: true });
    }
  } catch (e) {
    console.warn('Seeding initial payouts failed:', e);
  }
}

