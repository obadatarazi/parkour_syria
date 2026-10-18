import { MapPin, MessageCircle } from 'lucide-react';
import { useNav } from '@/components/nav';
import { dirCategoryLabels, type DirectoryItem } from '@/data/demo';

export function DirectoryCard({ item }: { item: DirectoryItem }) {
  const { navigate } = useNav();

  return (
    <div className="group relative overflow-hidden bg-[#121212] border border-white/5 transition-all duration-500 hover:border-white/20">
      <div className="overflow-hidden h-56 relative">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="cinematic-img"
          style={{ position: 'absolute', inset: 0 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-[1]" />
        <div className="absolute top-3 right-3 z-[2] flex gap-2 flex-wrap">
          <span className="tag">{dirCategoryLabels[item.category]}</span>
          {item.verified && <span className="tag tag-verified">تم التحقق</span>}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold mb-2 text-white">{item.name}</h3>
        <div className="text-sm text-white/40 mb-3 flex items-center gap-1.5">
          <MapPin size={13} /> {item.area}
        </div>
        <p className="text-sm text-white/55 mb-4 leading-relaxed line-clamp-2">{item.description}</p>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => navigate('dir-detail')}
            className="btn btn-outline btn-sm"
          >
            التفاصيل
          </button>
          <a
            href={`https://wa.me/${item.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-dark btn-sm"
          >
            <MessageCircle size={14} /> واتساب
          </a>
        </div>
      </div>
    </div>
  );
}
