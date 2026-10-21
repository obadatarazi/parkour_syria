/**
 * Static Admin copies of Backend PHP enums (OptionController).
 * Labels mirror Backend/lang/{en,ar}/enum.php — plus REVIEWED (missing in lang files).
 */

export type StaticEnumLocale = "en" | "ar";

export type StaticEnumOptionDef = {
  value: string;
  label: Record<StaticEnumLocale, string>;
};

function defs(
  entries: Array<[string, string, string]>,
): StaticEnumOptionDef[] {
  return entries.map(([value, en, ar]) => ({
    value,
    label: { en, ar },
  }));
}

export const STATIC_ENUM_OPTIONS = {
  multiTypeSettingType: defs([
    ["EMAIL", "Email", "بريد إلكتروني"],
    ["LINK", "Link", "رابط"],
    ["NUMBER", "Number", "رقم"],
    ["PHONE_NUMBER", "Phone Number", "رقم هاتف"],
    ["TEXT", "Text", "نص"],
    ["PERCENTAGE", "Percentage", "نسبة مئوية"],
    ["BOOLEAN", "Boolean", "منطقي"],
  ]),
  userGender: defs([
    ["MALE", "Male", "ذكر"],
    ["FEMALE", "Female", "أنثى"],
  ]),
  userType: defs([
    ["ADMIN", "Admin", "مدير"],
    ["CUSTOMER", "Customer", "مستخدم"],
  ]),
  contactUsStatus: defs([
    ["PENDING", "Pending", "قيد الانتظار"],
    ["REVIEWED", "Reviewed", "تمت المراجعة"],
  ]),
  notificationType: defs([
    ["ORDER", "Order", "طلب"],
    ["STOCK", "Stock", "المخزون"],
    ["RX", "Prescription", "وصفة طبية"],
    ["CUSTOMER", "Customer", "مستخدم"],
    ["PAYMENT", "Payment", "دفع"],
    ["PROMO", "Promotion", "عرض ترويجي"],
    ["REVIEW", "Review", "تقييم"],
    ["LOYALTY", "Loyalty", "الولاء"],
    ["CUSTOM", "Custom", "مخصص"],
    ["WARNING", "Warning", "تحذير"],
    ["ERROR", "Error", "خطأ"],
  ]),
  staticPromotionType: defs([
    ["MOBILE", "Mobile", "جوال"],
    ["DESKTOP", "Desktop", "سطح المكتب"],
  ]),
  sliderPromotionType: defs([
    ["MOBILE", "Mobile", "جوال"],
    ["DESKTOP", "Desktop", "سطح المكتب"],
  ]),
  productType: defs([
    ["SIMPLE", "Simple", "بسيط"],
    ["VARIABLE_PRODUCT", "Variable Product", "متعدد الخيارات"],
  ]),
  productStatus: defs([
    ["OUT_OF_STOCK", "Out of Stock", "نفذ من المخزون"],
    ["LOW_STOCK", "Low Stock", "مخزون منخفض"],
    ["IN_STOCK", "In Stock", "متوفر"],
  ]),
  orderStatus: defs([
    ["PENDING_PAYMENT", "Pending Payment", "بانتظار الدفع"],
    ["PROCESSING", "Processing", "قيد المعالجة"],
    ["READY_TO_PREPARE", "Ready to prepare", "جاهز للتحضير"],
    ["ON_HOLD", "On Hold", "معلق"],
    ["COMPLETED", "Completed", "مكتمل"],
    ["CANCELLED", "Cancelled", "ملغي"],
    ["REFUNDED", "Refunded", "مسترجع"],
    [
      "ON_THE_WAY_TO_DELIVER_TODAY",
      "On the way to deliver today",
      "في الطريق للتوصيل اليوم",
    ],
  ]),
  orderCreatedBy: defs([
    ["CUSTOMER", "Customer", "مستخدم"],
    ["GUEST", "Guest", "زائر"],
    ["ADMIN", "Admin", "مدير"],
  ]),
  orderSource: defs([
    ["WEBSITE", "Website", "الموقع الإلكتروني"],
    ["WHATSAPP", "WhatsApp", "واتساب"],
    ["CARE_PLAN", "Care Plan", "خطة العناية"],
  ]),
  invoiceStatus: defs([
    ["PAID", "Paid", "مدفوع"],
    ["UNPAID", "Unpaid", "غير مدفوع"],
    ["FAILED", "Failed", "فشل"],
    ["REFUNDED", "Refunded", "مسترجع"],
    ["CANCELLED", "Cancelled", "ملغي"],
    ["EXPIRED", "Expired", "منتهي الصلاحية"],
  ]),
  invoicePaymentProvider: defs([
    ["CASH_ON_DELIVERY", "Cash on Delivery", "الدفع عند الاستلام"],
    ["MYFATOORAH", "MyFatoorah", "ماي فاتورة"],
    ["HESABE", "Hesabe", "حسابي"],
  ]),
  couponType: defs([
    ["FIXED", "Fixed", "مبلغ ثابت"],
    ["PERCENTAGE", "Percentage", "نسبة مئوية"],
    ["FREE_SHIPPING", "Free Shipping", "شحن مجاني"],
  ]),
  couponStatus: defs([
    ["ACTIVE", "Active", "فعال"],
    ["IN_ACTIVE", "Inactive", "غير فعال"],
    ["EXPIRED", "Expired", "منتهي الصلاحية"],
    ["REACH_THE_LIMIT", "Reached the limit", "تم الوصول إلى الحد الأقصى"],
    ["DRAFT", "Draft", "مسودة"],
  ]),
  couponAudience: defs([
    ["EVERYONE", "Everyone", "الجميع"],
    ["SPECIFIC_USERS", "Specific Users", "مستخدمون محددون"],
  ]),
  couponApplicableTo: defs([
    ["PRODUCT", "Product", "منتج"],
    ["BRAND", "Brand", "علامة تجارية"],
    ["CATEGORY", "Category", "تصنيف"],
    ["TAG", "Tag", "وسم"],
  ]),
  couponScope: defs([
    ["CART", "Whole cart", "السلة كاملة"],
    ["ITEMS", "Selected items", "عناصر محددة"],
    ["SHIPPING", "Shipping", "الشحن"],
  ]),
  carePlanStatus: defs([
    ["ACTIVE", "Active", "نشط"],
    ["PAUSED", "Paused", "موقوف"],
    ["CANCELLED", "Cancelled", "ملغى"],
  ]),
  carePlanFrequency: defs([
    ["WEEKLY", "Weekly", "أسبوعي"],
    ["BIWEEKLY", "Every 2 weeks", "كل أسبوعين"],
    ["MONTHLY", "Monthly", "شهري"],
  ]),
  carePlanPreferredWeekday: defs([
    ["0", "Sunday", "الأحد"],
    ["1", "Monday", "الإثنين"],
    ["2", "Tuesday", "الثلاثاء"],
    ["3", "Wednesday", "الأربعاء"],
    ["4", "Thursday", "الخميس"],
    ["5", "Friday", "الجمعة"],
    ["6", "Saturday", "السبت"],
  ]),
  carePlanCycleStatus: defs([
    ["SCHEDULED", "Scheduled", "مجدولة"],
    ["AWAITING_PAYMENT", "Awaiting Payment", "بانتظار الدفع"],
    ["ORDERED", "Ordered", "تم الطلب"],
    ["SKIPPED", "Skipped", "متخطاة"],
    ["CANCELLED", "Cancelled", "ملغى"],
    ["FAILED", "Failed", "فشل"],
  ]),
  carePlanEventType: defs([
    ["CREATED", "Created", "تم الإنشاء"],
    ["ITEM_ADDED", "Item added", "تمت إضافة منتج"],
    ["ITEM_REMOVED", "Item removed", "تمت إزالة منتج"],
    ["FREQUENCY_CHANGED", "Frequency changed", "تم تغيير التكرار"],
    ["ADDRESS_CHANGED", "Address changed", "تم تغيير العنوان"],
    ["PAUSED", "Paused", "موقوف"],
    ["RESUMED", "Resumed", "تم الاستئناف"],
    ["SKIPPED", "Skipped", "متخطاة"],
    ["CANCELLED", "Cancelled", "ملغى"],
    ["CYCLE_ORDERED", "Cycle ordered", "تم إنشاء طلب الدورة"],
    ["CYCLE_FAILED", "Cycle failed", "فشلت الدورة"],
    ["PAYMENT_REMINDER", "Payment reminder", "تذكير بالدفع"],
    ["AUTO_PAUSED", "Auto paused", "إيقاف تلقائي"],
  ]),
  carePlanFailureReason: defs([
    ["INSUFFICIENT_STOCK", "Insufficient stock", "مخزون غير كافٍ"],
    ["PAYMENT_WINDOW_EXPIRED", "Payment window expired", "انتهت مهلة الدفع"],
    ["ADMIN_OVERRIDE", "Admin override", "تعديل من الأدمن"],
    ["PRODUCT_UNAVAILABLE", "Product unavailable", "المنتج غير متوفر"],
    ["CUSTOMER_CANCELLED", "Cancelled by customer", "ألغاه الزبون"],
    ["CUSTOMER_SKIPPED", "Skipped by customer", "تخطاه الزبون"],
    ["AUTO_PAUSED_MISSED_PAYMENTS", "Auto-paused after missed payments", "إيقاف تلقائي بسبب تفويت الدفع"],
  ]),
  trendingSearchTargetType: defs([
    ["KEYWORD", "Keyword", "كلمة مفتاحية"],
    ["BRAND", "Brand", "علامة تجارية"],
    ["CATEGORY", "Category", "تصنيف"],
    ["PRODUCT", "Product", "منتج"],
    ["TAG", "Tag", "وسم"],
  ]),
  loyaltyEventType: defs([
    ["REGISTRATION", "Registration", "تسجيل"],
    ["ORDER", "Order", "طلب"],
    ["CARE_PLAN", "Care Plan", "خطة العناية"],
    ["MILESTONE", "Milestone", "معلم"],
  ]),
  loyaltyRewardType: defs([
    ["PERCENTAGE", "Percentage", "نسبة مئوية"],
    ["FREE_SHIPPING", "Free shipping", "شحن مجاني"],
    ["FIXED", "Fixed amount", "مبلغ ثابت"],
  ]),
  loyaltyLedgerType: defs([
    ["EARN", "Earn", "اكتساب"],
    ["REDEEM", "Redeem", "استبدال"],
    ["ADJUST", "Adjust", "تعديل"],
  ]),
  loyaltyRedemptionStatus: defs([
    ["ACTIVE", "Active", "نشط"],
    ["USED", "Used", "مستخدم"],
    ["EXPIRED", "Expired", "منتهي"],
    ["CANCELLED", "Cancelled", "ملغى"],
  ]),
  promotionType: defs([["BOGO", "Buy X get Y free", "اشترِ X واحصل على Y مجاناً"]]),
  promotionDiscountType: defs([["PERCENTAGE", "Percentage", "نسبة مئوية"]]),
  prescriptionStatus: defs([
    ["PENDING", "Pending", "قيد الانتظار"],
    ["APPROVED", "Approved", "مقبولة"],
    ["REJECTED", "Rejected", "مرفوضة"],
  ]),
  staffNoteType: defs([
    ["GENERAL", "General", "عام"],
    ["CALL", "Call", "مكالمة"],
    ["COMPLAINT", "Complaint", "شكوى"],
    ["DELIVERY", "Delivery", "توصيل"],
  ]),
} as const;

