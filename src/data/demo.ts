export type DirCategory = 'place' | 'coach' | 'team';

export interface DirectoryItem {
  id: string;
  category: DirCategory;
  name: string;
  area: string;
  description: string;
  verified: boolean;
  whatsapp: string;
  image: string;
}

export const directoryItems: DirectoryItem[] = [
  {
    id: 'tishreen-park',
    category: 'place',
    name: 'حديقة تشرين · منطقة التدريب',
    area: 'المزة',
    description: 'مساحة مفتوحة مناسبة للمبتدئين، أرضية عشبية ومنصات منخفضة.',
    verified: true,
    whatsapp: '963999000111',
    image: 'https://images.pexels.com/photos/6008952/pexels-photo-6008952.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'ahmad-halabi',
    category: 'coach',
    name: 'أحمد الحلبي',
    area: 'أبو رمانة',
    description: 'مدرب بخبرة 8 سنوات. دروس فردية وجماعية. يركز على الأمان والتقنية.',
    verified: true,
    whatsapp: '963999000222',
    image: 'https://images.pexels.com/photos/6008894/pexels-photo-6008894.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'damascus-freerun',
    category: 'team',
    name: 'فريق دمشق فري رانينغ',
    area: 'كفرسوسة',
    description: 'يجتمع كل جمعة وسبت. يستقبل مبتدئين ويُنظّم ورشات شهرية.',
    verified: false,
    whatsapp: '963999000333',
    image: 'https://images.pexels.com/photos/6008975/pexels-photo-6008975.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'sara-dimashqi',
    category: 'coach',
    name: 'سارة الدمشقي',
    area: 'المزة',
    description: 'مدربة متخصصة بالمبتدئين والنساء.',
    verified: false,
    whatsapp: '963999000444',
    image: 'https://images.pexels.com/photos/9645058/pexels-photo-9645058.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'shami-parkour',
    category: 'team',
    name: 'مجموعة الباركور الشامية',
    area: 'المزة',
    description: 'تدريبات أسبوعية ورحلات.',
    verified: true,
    whatsapp: '963999000555',
    image: 'https://images.pexels.com/photos/6009162/pexels-photo-6009162.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'jalaa-park',
    category: 'place',
    name: 'حديقة الجلاء',
    area: 'أبو رمانة',
    description: 'مساحة مناسبة لتمارين التوازن والقفز الدقيق. أرضية مستوية.',
    verified: false,
    whatsapp: '963999000666',
    image: 'https://images.pexels.com/photos/6008986/pexels-photo-6008986.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
];

export interface ParkourEvent {
  id: string;
  type: string;
  date: string;
  title: string;
  location: string;
  whatsapp: string;
  image: string;
}

export const events: ParkourEvent[] = [
  {
    id: 'safety-workshop',
    type: 'ورشة',
    date: 'السبت 18 أكتوبر · 10:00 ص',
    title: 'ورشة أمان للمبتدئين',
    location: 'حديقة تشرين · المزة',
    whatsapp: '963999000111',
    image: 'https://images.pexels.com/photos/6008917/pexels-photo-6008917.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'friday-gathering',
    type: 'تجمع',
    date: 'الجمعة 17 أكتوبر · 4:00 م',
    title: 'تجمع يوم الجمعة · جسر الرئيس',
    location: 'تجمع أسبوعي مفتوح. تدريب حر وتبادل خبرات.',
    whatsapp: '963999000333',
    image: 'https://images.pexels.com/photos/6009290/pexels-photo-6009290.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'balance-workshop',
    type: 'ورشة',
    date: 'الأحد 26 أكتوبر · 9:00 ص',
    title: 'ورشة توازن وقفز دقيق',
    location: 'حديقة الجلاء · أبو رمانة',
    whatsapp: '963999000222',
    image: 'https://images.pexels.com/photos/6009176/pexels-photo-6009176.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
];

export interface BlogPost {
  id: string;
  category: string;
  date: string;
  title: string;
  excerpt: string;
  image: string;
  body?: { heading: string; text: string }[];
}

export const blogPosts: BlogPost[] = [
  {
    id: 'safety-rules',
    category: 'أمان',
    date: '5 أكتوبر 2026',
    title: '5 قواعد أمان لا غنى عنها للمبتدئ',
    excerpt: 'قبل أن تقفز أو تتدحرج — القواعد الأساسية لكل تدريب.',
    image: 'https://images.pexels.com/photos/33938537/pexels-photo-33938537.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    body: [
      { heading: '1. تدرّج دائماً', text: 'ابدأ من الأرض ثم ارتفاعات منخفضة جداً.' },
      { heading: '2. افحص المكان', text: 'تأكد أن السطح جاف ومستقر.' },
      { heading: '3. لا تتدرّب وحدك في البداية', text: 'وجود شخص آخر يساعد في الطوارئ.' },
      { heading: '4. استمع لجسمك', text: 'الألم إشارة — توقف فوراً.' },
      { heading: '5. تجنّب الأماكن الخطرة', text: 'لا مبانٍ متضررة. موقعنا لا يُدرجها.' },
    ],
  },
  {
    id: 'home-strength',
    category: 'تدريب',
    date: '1 أكتوبر 2026',
    title: 'كيف تبني قوّة أساسية للباركور في المنزل',
    excerpt: 'تمارين بلا معدات لتطوير القوة والمرونة.',
    image: 'https://images.pexels.com/photos/6008881/pexels-photo-6008881.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'damascus-places',
    category: 'دمشق',
    date: '28 سبتمبر 2026',
    title: 'أفضل 3 أماكن آمنة للتدريب في دمشق',
    excerpt: 'استعراض لأماكن مناسبة للمبتدئين في العاصمة.',
    image: 'https://images.pexels.com/photos/6008979/pexels-photo-6008979.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
];

export interface GalleryImage {
  url: string;
  caption: string;
}

export const galleryImages: GalleryImage[] = [
  { url: 'https://images.pexels.com/photos/6008908/pexels-photo-6008908.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', caption: 'قفزة في المدينة' },
  { url: 'https://images.pexels.com/photos/6009002/pexels-photo-6009002.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', caption: 'تدريب حر' },
  { url: 'https://images.pexels.com/photos/32189329/pexels-photo-32189329.png?auto=compress&cs=tinysrgb&h=650&w=940', caption: 'تجاوز عقبة' },
  { url: 'https://images.pexels.com/photos/6009260/pexels-photo-6009260.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', caption: 'قفز من جدار' },
  { url: 'https://images.pexels.com/photos/6008994/pexels-photo-6008994.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', caption: 'تدريب في الشارع' },
  { url: 'https://images.pexels.com/photos/6009001/pexels-photo-6009001.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', caption: 'حركة دقيقة' },
  { url: 'https://images.pexels.com/photos/6009275/pexels-photo-6009275.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', caption: 'قفز من سور' },
  { url: 'https://images.pexels.com/photos/6009011/pexels-photo-6009011.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', caption: 'باركور حضري' },
];

export interface Lesson {
  num: number;
  title: string;
  desc: string;
  body?: { heading: string; text: string; list?: string[] }[];
}

export const lessons: Lesson[] = [
  {
    num: 1,
    title: 'الأمان أولاً',
    desc: 'قواعد أساسية · أماكن آمنة',
    body: [
      {
        heading: 'لماذا الأمان أهم؟',
        text: 'الباركور ليس عن القفز من أسطح عالية. الهدف هو التحكّم بالجسم. كل إصابة تُبعدك عن التدريب.',
      },
      {
        heading: 'قواعد الأمان',
        text: '',
        list: [
          'تدرّج دائماً: ابدأ من الأرض ثم ارتفاعات منخفضة جداً.',
          'الهبوط أولاً: تعلّم الهبوط الهادئ قبل أي قفز.',
          'افحص المكان: سطح جاف ومستقر.',
          'لا تتدرّب وحدك في البداية.',
          'استمع لجسمك: الألم إشارة — توقف.',
          'تجنّب الأماكن الخطرة: لا مبانٍ متضررة.',
        ],
      },
    ],
  },
  { num: 2, title: 'الهبوط الصحيح', desc: 'تقنية الهبوط من ارتفاعات منخفضة' },
  { num: 3, title: 'الدحرجة (Roll)', desc: 'امتصاص الصدمة بعد القفز' },
  { num: 4, title: 'التوازن الأساسي', desc: 'المشي على حواف منخفضة' },
  { num: 5, title: 'القفز البسيط', desc: 'القفز من نقطة إلى نقطة بدقة' },
  { num: 6, title: 'التسلق الآمن', desc: 'صعود ونزول الجدران المنخفضة' },
  { num: 7, title: 'الجمع بين الحركات', desc: 'ربط الأساسيات في سلسلة' },
];

export interface Slide {
  cat: string;
  title: string;
  text: string;
  image: string;
  primary: { label: string; page: PageId };
  secondary: { label: string; page: PageId };
}

export type PageId =
  | 'home'
  | 'what'
  | 'path'
  | 'lesson'
  | 'directory'
  | 'dir-detail'
  | 'events'
  | 'suggest'
  | 'blog'
  | 'article'
  | 'book'
  | 'about'
  | 'contact'
  | 'disclaimer';

export const slides: Slide[] = [
  {
    cat: 'تدريب · للجميع',
    title: 'تدرّبوا معاً — ابدأوا من الأمان في دمشق',
    text: 'مسار واضح للمبتدئين، أماكن تدريب، ومدربون موثوقون. باركور سوريا مرتبط بـ Parkour.com.',
    image: 'https://images.pexels.com/photos/6008908/pexels-photo-6008908.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    primary: { label: 'مسار المبتدئ', page: 'path' },
    secondary: { label: 'الدليل', page: 'directory' },
  },
  {
    cat: 'دليل · دمشق',
    title: 'أماكن ومدربون وفرق — اكتشف مجتمعك',
    text: 'دليل محلي لأماكن التدريب والمدربين والفرق في أحياء دمشق، مع شارات تحقق وواتساب مباشر.',
    image: 'https://images.pexels.com/photos/9645058/pexels-photo-9645058.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    primary: { label: 'تصفّح الدليل', page: 'directory' },
    secondary: { label: 'اقترح إضافة', page: 'suggest' },
  },
  {
    cat: 'فعاليات · ورشات',
    title: 'ورشات وتجمّعات قادمة — انضم للتدريب',
    text: 'فعاليات أمان للمبتدئين، جلسات تقنية، وتجمّعات مفتوحة. سجّل عبر واتساب.',
    image: 'https://images.pexels.com/photos/6009260/pexels-photo-6009260.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    primary: { label: 'الفعاليات', page: 'events' },
    secondary: { label: 'المدونة', page: 'blog' },
  },
];

export const navLinks: { label: string; page: PageId }[] = [
  { label: 'الرئيسية', page: 'home' },
  { label: 'ما هو الباركور', page: 'what' },
  { label: 'مسار المبتدئ', page: 'path' },
  { label: 'الدليل', page: 'directory' },
  { label: 'الفعاليات', page: 'events' },
  { label: 'المدونة', page: 'blog' },
  { label: 'الكتاب', page: 'book' },
];

export const areas = ['المزة', 'أبو رمانة', 'كفرسوسة', 'أخرى'];

export const dirCategoryLabels: Record<DirCategory, string> = {
  place: 'مكان',
  coach: 'مدرب',
  team: 'فريق',
};
