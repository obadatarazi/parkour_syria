import {
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  FileText,
  ShoppingBag,
  Star,
  Tag,
  Users,
} from "lucide-react";

import type {
  AdminNotification,
  Category,
  CategoryPiePoint,
  Customer,
  InventoryItem,
  Order,
  OrdersWeekPoint,
  Prescription,
  Product,
  Promotion,
  RevenueDataPoint,
} from "@/shared/demo/types/admin-demo.types";

export const REVENUE_DATA: RevenueDataPoint[] = [
  { month: "Jan", monthAr: "يناير", revenue: 12400, target: 14000, orders: 145 },
  { month: "Feb", monthAr: "فبراير", revenue: 15800, target: 14000, orders: 187 },
  { month: "Mar", monthAr: "مارس", revenue: 13200, target: 15000, orders: 156 },
  { month: "Apr", monthAr: "أبريل", revenue: 18900, target: 16000, orders: 223 },
  { month: "May", monthAr: "مايو", revenue: 21500, target: 18000, orders: 254 },
  { month: "Jun", monthAr: "يونيو", revenue: 19800, target: 20000, orders: 234 },
  { month: "Jul", monthAr: "يوليو", revenue: 24200, target: 21000, orders: 287 },
];

export const ORDERS_WEEK: OrdersWeekPoint[] = [
  { day: "Mon", dayAr: "الاثنين", orders: 45, returns: 3 },
  { day: "Tue", dayAr: "الثلاثاء", orders: 67, returns: 5 },
  { day: "Wed", dayAr: "الأربعاء", orders: 52, returns: 2 },
  { day: "Thu", dayAr: "الخميس", orders: 83, returns: 7 },
  { day: "Fri", dayAr: "الجمعة", orders: 91, returns: 4 },
  { day: "Sat", dayAr: "السبت", orders: 71, returns: 6 },
  { day: "Sun", dayAr: "الأحد", orders: 38, returns: 1 },
];

export const CATEGORY_PIE: CategoryPiePoint[] = [
  { nameEn: "Pharmacy", nameAr: "الصيدلية", value: 38, color: "var(--brand)" },
  { nameEn: "Beauty", nameAr: "الجمال", value: 25, color: "var(--accent-brand)" },
  { nameEn: "Supplements", nameAr: "المكملات", value: 18, color: "var(--info)" },
  { nameEn: "Wellness", nameAr: "العافية", value: 11, color: "var(--chart-4)" },
  { nameEn: "Other", nameAr: "أخرى", value: 8, color: "var(--warning)" },
];

