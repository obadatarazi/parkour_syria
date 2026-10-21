-- =============================================================================
-- Parkour Syria — website content
-- =============================================================================
-- The content the website shows today, taken from the SPA (src/locales/ar.json + en.json,
-- src/data/demo.ts, src/config/site.ts, src/pages/HomePage.tsx), in Arabic and English.
--
-- Run it on a migrated database (php artisan migrate --seed creates the schema, the accounts and
-- the roles, but no content):
--
--   mysql -uroot parkour_syria < database/sql/parkour_content.sql
--   php artisan cache:clear        # the home payload, settings and sitemap are cached
--
-- It REPLACES the content tables below (areas, pages, sliders, lessons, directory, events, blog,
-- gallery) and upserts the site settings by key. Accounts, roles, permissions, suggestions and the
-- shop tables are never touched. Running it again resets the content to this file.
--
-- Images point at the Pexels photos the demo uses; replace them from the dashboard.
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
START TRANSACTION;

-- Reset the content tables
DELETE FROM `gallery_image_translations`;
DELETE FROM `gallery_images`;
DELETE FROM `blog_post_translations`;
DELETE FROM `blog_posts`;
DELETE FROM `blog_category_translations`;
DELETE FROM `blog_categories`;
DELETE FROM `event_translations`;
DELETE FROM `events`;
DELETE FROM `directory_entry_translations`;
DELETE FROM `directory_entries`;
DELETE FROM `lesson_translations`;
DELETE FROM `lessons`;
DELETE FROM `slider_translations`;
DELETE FROM `sliders`;
DELETE FROM `page_translations`;
DELETE FROM `pages`;
DELETE FROM `area_translations`;
DELETE FROM `areas`;

-- Areas (neighbourhoods of the directory and events)

INSERT INTO `areas` (`id`, `slug`, `sort_order`, `publish`, `created_at`, `updated_at`) VALUES
  (1, 'mazzeh', 1, 1, NOW(), NOW()),
  (2, 'abu-rummaneh', 2, 1, NOW(), NOW()),
  (3, 'kafr-sousa', 3, 1, NOW(), NOW()),
  (4, 'other', 4, 1, NOW(), NOW());

INSERT INTO `area_translations` (`area_id`, `locale`, `name`) VALUES
  (1, 'ar', 'المزة'),
  (1, 'en', 'Mazzeh'),
  (2, 'ar', 'أبو رمانة'),
  (2, 'en', 'Abu Rummaneh'),
  (3, 'ar', 'كفرسوسة'),
  (3, 'en', 'Kafr Sousa'),
  (4, 'ar', 'أخرى'),
  (4, 'en', 'Other');

-- Pages (one row per fixed page of the website, found by key)

INSERT INTO `pages` (`id`, `key`, `publish`, `image_file_url`, `created_at`, `updated_at`) VALUES
  (1, 'home', 1, 'https://images.pexels.com/photos/6008979/pexels-photo-6008979.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', NOW(), NOW()),
  (2, 'what', 1, NULL, NOW(), NOW()),
  (3, 'path', 1, NULL, NOW(), NOW()),
  (4, 'directory', 1, NULL, NOW(), NOW()),
  (5, 'events', 1, NULL, NOW(), NOW()),
  (6, 'blog', 1, NULL, NOW(), NOW()),
  (7, 'suggest', 1, NULL, NOW(), NOW()),
  (8, 'book', 1, 'https://images.pexels.com/photos/6009011/pexels-photo-6009011.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', NOW(), NOW()),
  (9, 'about', 1, NULL, NOW(), NOW()),
  (10, 'contact', 1, NULL, NOW(), NOW()),
  (11, 'disclaimer', 1, NULL, NOW(), NOW());

