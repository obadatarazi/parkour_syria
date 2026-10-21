import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle2,
  DollarSign,
  Info,
  Loader2,
  Mail,
  Package,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  TrendingUp,
  Upload,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { type ComponentType, type CSSProperties, type ReactNode,useState } from "react";

import {
  AppButton,
  DataTable,
  PageContainer,
  StatusBadge,
  type StatusBadgeVariant,
  UserAvatar,
} from "@/shared/components";
import type { DataTableColumn } from "@/shared/components/data/DataTable.types";
import { formatKwd } from "@/features/products/utils/product-display.utils";
import { AdminStatusBadge, DemoSkeleton } from "@/shared/demo";
import { Button } from "@/shared/design-system/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/design-system/components/ui/card";
import { Input } from "@/shared/design-system/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/design-system/components/ui/table";
import { cn } from "@/shared/design-system/components/ui/utils";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import {
  GuidanceDemoDock,
  type GuidanceDemoDockState,
  useGuidance,
} from "@/shared/guidance";

type ShowcaseTab =
  | "buttons"
  | "forms"
  | "cards"
  | "tables"
  | "modals"
  | "status"
  | "empty"
  | "loading"
  | "toasts"
  | "guidance";

type ShowcaseTableRow = {
  id: number;
  name: string;
  nameAr: string;
  email: string;
  status: "active" | "pending" | "cancelled";
  total: string;
};

type ModalType = "delete" | "edit" | "success" | "warn" | "error";

type ToastType = "success" | "error" | "warning" | "info" | "loading";

type ToastItem = {
  id: number;
  type: ToastType;
  msg: string;
};

type ToastConfig = {
  Icon: ComponentType<{ className?: string }>;
  bg: string;
  border: string;
  text: string;
  ic: string;
};

type SwitchRow = {
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
};

type EmptyStateItem = {
  Icon: ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
};

type ProgressBarItem = {
  label: string;
  value: number;
  color: string;
};

const SHOWCASE_TABS: ShowcaseTab[] = [
  "buttons",
  "forms",
  "cards",
  "tables",
  "modals",
  "status",
  "empty",
  "loading",
  "toasts",
  "guidance",
];

const SHOWCASE_TABLE_ROWS: ShowcaseTableRow[] = [
  {
    id: 1,
    name: "Fatima Al-Rashidi",
    nameAr: "فاطمة الراشدي",
    email: "fatima@example.com",
    status: "active",
    total: "18.500",
  },
  {
    id: 2,
    name: "Mohammed Al-Sabah",
    nameAr: "محمد الصباح",
    email: "m.sabah@kw.com",
    status: "pending",
    total: "11.750",
  },
  {
    id: 3,
    name: "Sara Hassan",
    nameAr: "سارة حسن",
    email: "sara.h@gmail.com",
    status: "cancelled",
    total: "31.200",
  },
];

const SHOWCASE_STATUS_VARIANTS: Record<ShowcaseTableRow["status"], StatusBadgeVariant> = {
  active: "success",
  pending: "warning",
  cancelled: "danger",
};

const STATUS_KEYS = [
  "delivered",
  "shipped",
  "processing",
  "pending",
  "cancelled",
  "approved",
  "rejected",
  "active",
  "inactive",
  "draft",
  "published",
  "lowstock",
] as const;

const TOAST_CONFIG: Record<ToastType, ToastConfig> = {
  success: {
    Icon: CheckCircle2,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
    ic: "text-emerald-500",
  },
  error: {
    Icon: XCircle,
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-800",
    ic: "text-rose-500",
  },
  warning: {
    Icon: AlertTriangle,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    ic: "text-amber-500",
  },
  info: {
    Icon: Info,
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    ic: "text-blue-500",
  },
  loading: {
    Icon: Loader2,
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-800",
    ic: "text-violet-500",
  },
};

function ShowcaseSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="h-5 w-1 rounded-full bg-brand" />
        <h3 className="text-xs font-bold tracking-wider text-foreground uppercase">{title}</h3>
      </div>
      <div className="rounded-2xl border border-border/60 bg-muted/30 p-5">{children}</div>
    </div>
  );
}

function statusLabel(status: (typeof STATUS_KEYS)[number], isRTL: boolean): string {
  if (status === "lowstock") return isRTL ? "مخزون منخفض" : "Low Stock";
  return status;
}