export const ORDERS: Order[] = [
  { id: "ARC-4872", customerEn: "Fatima Al-Rashidi", customerAr: "فاطمة الراشدي", email: "fatima@example.com", items: 3, total: 18.5, status: "delivered", date: "Jun 15, 2025", dateAr: "١٥ يونيو ٢٠٢٥", payment: "Visa", avatar: "F", categoryEn: "Pharmacy", categoryAr: "الصيدلية" },
  { id: "ARC-4651", customerEn: "Mohammed Al-Sabah", customerAr: "محمد الصباح", email: "m.sabah@kw.com", items: 2, total: 11.75, status: "shipped", date: "Jun 14, 2025", dateAr: "١٤ يونيو ٢٠٢٥", payment: "KNET", avatar: "M", categoryEn: "Beauty", categoryAr: "الجمال" },
  { id: "ARC-4320", customerEn: "Sara Hassan", customerAr: "سارة حسن", email: "sara.h@gmail.com", items: 5, total: 31.2, status: "processing", date: "Jun 14, 2025", dateAr: "١٤ يونيو ٢٠٢٥", payment: "Apple Pay", avatar: "S", categoryEn: "Supps", categoryAr: "المكملات" },
  { id: "ARC-3988", customerEn: "Ahmed Al-Mutawa", customerAr: "أحمد المطوع", email: "ahmed.m@kw.com", items: 1, total: 7.9, status: "pending", date: "Jun 13, 2025", dateAr: "١٣ يونيو ٢٠٢٥", payment: "Cash", avatar: "A", categoryEn: "Pharmacy", categoryAr: "الصيدلية" },
  { id: "ARC-3654", customerEn: "Lana Qabandi", customerAr: "لانا القبندي", email: "lana.q@kw.com", items: 4, total: 24.35, status: "cancelled", date: "Jun 12, 2025", dateAr: "١٢ يونيو ٢٠٢٥", payment: "Visa", avatar: "L", categoryEn: "Beauty", categoryAr: "الجمال" },
  { id: "ARC-3210", customerEn: "Noor Al-Ahmad", customerAr: "نور الأحمد", email: "noor.a@kw.com", items: 2, total: 14.7, status: "delivered", date: "Jun 11, 2025", dateAr: "١١ يونيو ٢٠٢٥", payment: "KNET", avatar: "N", categoryEn: "Wellness", categoryAr: "العافية" },
  { id: "ARC-2981", customerEn: "Khalid Al-Mansouri", customerAr: "خالد المنصوري", email: "k.mans@kw.com", items: 6, total: 42.5, status: "delivered", date: "Jun 10, 2025", dateAr: "١٠ يونيو ٢٠٢٥", payment: "Visa", avatar: "K", categoryEn: "Pharmacy", categoryAr: "الصيدلية" },
  { id: "ARC-2744", customerEn: "Maryam Al-Kindi", customerAr: "مريم الكندي", email: "maryam.k@kw.com", items: 3, total: 19.85, status: "shipped", date: "Jun 9, 2025", dateAr: "٩ يونيو ٢٠٢٥", payment: "Apple Pay", avatar: "M", categoryEn: "Beauty", categoryAr: "الجمال" },
  { id: "ARC-2488", customerEn: "Fatima Al-Rashidi", customerAr: "فاطمة الراشدي", email: "fatima@example.com", items: 1, total: 6.25, status: "delivered", date: "Jun 8, 2025", dateAr: "٨ يونيو ٢٠٢٥", payment: "KNET", avatar: "F", categoryEn: "Supps", categoryAr: "المكملات" },
  { id: "ARC-2200", customerEn: "Sara Hassan", customerAr: "سارة حسن", email: "sara.h@gmail.com", items: 2, total: 15.4, status: "processing", date: "Jun 7, 2025", dateAr: "٧ يونيو ٢٠٢٥", payment: "Visa", avatar: "S", categoryEn: "Pharmacy", categoryAr: "الصيدلية" },
  { id: "ARC-1980", customerEn: "Ahmed Al-Mutawa", customerAr: "أحمد المطوع", email: "ahmed.m@kw.com", items: 4, total: 28.9, status: "delivered", date: "Jun 6, 2025", dateAr: "٦ يونيو ٢٠٢٥", payment: "Cash", avatar: "A", categoryEn: "Wellness", categoryAr: "العافية" },
  { id: "ARC-1750", customerEn: "Lana Qabandi", customerAr: "لانا القبندي", email: "lana.q@kw.com", items: 2, total: 9.1, status: "cancelled", date: "Jun 5, 2025", dateAr: "٥ يونيو ٢٠٢٥", payment: "Visa", avatar: "L", categoryEn: "Beauty", categoryAr: "الجمال" },
];

