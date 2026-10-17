import { useState, type FormEvent } from 'react';
import { Reveal } from '@/components/Reveal';
import { areas } from '@/data/demo';

export function SuggestPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div>
      <div className="page-hero">
        <div className="container-x">
          <h1>اقترح إضافة</h1>
          <p>نراجع كل اقتراح قبل النشر</p>
        </div>
      </div>
      <Reveal as="section" className="section">
        <div className="container-x max-w-[520px]">
          {submitted ? (
            <div className="safety" style={{ background: '#e8f5e9', borderRight: '4px solid #2e7d32' }}>
              <strong style={{ color: '#2e7d32' }}>تم الإرسال</strong>
              شكراً لك! سنراجع اقتراحك قبل النشر.
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block font-semibold text-[0.85rem] mb-1.5">نوع الاقتراح *</label>
                <select
                  required
                  className="w-full p-3 border border-[#e5e5e5] text-[0.9rem] outline-none focus:border-[#999] bg-white"
                >
                  <option value="">اختر...</option>
                  <option>مكان</option>
                  <option>مدرب</option>
                  <option>فريق</option>
                  <option>فعالية</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block font-semibold text-[0.85rem] mb-1.5">الاسم *</label>
                <input
                  type="text"
                  required
                  placeholder="الاسم"
                  className="w-full p-3 border border-[#e5e5e5] text-[0.9rem] outline-none focus:border-[#999]"
                />
              </div>
              <div className="mb-4">
                <label className="block font-semibold text-[0.85rem] mb-1.5">الحي *</label>
                <select
                  required
                  className="w-full p-3 border border-[#e5e5e5] text-[0.9rem] outline-none focus:border-[#999] bg-white"
                >
                  <option value="">اختر...</option>
                  {areas.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block font-semibold text-[0.85rem] mb-1.5">الوصف *</label>
                <textarea
                  required
                  placeholder="وصف مختصر..."
                  className="w-full p-3 border border-[#e5e5e5] text-[0.9rem] outline-none focus:border-[#999] min-h-[100px] resize-y"
                />
              </div>
              <div className="mb-4">
                <label className="block font-semibold text-[0.85rem] mb-1.5">رابط التواصل</label>
                <input
                  type="text"
                  placeholder="واتساب أو فيسبوك"
                  className="w-full p-3 border border-[#e5e5e5] text-[0.9rem] outline-none focus:border-[#999]"
                />
              </div>
              <div className="flex gap-2.5 items-start text-[0.875rem] text-[#555] mb-5">
                <input type="checkbox" id="sc" required className="mt-1 w-4 h-4 accent-[#111]" />
                <label htmlFor="sc">أقرّ بأن المكان آمن ولا يشمل مباني متضررة.</label>
              </div>
              <button type="submit" className="btn btn-dark btn-lg btn-block">
                إرسال الاقتراح
              </button>
            </form>
          )}
        </div>
      </Reveal>
    </div>
  );
}