export function DesignSystemPage() {
  const t = useTranslation();
  const { language } = useLocalization();
  const isRTL = language === "ar";

  const [activeTab, setActiveTab] = useState<ShowcaseTab>("buttons");
  const [sw1, setSw1] = useState(false);
  const [sw2, setSw2] = useState(true);
  const [radio, setRadio] = useState("opt1");
  const [checks, setChecks] = useState<string[]>(["published"]);
  const [prog, setProg] = useState(68);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<ModalType | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [selectedTableIds, setSelectedTableIds] = useState<Array<string | number>>([]);
  const [tablePage, setTablePage] = useState(1);
  const guidanceApi = useGuidance();
  const [demoDock, setDemoDock] = useState<GuidanceDemoDockState>({
    active: false,
    showHotspots: true,
    showChecklist: true,
    showBanner: true,
    showContextualTip: true,
    forceEmpty: false,
  });

  const showcaseTableColumns: DataTableColumn<ShowcaseTableRow>[] = [
    {
      id: "customer",
      header: t.customer,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <UserAvatar name={row.name} />
          <div>
            <p className="text-xs font-semibold text-foreground">
              {isRTL ? row.nameAr : row.name}
            </p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: "status",
      header: t.status,
      cell: (row) => (
        <StatusBadge label={t[row.status]} variant={SHOWCASE_STATUS_VARIANTS[row.status]} />
      ),
    },
    {
      id: "total",
      header: t.total,
      cell: (row) => (
        <span className="text-xs font-bold text-brand">
          {formatKwd(Number(row.total))}
        </span>
      ),
    },
  ];

  const addToast = (type: ToastType, msg: string) => {
    const id = Date.now();
    setToasts((current) => [...current, { id, type, msg }]);
    if (type !== "loading") {
      window.setTimeout(
        () => setToasts((current) => current.filter((toast) => toast.id !== id)),
        3000,
      );
    }
  };

  const switchRows: SwitchRow[] = [
    { value: sw1, onChange: setSw1, label: isRTL ? "تفعيل الإشعارات" : "Enable notifications" },
    { value: sw2, onChange: setSw2, label: isRTL ? "الموافقة التلقائية" : "Auto-approve orders" },
  ];

  const checkboxOptions: { label: string; value: string }[] = [
    { label: isRTL ? "منشور" : "Published", value: "published" },
    { label: isRTL ? "مسودة" : "Draft", value: "draft" },
    { label: isRTL ? "غير نشط" : "Inactive", value: "inactive" },
  ];

  const radioOptions: { label: string; value: string }[] = [
    { label: isRTL ? "يومي" : "Daily", value: "opt1" },
    { label: isRTL ? "أسبوعي" : "Weekly", value: "opt2" },
    { label: isRTL ? "شهري" : "Monthly", value: "opt3" },
  ];

  const modalTriggers: { type: ModalType; label: string }[] = [
    { type: "delete", label: isRTL ? "حذف" : "Delete" },
    { type: "edit", label: isRTL ? "تعديل" : "Edit" },
    { type: "success", label: isRTL ? "نجاح" : "Success" },
    { type: "warn", label: isRTL ? "تحذير" : "Warning" },
    { type: "error", label: isRTL ? "خطأ" : "Error" },
  ];

  const toastTriggers: { type: ToastType; message: string }[] = [
    { type: "success", message: isRTL ? "تم الحفظ بنجاح" : "Saved successfully!" },
    { type: "error", message: isRTL ? "فشل الحفظ" : "Save failed" },
    { type: "warning", message: isRTL ? "مخزون منخفض" : "Low stock warning" },
    { type: "info", message: isRTL ? "طلب جديد" : "New order received" },
    { type: "loading", message: isRTL ? "جارٍ المعالجة..." : "Processing..." },
  ];

  const emptyStates: EmptyStateItem[] = [
    {
      Icon: Package,
      title: isRTL ? "لا توجد منتجات" : "No Products",
      subtitle: isRTL ? "أضف منتجًا لبدء البيع" : "Add a product to start selling",
    },
    {
      Icon: ShoppingBag,
      title: isRTL ? "لا توجد طلبات" : "No Orders",
      subtitle: isRTL ? "ستظهر الطلبات هنا" : "Orders will appear here",
    },
    {
      Icon: Bell,
      title: isRTL ? "لا توجد إشعارات" : "No Notifications",
      subtitle: isRTL ? "أنت على اطلاع كامل!" : "You're all caught up!",
    },
    {
      Icon: Search,
      title: isRTL ? "لا توجد نتائج" : "No Results",
      subtitle: isRTL ? "جرب كلمات بحث مختلفة" : "Try different search terms",
    },
  ];

  const progressBars: ProgressBarItem[] = [
    {
      label: isRTL ? "هدف الإيرادات" : "Revenue Goal",
      value: prog,
      color: "bg-brand",
    },
    {
      label: isRTL ? "مستوى المخزون" : "Stock Level",
      value: 35,
      color: "bg-accent-brand",
    },
    {
      label: isRTL ? "التنفيذ" : "Fulfillment",
      value: 92,
      color: "bg-emerald-500",
    },
    {
      label: isRTL ? "معدل الإرجاع" : "Return Rate",
      value: 8,
      color: "bg-rose-500",
    },
  ];

  const skeletonTableWidths: CSSProperties[] = [
    { width: 80 },
    { width: 120 },
    { width: 80 },
    { width: 60 },
    { width: 60 },
  ];

  return (
    <PageContainer className="relative">
      <div className="pointer-events-none fixed top-4 end-4 z-50 space-y-2">
        {toasts.map((toast) => {
          const cfg = TOAST_CONFIG[toast.type];
          const ToastIcon = cfg.Icon;

          return (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto flex max-w-xs items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg",
                cfg.bg,
                cfg.border,
              )}
            >
              <ToastIcon
                className={cn(
                  "size-4 flex-none",
                  cfg.ic,
                  toast.type === "loading" && "animate-spin",
                )}
              />
              <p className={cn("flex-1 text-sm font-semibold", cfg.text)}>{toast.msg}</p>
              <button
                type="button"
                onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
                className="text-muted-foreground"
                aria-label={t.cancel}
              >
                <X className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {modal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-label={t.cancel}
            onClick={() => setModal(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl bg-card p-6 shadow-2xl">
            {modal === "delete" ? (
              <>
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-rose-50">
                  <Trash2 className="size-6 text-rose-500" />
                </div>
                <h3 className="mb-1 text-lg font-black text-foreground">
                  {isRTL ? "حذف المنتج" : "Delete Product"}
                </h3>
                <p className="mb-5 text-sm text-muted-foreground">
                  {isRTL ? "هل أنت متأكد؟ لا يمكن التراجع." : "Are you sure? This cannot be undone."}
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setModal(null)}>
                    {t.cancel}
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      setModal(null);
                      addToast("success", isRTL ? "تم الحذف بنجاح" : "Deleted successfully");
                    }}
                  >
                    {t.delete}
                  </Button>
                </div>
              </>
            ) : null}

            {modal === "edit" ? (
              <>
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-lg font-black text-foreground">
                    {isRTL ? "تعديل المنتج" : "Edit Product"}
                  </h3>
                  <button type="button" onClick={() => setModal(null)} aria-label={t.cancel}>
                    <X className="size-5 text-muted-foreground" />
                  </button>
                </div>
                <div className="space-y-3">
                  {[isRTL ? "اسم المنتج" : "Product Name", isRTL ? "الماركة" : "Brand", isRTL ? "السعر" : "Price"].map(
                    (label) => (
                      <div key={label}>
                        <label className="mb-1 block text-xs font-bold text-muted-foreground">
                          {label}
                        </label>
                        <Input className="rounded-xl" />
                      </div>
                    ),
                  )}
                </div>
                <div className="mt-5 flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setModal(null)}>
                    {t.cancel}
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setModal(null);
                      addToast("success", isRTL ? "تم الحفظ" : "Changes saved");
                    }}
                  >
                    {t.save}
                  </Button>
                </div>
              </>
            ) : null}

            {modal === "success" ? (
              <div className="py-4 text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-50">
                  <CheckCircle2 className="size-8 text-emerald-500" />
                </div>
                <h3 className="mb-2 text-xl font-black text-foreground">
                  {isRTL ? "تم بنجاح!" : "Success!"}
                </h3>
                <p className="mb-5 text-sm text-muted-foreground">
                  {isRTL ? "تم حفظ التغييرات." : "Your changes were saved."}
                </p>
                <Button
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                  onClick={() => setModal(null)}
                >
                  {isRTL ? "متابعة" : "Continue"}
                </Button>
              </div>
            ) : null}

            {modal === "warn" ? (
              <>
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-amber-50">
                  <AlertTriangle className="size-6 text-amber-500" />
                </div>
                <h3 className="mb-1 text-lg font-black text-foreground">
                  {isRTL ? "أرشفة المنتج" : "Archive Product"}
                </h3>
                <p className="mb-5 text-sm text-muted-foreground">
                  {isRTL
                    ? "سيُخفى المنتج ويمكن استعادته لاحقًا."
                    : "Product will be hidden but can be restored."}
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setModal(null)}>
                    {t.cancel}
                  </Button>
                  <Button
                    className="flex-1 bg-amber-500 hover:bg-amber-600"
                    onClick={() => {
                      setModal(null);
                      addToast("warning", isRTL ? "تم الأرشفة" : "Archived");
                    }}
                  >
                    {isRTL ? "أرشفة" : "Archive"}
                  </Button>
                </div>
              </>
            ) : null}

            {modal === "error" ? (
              <>
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-rose-50">
                  <XCircle className="size-6 text-rose-500" />
                </div>
                <h3 className="mb-1 text-lg font-black text-foreground">
                  {isRTL ? "حدث خطأ" : "Error"}
                </h3>
                <p className="mb-5 text-sm text-muted-foreground">
                  {isRTL ? "تعذّر معالجة الطلب." : "Could not process the request."}
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setModal(null)}>
                    {t.cancel}
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={() => setModal(null)}>
                    {isRTL ? "إعادة المحاولة" : "Try Again"}
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      <Card className="gap-0 overflow-hidden border-border/60 py-0 shadow-sm">
        <CardHeader className="border-b border-border/60 bg-gradient-to-r from-brand/5 to-transparent px-6 py-4">
          <h2 className="flex items-center gap-2 font-black text-foreground">
            <Zap className="size-5 text-accent-brand" aria-hidden="true" />
            {t.designSystemTitle}
          </h2>
          <p className="text-sm text-muted-foreground">{t.designSystemSubtitle}</p>
        </CardHeader>

        <div className="flex overflow-x-auto border-b border-border/60 bg-muted/20 [scrollbar-width:none]">
          {SHOWCASE_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-none border-b-2 px-5 py-3 text-sm font-semibold capitalize transition-all",
                activeTab === tab
                  ? "border-brand bg-card text-brand"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <CardContent className="space-y-8 p-6">
          {activeTab === "buttons" ? (
            <>
              <ShowcaseSection title={isRTL ? "أنواع الأزرار" : "Button Variants"}>
                <div className="flex flex-wrap gap-3">
                  <Button>{isRTL ? "رئيسي" : "Primary"}</Button>
                  <Button variant="secondary">{isRTL ? "ثانوي" : "Secondary"}</Button>
                  <Button variant="outline">{isRTL ? "إطار" : "Outline"}</Button>
                  <Button variant="destructive">{isRTL ? "خطر" : "Danger"}</Button>
                  <Button className="bg-emerald-500 hover:bg-emerald-600">
                    {isRTL ? "نجاح" : "Success"}
                  </Button>
                  <Button className="bg-accent-brand hover:bg-accent-brand/90">
                    {isRTL ? "ثانوي" : "Accent"}
                  </Button>
                  <Button variant="ghost">{isRTL ? "شبح" : "Ghost"}</Button>
                </div>
              </ShowcaseSection>

              <ShowcaseSection title={isRTL ? "حالات الأزرار" : "Button States"}>
                <div className="flex flex-wrap items-center gap-3">
                  <Button>{isRTL ? "افتراضي" : "Default"}</Button>
                  <Button className="ring-2 ring-brand/30">{isRTL ? "تحريك" : "Hover"}</Button>
                  <Button disabled>{isRTL ? "معطل" : "Disabled"}</Button>
                  <Button
                    onClick={() => {
                      setLoading(true);
                      window.setTimeout(() => setLoading(false), 2000);
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        {isRTL ? "جارٍ التحميل..." : "Loading..."}
                      </>
                    ) : (
                      (isRTL ? "اضغط للتحميل" : "Click → Loading")
                    )}
                  </Button>
                  <Button>
                    <Plus className="size-4" />
                    {isRTL ? "إضافة منتج" : "Add Product"}
                  </Button>
                  <Button size="icon" aria-label={isRTL ? "إضافة" : "Add"}>
                    <Plus className="size-5" />
                  </Button>
                </div>
              </ShowcaseSection>
            </>
          ) : null}

          {activeTab === "forms" ? (
            <div className="grid gap-8 sm:grid-cols-2">
              <div className="space-y-4">
                <ShowcaseSection title={isRTL ? "حقول النص" : "Text Inputs"}>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-muted-foreground">
                        {isRTL ? "الحقل الافتراضي" : "Default"}
                      </label>
                      <Input
                        className="rounded-xl"
                        placeholder={isRTL ? "أدخل النص هنا..." : "Enter text here..."}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-muted-foreground">
                        {isRTL ? "مع أيقونة" : "With Icon"}
                      </label>
                      <div className="relative">
                        <Mail className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input className="rounded-xl ps-10" placeholder="email@example.com" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-muted-foreground">
                        {isRTL ? "حالة خطأ" : "Error State"}
                      </label>
                      <Input
                        className="rounded-xl border-2 border-rose-400 bg-rose-50/30"
                        defaultValue={isRTL ? "قيمة غير صحيحة" : "Invalid value"}
                      />
                      <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
                        <AlertCircle className="size-3" />
                        {t.required}
                      </p>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-muted-foreground">
                        {isRTL ? "معطل" : "Disabled"}
                      </label>
                      <Input
                        disabled
                        className="rounded-xl"
                        value={isRTL ? "حقل معطل" : "Disabled input"}
                        readOnly
                      />
                    </div>
                  </div>
                </ShowcaseSection>

                <ShowcaseSection title={isRTL ? "مفاتيح التبديل" : "Switches"}>
                  <div className="space-y-3">
                    {switchRows.map(({ value, onChange, label }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{label}</span>
                        <button
                          type="button"
                          onClick={() => onChange(!value)}
                          className={cn(
                            "relative h-6 w-12 rounded-full transition-colors",
                            value ? "bg-brand" : "bg-muted",
                          )}
                          aria-pressed={value}
                        >
                          <span
                            className={cn(
                              "absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform",
                              value ? "translate-x-6" : "translate-x-0.5",
                            )}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </ShowcaseSection>
              </div>

              <div className="space-y-4">
                <ShowcaseSection title={isRTL ? "اختيارات متعددة" : "Checkboxes & Radio"}>
                  <div className="mb-3 space-y-2">
                    {checkboxOptions.map(({ label, value }) => (
                      <label key={value} className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checks.includes(value)}
                          onChange={() =>
                            setChecks((current) =>
                              current.includes(value)
                                ? current.filter((item) => item !== value)
                                : [...current, value],
                            )
                          }
                          className="size-4 rounded accent-brand"
                        />
                        <span className="text-sm font-medium text-foreground">{label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="space-y-2 border-t border-border/60 pt-3">
                    {radioOptions.map(({ label, value }) => (
                      <label key={value} className="flex cursor-pointer items-center gap-3">
                        <input
                          type="radio"
                          checked={radio === value}
                          onChange={() => setRadio(value)}
                          className="size-4 accent-brand"
                        />
                        <span className="text-sm font-medium text-foreground">{label}</span>
                      </label>
                    ))}
                  </div>
                </ShowcaseSection>

                <ShowcaseSection title={isRTL ? "رفع الملفات" : "File Upload"}>
                  <div className="cursor-pointer rounded-2xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-brand/40">
                    <Upload className="mx-auto mb-2 size-6 text-muted-foreground" />
                    <p className="text-sm font-semibold text-foreground">
                      {isRTL ? "اسحب وأفلت أو انقر للاختيار" : "Drop or click to upload"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, PDF — max 10MB</p>
                  </div>
                </ShowcaseSection>
              </div>
            </div>
          ) : null}

          {activeTab === "cards" ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Card className="gap-0 border-border/60 py-0 shadow-sm">
                <CardContent className="p-5">
                  <p className="mb-3 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    {isRTL ? "بطاقة تحليلية" : "Analytics Card"}
                  </p>
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                      <DollarSign className="size-5" />
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-success-muted px-2 py-0.5 text-xs font-bold text-success">
                      <TrendingUp className="size-3" />
                      +14%
                    </span>
                  </div>
                  <p className="text-2xl font-black text-foreground">{formatKwd(19800)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t.monthlyRevenue}</p>
                </CardContent>
              </Card>

              <Card className="gap-0 overflow-hidden border-0 bg-gradient-to-br from-brand to-[#063e38] py-0 text-white shadow-sm">
                <CardContent className="p-5">
                  <p className="mb-3 text-xs font-bold tracking-wider text-white/60 uppercase">
                    {isRTL ? "بطاقة عميل" : "Customer Card"}
                  </p>
                  <div className="mb-3 flex items-center gap-3">
                    <UserAvatar name="Fatima" size="md" />
                    <div>
                      <p className="text-sm font-bold">
                        {isRTL ? "فاطمة الراشدي" : "Fatima Al-Rashidi"}
                      </p>
                      <p className="text-xs text-white/60">{isRTL ? "عضو ذهبي" : "Gold Member"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 rounded-xl bg-white/10 p-3 text-center text-sm">
                    <div>
                      <p className="font-black">28</p>
                      <p className="text-[10px] text-white/60">{isRTL ? "طلبات" : "Orders"}</p>
                    </div>
                    <div>
                      <p className="font-black">2,450</p>
                      <p className="text-[10px] text-white/60">{isRTL ? "نقاط" : "Points"}</p>
                    </div>
                    <div>
                      <p className="font-black">{formatKwd(284)}</p>
                      <p className="text-[10px] text-white/60">{isRTL ? "إجمالي" : "Spent"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group gap-0 overflow-hidden border-border/60 py-0 shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-0">
                  <p className="px-4 pt-4 pb-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    {isRTL ? "بطاقة منتج" : "Product Card"}
                  </p>
                  <div className="h-32 overflow-hidden bg-muted">
                    <img
                      src="https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=300&h=200&fit=crop&auto=format"
                      alt=""
                      className="size-full object-cover transition-transform duration-400 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground">Cetaphil</p>
                    <p className="mb-2 text-sm font-bold text-foreground">
                      {isRTL ? "كريم سيتافيل ٢٥٠جم" : "Cetaphil Cream 250g"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-brand">{formatKwd(3.85)}</span>
                      <AdminStatusBadge status="published" label={t.published} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {activeTab === "tables" ? (
            <>
              <ShowcaseSection title={isRTL ? "جدول أساسي" : "Basic Table"}>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="px-4 py-3 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                        {t.customer}
                      </TableHead>
                      <TableHead className="px-4 py-3 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                        {t.status}
                      </TableHead>
                      <TableHead className="px-4 py-3 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                        {t.total}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SHOWCASE_TABLE_ROWS.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="px-4 py-3 text-xs font-semibold text-foreground">
                          {isRTL ? row.nameAr : row.name}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <StatusBadge
                            label={t[row.status]}
                            variant={SHOWCASE_STATUS_VARIANTS[row.status]}
                          />
                        </TableCell>
                        <TableCell className="px-4 py-3 text-xs font-bold text-brand">
                          {formatKwd(Number(row.total))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ShowcaseSection>

              <ShowcaseSection title={isRTL ? "جدول بيانات" : "Data Table"}>
                <DataTable
                  columns={showcaseTableColumns}
                  data={SHOWCASE_TABLE_ROWS}
                  emptyTitle={t.noData}
                  enableSelection
                  selectedIds={selectedTableIds}
                  onSelectionChange={setSelectedTableIds}
                  selectAllLabel={t.selectAllRows}
                  rowActions={() => (
                    <AppButton variant="ghost" size="sm" className="text-brand">
                      {t.viewAction}
                    </AppButton>
                  )}
                  actionsHeader={t.actions}
                  pagination={{
                    page: tablePage,
                    pageSize: 10,
                    totalItems: SHOWCASE_TABLE_ROWS.length,
                    onPageChange: setTablePage,
                    previousLabel: t.previous,
                    nextLabel: t.next,
                  }}
                  showingLabel={t.showing}
                />
              </ShowcaseSection>

              <ShowcaseSection title={isRTL ? "جدول فارغ" : "Empty Table"}>
                <DataTable
                  columns={showcaseTableColumns}
                  data={[]}
                  emptyTitle={isRTL ? "لا توجد صفوف" : "No rows yet"}
                  emptyDescription={
                    isRTL
                      ? "ستظهر البيانات هنا عند توفرها."
                      : "Rows will appear here once data is available."
                  }
                  emptyAction={
                    <AppButton size="sm">
                      <Plus className="size-4" aria-hidden="true" />
                      {t.addNew}
                    </AppButton>
                  }
                />
              </ShowcaseSection>
            </>
          ) : null}

          {activeTab === "modals" ? (
            <ShowcaseSection title={isRTL ? "تفعيل النوافذ المنبثقة" : "Trigger Modals"}>
              <div className="flex flex-wrap gap-3">
                {modalTriggers.map(({ type, label }) => (
                  <Button
                    key={type}
                    variant="outline"
                    onClick={() => setModal(type)}
                    className={cn(
                      type === "delete" || type === "error"
                        ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                        : type === "success"
                          ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                          : type === "warn"
                            ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                            : "border-brand/30 text-brand hover:bg-brand/5",
                    )}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </ShowcaseSection>
          ) : null}

          {activeTab === "status" ? (
            <>
              <ShowcaseSection title={isRTL ? "شارات الحالة" : "Status Badges"}>
                <div className="flex flex-wrap gap-2">
                  {STATUS_KEYS.map((status) => (
                    <AdminStatusBadge
                      key={status}
                      status={status}
                      label={
                        status === "lowstock"
                          ? statusLabel(status, isRTL)
                          : t[status as keyof typeof t]
                      }
                    />
                  ))}
                </div>
              </ShowcaseSection>

              <ShowcaseSection title={isRTL ? "أشرطة التقدم" : "Progress Bars"}>
                <div className="space-y-4">
                  {progressBars.map(({ label, value, color }) => (
                    <div key={label}>
                      <div className="mb-1.5 flex justify-between">
                        <span className="text-xs font-semibold text-foreground">{label}</span>
                        <span className="text-xs font-bold text-muted-foreground">{value}%</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn("h-full rounded-full transition-all duration-700", color)}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={prog}
                    onChange={(event) => setProg(Number(event.target.value))}
                    className="w-full accent-brand"
                  />
                </div>
              </ShowcaseSection>
            </>
          ) : null}

          {activeTab === "empty" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {emptyStates.map(({ Icon, title, subtitle }) => (
                <Card
                  key={title}
                  className="flex flex-col items-center border-border/60 py-10 text-center shadow-sm"
                >
                  <CardContent className="flex flex-col items-center">
                    <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                      <Icon className="size-7 text-muted-foreground" />
                    </div>
                    <p className="mb-1 font-bold text-foreground">{title}</p>
                    <p className="mb-4 text-xs text-muted-foreground">{subtitle}</p>
                    <Button size="sm">
                      <Plus className="size-3.5" />
                      {isRTL ? "إضافة" : "Add New"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}

          {activeTab === "loading" ? (
            <>
              <ShowcaseSection title={isRTL ? "بطاقات هيكلية" : "Skeleton Cards"}>
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((index) => (
                    <Card key={index} className="gap-0 border-border/60 py-0 shadow-sm">
                      <CardContent className="space-y-3 p-5">
                        <DemoSkeleton className="size-10 rounded-xl" />
                        <DemoSkeleton className="h-6 w-24" />
                        <DemoSkeleton className="h-4 w-full" />
                        <DemoSkeleton className="h-3 w-3/4" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ShowcaseSection>

              <ShowcaseSection title={isRTL ? "جداول هيكلية" : "Skeleton Table"}>
                <Card className="gap-0 overflow-hidden border-border/60 py-0 shadow-sm">
                  <div className="flex gap-4 border-b border-border/60 bg-muted/30 px-5 py-3">
                    {skeletonTableWidths.map((style, index) => (
                      <DemoSkeleton key={index} className="h-3" style={style} />
                    ))}
                  </div>
                  {[1, 2, 3, 4].map((index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 border-b border-border/40 px-5 py-3.5 last:border-b-0"
                    >
                      <DemoSkeleton className="size-9 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <DemoSkeleton className="h-3 w-32" />
                        <DemoSkeleton className="h-2.5 w-24" />
                      </div>
                      <DemoSkeleton className="h-5 w-20 rounded-full" />
                      <DemoSkeleton className="h-3 w-16" />
                    </div>
                  ))}
                </Card>
              </ShowcaseSection>

              <ShowcaseSection title={isRTL ? "مؤشرات التحميل" : "Loading Spinners"}>
                <div className="flex flex-wrap items-center gap-8">
                  <Loader2 className="size-8 animate-spin text-brand" />
                  <div className="size-8 animate-spin rounded-full border-4 border-brand/20 border-t-brand" />
                  <div className="size-8 animate-spin rounded-full border-4 border-rose-100 border-t-rose-500" />
                  <div className="flex gap-1">
                    {[1, 2, 3].map((index) => (
                      <div
                        key={index}
                        className="size-2.5 animate-bounce rounded-full bg-brand"
                        style={{ animationDelay: `${index * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </ShowcaseSection>
            </>
          ) : null}

          {activeTab === "toasts" ? (
            <>
              <ShowcaseSection title={isRTL ? "تفعيل الرسائل المنبثقة" : "Trigger Toasts"}>
                <div className="flex flex-wrap gap-3">
                  {toastTriggers.map(({ type, message }) => (
                    <Button
                      key={type}
                      variant="outline"
                      onClick={() => addToast(type, message)}
                      className={cn(
                        "capitalize",
                        type === "success"
                          ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                          : type === "error"
                            ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                            : type === "warning"
                              ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                              : type === "info"
                                ? "border-blue-200 text-blue-600 hover:bg-blue-50"
                                : "border-violet-200 text-violet-600 hover:bg-violet-50",
                      )}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </ShowcaseSection>

              <ShowcaseSection title={isRTL ? "معاينة الرسائل" : "Toast Preview"}>
                <div className="max-w-sm space-y-3">
                  {(Object.entries(TOAST_CONFIG) as [ToastType, ToastConfig][]).map(
                    ([type, cfg]) => {
                      const PreviewIcon = cfg.Icon;

                      return (
                        <div
                          key={type}
                          className={cn(
                            "flex items-center gap-3 rounded-2xl border px-4 py-3",
                            cfg.bg,
                            cfg.border,
                          )}
                        >
                          <PreviewIcon
                            className={cn(
                              "size-4 flex-none",
                              cfg.ic,
                              type === "loading" && "animate-spin",
                            )}
                          />
                          <p className={cn("flex-1 text-sm font-semibold capitalize", cfg.text)}>
                            {type}
                          </p>
                          <X className="size-3.5 text-muted-foreground" />
                        </div>
                      );
                    },
                  )}
                </div>
              </ShowcaseSection>
            </>
          ) : null}

          {activeTab === "guidance" ? (
            <>
              <ShowcaseSection
                title={isRTL ? "إرشاد داخل التطبيق" : "In-app guidance"}
              >
                <p className="mb-4 text-sm text-muted-foreground">
                  {isRTL
                    ? "استخدم قائمة المساعدة في الرأس أو افتح لوحة المعاينة هنا."
                    : "Use Help in the header on any page, or open the pattern playground dock here."}
                </p>
                <div className="flex flex-wrap gap-3" data-guidance="design-system-title">
                  <Button
                    onClick={() =>
                      setDemoDock((current) => ({ ...current, active: true }))
                    }
                  >
                    {t.guidancePreview}
                  </Button>
                  <Button variant="outline" onClick={() => guidanceApi.startProductTour()}>
                    {t.guidanceProductTour}
                  </Button>
                  <Button variant="outline" onClick={() => guidanceApi.showChecklist()}>
                    {t.guidanceToggleChecklist}
                  </Button>
                </div>
              </ShowcaseSection>
              <GuidanceDemoDock
                state={demoDock}
                labels={{
                  title: t.guidanceDemoDockTitle,
                  productTour: t.guidanceProductTour,
                  coachMarks: t.guidanceCoachMarks,
                  walkthrough: t.guidanceWalkthrough,
                  hotspots: t.guidanceToggleHotspots,
                  checklist: t.guidanceToggleChecklist,
                  banner: t.guidanceToggleBanner,
                  contextualTip: t.guidanceToggleContextualTip,
                  emptyState: t.guidanceToggleEmpty,
                  stop: t.guidanceStopPreview,
                  collapse: t.guidanceCollapse,
                  expand: t.guidanceExpand,
                  drag: t.guidanceDrag,
                }}
                onProductTour={() => guidanceApi.startProductTour()}
                onCoachMarks={() => guidanceApi.startCoachMarks()}
                onWalkthrough={() => guidanceApi.startWalkthrough()}
                onToggle={(key) =>
                  setDemoDock((current) => ({ ...current, [key]: !current[key] }))
                }
                onStop={() => setDemoDock((current) => ({ ...current, active: false }))}
              />
            </>
          ) : null}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
