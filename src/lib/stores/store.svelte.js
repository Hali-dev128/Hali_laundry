import { browser } from '$app/environment';

const INITIAL_PRICES = [
  { id: 'p1', name: 'Agbada (Complete)', category: 'Traditional', price: 2500 },
  { id: 'p2', name: 'Senator / Native Wear', category: 'Traditional', price: 1500 },
  { id: 'p3', name: 'Shirt / Polo', category: 'General', price: 500 },
  { id: 'p4', name: 'Trousers / Jeans', category: 'General', price: 600 },
  { id: 'p5', name: 'Suit (2-Piece)', category: 'Formal', price: 3000 },
  { id: 'p6', name: 'Bedspread / Duvet', category: 'Bedding', price: 2000 }
];

const INITIAL_CUSTOMERS = [
  { id: 'c1', name: 'Mr. Adebayo', phone: '08031234567' },
  { id: 'c2', name: 'Dr. Chioma', phone: '08098765432' }
];

const INITIAL_ORDERS = [
  {
    id: 'ord-101',
    orderCode: 'LND-101',
    storeId: 'hali_laundry_01',
    customerName: 'Mr. Adebayo',
    customerPhone: '08031234567',
    items: [
      { name: 'Agbada (Complete)', qty: 1, unitPrice: 2500, note: 'Starch heavily' },
      { name: 'Shirt / Polo', qty: 2, unitPrice: 500, note: 'Collar stain' }
    ],
    isExpress: false,
    totalAmount: 3500,
    amountPaid: 3500,
    paymentStatus: 'PAID',
    status: 'READY',
    createdAt: '2026-11-20'
  }
];

class LaundryStore {
  // Auth & Multi-Tenancy State
  isAuthenticated = $state(false);
  role = $state('worker'); // 'worker' or 'admin'
  storeId = $state('hali_laundry_01');
  storeName = $state('Hali Laundry');

  // App State
  prices = $state(INITIAL_PRICES);
  customers = $state(INITIAL_CUSTOMERS);
  orders = $state(INITIAL_ORDERS);
  expressMultiplier = $state(1.5);

  // Offline Sync State
  isOnline = $state(true);
  offlineQueue = $state([]);

  constructor() {
    if (browser) {
      this.isOnline = navigator.onLine;
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));

      const savedSession = localStorage.getItem('laundry_session');
      if (savedSession) {
        const session = JSON.parse(savedSession);
        this.isAuthenticated = !!session.isAuthenticated;
        this.role = session.role || 'worker';
        this.storeId = session.storeId || 'hali_laundry_01';
        this.storeName = session.storeName || 'Hali Laundry';
      }

      this.loadStoreData();