export type StaticEnumOptionsKey = keyof typeof STATIC_ENUM_OPTIONS;

export function resolveStaticEnumOptions(
  key: StaticEnumOptionsKey,
  locale: StaticEnumLocale,
): Array<{ value: string; label: string }> {
  return STATIC_ENUM_OPTIONS[key].map((option) => ({
    value: option.value,
    label: option.label[locale] ?? option.label.en,
  }));
}

/** Prefer a localized static label when the API returns a raw enum value. */
export function resolveStaticEnumLabel(
  key: StaticEnumOptionsKey,
  value: string | null | undefined,
  locale: StaticEnumLocale,
  fallbackLabel?: string | null,
): string | null {
  const normalizedValue = value?.trim() || null;
  const normalizedLabel = fallbackLabel?.trim() || null;
  if (!normalizedValue && !normalizedLabel) return null;

  const options = resolveStaticEnumOptions(key, locale);
  const match = options.find(
    (option) =>
      option.value === normalizedValue ||
      option.value === normalizedLabel ||
      option.value.toUpperCase() === (normalizedValue ?? "").toUpperCase(),
  );
  if (match) return match.label;

  if (
    normalizedLabel &&
    normalizedLabel !== normalizedValue &&
    !/^[A-Z][A-Z0-9_]*$/.test(normalizedLabel)
  ) {
    return normalizedLabel;
  }

  return normalizedLabel || normalizedValue;
}
