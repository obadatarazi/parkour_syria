import { MapPin, MessageCircle } from 'lucide-react';
import { useNav } from '@/components/nav';
import { dirCategoryLabels, type DirectoryItem } from '@/data/demo';

export function DirectoryCard({ item }: { item: DirectoryItem }) {
  const { navigate } = useNav();

  return (
    <div className="border border-[#e5e5e5] overflow-hidden transition-all hover:border-[#ccc] hover:shadow-lg group">
      <div className="overflow-hidden h-44">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="flex gap-2 mb-2 flex-wrap">
          <span className="tag">{dirCategoryLabels[item.category]}</span>
          {item.verified && <span className="tag tag-verified">تم التحقق</span>}
        </div>
        <h3 className="text-[1.05rem] font-bold mb-1.5">{item.name}</h3>
        <div className="text-sm text-[#888] mb-2 flex items-center gap-1">
          <MapPin size={13} /> {item.area}
        </div>
        <p className="text-sm text-[#555] mb-3.5 leading-relaxed line-clamp-2">{item.description}</p>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => navigate('dir-detail')} className="btn btn-dark btn-sm">
            التفاصيل
          </button>
          <a
            href={`https://wa.me/${item.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline btn-sm"
          >
            <MessageCircle size={14} /> واتساب
          </a>
        </div>
      </div>
    </div>
  );
}