      const savedQueue = localStorage.getItem('laundry_offline_queue');
      if (savedQueue) this.offlineQueue = JSON.parse(savedQueue);
    }
  }

  saveSession() {
    if (browser) {
      localStorage.setItem(
        'laundry_session',
        JSON.stringify({
          isAuthenticated: this.isAuthenticated,
          role: this.role,
          storeId: this.storeId,
          storeName: this.storeName
        })
      );
    }
  }

  loadStoreData() {
    if (!browser) return;
    const savedOrders = localStorage.getItem(`laundry_orders_${this.storeId}`);
    const savedPrices = localStorage.getItem(`laundry_prices_${this.storeId}`);
    const savedCustomers = localStorage.getItem(`laundry_customers_${this.storeId}`);

    this.orders = savedOrders ? JSON.parse(savedOrders) : [...INITIAL_ORDERS];
    this.prices = savedPrices ? JSON.parse(savedPrices) : [...INITIAL_PRICES];
    this.customers = savedCustomers ? JSON.parse(savedCustomers) : [...INITIAL_CUSTOMERS];
  }

  // Mock Login for existing store / staff
  login({ storeId, role }) {
    this.storeId = (storeId || 'hali_laundry_01').trim();
    this.storeName = this.formatStoreName(this.storeId);
    this.role = role === 'admin' ? 'admin' : 'worker';
    this.isAuthenticated = true;
    this.loadStoreData();
    this.saveSession();
  }

  // Mock Sign Up for a brand-new laundry shop (creates Admin account)
  signupStore({ storeName, phoneOrEmail }) {
    const cleanName = storeName.trim();
    const generatedId =
      cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '') + '_01';

    this.storeId = generatedId || `store_${Date.now()}`;
    this.storeName = cleanName;
    this.role = 'admin';
    this.isAuthenticated = true;

    // Fresh store starts with clean orders & starter price list
    this.orders = [];
    this.prices = [...INITIAL_PRICES];
    this.customers = [];
    this.save();
    this.saveSession();
  }

  logout() {
    this.isAuthenticated = false;
    this.saveSession();
  }

  formatStoreName(id) {
    return id
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  handleNetworkChange(status) {
    this.isOnline = status;
    if (status && this.offlineQueue.length > 0) {
      this.syncOfflineQueue();
    }
  }

  save() {
    if (browser) {
      localStorage.setItem(`laundry_orders_${this.storeId}`, JSON.stringify(this.orders));
      localStorage.setItem(`laundry_prices_${this.storeId}`, JSON.stringify(this.prices));
      localStorage.setItem(`laundry_customers_${this.storeId}`, JSON.stringify(this.customers));
      localStorage.setItem('laundry_offline_queue', JSON.stringify(this.offlineQueue));
    }
  }

  toggleRole() {
    this.role = this.role === 'worker' ? 'admin' : 'worker';
    this.saveSession();
  }

  setStoreId(newStoreId) {
    this.storeId = newStoreId.trim() || 'hali_laundry_01';
    this.storeName = this.formatStoreName(this.storeId);
    this.loadStoreData();
    this.saveSession();
  }

  addOrder({ customerName, customerPhone, items, isExpress, amountPaid }) {
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
    const totalAmount = isExpress ? Math.round(subtotal * this.expressMultiplier) : subtotal;

    let paymentStatus = 'UNPAID';
    if (amountPaid >= totalAmount) {
      paymentStatus = 'PAID';
    } else if (amountPaid > 0) {
      paymentStatus = 'PART_PAID';
    }

    const orderCode = `LND-${Math.floor(100 + Math.random() * 900)}`;

    const newOrder = {
      id: `ord-${Date.now()}`,
      orderCode,
      storeId: this.storeId,
      customerName,
      customerPhone,
      items,
      isExpress,
      totalAmount,
      amountPaid,
      paymentStatus,
      status: 'RECEIVED',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const existingCust = this.customers.find((c) => c.phone === customerPhone);
    if (!existingCust) {
      this.customers.push({ id: `c-${Date.now()}`, name: customerName, phone: customerPhone });
    }

    this.orders.unshift(newOrder);
    this.save();

    if (!this.isOnline) {
      this.offlineQueue.push(newOrder);
      this.save();
    }

    return newOrder;
  }

  syncOfflineQueue() {
    console.log(`[Sync] Internet restored! Flushing ${this.offlineQueue.length} offline orders...`);
    this.offlineQueue = [];
    this.save();
  }

  updateOrderStatus(orderId, newStatus) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return;

    if (newStatus === 'COLLECTED' && order.paymentStatus !== 'PAID') {
      alert('Error: Cannot release order. Customer has an outstanding balance!');
      return;
    }

    order.status = newStatus;
    this.save();
  }

  recordPayment(orderId, additionalAmount) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return;

    order.amountPaid = Math.min(order.totalAmount, order.amountPaid + additionalAmount);

    if (order.amountPaid >= order.totalAmount) {
      order.paymentStatus = 'PAID';
    } else if (order.amountPaid > 0) {
      order.paymentStatus = 'PART_PAID';
    }
    this.save();
  }
}

export const laundryStore = new LaundryStore();