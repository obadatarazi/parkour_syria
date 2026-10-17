import { MapPin, MessageCircle, Facebook } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { useNav } from '@/components/nav';

export function DirDetailPage() {
  const { navigate } = useNav();

  return (
    <div>
      <Reveal as="section" className="section">
        <div className="container-x max-w-[720px]">
          <button onClick={() => navigate('directory')} className="back-link">
            → العودة للدليل
          </button>
          <div className="flex gap-2 mb-3">
            <span className="tag">مكان</span>
            <span className="tag tag-verified">تم التحقق</span>
          </div>
          <h1 className="text-[1.6rem] font-extrabold mb-2">حديقة تشرين · منطقة التدريب</h1>
          <div className="text-[#888] mb-4 flex items-center gap-1">
            <MapPin size={14} /> المزة · دمشق
          </div>
          <p className="mb-3">
            مساحة مفتوحة مناسبة للمبتدئين والمتوسطين. أرضية عشبية ومنصات منخفضة.
          </p>
          <p className="text-[#888] text-[0.9rem] mb-6">
            يُنصح بالتدريب صباحاً. تم التحقق — لا مبانٍ متضررة.
          </p>
          <div className="flex gap-2.5 flex-wrap">
            <a href="https://wa.me/963999000111" target="_blank" rel="noreferrer" className="btn btn-dark">
              <MessageCircle size={16} /> واتساب
            </a>
            <button className="btn btn-outline">
              <Facebook size={16} /> فيسبوك
            </button>
            <button className="btn btn-outline">خريطة Google</button>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