export const PRODUCTS: Product[] = [
  { id: 1, nameEn: "Cetaphil Moisturizing Cream 250g", nameAr: "كريم سيتافيل المرطب ٢٥٠جم", brand: "Cetaphil", categoryEn: "Beauty", categoryAr: "الجمال", price: 3.85, stock: 45, sold: 312, status: "published", img: "https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=60&h=60&fit=crop&auto=format" },
  { id: 2, nameEn: "Omega-3 Fish Oil 1000mg / 90 Caps", nameAr: "أوميغا-٣ زيت السمك ٩٠ كبسولة", brand: "Solgar", categoryEn: "Supps", categoryAr: "المكملات", price: 6.25, stock: 38, sold: 198, status: "published", img: "https://images.unsplash.com/photo-1559087316-6b27308e53f6?w=60&h=60&fit=crop&auto=format" },
  { id: 3, nameEn: "La Roche-Posay SPF50+ Sunscreen", nameAr: "واقي شمس لاروش بوزيه ٥٠+", brand: "La Roche-Posay", categoryEn: "Beauty", categoryAr: "الجمال", price: 7.9, stock: 5, sold: 456, status: "published", img: "https://images.unsplash.com/photo-1622910076411-b126ff7e469b?w=60&h=60&fit=crop&auto=format" },
  { id: 4, nameEn: "Vitamin C 1000mg Effervescent (20)", nameAr: "فيتامين سي ١٠٠٠ملغ فوار (٢٠)", brand: "Redoxon", categoryEn: "Supps", categoryAr: "المكملات", price: 2.45, stock: 120, sold: 87, status: "published", img: "https://images.unsplash.com/photo-1624362772755-4d5843e67047?w=60&h=60&fit=crop&auto=format" },
  { id: 5, nameEn: "Biotin Hair & Nail Gummies 60ct", nameAr: "حلوى بيوتين للشعر والأظافر ٦٠", brand: "Nature's Bounty", categoryEn: "Supps", categoryAr: "المكملات", price: 4.75, stock: 28, sold: 221, status: "published", img: "https://images.unsplash.com/photo-1598528738936-c50861cc75a9?w=60&h=60&fit=crop&auto=format" },
  { id: 6, nameEn: "Panadol Extra 500mg (24 Tabs)", nameAr: "بنادول إكسترا ٥٠٠ملغ (٢٤ قرص)", brand: "Panadol", categoryEn: "Pharmacy", categoryAr: "الصيدلية", price: 1.35, stock: 88, sold: 1024, status: "published", img: "https://images.unsplash.com/photo-1732900293895-233f769299b3?w=60&h=60&fit=crop&auto=format" },
  { id: 7, nameEn: "Maybelline Fit Me Foundation SPF18", nameAr: "فاونديشن ميبيلين فيت مي", brand: "Maybelline", categoryEn: "Beauty", categoryAr: "الجمال", price: 3.2, stock: 62, sold: 342, status: "published", img: "https://images.unsplash.com/photo-1608979048467-6194dabc6a3d?w=60&h=60&fit=crop&auto=format" },
  { id: 8, nameEn: "Neutrogena Hydro Boost Water Gel", nameAr: "جل نيوتروجينا هيدرو بوست", brand: "Neutrogena", categoryEn: "Beauty", categoryAr: "الجمال", price: 5.5, stock: 3, sold: 177, status: "draft", img: "https://images.unsplash.com/photo-1748543668646-e81cda0890f3?w=60&h=60&fit=crop&auto=format" },
  { id: 9, nameEn: "Cosrx Snail Mucin 96% Essence 100ml", nameAr: "إيسنس كوسركس مخاط الحلزون ٩٦٪", brand: "COSRX", categoryEn: "Beauty", categoryAr: "الجمال", price: 8.75, stock: 2, sold: 534, status: "published", img: "https://images.unsplash.com/photo-1601049505392-eebe867c4329?w=60&h=60&fit=crop&auto=format" },
  { id: 10, nameEn: "Augmentin 625mg (10 Tabs) — Rx", nameAr: "أوجمنتين ٦٢٥ملغ (١٠) — وصفة", brand: "GSK", categoryEn: "Pharmacy", categoryAr: "الصيدلية", price: 2.85, stock: 15, sold: 156, status: "inactive", img: "https://images.unsplash.com/photo-1583088580067-16d1109aeacb?w=60&h=60&fit=crop&auto=format" },
];

