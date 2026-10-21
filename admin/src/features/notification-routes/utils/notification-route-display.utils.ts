import {
  Ban,
  ClipboardList,
  FileText,
  HeartPulse,
  type LucideIcon,
  Mail,
  MessageSquare,
  Package,
  PauseCircle,
  ShieldAlert,
  ShoppingBag,
  Star,
  Users,
  Wallet,
} from "lucide-react";

type NotificationRouteVisual = {
  icon: LucideIcon;
  iconClass: string;
  chipClass: string;
};

const DEFAULT_VISUAL: NotificationRouteVisual = {
  icon: MessageSquare,
  iconClass: "text-slate-600",
  chipClass: "bg-slate-100 ring-1 ring-slate-200/80 dark:bg-slate-800/60 dark:ring-slate-700/80",
};

const ROUTE_VISUALS: Record<string, NotificationRouteVisual> = {
  REGISTER_CUSTOMER_ACCOUNT: {
    icon: Users,
    iconClass: "text-emerald-600",
    chipClass: "bg-emerald-100 ring-1 ring-emerald-200/80 dark:bg-emerald-950/50 dark:ring-emerald-800/60",
  },
  LOW_STOCK_ALERT: {
    icon: Package,
    iconClass: "text-amber-600",
    chipClass: "bg-amber-100 ring-1 ring-amber-200/80 dark:bg-amber-950/50 dark:ring-amber-800/60",
  },
  ORDER_CREATED: {
    icon: ClipboardList,
    iconClass: "text-sky-600",
    chipClass: "bg-sky-100 ring-1 ring-sky-200/80 dark:bg-sky-950/50 dark:ring-sky-800/60",
  },
  CREATE_PRODUCT_REVIEW: {
    icon: Star,
    iconClass: "text-orange-500",
    chipClass: "bg-orange-100 ring-1 ring-orange-200/80 dark:bg-orange-950/50 dark:ring-orange-800/60",
  },
  PRESCRIPTION_CREATED: {
    icon: FileText,
    iconClass: "text-violet-600",
    chipClass: "bg-violet-100 ring-1 ring-violet-200/80 dark:bg-violet-950/50 dark:ring-violet-800/60",
  },
  CARE_PLAN_CREATED: {
    icon: HeartPulse,
    iconClass: "text-rose-600",
    chipClass: "bg-rose-100 ring-1 ring-rose-200/80 dark:bg-rose-950/50 dark:ring-rose-800/60",
  },
  CARE_PLAN_AUTO_PAUSED: {
    icon: PauseCircle,
    iconClass: "text-amber-700",
    chipClass: "bg-amber-100 ring-1 ring-amber-300/80 dark:bg-amber-950/50 dark:ring-amber-800/60",
  },
  CARE_PLAN_INSUFFICIENT_STOCK: {
    icon: Package,
    iconClass: "text-amber-600",
    chipClass: "bg-amber-100 ring-1 ring-amber-200/80 dark:bg-amber-950/50 dark:ring-amber-800/60",
  },
  CARE_PLAN_PRODUCT_REMOVED_ADMIN: {
    icon: ShoppingBag,
    iconClass: "text-slate-600",
    chipClass: "bg-slate-100 ring-1 ring-slate-200/80 dark:bg-slate-800/60 dark:ring-slate-700/80",
  },
  CARE_PLAN_PRODUCT_UNAVAILABLE: {
    icon: Ban,
    iconClass: "text-slate-600",
    chipClass: "bg-slate-100 ring-1 ring-slate-200/80 dark:bg-slate-800/60 dark:ring-slate-700/80",
  },
  CREATE_CONTACT_US: {
    icon: Mail,
    iconClass: "text-indigo-600",
    chipClass: "bg-indigo-100 ring-1 ring-indigo-200/80 dark:bg-indigo-950/50 dark:ring-indigo-800/60",
  },
  ORDER_PAYMENT_FAILED: {
    icon: Wallet,
    iconClass: "text-red-600",
    chipClass: "bg-red-100 ring-1 ring-red-200/80 dark:bg-red-950/50 dark:ring-red-800/60",
  },
  CARE_PLAN_PAYMENT_FAILED: {
    icon: Wallet,
    iconClass: "text-red-600",
    chipClass: "bg-red-100 ring-1 ring-red-200/80 dark:bg-red-950/50 dark:ring-red-800/60",
  },
  CARE_PLAN_CANCELLED: {
    icon: ShieldAlert,
    iconClass: "text-rose-700",
    chipClass: "bg-rose-100 ring-1 ring-rose-200/80 dark:bg-rose-950/50 dark:ring-rose-800/60",
  },
};

export function getNotificationRouteVisual(
  eventValue: string | null | undefined,
): NotificationRouteVisual {
  if (eventValue && eventValue in ROUTE_VISUALS) {
    return ROUTE_VISUALS[eventValue];
  }
  return DEFAULT_VISUAL;
}

export function getNotificationRouteCounts(recipients: Array<{ inApp: boolean; email: boolean }>) {
  return {
    recipientsCount: recipients.length,
    inAppCount: recipients.filter((recipient) => recipient.inApp).length,
    emailCount: recipients.filter((recipient) => recipient.email).length,
    isFallback: recipients.length === 0,
  };
}
