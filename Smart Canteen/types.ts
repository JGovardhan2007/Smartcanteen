export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
  NONE = 'NONE'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum ProductCategory {
  MAIN = 'Main Course',
  SNACK = 'Snack',
  DRINK = 'Drink',
  DESSERT = 'Dessert'
}

export type DietType = 'VEG' | 'NON-VEG';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  dietType: DietType; // Replaces calories
  imageUrl: string;
  isAvailable: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  studentId: string;
  studentName?: string;
  rollNo?: string;
  tokenNumber: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  timestamp: number;
}

export interface SalesReportData {
  name: string;
  revenue: number;
  orders: number;
}