export const CATEGORIES: Category[] = [
  { id: 1, nameEn: "Pharmacy", nameAr: "الصيدلية", products: 1240, icon: "💊", activeProducts: 1180, status: "active" },
  { id: 2, nameEn: "Beauty & Skincare", nameAr: "الجمال والعناية", products: 620, icon: "💄", activeProducts: 590, status: "active" },
  { id: 3, nameEn: "Vitamins & Supps", nameAr: "الفيتامينات والمكملات", products: 430, icon: "🌿", activeProducts: 410, status: "active" },
  { id: 4, nameEn: "Wellness", nameAr: "العافية", products: 280, icon: "❤️", activeProducts: 265, status: "active" },
  { id: 5, nameEn: "Personal Care", nameAr: "العناية الشخصية", products: 390, icon: "🧴", activeProducts: 375, status: "active" },
  { id: 6, nameEn: "Mother & Baby", nameAr: "الأم والطفل", products: 210, icon: "🍼", activeProducts: 200, status: "active" },
  { id: 7, nameEn: "Medical Devices", nameAr: "الأجهزة الطبية", products: 195, icon: "🩺", activeProducts: 180, status: "active" },
  { id: 8, nameEn: "Offers & Deals", nameAr: "العروض والتخفيضات", products: 340, icon: "🎁", activeProducts: 340, status: "active" },
];

export const CUSTOMERS: Customer[] = [
  { id: 1, nameEn: "Fatima Al-Rashidi", nameAr: "فاطمة الراشدي", email: "fatima@example.com", phone: "+965 9988 7766", tier: "Gold", points: 2450, orders: 28, spent: 284.5, joined: "Jan 10, 2024", joinedAr: "١٠ يناير ٢٠٢٤", lastOrder: "Jun 15", status: "active", avatar: "F" },
  { id: 2, nameEn: "Mohammed Al-Sabah", nameAr: "محمد الصباح", email: "m.sabah@example.com", phone: "+965 9977 8855", tier: "Silver", points: 980, orders: 14, spent: 142.75, joined: "Mar 15, 2024", joinedAr: "١٥ مارس ٢٠٢٤", lastOrder: "Jun 14", status: "active", avatar: "M" },
  { id: 3, nameEn: "Sara Hassan", nameAr: "سارة حسن", email: "sara.h@gmail.com", phone: "+965 9944 3322", tier: "Gold", points: 1870, orders: 21, spent: 198.1, joined: "Feb 20, 2024", joinedAr: "٢٠ فبراير ٢٠٢٤", lastOrder: "Jun 14", status: "active", avatar: "S" },
  { id: 4, nameEn: "Ahmed Al-Mutawa", nameAr: "أحمد المطوع", email: "ahmed.m@kw.com", phone: "+965 9933 1100", tier: "Bronze", points: 340, orders: 5, spent: 48.2, joined: "May 1, 2024", joinedAr: "١ مايو ٢٠٢٤", lastOrder: "Jun 13", status: "active", avatar: "A" },
  { id: 5, nameEn: "Lana Qabandi", nameAr: "لانا القبندي", email: "lana.q@kw.com", phone: "+965 9955 4433", tier: "Silver", points: 1200, orders: 17, spent: 165.4, joined: "Jan 28, 2024", joinedAr: "٢٨ يناير ٢٠٢٤", lastOrder: "Jun 12", status: "active", avatar: "L" },
  { id: 6, nameEn: "Noor Al-Ahmad", nameAr: "نور الأحمد", email: "noor.a@kw.com", phone: "+965 9966 5544", tier: "Bronze", points: 520, orders: 8, spent: 82.35, joined: "Apr 10, 2024", joinedAr: "١٠ أبريل ٢٠٢٤", lastOrder: "Jun 11", status: "active", avatar: "N" },
  { id: 7, nameEn: "Khalid Al-Mansouri", nameAr: "خالد المنصوري", email: "k.mans@kw.com", phone: "+965 9911 2233", tier: "Gold", points: 3100, orders: 35, spent: 342.8, joined: "Dec 5, 2023", joinedAr: "٥ ديسمبر ٢٠٢٣", lastOrder: "Jun 10", status: "active", avatar: "K" },
  { id: 8, nameEn: "Maryam Al-Kindi", nameAr: "مريم الكندي", email: "maryam.k@kw.com", phone: "+965 9922 3344", tier: "Silver", points: 760, orders: 11, spent: 98.65, joined: "Mar 3, 2024", joinedAr: "٣ مارس ٢٠٢٤", lastOrder: "Jun 9", status: "inactive", avatar: "M" },
];

