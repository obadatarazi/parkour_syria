import { MapPin, MessageCircle } from 'lucide-react';
import { useNav } from '@/components/nav';
import type { DirectoryItem } from '@/data/demo';
import { useDemo } from '@/data/useDemo';
import { useI18n } from '@/i18n/useI18n';
import { photo, photoSet } from '@/lib/photo';
import { whatsappLink } from '@/config/site';

export function DirectoryCard({ item }: { item: DirectoryItem }) {
  const { navigate } = useNav();
  const { dirCategoryLabels } = useDemo();
  const { t } = useI18n();

  return (
    <div className="group relative overflow-hidden bg-[#121212] border border-white/5 transition-all duration-500 hover:border-white/20">
      <div className="overflow-hidden h-56 relative">
        <img
          src={photo(item.image, 800)}
          srcSet={photoSet(item.image, [480, 800])}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          alt={item.name}
          loading="lazy"
          className="cinematic-img"
          style={{ position: 'absolute', inset: 0 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-[1]" />
        <div className="absolute top-3 start-3 z-[2] flex gap-2 flex-wrap">
          <span className="tag">{dirCategoryLabels[item.category]}</span>
          {item.verified && (
            <span className="tag tag-verified">{t('common.verified')}</span>
          )}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold mb-2 text-white">{item.name}</h3>
        <div className="text-sm text-white/40 mb-3 flex items-center gap-1.5">
          <MapPin size={13} /> {item.area}
        </div>
        <p className="text-sm text-white/55 mb-4 leading-relaxed line-clamp-2">
          {item.description}
        </p>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => navigate('dir-detail', item.id)}
            className="btn btn-outline btn-sm"
          >
            {t('common.details')}
          </button>
          <a
            href={whatsappLink(item.whatsapp)}
            target="_blank"
            rel="noreferrer"
            className="btn btn-dark btn-sm"
          >
            <MessageCircle size={14} /> {t('common.whatsapp')}
          </a>
        </div>
      </div>
    </div>
  );
}
