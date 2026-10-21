export type TrendDirection = "up" | "down" | "neutral";

export type DashboardStat = {
  value: string;
  change: string;
  trend: TrendDirection;
  count?: number;
  amount?: number;
};

export type DashboardStats = Record<
  "revenue" | "deliveryFees" | "totalOrders" | "activeProducts" | "totalCustomers",
  DashboardStat
>;

export type OrderStatusLabel = {
  label: string;
  value: string;
};

export type RecentOrder = {
  id: string;
  orderId: number;
  customerEn: string;
  customerAr: string;
  email: string;
  avatar: string;
  total: number;
  status: OrderStatusLabel;
  createdAt: string;
};

export type RevenueChartPoint = {
  label: string;
  labelAr: string;
  month: string;
  monthAr: string;
  revenue: number;
  orders: number;
};

export type CategoryChartPoint = {
  id?: string;
  nameEn: string;
  nameAr: string;
  value: number;
  color: string;
};

export type LowStockItem = {
  id: number;
  nameEn: string;
  nameAr: string;
  stock: number;
  reorderPoint: number;
  imageUrl: string;
};

export type DashboardSnapshot = {
  range: {
    period: string;
    from: string;
    to: string;
  };
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  revenueChart: RevenueChartPoint[];
  categoryChart: CategoryChartPoint[];
  lowStockItems: LowStockItem[];
};

export type DataRequestStatus = "idle" | "loading" | "success" | "empty" | "error";

export type DataRequestState<T> = {
  data: T | null;
  status: DataRequestStatus;
  error: Error | null;
};