export const PRESCRIPTIONS: Prescription[] = [
  { id: "RX-2025-441", customerEn: "Fatima Al-Rashidi", customerAr: "فاطمة الراشدي", productEn: "Augmentin 625mg", productAr: "أوجمنتين ٦٢٥ملغ", uploadDate: "Jun 15", status: "pending", noteEn: "Awaiting pharmacist review", noteAr: "بانتظار مراجعة الصيدلاني" },
  { id: "RX-2025-440", customerEn: "Mohammed Al-Sabah", customerAr: "محمد الصباح", productEn: "Concor 5mg", productAr: "كونكور ٥ملغ", uploadDate: "Jun 14", status: "approved", noteEn: "Verified by Dr. Al-Sayed", noteAr: "تم التحقق بواسطة د. السيد" },
  { id: "RX-2025-439", customerEn: "Sara Hassan", customerAr: "سارة حسن", productEn: "Augmentin 625mg", productAr: "أوجمنتين ٦٢٥ملغ", uploadDate: "Jun 13", status: "rejected", noteEn: "Prescription expired (> 3 months)", noteAr: "الوصفة منتهية (أكثر من ٣ أشهر)" },
  { id: "RX-2025-438", customerEn: "Ahmed Al-Mutawa", customerAr: "أحمد المطوع", productEn: "Metformin 500mg", productAr: "ميتفورمين ٥٠٠ملغ", uploadDate: "Jun 13", status: "pending", noteEn: "Awaiting pharmacist review", noteAr: "بانتظار مراجعة الصيدلاني" },
  { id: "RX-2025-437", customerEn: "Lana Qabandi", customerAr: "لانا القبندي", productEn: "Levothyroxine 50mcg", productAr: "ليفوثيروكسين ٥٠ مكجم", uploadDate: "Jun 12", status: "approved", noteEn: "Verified by Dr. Al-Rashidi", noteAr: "تم التحقق بواسطة د. الراشدي" },
  { id: "RX-2025-436", customerEn: "Khalid Al-Mansouri", customerAr: "خالد المنصوري", productEn: "Atorvastatin 20mg", productAr: "أتورفاستاتين ٢٠ملغ", uploadDate: "Jun 11", status: "approved", noteEn: "Valid 6-month prescription", noteAr: "وصفة صالحة ٦ أشهر" },
  { id: "RX-2025-435", customerEn: "Noor Al-Ahmad", customerAr: "نور الأحمد", productEn: "Amoxicillin 500mg", productAr: "أموكسيسيلين ٥٠٠ملغ", uploadDate: "Jun 10", status: "rejected", noteEn: "Image unclear, please re-upload", noteAr: "الصورة غير واضحة، يرجى الرفع من جديد" },
  { id: "RX-2025-434", customerEn: "Maryam Al-Kindi", customerAr: "مريم الكندي", productEn: "Omeprazole 20mg", productAr: "أوميبرازول ٢٠ملغ", uploadDate: "Jun 9", status: "pending", noteEn: "Awaiting pharmacist review", noteAr: "بانتظار مراجعة الصيدلاني" },
  { id: "RX-2025-433", customerEn: "Sara Hassan", customerAr: "سارة حسن", productEn: "Amlodipine 5mg", productAr: "أملوديبين ٥ملغ", uploadDate: "Jun 8", status: "approved", noteEn: "Verified — monthly repeat allowed", noteAr: "تم التحقق — تجديد شهري مسموح" },
  { id: "RX-2025-432", customerEn: "Fatima Al-Rashidi", customerAr: "فاطمة الراشدي", productEn: "Concor 5mg", productAr: "كونكور ٥ملغ", uploadDate: "Jun 7", status: "approved", noteEn: "Verified by Dr. Al-Sayed", noteAr: "تم التحقق بواسطة د. السيد" },
];