INSERT INTO `page_translations` (`page_id`, `locale`, `title`, `body`, `seo_title`, `seo_description`) VALUES
  (1, 'ar', 'تعلّم الباركور بأمان في دمشق', '<p>منصة سورية مرتبطة بـ Parkour.com — دليل أماكن ومدربين، دروس للمبتدئين، فعاليات، ومقالات.</p><blockquote>كن قوياً لتكون نافعاً</blockquote>', 'باركور سوريا | تعلّم الباركور بأمان في دمشق', 'موقع باركور سوريا — تعلّم الباركور بأمان، دليل أماكن ومدربين وفرق في دمشق، فعاليات، مقالات، وكتاب الباركور.'),
  (1, 'en', 'Learn parkour safely in Damascus', '<p>A Syrian platform affiliated with Parkour.com — a directory of places and coaches, beginner lessons, events, and articles.</p><blockquote>Be strong to be useful</blockquote>', 'Parkour Syria | Learn parkour safely in Damascus', 'Parkour Syria — learn parkour safely, a directory of places, coaches, and teams in Damascus, events, articles, and the parkour book.'),
  (2, 'ar', 'ما هو الباركور؟', '<p>الباركور (Parkour) هو فن وفلسفة التنقّل بكفاءة من نقطة إلى أخرى باستخدام الجسم فقط. الهدف ليس العرض، بل التغلّب على العقبات بأمان وذكاء.</p><h3>تنبيه أمان</h3><p>الباركور رياضة تتطلب تدريباً تدريجياً. لا تحاول حركات متقدمة قبل إتقان الأساسيات.</p><h3>من أين جاء الباركور؟</h3><p>وُلد في فرنسا في أواخر الثمانينيات على يد دافيد بيل (David Belle)، مستلهماً والده رايمون بيل. الفلسفة: «كن قوياً لتكون نافعاً».</p><p>في سوريا نركّز على نسخة آمنة ومناسبة للواقع المحلي — خاصة في دمشق.</p><h3>لماذا الباركور؟</h3><ul><li>يبني القوة والمرونة والتوازن</li><li>يُحسّن الثقة واتخاذ القرار</li><li>منخفضة التكلفة</li><li>مجتمع ودّي يشجّع التدرّج</li></ul><h3>هل هو خطر؟</h3><p>مثل أي رياضة. معظم الإصابات من التسرّع. مع الأمان والتدرّج يمكن ممارسته بأمان.</p><h3>أسئلة شائعة</h3><h4>ما العمر المناسب؟</h4><p>من 12–14 مع إشراف، والبالغون في أي عمر.</p><h4>هل أحتاج معدات؟</h4><p>حذاء بقبضة جيدة وملابس مريحة. لا حاجة لمعدات أخرى.</p><h4>أين أتدرّب في دمشق؟</h4><p>راجع دليل الأماكن.</p><h4>هل مرتبط بـ Parkour.com؟</h4><p>نعم. باركور سوريا مرتبط بـ Parkour.com ويعمل ضمن رؤيته لدعم مجتمع الباركور محلياً في سوريا.</p>', 'ما هو الباركور', 'تعريف بسيط وواضح'),
  (2, 'en', 'What is parkour?', '<p>Parkour is an art and philosophy of moving efficiently from point to point using only the body. The goal is not showmanship, but overcoming obstacles safely and intelligently.</p><h3>Safety notice</h3><p>Parkour is a sport that requires gradual training. Do not attempt advanced moves before mastering the basics.</p><h3>Where did parkour come from?</h3><p>It was born in France in the late 1980s through David Belle, inspired by his father Raymond Belle. The philosophy: “Be strong to be useful.”</p><p>In Syria we focus on a safe version suited to local reality — especially in Damascus.</p><h3>Why parkour?</h3><ul><li>Builds strength, flexibility, and balance</li><li>Improves confidence and decision-making</li><li>Low cost</li><li>A friendly community that encourages gradual progress</li></ul><h3>Is it dangerous?</h3><p>Like any sport. Most injuries come from rushing. With safety and gradual progress it can be practiced safely.</p><h3>Common questions</h3><h4>What age is appropriate?</h4><p>From 12–14 with supervision; adults at any age.</p><h4>Do I need equipment?</h4><p>Shoes with good grip and comfortable clothes. No other gear needed.</p><h4>Where do I train in Damascus?</h4><p>See the places directory.</p><h4>Are you affiliated with Parkour.com?</h4><p>Yes. Parkour Syria is affiliated with Parkour.com and works within its vision to support the local parkour community in Syria.</p>', 'What is parkour', 'A simple, clear definition'),
  (3, 'ar', 'مسار المبتدئ', '<p>ابدأ من الأمان، ثم الأساسيات</p><h3>الأمان أولاً</h3><p>الدرس الأول إلزامي. لا تنتقل للتالي قبل فهم القواعد.</p>', 'مسار المبتدئ', 'ابدأ من الأمان، ثم الأساسيات'),
  (3, 'en', 'Beginner path', '<p>Start with safety, then the basics</p><h3>Safety first</h3><p>Lesson one is mandatory. Do not move on before you understand the rules.</p>', 'Beginner path', 'Start with safety, then the basics'),
  (4, 'ar', 'الدليل · دمشق', '<p>أماكن · مدربون · فرق</p><h3>ملاحظة</h3><p>الإدراج ليس تزكية. لا نُدرج مباني متضررة.</p>', 'الدليل', 'أماكن · مدربون · فرق'),
  (4, 'en', 'Directory · Damascus', '<p>Places · Coaches · Teams</p><h3>Note</h3><p>A listing is not an endorsement. We do not list damaged buildings.</p>', 'Directory', 'Places · Coaches · Teams'),
  (5, 'ar', 'الفعاليات القادمة', '<p>ورشات وتجمعات — المنتهية تختفي تلقائياً</p>', 'الفعاليات', 'ورشات وتجمعات — المنتهية تختفي تلقائياً'),
  (5, 'en', 'Upcoming events', '<p>Workshops and gatherings — past events drop off automatically</p>', 'Events', 'Workshops and gatherings — past events drop off automatically'),
  (6, 'ar', 'المدونة', '<p>مقالات عن الباركور والأمان</p>', 'المدونة', 'مقالات عن الباركور والأمان'),
  (6, 'en', 'Blog', '<p>Articles on parkour and safety</p>', 'Blog', 'Articles on parkour and safety'),
  (7, 'ar', 'اقترح إضافة', '<p>نراجع كل اقتراح قبل النشر</p><p>أقرّ بأن المكان آمن ولا يشمل مباني متضررة.</p>', 'اقترح إضافة', 'نراجع كل اقتراح قبل النشر'),
  (7, 'en', 'Suggest an entry', '<p>We review every suggestion before publishing</p><p>I confirm the place is safe and does not include damaged buildings.</p>', 'Suggest an entry', 'We review every suggestion before publishing'),
  (8, 'ar', 'الكتاب', '<h3>كتاب الباركور · دليل المبتدئ الآمن</h3><p>دليل عملي بالعربية.</p><h3>لمن؟</h3><ul><li>المبتدئون</li><li>الأهالي</li><li>الممارسون</li></ul><p>PDF. الطلب عبر واتساب فقط.</p>', 'الكتاب', 'دليل المبتدئ الآمن'),
  (8, 'en', 'The book', '<h3>The parkour book · Safe beginner guide</h3><p>A practical guide in Arabic.</p><h3>For whom?</h3><ul><li>Beginners</li><li>Parents</li><li>Practitioners</li></ul><p>PDF. Orders via WhatsApp only.</p>', 'The book', 'Safe beginner guide'),
  (9, 'ar', 'من نحن', '<p>باركور سوريا منصة سورية مرتبطة بـ Parkour.com تساعد المهتمين بالباركور على التعلّم بأمان وإيجاد أماكن التدريب والمدربين في دمشق.</p><p>مرتبط بـ Parkour.com — محتوى محلي لدمشق وسوريا.</p>', 'من نحن', 'مرتبط بـ Parkour.com — محتوى محلي لدمشق وسوريا.'),
  (9, 'en', 'About us', '<p>Parkour Syria is a Syrian platform affiliated with Parkour.com that helps parkour enthusiasts learn safely and find training spots and coaches in Damascus.</p><p>Affiliated with Parkour.com — local content for Damascus and Syria.</p>', 'About us', 'Affiliated with Parkour.com — local content for Damascus and Syria.'),
  (10, 'ar', 'تواصل معنا', NULL, 'تواصل معنا', NULL),
  (10, 'en', 'Contact us', NULL, 'Contact', NULL),
  (11, 'ar', 'إخلاء المسؤولية والأمان', '<h3>إخلاء المسؤولية</h3><p>المحتوى لأغراض تثقيفية فقط. لسنا مسؤولين عن أي إصابة. الممارس يتحمّل المسؤولية الكاملة.</p><h3>سياسة الأمان</h3><ul><li>لا نُدرج مباني متضررة أو مناطق خطرة</li><li>كل اقتراح يُراجع قبل النشر</li><li>الإدراج ليس تزكية</li></ul><h3>الارتباط بـ Parkour.com</h3><p>باركور سوريا مرتبط بـ Parkour.com ويعمل كمحتوى محلي للمجتمع السوري.</p>', 'إخلاء المسؤولية', 'المحتوى لأغراض تثقيفية فقط. لسنا مسؤولين عن أي إصابة. الممارس يتحمّل المسؤولية الكاملة.'),
  (11, 'en', 'Disclaimer and safety', '<h3>Disclaimer</h3><p>Content is for educational purposes only. We are not responsible for any injury. The practitioner bears full responsibility.</p><h3>Safety policy</h3><ul><li>We do not list damaged buildings or dangerous areas</li><li>Every suggestion is reviewed before publishing</li><li>A listing is not an endorsement</li></ul><h3>Affiliation with Parkour.com</h3><p>Parkour Syria is affiliated with Parkour.com and serves as local content for the Syrian community.</p>', 'Disclaimer', 'Content is for educational purposes only. We are not responsible for any injury. The practitioner bears full responsibility.');

