import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { useNav } from '@/components/nav';

const faqs = [
  { q: 'ما العمر المناسب؟', a: 'من 12–14 مع إشراف، والبالغون في أي عمر.' },
  { q: 'هل أحتاج معدات؟', a: 'حذاء بقبضة جيدة وملابس مريحة. لا حاجة لمعدات أخرى.' },
  { q: 'أين أتدرّب في دمشق؟', a: 'راجع دليل الأماكن.' },
  {
    q: 'هل مرتبط بـ Parkour.com؟',
    a: 'نعم. باركور سوريا مرتبط بـ Parkour.com ويعمل ضمن رؤيته لدعم مجتمع الباركور محلياً في سوريا.',
  },
];

export function WhatPage() {
  const { navigate } = useNav();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div>
      <div className="page-hero">
        <div className="container-x">
          <h1>ما هو الباركور؟</h1>
          <p>تعريف بسيط وواضح</p>
        </div>
      </div>
      <Reveal as="section" className="section">
        <div className="container-x prose">
          <div className="safety">
            <strong>تنبيه أمان</strong>الباركور رياضة تتطلب تدريباً تدريجياً. لا تحاول حركات متقدمة قبل
            إتقان الأساسيات.
          </div>
          <p>
            الباركور (Parkour) هو فن وفلسفة التنقّل بكفاءة من نقطة إلى أخرى باستخدام الجسم فقط. الهدف
            ليس العرض، بل التغلّب على العقبات بأمان وذكاء.
          </p>
          <h2>من أين جاء الباركور؟</h2>
          <p>
            وُلد في فرنسا في أواخر الثمانينيات على يد <strong>دافيد بيل (David Belle)</strong>، مستلهماً
            والده رايمون بيل. الفلسفة: «كن قوياً لتكون نافعاً».
          </p>
          <p>في سوريا نركّز على نسخة آمنة ومناسبة للواقع المحلي — خاصة في دمشق.</p>
          <h2>لماذا الباركور؟</h2>
          <ul>
            <li>يبني القوة والمرونة والتوازن</li>
            <li>يُحسّن الثقة واتخاذ القرار</li>
            <li>منخفضة التكلفة</li>
            <li>مجتمع ودّي يشجّع التدرّج</li>
          </ul>
          <h2>هل هو خطر؟</h2>
          <p>مثل أي رياضة. معظم الإصابات من التسرّع. مع الأمان والتدرّج يمكن ممارسته بأمان.</p>
          <h2>أسئلة شائعة</h2>
          {faqs.map((f, i) => (
            <div key={i} className="border-b border-[#e5e5e5]">
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="py-4 font-semibold text-[0.95rem] w-full flex justify-between items-center gap-3"
              >
                {f.q}{' '}
                <ChevronDown
                  size={16}
                  className={openIdx === i ? 'rotate-180 transition-transform' : 'transition-transform'}
                />
              </button>
              {openIdx === i && (
                <p className="pb-4 text-[0.9rem] text-[#555]">
                  {f.a}{' '}
                  {i === 2 && (
                    <button onClick={() => navigate('directory')} className="underline">
                      دليل الأماكن
                    </button>
                  )}
                </p>
              )}
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