export const INVENTORY: InventoryItem[] = [
  { id: 1, nameEn: "Cetaphil Cream 250g", nameAr: "كريم سيتافيل ٢٥٠جم", brand: "Cetaphil", stock: 45, reorder: 20, supplierEn: "Gulf Medical Dist.", supplierAr: "موزع خليج الطبي", locationEn: "Shelf A-12", locationAr: "رف أ-١٢", lastRestocked: "Jun 1", img: "https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=50&h=50&fit=crop&auto=format" },
  { id: 2, nameEn: "Omega-3 / 90 Caps", nameAr: "أوميغا-٣ / ٩٠ كبسولة", brand: "Solgar", stock: 38, reorder: 25, supplierEn: "Health Depot KW", supplierAr: "مستودع الصحة KW", locationEn: "Shelf B-3", locationAr: "رف ب-٣", lastRestocked: "May 28", img: "https://images.unsplash.com/photo-1559087316-6b27308e53f6?w=50&h=50&fit=crop&auto=format" },
  { id: 3, nameEn: "La Roche-Posay SPF50+", nameAr: "لاروش بوزيه SPF50+", brand: "La Roche-Posay", stock: 5, reorder: 15, supplierEn: "Prestige Beauty", supplierAr: "بريستيج بيوتي", locationEn: "Shelf C-7", locationAr: "رف ج-٧", lastRestocked: "May 20", img: "https://images.unsplash.com/photo-1622910076411-b126ff7e469b?w=50&h=50&fit=crop&auto=format" },
  { id: 4, nameEn: "Vitamin C 1000mg (20)", nameAr: "فيتامين سي ١٠٠٠ملغ", brand: "Redoxon", stock: 120, reorder: 50, supplierEn: "Pharma Direct", supplierAr: "فارما دايركت", locationEn: "Shelf D-1", locationAr: "رف د-١", lastRestocked: "Jun 5", img: "https://images.unsplash.com/photo-1624362772755-4d5843e67047?w=50&h=50&fit=crop&auto=format" },
  { id: 5, nameEn: "Biotin Gummies 60ct", nameAr: "حلوى بيوتين ٦٠", brand: "Nature's Bounty", stock: 28, reorder: 30, supplierEn: "Health Depot KW", supplierAr: "مستودع الصحة KW", locationEn: "Shelf B-8", locationAr: "رف ب-٨", lastRestocked: "May 15", img: "https://images.unsplash.com/photo-1598528738936-c50861cc75a9?w=50&h=50&fit=crop&auto=format" },
  { id: 6, nameEn: "Panadol Extra 500mg", nameAr: "بنادول إكسترا ٥٠٠ملغ", brand: "Panadol", stock: 88, reorder: 40, supplierEn: "Gulf Medical Dist.", supplierAr: "موزع خليج الطبي", locationEn: "Shelf A-1", locationAr: "رف أ-١", lastRestocked: "Jun 8", img: "https://images.unsplash.com/photo-1732900293895-233f769299b3?w=50&h=50&fit=crop&auto=format" },
  { id: 7, nameEn: "Maybelline Fit Me Fdn", nameAr: "فاونديشن ميبيلين", brand: "Maybelline", stock: 62, reorder: 30, supplierEn: "Prestige Beauty", supplierAr: "بريستيج بيوتي", locationEn: "Shelf C-2", locationAr: "رف ج-٢", lastRestocked: "Jun 3", img: "https://images.unsplash.com/photo-1608979048467-6194dabc6a3d?w=50&h=50&fit=crop&auto=format" },
  { id: 8, nameEn: "Neutrogena Hydro Boost", nameAr: "جل نيوتروجينا هيدرو", brand: "Neutrogena", stock: 3, reorder: 20, supplierEn: "Health Depot KW", supplierAr: "مستودع الصحة KW", locationEn: "Shelf C-9", locationAr: "رف ج-٩", lastRestocked: "May 10", img: "https://images.unsplash.com/photo-1748543668646-e81cda0890f3?w=50&h=50&fit=crop&auto=format" },
  { id: 9, nameEn: "Cosrx Snail Mucin 100ml", nameAr: "إيسنس كوسركس ١٠٠مل", brand: "COSRX", stock: 2, reorder: 15, supplierEn: "K-Beauty Import", supplierAr: "كيوتي إمبورت", locationEn: "Shelf C-14", locationAr: "رف ج-١٤", lastRestocked: "Apr 25", img: "https://images.unsplash.com/photo-1601049505392-eebe867c4329?w=50&h=50&fit=crop&auto=format" },
  { id: 10, nameEn: "Augmentin 625mg (Rx)", nameAr: "أوجمنتين ٦٢٥ملغ (Rx)", brand: "GSK", stock: 15, reorder: 30, supplierEn: "Pharma Direct", supplierAr: "فارما دايركت", locationEn: "Shelf A-5", locationAr: "رف أ-٥", lastRestocked: "Jun 2", img: "https://images.unsplash.com/photo-1583088580067-16d1109aeacb?w=50&h=50&fit=crop&auto=format" },
];

