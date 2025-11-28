
export enum Category {
  SET = '精選套餐',
  MAIN = '主食',
  SNACK = '點心',
  DRINK = '飲品'
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  imageUrl: string;
  isAvailable: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export enum OrderStatus {
  PENDING = '待處理',
  COOKING = '製作中',
  COMPLETED = '已完成',
  CANCELLED = '已取消'
}

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  timestamp: number;
  customerNote?: string;
  tableNumber?: string;
  customerName: string;
  customerPhone: string;
}

export interface StoreSettings {
  name: string;
  isOpen: boolean;
}

export type ViewMode = 'CUSTOMER' | 'ADMIN';