-- Home hero slider

INSERT INTO `sliders` (`id`, `sort_order`, `publish`, `image_file_url`, `primary_page`, `secondary_page`, `created_at`, `updated_at`) VALUES
  (1, 1, 1, 'https://images.pexels.com/photos/6008908/pexels-photo-6008908.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'path', 'directory', NOW(), NOW()),
  (2, 2, 1, 'https://images.pexels.com/photos/9645058/pexels-photo-9645058.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'directory', 'suggest', NOW(), NOW()),
  (3, 3, 1, 'https://images.pexels.com/photos/6009260/pexels-photo-6009260.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'events', 'blog', NOW(), NOW());

INSERT INTO `slider_translations` (`slider_id`, `locale`, `badge`, `title`, `description`, `primary_button_text`, `secondary_button_text`) VALUES
  (1, 'ar', 'تدريب · للجميع', 'تدرّبوا معاً — ابدأوا من الأمان في دمشق', 'مسار واضح للمبتدئين، أماكن تدريب، ومدربون موثوقون. باركور سوريا مرتبط بـ Parkour.com.', 'مسار المبتدئ', 'الدليل'),
  (1, 'en', 'Training · For everyone', 'Train together — start with safety in Damascus', 'A clear beginner path, training spots, and trusted coaches. Parkour Syria is affiliated with Parkour.com.', 'Beginner path', 'Directory'),
  (2, 'ar', 'دليل · دمشق', 'أماكن ومدربون وفرق — اكتشف مجتمعك', 'دليل محلي لأماكن التدريب والمدربين والفرق في أحياء دمشق، مع شارات تحقق وواتساب مباشر.', 'تصفّح الدليل', 'اقترح إضافة'),
  (2, 'en', 'Directory · Damascus', 'Places, coaches, and teams — find your community', 'A local directory of training spots, coaches, and teams across Damascus neighborhoods, with verification badges and direct WhatsApp.', 'Browse directory', 'Suggest an entry'),
  (3, 'ar', 'فعاليات · ورشات', 'ورشات وتجمّعات قادمة — انضم للتدريب', 'فعاليات أمان للمبتدئين، جلسات تقنية، وتجمّعات مفتوحة. سجّل عبر واتساب.', 'الفعاليات', 'المدونة'),
  (3, 'en', 'Events · Workshops', 'Upcoming workshops and gatherings — join the training', 'Beginner safety events, technique sessions, and open gatherings. Register via WhatsApp.', 'Events', 'Blog');

-- Beginner path lessons (slug = lesson number, as /path/:num on the website)

INSERT INTO `lessons` (`id`, `slug`, `sort_order`, `youtube_url`, `image_file_url`, `publish`, `created_at`, `updated_at`) VALUES
  (1, '1', 1, NULL, NULL, 1, NOW(), NOW()),
  (2, '2', 2, NULL, NULL, 1, NOW(), NOW()),
  (3, '3', 3, NULL, NULL, 1, NOW(), NOW()),
  (4, '4', 4, NULL, NULL, 1, NOW(), NOW()),
  (5, '5', 5, NULL, NULL, 1, NOW(), NOW()),
  (6, '6', 6, NULL, NULL, 1, NOW(), NOW()),
  (7, '7', 7, NULL, NULL, 1, NOW(), NOW());

INSERT INTO `lesson_translations` (`lesson_id`, `locale`, `title`, `summary`, `body`, `safety_note`) VALUES
  (1, 'ar', 'الأمان أولاً', 'قواعد أساسية · أماكن آمنة', '<h3>لماذا الأمان أهم؟</h3><p>الباركور ليس عن القفز من أسطح عالية. الهدف هو التحكّم بالجسم. كل إصابة تُبعدك عن التدريب.</p><h3>قواعد الأمان</h3><ul><li>تدرّج دائماً: ابدأ من الأرض ثم ارتفاعات منخفضة جداً.</li><li>الهبوط أولاً: تعلّم الهبوط الهادئ قبل أي قفز.</li><li>افحص المكان: سطح جاف ومستقر.</li><li>لا تتدرّب وحدك في البداية.</li><li>استمع لجسمك: الألم إشارة — توقف.</li><li>تجنّب الأماكن الخطرة: لا مبانٍ متضررة.</li></ul>', 'درس نظري وعملي خفيف. لا تحاول حركات متقدمة.'),
  (1, 'en', 'Safety first', 'Basic rules · Safe places', '<h3>Why safety matters most</h3><p>Parkour is not about jumping from high roofs. The goal is body control. Every injury keeps you from training.</p><h3>Safety rules</h3><ul><li>Always progress gradually: start on the ground, then very low heights.</li><li>Landing first: learn a quiet landing before any jump.</li><li>Check the spot: dry, stable surface.</li><li>Don&#x27;t train alone at first.</li><li>Listen to your body: pain is a signal — stop.</li><li>Avoid dangerous places: no damaged buildings.</li></ul>', 'A light theory and practice lesson. Do not attempt advanced moves.'),
  (2, 'ar', 'الهبوط الصحيح', 'تقنية الهبوط من ارتفاعات منخفضة', NULL, 'درس نظري وعملي خفيف. لا تحاول حركات متقدمة.'),
  (2, 'en', 'Proper landing', 'Landing technique from low heights', NULL, 'A light theory and practice lesson. Do not attempt advanced moves.'),
  (3, 'ar', 'الدحرجة (Roll)', 'امتصاص الصدمة بعد القفز', NULL, 'درس نظري وعملي خفيف. لا تحاول حركات متقدمة.'),
  (3, 'en', 'The roll', 'Absorbing impact after a jump', NULL, 'A light theory and practice lesson. Do not attempt advanced moves.'),
  (4, 'ar', 'التوازن الأساسي', 'المشي على حواف منخفضة', NULL, 'درس نظري وعملي خفيف. لا تحاول حركات متقدمة.'),
  (4, 'en', 'Basic balance', 'Walking on low edges', NULL, 'A light theory and practice lesson. Do not attempt advanced moves.'),
  (5, 'ar', 'القفز البسيط', 'القفز من نقطة إلى نقطة بدقة', NULL, 'درس نظري وعملي خفيف. لا تحاول حركات متقدمة.'),
  (5, 'en', 'Simple jumps', 'Jumping point to point with precision', NULL, 'A light theory and practice lesson. Do not attempt advanced moves.'),
  (6, 'ar', 'التسلق الآمن', 'صعود ونزول الجدران المنخفضة', NULL, 'درس نظري وعملي خفيف. لا تحاول حركات متقدمة.'),
  (6, 'en', 'Safe climbing', 'Ascending and descending low walls', NULL, 'A light theory and practice lesson. Do not attempt advanced moves.'),
  (7, 'ar', 'الجمع بين الحركات', 'ربط الأساسيات في سلسلة', NULL, 'درس نظري وعملي خفيف. لا تحاول حركات متقدمة.'),
  (7, 'en', 'Combining moves', 'Linking basics into a sequence', NULL, 'A light theory and practice lesson. Do not attempt advanced moves.');

-- Directory: places, coaches and teams

INSERT INTO `directory_entries` (`id`, `slug`, `type`, `area_id`, `whatsapp`, `facebook_url`, `instagram_url`, `map_url`, `image_file_url`, `verified`, `publish`, `sort_order`, `created_at`, `updated_at`) VALUES
  (1, 'tishreen-park', 'place', 1, '963999000111', NULL, NULL, NULL, 'https://images.pexels.com/photos/6008952/pexels-photo-6008952.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1, 1, 1, NOW(), NOW()),
  (2, 'ahmad-halabi', 'coach', 2, '963999000222', NULL, NULL, NULL, 'https://images.pexels.com/photos/6008894/pexels-photo-6008894.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1, 1, 2, NOW(), NOW()),
  (3, 'damascus-freerun', 'team', 3, '963999000333', NULL, NULL, NULL, 'https://images.pexels.com/photos/6008975/pexels-photo-6008975.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0, 1, 3, NOW(), NOW()),
  (4, 'sara-dimashqi', 'coach', 1, '963999000444', NULL, NULL, NULL, 'https://images.pexels.com/photos/9645058/pexels-photo-9645058.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0, 1, 4, NOW(), NOW()),
  (5, 'shami-parkour', 'team', 1, '963999000555', NULL, NULL, NULL, 'https://images.pexels.com/photos/6009162/pexels-photo-6009162.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1, 1, 5, NOW(), NOW()),
  (6, 'jalaa-park', 'place', 2, '963999000666', NULL, NULL, NULL, 'https://images.pexels.com/photos/6008986/pexels-photo-6008986.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0, 1, 6, NOW(), NOW());

INSERT INTO `directory_entry_translations` (`directory_entry_id`, `locale`, `name`, `description`) VALUES
  (1, 'ar', 'حديقة تشرين · منطقة التدريب', 'مساحة مفتوحة مناسبة للمبتدئين، أرضية عشبية ومنصات منخفضة.'),
  (1, 'en', 'Tishreen Park · Training area', 'An open space suitable for beginners, with grass and low platforms.'),
  (2, 'ar', 'أحمد الحلبي', 'مدرب بخبرة 8 سنوات. دروس فردية وجماعية. يركز على الأمان والتقنية.'),
  (2, 'en', 'Ahmad Al-Halabi', 'Coach with 8 years of experience. Individual and group lessons. Focuses on safety and technique.'),
  (3, 'ar', 'فريق دمشق فري رانينغ', 'يجتمع كل جمعة وسبت. يستقبل مبتدئين ويُنظّم ورشات شهرية.'),
  (3, 'en', 'Damascus Freerunning Team', 'Meets every Friday and Saturday. Welcomes beginners and runs monthly workshops.'),
  (4, 'ar', 'سارة الدمشقي', 'مدربة متخصصة بالمبتدئين والنساء.'),
  (4, 'en', 'Sara Al-Dimashqi', 'Coach specializing in beginners and women.'),
  (5, 'ar', 'مجموعة الباركور الشامية', 'تدريبات أسبوعية ورحلات.'),
  (5, 'en', 'Shami Parkour Group', 'Weekly training and trips.'),
  (6, 'ar', 'حديقة الجلاء', 'مساحة مناسبة لتمارين التوازن والقفز الدقيق. أرضية مستوية.'),
  (6, 'en', 'Al-Jalaa Park', 'A space suited to balance and precision jumps. Level ground.');

-- Events (Damascus time). The website hides each one once it has started.

INSERT INTO `events` (`id`, `slug`, `type`, `starts_at`, `area_id`, `contact`, `image_file_url`, `publish`, `created_at`, `updated_at`) VALUES
  (1, 'safety-workshop', 'workshop', '2026-10-24 10:00:00', 1, '963999000111', 'https://images.pexels.com/photos/6008917/pexels-photo-6008917.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1, NOW(), NOW()),
  (2, 'friday-gathering', 'gathering', '2026-10-23 16:00:00', 1, '963999000333', 'https://images.pexels.com/photos/6009290/pexels-photo-6009290.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1, NOW(), NOW()),
  (3, 'balance-workshop', 'workshop', '2026-11-01 09:00:00', 2, '963999000222', 'https://images.pexels.com/photos/6009176/pexels-photo-6009176.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1, NOW(), NOW());

INSERT INTO `event_translations` (`event_id`, `locale`, `title`, `location_label`, `description`) VALUES
  (1, 'ar', 'ورشة أمان للمبتدئين', 'حديقة تشرين · المزة', NULL),
  (1, 'en', 'Beginner safety workshop', 'Tishreen Park · Mazzeh', NULL),
  (2, 'ar', 'تجمع يوم الجمعة · جسر الرئيس', 'تجمع أسبوعي مفتوح. تدريب حر وتبادل خبرات.', NULL),
  (2, 'en', 'Friday gathering · Presidential Bridge', 'Open weekly gathering. Free training and experience sharing.', NULL),
  (3, 'ar', 'ورشة توازن وقفز دقيق', 'حديقة الجلاء · أبو رمانة', NULL),
  (3, 'en', 'Balance and precision jump workshop', 'Al-Jalaa Park · Abu Rummaneh', NULL);

-- Blog

INSERT INTO `blog_categories` (`id`, `slug`, `sort_order`, `publish`, `created_at`, `updated_at`) VALUES
  (1, 'safety', 1, 1, NOW(), NOW()),
  (2, 'training', 2, 1, NOW(), NOW()),
  (3, 'damascus', 3, 1, NOW(), NOW());

INSERT INTO `blog_category_translations` (`blog_category_id`, `locale`, `title`) VALUES
  (1, 'ar', 'أمان'),
  (1, 'en', 'Safety'),
  (2, 'ar', 'تدريب'),
  (2, 'en', 'Training'),
  (3, 'ar', 'دمشق'),
  (3, 'en', 'Damascus');

INSERT INTO `blog_posts` (`id`, `slug`, `blog_category_id`, `image_file_url`, `publish`, `published_at`, `created_at`, `updated_at`) VALUES
  (1, 'safety-rules', 1, 'https://images.pexels.com/photos/33938537/pexels-photo-33938537.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1, '2026-10-05 09:00:00', NOW(), NOW()),
  (2, 'home-strength', 2, 'https://images.pexels.com/photos/6008881/pexels-photo-6008881.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1, '2026-10-01 09:00:00', NOW(), NOW()),
  (3, 'damascus-places', 3, 'https://images.pexels.com/photos/6008979/pexels-photo-6008979.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1, '2026-09-28 09:00:00', NOW(), NOW());

INSERT INTO `blog_post_translations` (`blog_post_id`, `locale`, `title`, `excerpt`, `body`, `seo_title`, `seo_description`) VALUES
  (1, 'ar', '5 قواعد أمان لا غنى عنها للمبتدئ', 'قبل أن تقفز أو تتدحرج — القواعد الأساسية لكل تدريب.', '<h3>1. تدرّج دائماً</h3><p>ابدأ من الأرض ثم ارتفاعات منخفضة جداً.</p><h3>2. افحص المكان</h3><p>تأكد أن السطح جاف ومستقر.</p><h3>3. لا تتدرّب وحدك في البداية</h3><p>وجود شخص آخر يساعد في الطوارئ.</p><h3>4. استمع لجسمك</h3><p>الألم إشارة — توقف فوراً.</p><h3>5. تجنّب الأماكن الخطرة</h3><p>لا مبانٍ متضررة. موقعنا لا يُدرجها.</p>', '5 قواعد أمان لا غنى عنها للمبتدئ', 'قبل أن تقفز أو تتدحرج — القواعد الأساسية لكل تدريب.'),
  (1, 'en', '5 essential safety rules for beginners', 'Before you jump or roll — the basics for every session.', '<h3>1. Always progress gradually</h3><p>Start on the ground, then very low heights.</p><h3>2. Check the spot</h3><p>Make sure the surface is dry and stable.</p><h3>3. Don&#x27;t train alone at first</h3><p>Having someone else helps in an emergency.</p><h3>4. Listen to your body</h3><p>Pain is a signal — stop immediately.</p><h3>5. Avoid dangerous places</h3><p>No damaged buildings. We do not list them.</p>', '5 essential safety rules for beginners', 'Before you jump or roll — the basics for every session.'),
  (2, 'ar', 'كيف تبني قوّة أساسية للباركور في المنزل', 'تمارين بلا معدات لتطوير القوة والمرونة.', NULL, 'كيف تبني قوّة أساسية للباركور في المنزل', 'تمارين بلا معدات لتطوير القوة والمرونة.'),
  (2, 'en', 'How to build parkour base strength at home', 'No-equipment exercises for strength and mobility.', NULL, 'How to build parkour base strength at home', 'No-equipment exercises for strength and mobility.'),
  (3, 'ar', 'أفضل 3 أماكن آمنة للتدريب في دمشق', 'استعراض لأماكن مناسبة للمبتدئين في العاصمة.', NULL, 'أفضل 3 أماكن آمنة للتدريب في دمشق', 'استعراض لأماكن مناسبة للمبتدئين في العاصمة.'),
  (3, 'en', 'Top 3 safe training spots in Damascus', 'A look at beginner-friendly places in the capital.', NULL, 'Top 3 safe training spots in Damascus', 'A look at beginner-friendly places in the capital.');

-- Home gallery

INSERT INTO `gallery_images` (`id`, `sort_order`, `image_file_url`, `publish`, `created_at`, `updated_at`) VALUES
  (1, 1, 'https://images.pexels.com/photos/6008908/pexels-photo-6008908.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1, NOW(), NOW()),
  (2, 2, 'https://images.pexels.com/photos/6009002/pexels-photo-6009002.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1, NOW(), NOW()),
  (3, 3, 'https://images.pexels.com/photos/32189329/pexels-photo-32189329.png?auto=compress&cs=tinysrgb&h=650&w=940', 1, NOW(), NOW()),
  (4, 4, 'https://images.pexels.com/photos/6009260/pexels-photo-6009260.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1, NOW(), NOW()),
  (5, 5, 'https://images.pexels.com/photos/6008994/pexels-photo-6008994.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1, NOW(), NOW()),
  (6, 6, 'https://images.pexels.com/photos/6009001/pexels-photo-6009001.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1, NOW(), NOW()),
  (7, 7, 'https://images.pexels.com/photos/6009275/pexels-photo-6009275.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1, NOW(), NOW()),
  (8, 8, 'https://images.pexels.com/photos/6009011/pexels-photo-6009011.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1, NOW(), NOW());

INSERT INTO `gallery_image_translations` (`gallery_image_id`, `locale`, `caption`) VALUES
  (1, 'ar', 'قفزة في المدينة'),
  (1, 'en', 'City jump'),
  (2, 'ar', 'تدريب حر'),
  (2, 'en', 'Free training'),
  (3, 'ar', 'تجاوز عقبة'),
  (3, 'en', 'Obstacle transit'),
  (4, 'ar', 'قفز من جدار'),
  (4, 'en', 'Wall jump'),
  (5, 'ar', 'تدريب في الشارع'),
  (5, 'en', 'Street training'),
  (6, 'ar', 'حركة دقيقة'),
  (6, 'en', 'Precision move'),
  (7, 'ar', 'قفز من سور'),
  (7, 'en', 'Fence jump'),
  (8, 'ar', 'باركور حضري'),
  (8, 'en', 'Urban parkour');

-- Site settings. Upserted by key, so the rows keep their ids.

INSERT INTO `multi_type_settings` (`setting_key`, `value`, `type`, `description`, `created_at`, `updated_at`) VALUES
  ('site_name', 'باركور سوريا', 'TEXT', 'Site name shown in the header and titles', NOW(), NOW()),
  ('default_locale', 'ar', 'TEXT', 'Language of the website (ar while FEATURE_PUBLIC_EN_LOCALE is off)', NOW(), NOW()),
  ('whatsapp_number', '963999000000', 'PHONE_NUMBER', 'Main WhatsApp number, international format without +', NOW(), NOW()),
  ('whatsapp_display', '+963 999 000 000', 'TEXT', 'The WhatsApp number as printed on the contact page', NOW(), NOW()),
  ('whatsapp_book_message', 'مرحبا، أريد طلب كتاب الباركور', 'TEXT', 'Prefilled WhatsApp message of the "order the book" button', NOW(), NOW()),
  ('facebook_url', '', 'LINK', 'Facebook page. Empty: not set yet (the website shows #)', NOW(), NOW()),
  ('facebook_handle', 'ParkourSyria', 'TEXT', 'Facebook name as printed on the contact page', NOW(), NOW()),
  ('instagram_url', '', 'LINK', 'Instagram account. Empty: not set yet (the website shows #)', NOW(), NOW()),
  ('instagram_handle', '@parkoursyria', 'TEXT', 'Instagram handle as printed on the contact page', NOW(), NOW()),
  ('email', 'info@parkoursyria.com', 'EMAIL', 'Public contact email', NOW(), NOW()),
  ('safety_notice_short', 'الباركور رياضة تتطلب تدريباً تدريجياً. لا تحاول حركات متقدمة قبل إتقان الأساسيات.', 'TEXT', 'Short safety notice shown across the site', NOW(), NOW()),
  ('safety_notice_directory', 'الإدراج ليس تزكية. لا نُدرج مباني متضررة.', 'TEXT', 'Note at the top of the directory', NOW(), NOW())
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), `type` = VALUES(`type`), `description` = VALUES(`description`), `updated_at` = NOW();

COMMIT;
SET FOREIGN_KEY_CHECKS = 1;