export const PROMOTIONS: Promotion[] = [
  { id: 1, nameEn: "Summer Skincare Sale", nameAr: "تخفيضات العناية الصيفية", code: "SUMMER20", type: "percent", discount: 20, usage: 284, limit: 500, minOrder: 10, expires: "Aug 31, 2025", expiresAr: "٣١ أغسطس ٢٠٢٥", status: "active", color: "from-rose-400 to-pink-500" },
  { id: 2, nameEn: "Buy 1 Get 1 Free — Vitamins", nameAr: "اشترِ ١ واحصل على ١ مجانًا", code: "BOGO-VITS", type: "bogo", discount: 50, usage: 147, limit: 200, minOrder: 0, expires: "Jul 31, 2025", expiresAr: "٣١ يوليو ٢٠٢٥", status: "active", color: "from-emerald-400 to-teal-500" },
  { id: 3, nameEn: "New Member Welcome", nameAr: "خصم ترحيب الأعضاء الجدد", code: "NEWMEMBER10", type: "percent", discount: 10, usage: 512, limit: null, minOrder: 5, expires: "Dec 31, 2025", expiresAr: "٣١ ديسمبر ٢٠٢٥", status: "active", color: "from-blue-400 to-indigo-500" },
  { id: 4, nameEn: "Newsletter Subscriber Offer", nameAr: "عرض مشتركي النشرة البريدية", code: "NEWSUB15", type: "percent", discount: 15, usage: 89, limit: 300, minOrder: 8, expires: "Sep 30, 2025", expiresAr: "٣٠ سبتمبر ٢٠٢٥", status: "active", color: "from-violet-400 to-purple-500" },
  { id: 5, nameEn: "Gold Tier Exclusive", nameAr: "حصري لأعضاء المستوى الذهبي", code: "GOLD25", type: "percent", discount: 25, usage: 63, limit: 100, minOrder: 15, expires: "Jun 30, 2025", expiresAr: "٣٠ يونيو ٢٠٢٥", status: "expired", color: "from-amber-400 to-orange-500" },
  { id: 6, nameEn: "Free Delivery Weekend", nameAr: "توصيل مجاني نهاية الأسبوع", code: "FREEDEL", type: "free_del", discount: 100, usage: 431, limit: null, minOrder: 0, expires: "Jul 5, 2025", expiresAr: "٥ يوليو ٢٠٢٥", status: "paused", color: "from-teal-400 to-cyan-500" },
];

