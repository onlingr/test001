
import { MenuItem, Order, OrderStatus, StoreSettings } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

// Helper to handle response status
const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown Error');
    throw new Error(`API Error: ${res.status} ${text}`);
  }
  return res.json();
};

export const api = {
  // Menu
  getMenu: async (): Promise<MenuItem[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/menu`);
      return handleResponse(res);
    } catch (error) {
      console.error("API getMenu failed:", error);
      throw error;
    }
  },
  
  addMenuItem: async (item: Partial<MenuItem>) => {
    const res = await fetch(`${API_BASE_URL}/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return handleResponse(res);
  },

  updateMenuItem: async (item: MenuItem) => {
    const res = await fetch(`${API_BASE_URL}/menu/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return handleResponse(res);
  },

  deleteMenuItem: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/menu/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  toggleMenuItem: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/menu/${id}/toggle`, { method: 'PUT' });
    return handleResponse(res);
  },

  // Orders
  getOrders: async (): Promise<Order[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders`);
      return handleResponse(res);
    } catch (error) {
      console.error("API getOrders failed:", error);
      throw error;
    }
  },

  createOrder: async (orderData: { items: any[], totalAmount: number, customerName: string, customerPhone: string, customerNote: string }) => {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    return handleResponse(res);
  },

  updateOrderStatus: async (id: string, status: OrderStatus) => {
    const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  // Settings
  getSettings: async (): Promise<StoreSettings> => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      return handleResponse(res);
    } catch (error) {
      console.error("API getSettings failed:", error);
      throw error;
    }
  },

  updateSettings: async (settings: StoreSettings) => {
    const res = await fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return handleResponse(res);
  }
};
