import type { LucideIcon } from "lucide-react";

export type OrderStatus = "delivered" | "shipped" | "processing" | "pending" | "cancelled";

export type ProductStatus = "published" | "draft" | "inactive";

export type CategoryStatus = "active";

export type CustomerTier = "Gold" | "Silver" | "Bronze";

export type CustomerStatus = "active" | "inactive";

export type PrescriptionStatus = "pending" | "approved" | "rejected";

export type PromotionType = "percent" | "bogo" | "free_del";

export type PromotionStatus = "active" | "expired" | "paused";

export type AdminNotificationType =
  | "order"
  | "stock"
  | "rx"
  | "customer"
  | "payment"
  | "promo"
  | "review";

export type RevenueDataPoint = {
  month: string;
  monthAr: string;
  revenue: number;
  target: number;
  orders: number;
};

export type OrdersWeekPoint = {
  day: string;
  dayAr: string;
  orders: number;
  returns: number;
};

export type CategoryPiePoint = {
  nameEn: string;
  nameAr: string;
  value: number;
  color: string;
};

export type Order = {
  id: string;
  customerEn: string;
  customerAr: string;
  email: string;
  items: number;
  total: number;
  status: OrderStatus;
  date: string;
  dateAr: string;
  payment: string;
  avatar: string;
  categoryEn: string;
  categoryAr: string;
};

export type Product = {
  id: number;
  nameEn: string;
  nameAr: string;
  brand: string;
  categoryEn: string;
  categoryAr: string;
  price: number;
  stock: number;
  sold: number;
  status: ProductStatus;
  img: string;
};

export type Category = {
  id: number;
  nameEn: string;
  nameAr: string;
  products: number;
  icon: string;
  activeProducts: number;
  status: CategoryStatus;
};

export type Customer = {
  id: number;
  nameEn: string;
  nameAr: string;
  email: string;
  phone: string;
  tier: CustomerTier;
  points: number;
  orders: number;
  spent: number;
  joined: string;
  joinedAr: string;
  lastOrder: string;
  status: CustomerStatus;
  avatar: string;
};

export type Prescription = {
  id: string;
  customerEn: string;
  customerAr: string;
  productEn: string;
  productAr: string;
  uploadDate: string;
  status: PrescriptionStatus;
  noteEn: string;
  noteAr: string;
};

export type InventoryItem = {
  id: number;
  nameEn: string;
  nameAr: string;
  brand: string;
  stock: number;
  reorder: number;
  supplierEn: string;
  supplierAr: string;
  locationEn: string;
  locationAr: string;
  lastRestocked: string;
  img: string;
};

export type Promotion = {
  id: number;
  nameEn: string;
  nameAr: string;
  code: string;
  type: PromotionType;
  discount: number;
  usage: number;
  limit: number | null;
  minOrder: number;
  expires: string;
  expiresAr: string;
  status: PromotionStatus;
  color: string;
};

export type AdminNotification = {
  id: number;
  type: AdminNotificationType;
  Icon: LucideIcon;
  titleEn: string;
  titleAr: string;
  msgEn: string;
  msgAr: string;
  timeEn: string;
  timeAr: string;
  read: boolean;
  color: string;
};
