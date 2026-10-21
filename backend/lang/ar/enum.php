<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Enum Language Lines
    |--------------------------------------------------------------------------
    |
    | The following language lines are used during Enum for various
    | messages that we need to display to the user. You are free to modify
    | these language lines according to your application's requirements.
    |
     */

    'test_key' => 'تجريب',

    'MALE' => 'ذكر',
    'FEMALE' => 'انثى',

    'EMAIL' => 'البريد الإلكتروني',
    'LINK' => 'رابط',
    'NUMBER' => 'رقم',
    'PHONE_NUMBER' => 'رقم الهاتف',
    'TEXT' => 'نص',

    'CUSTOMER' => 'مستخدم',
    'ADMIN' => 'مدير',
    'REGISTER_CUSTOMER_ACCOUNT' => 'تسجيل عميل جديد',
    'LOW_STOCK_ALERT' => 'تنبيه انخفاض المخزون',
    'PRODUCT_OUT_OF_STOCK' => 'نفاد مخزون منتج',
    'ORDER_CREATED' => 'طلب جديد',
    'CREATE_PRODUCT_REVIEW' => 'تقييم جديد لمنتج',
    'PRESCRIPTION_CREATED' => 'تم رفع وصفة طبية جديدة',
    'CARE_PLAN_CREATED' => 'تمت تفعيل خطة العناية',
    'CARE_PLAN_AUTO_PAUSED' => 'تم إيقاف خطة العناية تلقائياً',
    'CARE_PLAN_INSUFFICIENT_STOCK' => 'مخزون خطة العناية غير كافٍ',
    'CARE_PLAN_PRODUCT_REMOVED_ADMIN' => 'تمت إزالة منتج من خطط العناية',
    'CARE_PLAN_PRODUCT_UNAVAILABLE' => 'منتج خطة العناية غير متوفر',
    'CREATE_CONTACT_US' => 'طلب تواصل جديد',
    'ORDER_PAYMENT_FAILED' => 'فشلت عملية دفع الطلب',
    'CARE_PLAN_PAYMENT_FAILED' => 'فشلت عملية دفع خطة العناية',
    'CARE_PLAN_CANCELLED' => 'تم إلغاء خطة العناية',

    'MOBILE' => 'جوال',
    'DESKTOP' => 'سطح المكتب',

    'SIMPLE' => 'بسيط',
    'VARIABLE_PRODUCT' => 'متعدد الخيارات',

    'OUT_OF_STOCK' => 'نفذ من المخزون',
    'LOW_STOCK' => 'مخزون منخفض',
    'IN_STOCK' => 'متوفر',

    'INCREMENT' => 'زيادة',
    'DECREMENT' => 'نقصان',
    'SET' => 'تحديد',

    'PENDING' => 'قيد الانتظار',
    'APPROVE' => 'مقبول',
    'REJECT' => 'مرفوض',
    'APPROVED' => 'مقبولة',
    'REJECTED' => 'مرفوضة',
    'PERCENTAGE' => 'نسبة مئوية',
    'BOOLEAN' => 'قيمة منطقية',

    'PENDING_PAYMENT' => 'بانتظار الدفع',
    'PROCESSING' => 'قيد المعالجة',
    'READY_TO_PREPARE' => 'جاهز للتحضير',
    'ON_HOLD' => 'معلق',
    'COMPLETED' => 'مكتمل',
    'CANCELLED' => 'ملغي',
    'REFUNDED' => 'مسترجع',
    'ON_THE_WAY_TO_DELIVER_TODAY' => 'في الطريق للتوصيل اليوم',

    'GUEST' => 'زائر',

    'PAID' => 'مدفوع',
    'UNPAID' => 'غير مدفوع',
    'FAILED' => 'فشل',
    'EXPIRED' => 'منتهي الصلاحية',

    'WEBSITE' => 'الموقع الإلكتروني',
    'WHATSAPP' => 'واتساب',

    'CASH_ON_DELIVERY' => 'الدفع عند الاستلام',
    'MYFATOORAH' => 'ماي فاتورة',
    'HESABE' => 'حسابي',

    // HesabePaymentMethod: طريقة الدفع التي يُثبَّت عليها طلب حسابي. HOSTED تعني ألا يختار العميل
    // شيئاً هنا ويختار من صفحة حسابي نفسها.
    'HOSTED' => 'جميع طرق الدفع',
    'KNET' => 'كي نت',
    'VISA_MASTER' => 'فيزا / ماستركارد',
    'VISA_MASTER_CYBS' => 'فيزا / ماستركارد',
    'AMEX' => 'أمريكان إكسبريس',
    'AMEX_MPGS' => 'أمريكان إكسبريس',
    'APPLE_PAY' => 'أبل باي',
    'APPLE_PAY_CYBS' => 'أبل باي',
    'APPLE_PAY_KNET_DEBIT' => 'أبل باي (كي نت للخصم)',
    'APPLE_PAY_KNET_CREDIT' => 'أبل باي (كي نت للائتمان)',
    'APPLE_PAY_KNET_INTERNATIONAL' => 'أبل باي (كي نت الدولية)',
    'APPLE_PAY_AMEX_INTERNATIONAL' => 'أبل باي (أمريكان إكسبريس الدولية)',
    'GOOGLE_PAY' => 'جوجل باي',
    'DEEMA' => 'ديمة',
    'SAMSUNG_PAY' => 'سامسونج باي',

    'ORDER' => 'طلب',
    'STOCK' => 'المخزون',
    'RX' => 'وصفة طبية',
    // 'CUSTOMER' is already declared above for UserType, it carries the same label here.
    'PAYMENT' => 'دفع',
    'PROMO' => 'عرض ترويجي',
    'REVIEW' => 'تقييم',
    'LOYALTY' => 'الولاء',
    'CUSTOM' => 'مخصص',
    'WARNING' => 'تحذير',
    'ERROR' => 'خطأ',

    // Coupons. 'PERCENTAGE' and 'EXPIRED' are already declared above, they carry the same label here.
    'FIXED' => 'مبلغ ثابت',
    'FREE_SHIPPING' => 'شحن مجاني',

    'PRODUCT' => 'منتج',
    'CATEGORY' => 'تصنيف',
    'BRAND' => 'علامة تجارية',
    'TAG' => 'وسم',
    'KEYWORD' => 'كلمة مفتاحية',

    'CART' => 'السلة كاملة',
    'ITEMS' => 'عناصر محددة',
    'SHIPPING' => 'الشحن',

    'ACTIVE' => 'فعال',
    'IN_ACTIVE' => 'غير فعال',
    'REACH_THE_LIMIT' => 'تم الوصول إلى الحد الأقصى',
    'DRAFT' => 'مسودة',

    'EVERYONE' => 'الجميع',
    'SPECIFIC_USERS' => 'مستخدمون محددون',

    // Care Plan
    'PAUSED' => 'موقوفة',
    'SCHEDULED' => 'مجدولة',
    'AWAITING_PAYMENT' => 'بانتظار الدفع',
    'ORDERED' => 'تم الطلب',
    'SKIPPED' => 'متخطاة',
    'WEEKLY' => 'أسبوعي',
    'BIWEEKLY' => 'كل أسبوعين',
    'MONTHLY' => 'شهري',
    'CARE_PLAN' => 'خطة العناية',
    'SUNDAY' => 'الأحد',
    'MONDAY' => 'الإثنين',
    'TUESDAY' => 'الثلاثاء',
    'WEDNESDAY' => 'الأربعاء',
    'THURSDAY' => 'الخميس',
    'FRIDAY' => 'الجمعة',
    'SATURDAY' => 'السبت',
    'INSUFFICIENT_STOCK' => 'مخزون غير كافٍ',
    'PAYMENT_WINDOW_EXPIRED' => 'انتهت مهلة الدفع',
    'ADMIN_OVERRIDE' => 'تعديل من الأدمن',
    'PRODUCT_UNAVAILABLE' => 'المنتج غير متوفر',
    'CUSTOMER_CANCELLED' => 'ألغاه الزبون',
    'CUSTOMER_SKIPPED' => 'تخطاه الزبون',
    'AUTO_PAUSED_MISSED_PAYMENTS' => 'إيقاف تلقائي بسبب تفويت الدفع',
    'CREATED' => 'تم الإنشاء',
    'ITEM_ADDED' => 'تمت إضافة منتج',
    'ITEM_REMOVED' => 'تمت إزالة منتج',
    'FREQUENCY_CHANGED' => 'تم تغيير التكرار',
    'ADDRESS_CHANGED' => 'تم تغيير العنوان',
    'RESUMED' => 'تم الاستئناف',
    'CYCLE_ORDERED' => 'تم إنشاء طلب الدورة',
    'CYCLE_FAILED' => 'فشلت الدورة',
    'PAYMENT_REMINDER' => 'تذكير بالدفع',
    'AUTO_PAUSED' => 'إيقاف تلقائي',

    'REGISTRATION' => 'التسجيل',
    'MILESTONE' => 'إنجاز',
    'EARN' => 'كسب',
    'REDEEM' => 'استبدال',
    'ADJUST' => 'تعديل',
    'USED' => 'مستخدم',

    // Promotions. 'PERCENTAGE' is already declared above and carries the same label here.
    'BOGO' => 'اشترِ واحصل على هدية',

    'ABANDONED' => 'متروك',
    'CONVERTED' => 'تحول إلى طلب',

    'GENERAL' => 'عام',
    'CALL' => 'مكالمة',
    'COMPLAINT' => 'شكوى',
    'DELIVERY' => 'توصيل',

    // Parkour Syria
    'place' => 'مكان',
    'coach' => 'مدرب',
    'team' => 'فريق',
    'event' => 'فعالية',
    'workshop' => 'ورشة',
    'gathering' => 'تجمع',
    'pending' => 'قيد المراجعة',
    'accepted' => 'مقبول',
    'rejected' => 'مرفوض',
];
