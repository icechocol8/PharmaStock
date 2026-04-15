export interface Medicine {
  id?: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  cost: number;
  expiryDate: string;
  manufacturer: string;
  updatedAt: string;
}

export interface Transaction {
  id?: string;
  medicineId: string;
  medicineName?: string;
  type: 'sale' | 'restock' | 'adjustment';
  quantity: number;
  totalAmount: number;
  timestamp: string;
  userId: string;
}

export interface DashboardStats {
  totalMedicines: number;
  lowStockCount: number;
  expiringSoonCount: number;
  totalSalesToday: number;
}

export interface DailyLog {
  id?: string;
  medicineId: string;
  medicineName: string;
  date: string; // YYYY-MM-DD
  openingStock: number;
  sold: number;
  received: number;
  damaged: number;
  closingStock: number;
  notes: string;
  timestamp: string;
  userId: string;
}