export const ADMIN_NOTIFICATIONS: AdminNotification[] = [
  { id: 1, type: "order", Icon: ShoppingBag, titleEn: "New order #ARC-4872", titleAr: "طلب جديد #ARC-4872", msgEn: "Fatima Al-Rashidi placed an order for 18.50 KWD", msgAr: "قدّمت فاطمة الراشدي طلبًا بقيمة 18.50 KWD", timeEn: "2m ago", timeAr: "منذ دقيقتين", read: false, color: "text-blue-600 bg-blue-50" },
  { id: 2, type: "stock", Icon: AlertTriangle, titleEn: "Low stock: Cosrx Snail Mucin", titleAr: "مخزون منخفض: كوسركس مخاط الحلزون", msgEn: "Only 2 units remaining — reorder required", msgAr: "٢ وحدات فقط متبقية — مطلوب إعادة الطلب", timeEn: "15m ago", timeAr: "منذ ١٥ دقيقة", read: false, color: "text-amber-600 bg-amber-50" },
  { id: 3, type: "rx", Icon: FileText, titleEn: "Prescription RX-2025-441 pending", titleAr: "وصفة RX-2025-441 بانتظار المراجعة", msgEn: "Requires pharmacist approval before dispatch", msgAr: "تتطلب موافقة الصيدلاني قبل الشحن", timeEn: "1h ago", timeAr: "منذ ساعة", read: false, color: "text-violet-600 bg-violet-50" },
  { id: 4, type: "customer", Icon: Users, titleEn: "New customer registration", titleAr: "تسجيل عميل جديد", msgEn: "Noor Al-Ahmad created an account", msgAr: "أنشأت نور الأحمد حسابًا جديدًا", timeEn: "3h ago", timeAr: "منذ ٣ ساعات", read: true, color: "text-emerald-600 bg-emerald-50" },
  { id: 5, type: "order", Icon: CheckCircle2, titleEn: "Order ARC-4651 delivered", titleAr: "تم تسليم الطلب ARC-4651", msgEn: "Mohammed Al-Sabah order delivered successfully", msgAr: "تم تسليم طلب محمد الصباح بنجاح", timeEn: "5h ago", timeAr: "منذ ٥ ساعات", read: true, color: "text-emerald-600 bg-emerald-50" },
  { id: 6, type: "payment", Icon: DollarSign, titleEn: "Payment received — 31.20 KWD", titleAr: "تم استلام الدفع — 31.20 KWD", msgEn: "Sara Hassan paid via Apple Pay for order ARC-4320", msgAr: "دفعت سارة حسن عبر Apple Pay للطلب ARC-4320", timeEn: "6h ago", timeAr: "منذ ٦ ساعات", read: true, color: "text-teal-600 bg-teal-50" },
  { id: 7, type: "promo", Icon: Tag, titleEn: "Promo GOLD25 nearly exhausted", titleAr: "الكود GOLD25 على وشك النفاد", msgEn: "63/100 redemptions used — only 37 remaining", msgAr: "تم استخدام ٦٣/١٠٠ — ٣٧ فقط متبقية", timeEn: "1d ago", timeAr: "منذ يوم", read: true, color: "text-rose-600 bg-rose-50" },
  { id: 8, type: "review", Icon: Star, titleEn: "New product review submitted", titleAr: "تقييم منتج جديد", msgEn: "Khalid Al-Mansouri left 5★ on Panadol Extra", msgAr: "منح خالد المنصوري ٥ نجوم لبنادول إكسترا", timeEn: "1d ago", timeAr: "منذ يوم", read: true, color: "text-amber-600 bg-amber-50" },
];

export const lowStockItems: InventoryItem[] = INVENTORY.filter((item) => item.stock <= item.reorder);

export const topProducts: Product[] = [...PRODUCTS]
  .sort((a, b) => b.sold * b.price - a.sold * a.price)
  .slice(0, 5);
