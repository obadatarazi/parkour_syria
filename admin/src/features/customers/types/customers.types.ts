export type CrmTag = "vip" | "care_plan" | "prescription" | "high_value" | "inactive";

export type CrmSegment =
  | "new_buyers"
  | "repeat_buyers"
  | "care_plan"
  | "inactive"
  | "big_spenders";

export type CrmCustomerStatus = "active" | "inactive";

export type CrmStaffNoteType = "GENERAL" | "CALL" | "COMPLAINT" | "DELIVERY";

export type CrmTimelineType =
  | "registered"
  | "order"
  | "payment"
  | "care_plan"
  | "loyalty"
  | "prescription"
  | "note"
  | "notification"
  | "coupon"
  | "review"
  | "profile";

export type CrmLabelValue<T extends string = string> = {
  label: string;
  value: T;
};

export type CrmLoyalty = {
  pointsBalance: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
};

export type CrmCarePlanSummary = {
  id: number;
  status: CrmLabelValue;
  frequency: string;
  nextDeliveryAt: string | null;
};

export type CrmOrderSlice = {
  id: number;
  orderRefNumber: string;
  placedAt: string;
  total: number;
  status: CrmLabelValue;
  items: number;
  paymentMethod: string | null;
};

export type CrmPaymentSlice = {
  id: number;
  orderId: number;
  amount: number;
  method: string | null;
  status: CrmLabelValue;
  paidAt: string | null;
};

export type CrmReviewSlice = {
  id: number;
  productTitle: string | null;
  rating: number;
  body: string | null;
  status: CrmLabelValue;
  createdAt: string | null;
};

export type CrmCouponSlice = {
  code: string | null;
  title: string | null;
  valueLabel: string | null;
  status: CrmLabelValue;
  orderId: number | null;
  usedAt: string | null;
  assignedAt: string | null;
};

export type CrmAddressSlice = {
  id: number;
  title: string | null;
  line: string;
  phone: string | null;
  isDefault: boolean;
};

export type CrmPrescriptionSlice = {
  id: number;
  prescriptionNumber: string;
  status: CrmLabelValue;
  fileUrl: string | null;
  productsCount: number;
  products: { title: string | null }[];
  createdAt: string | null;
};

export type CrmStaffNote = {
  id: number;
  author: { id: number; fullName: string } | null;
  type: CrmLabelValue<CrmStaffNoteType>;
  body: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type CrmTimelineEvent = {
  id: number;
  type: CrmTimelineType;
  title: string;
  at: string | null;
};

export type CrmCustomer = {
  id: number;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
  /** Dedicated WhatsApp number; null means fall back to account phone. */
  whatsappPhoneNumber: string | null;
  whatsappNotificationsEnabled: boolean;
  avatarFileUrl: string | null;
  active: boolean;
  isVip: boolean;
  cookiesAccepted: boolean;
  cookiesAcceptedAt: string | null;
  joinedAt: string | null;
  lastOrderAt: string | null;
  ordersCount: number;
  spent: number;
  ordersTotal?: number;
  paymentsTotal?: number;
  tags: CrmTag[];
  loyalty: CrmLoyalty;
  carePlan: CrmCarePlanSummary | null;
  orders?: CrmOrderSlice[];
  payments?: CrmPaymentSlice[];
  reviews?: CrmReviewSlice[];
  coupons?: CrmCouponSlice[];
  addresses?: CrmAddressSlice[];
  prescriptions?: CrmPrescriptionSlice[];
  staffNotes?: CrmStaffNote[];
  timeline?: CrmTimelineEvent[];
};

export type CrmCustomerListParams = {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  direction?: "asc" | "desc";
  segment?: CrmSegment;
  tag?: CrmTag;
  status?: CrmCustomerStatus;
  carePlan?: "yes" | "no";
};

export type CrmKpi = {
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  count: number;
};

export type CrmStats = {
  highValueMinSpend: number;
  totalCustomers: CrmKpi;
  newCustomers: CrmKpi;
  carePlanSubscribers: CrmKpi;
  inactiveCustomers: CrmKpi;
  bigSpenders: CrmKpi;
  retentionRate: CrmKpi;
};

export type CrmGrowthPoint = {
  month: string;
  monthAr: string;
  newCustomers: number;
  returning: number;
};

export type CrmNamedSlice = {
  id: string;
  nameEn: string;
  nameAr: string;
  value: number;
  color: string;
};

export type CrmReport = {
  stats: CrmStats;
  growth: CrmGrowthPoint[];
  retention: CrmNamedSlice[];
  segments: CrmNamedSlice[];
  carePlanMix: CrmNamedSlice[];
};

export type CrmProfileInput = {
  fullName: string;
  email: string;
  phoneNumber: string;
  /** Empty string clears the dedicated WhatsApp number (use account phone). */
  whatsappPhoneNumber: string;
  whatsappNotificationsEnabled: boolean;
  active: boolean;
};

export type CrmStaffNoteInput = {
  body: string;
  type: CrmStaffNoteType;
};

export type CrmAssignCouponInput = {
  couponId: number;
};

export type CrmSendNotificationInput = {
  type?: string;
  translations: Record<string, { title: string; body?: string }>;
};

export type CrmInvoiceStatusFilter = "paid" | "unpaid";

export type CrmCustomerSliceParams = {
  page?: number;
  limit?: number;
  invoiceStatus?: CrmInvoiceStatusFilter;
};
