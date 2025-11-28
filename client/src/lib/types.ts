export type UserRole = "admin" | "cashier";

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  categoryId: string;
  categoryName: string;
  image?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Shift {
  id: string;
  cashierId: string;
  cashierName: string;
  startTime: Date;
  endTime?: Date;
  startingCash: number;
  endingCash?: number;
  totalSales: number;
  totalTransactions: number;
  status: "active" | "closed";
}

export interface Transaction {
  id: string;
  shiftId: string;
  cashierId: string;
  cashierName: string;
  customerName: string;
  items: TransactionItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentAmount: number;
  change: number;
  paymentMethod: "cash" | "card" | "qris";
  createdAt: Date;
}

export interface TransactionItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  previousStock: number;
  newStock: number;
  adjustment: number;
  reason: string;
  adjustedBy: string;
  createdAt: Date;
}

export interface Loan {
  id: string;
  shiftId: string;
  description: string;
  amount: number;
  recipientName: string;
  createdAt: Date;
}

export interface BilliardRental {
  id: string;
  shiftId: string;
  tableNumber: string;
  hoursRented: number;
  hourlyRate: number;
  totalPrice: number;
  startTime: Date;
  endTime?: Date;
  status: "active" | "closed";
  createdAt: Date;
}

export interface BilliardTable {
  id: string;
  tableNumber: string;
  hourlyRate: number;
  status: "available" | "in_use";
  createdAt: Date;
}
