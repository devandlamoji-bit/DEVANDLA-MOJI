import { Order } from './types.ts';

const API_BASE = '/api/orders';

// In-memory fallback if server is momentarily unreachable
const LOCAL_STORAGE_KEY = 'sweet_home_bakery_orders_v1';

function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read from localStorage', e);
  }
  return [];
}

function saveLocalOrders(orders: Order[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    console.warn('Could not save to localStorage', e);
  }
}

export async function fetchOrders(query?: { status?: string; search?: string }): Promise<Order[]> {
  try {
    const params = new URLSearchParams();
    if (query?.status && query.status !== 'ALL') params.append('status', query.status);
    if (query?.search) params.append('search', query.search);

    const url = `${API_BASE}${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    saveLocalOrders(data);
    return data;
  } catch (err) {
    console.warn('Backend fetch failed, utilizing cached orders:', err);
    let orders = getLocalOrders();
    if (query?.status && query.status !== 'ALL') {
      orders = orders.filter((o) => o.status === query.status);
    }
    if (query?.search) {
      const q = query.search.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.id.toString().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.product.toLowerCase().includes(q)
      );
    }
    return orders;
  }
}

export async function fetchOrderById(id: number | string): Promise<Order> {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Error fetching order by id:', e);
  }

  const local = getLocalOrders().find((o) => o.id === Number(id));
  if (local) return local;
  throw new Error(`Order #${id} not found`);
}

export async function createOrder(orderData: Partial<Order>): Promise<Order> {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create order');
    }

    const created = await res.json();
    const local = getLocalOrders();
    saveLocalOrders([created, ...local]);
    return created;
  } catch (err) {
    console.warn('Direct server create failed, creating locally:', err);
    // Graceful offline fallback
    const id = Math.floor(1000 + Math.random() * 9000);
    const fallbackOrder: Order = {
      id,
      customerName: orderData.customerName || 'Customer',
      contactNumber: orderData.contactNumber || '',
      product: orderData.product || 'Birthday Cake',
      quantity: Number(orderData.quantity) || 1,
      customization: orderData.customization || '',
      deliveryDate: orderData.deliveryDate || new Date().toISOString().split('T')[0],
      deliveryAddress: orderData.deliveryAddress || '',
      total: orderData.total || 850,
      status: 'CONFIRMED',
      isEggless: Boolean(orderData.isEggless),
      deliverySlot: orderData.deliverySlot || 'Standard Delivery',
      createdAt: new Date().toISOString(),
    };
    const local = getLocalOrders();
    saveLocalOrders([fallbackOrder, ...local]);
    return fallbackOrder;
  }
}

export async function updateOrderStatus(id: number, status: string): Promise<Order> {
  try {
    // Exactly matches the user's PUT request signature: `${API_URL}/${id}/status?status=${status}`
    const res = await fetch(`${API_BASE}/${id}/status?status=${encodeURIComponent(status)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Status update failed');
    }

    const updated = await res.json();
    const local = getLocalOrders().map((o) => (o.id === id ? updated : o));
    saveLocalOrders(local);
    return updated;
  } catch (err) {
    console.warn('Remote update failed, updating local state:', err);
    const local = getLocalOrders();
    const order = local.find((o) => o.id === id);
    if (order) {
      order.status = status as Order['status'];
      saveLocalOrders(local);
      return order;
    }
    throw err;
  }
}

export async function deleteOrder(id: number): Promise<void> {
  try {
    await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  } catch (e) {
    console.warn('Remote delete failed:', e);
  }
  const local = getLocalOrders().filter((o) => o.id !== id);
  saveLocalOrders(local);
}

export async function resetOrders(): Promise<Order[]> {
  try {
    const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      saveLocalOrders(data.orders || []);
      return data.orders || [];
    }
  } catch (e) {
    console.warn('Remote reset failed:', e);
  }
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  return fetchOrders();
}
