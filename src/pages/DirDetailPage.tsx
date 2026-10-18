import { MapPin, MessageCircle, Map as MapIcon } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { useNav } from '@/components/nav';
import { directoryItems, dirCategoryLabels } from '@/data/demo';
import { photo, photoSet } from '@/lib/photo';

export function DirDetailPage() {
  const { navigate, id } = useNav();
  const item = directoryItems.find((d) => d.id === id) ?? directoryItems[0];
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.name} ${item.area} دمشق`)}`;

  return (
    <div>
      <Reveal as="section" className="section">
        <div className="container-x max-w-[720px]">
          <button onClick={() => navigate('directory')} className="back-link">
            → العودة للدليل
          </button>
          <div className="flex gap-2 mb-3">
            <span className="tag">{dirCategoryLabels[item.category]}</span>
            {item.verified && <span className="tag tag-verified">تم التحقق</span>}
          </div>
          <h1 className="text-[1.6rem] font-extrabold mb-2">{item.name}</h1>
          <div className="text-white/50 mb-4 flex items-center gap-1">
            <MapPin size={14} /> {item.area} · دمشق
          </div>
          <Reveal type="reveal-scale" className="overflow-hidden mb-6">
            <img
              src={photo(item.image, 1280)}
              srcSet={photoSet(item.image, [760, 1280])}
              sizes="(min-width: 760px) 712px, 100vw"
              alt={item.name}
              className="w-full max-h-[380px] object-cover"
            />
          </Reveal>
          <p className="mb-3">{item.description}</p>
          <p className="text-white/50 text-[0.9rem] mb-6">
            {item.verified ? 'تم التحقق — لا مبانٍ متضررة.' : 'لم يتم التحقق بعد. الإدراج ليس تزكية.'}
          </p>
          <div className="flex gap-2.5 flex-wrap">
            <a href={`https://wa.me/${item.whatsapp}`} target="_blank" rel="noreferrer" className="btn btn-dark">
              <MessageCircle size={16} /> واتساب
            </a>
            {item.category === 'place' && (
              <a href={mapsUrl} target="_blank" rel="noreferrer" className="btn btn-outline">
                <MapIcon size={16} /> خريطة Google
              </a>
            )}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
