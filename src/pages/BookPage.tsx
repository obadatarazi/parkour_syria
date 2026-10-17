import { BookOpen } from 'lucide-react';
import { Reveal } from '@/components/Reveal';

export function BookPage() {
  return (
    <div>
      <div className="page-hero">
        <div className="container-x">
          <h1>الكتاب</h1>
          <p>دليل المبتدئ الآمن</p>
        </div>
      </div>
      <Reveal as="section" className="section">
        <div className="container-x max-w-[640px]">
          <Reveal type="reveal-jump" className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-8 items-center bg-[#111] text-white p-10 sm:px-7 mb-8 text-center sm:text-right">
            <div className="w-[140px] h-[190px] bg-[#333] flex items-center justify-center mx-auto">
              <BookOpen size={40} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold mb-3">كتاب الباركور · دليل المبتدئ الآمن</h2>
              <p className="opacity-80 text-[0.95rem]">دليل عملي بالعربية.</p>
            </div>
          </Reveal>
          <div className="prose">
            <h2>لمن؟</h2>
            <ul>
              <li>المبتدئون</li>
              <li>الأهالي</li>
              <li>الممارسون</li>
            </ul>
            <p className="text-[#888] text-[0.9rem]">PDF. الطلب عبر واتساب فقط.</p>
            <a
              href="https://wa.me/963999000000?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%B7%D9%84%D8%A8%20%D9%83%D8%AA%D8%A7%D8%A8%20%D8%A7%D9%84%D8%A8%D8%A7%D8%B1%D9%83%D9%88%D8%B1"
              target="_blank"
              rel="noreferrer"
              className="btn btn-accent btn-lg btn-block mt-5"
            >
              اطلب الكتاب عبر واتساب
            </a>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
