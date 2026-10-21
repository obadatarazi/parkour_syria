export type ReportPeriod = "week" | "month" | "year" | "custom";

export type ReportPeriodParams = {
  period: ReportPeriod;
  from?: string;
  to?: string;
};

export type ReportRange = {
  period: ReportPeriod;
  from: string;
  to: string;
};

export type ReportKpi = {
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  count: number;
  amount?: number;
};

export type ReportNamedSlice = {
  id: string;
  nameEn: string;
  nameAr: string;
  value: number;
  color: string;
  saved?: number;
};

export type ReportRevenuePoint = {
  label: string;
  labelAr: string;
  month: string;
  monthAr: string;
  revenue: number;
  orders: number;
};

export type ReportOrdersSeriesPoint = {
  label: string;
  labelAr: string;
  day: string;
  dayAr: string;
  orders: number;
  returns: number;
};

export type ReportTopProduct = {
  id: number;
  rank: number;
  nameEn: string;
  nameAr: string;
  imageUrl: string;
  sold: number;
  revenue: number;
  stock: number;
  isLowStock: boolean;
};

export type ReportTopCustomer = {
  id: number;
  rank: number;
  nameEn: string;
  nameAr: string;
  avatar: string;
  orders: number;
  spent: number;
};

export type ReportCouponRow = {
  id: number;
  code: string;
  title: string;
  type: string;
  uses: number;
  saved: number;
};

export type ReportUnusedCoupon = {
  id: number;
  code: string;
  title: string;
  status: string;
};

export type ReportCouponReport = {
  ordersWithCoupon: number;
  ordersWithoutCoupon: number;
  attachRate: number;
  usageCount: number;
  topCoupons: ReportCouponRow[];
  typeMix: ReportNamedSlice[];
  unusedActive: ReportUnusedCoupon[];
};

export type ReportDeliveryZoneRow = {
  id: number;
  nameEn: string;
  nameAr: string;
  fees: number;
  orders: number;
};

export type ReportPayload = {
  range: ReportRange;
  stats: {
    orderCompletionRate: ReportKpi;
    avgOrderValue: ReportKpi;
    newCustomers: ReportKpi;
    returnRate: ReportKpi;
    deliveryFees: ReportKpi;
    savingsTotal: ReportKpi;
    unitsSold: ReportKpi;
    cartsWithOrders: ReportKpi;
    cartsWithNoOrders: ReportKpi;
    cartConversionRate: ReportKpi;
  };
  savings: {
    coupons: ReportKpi;
    couponsGoods: ReportKpi;
    couponsShipping: ReportKpi;
    promotions: ReportKpi;
    loyalty: ReportKpi;
  };
  couponReport: ReportCouponReport;
  revenueChart: ReportRevenuePoint[];
  categoryChart: ReportNamedSlice[];
  brandChart: ReportNamedSlice[];
  topProducts: ReportTopProduct[];
  topCustomers: ReportTopCustomer[];
  stockSold: ReportTopProduct[];
  deliveryByZone: ReportDeliveryZoneRow[];
  ordersSeries: ReportOrdersSeriesPoint[];
  orderStatusMix: ReportNamedSlice[];
  paymentMix: ReportNamedSlice[];
};
