import { ChevronLeft, MapPin, MessageCircle, Map as MapIcon } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { useNav } from '@/components/nav';
import { whatsappLink } from '@/config/site';
import { useDemo } from '@/data/useDemo';
import { useI18n } from '@/i18n/useI18n';
import { photo, photoSet } from '@/lib/photo';

export function DirDetailPage() {
  const { navigate, id } = useNav();
  const { t } = useI18n();
  const { directoryItems, dirCategoryLabels, city } = useDemo();
  const item = directoryItems.find((d) => d.id === id) ?? directoryItems[0];
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.name} ${item.area} ${city}`)}`;

  return (
    <div>
      <Reveal as="section" className="section">
        <div className="container-x max-w-[720px]">
          <button
            type="button"
            onClick={() => navigate('directory')}
            className="back-link inline-flex items-center gap-1.5"
          >
            <ChevronLeft size={16} className="flip-rtl" />
            {t('pages.dirDetail.back')}
          </button>
          <div className="flex gap-2 mb-3">
            <span className="tag">{dirCategoryLabels[item.category]}</span>
            {item.verified && <span className="tag tag-verified">{t('common.verified')}</span>}
          </div>
          <h1 className="text-[1.6rem] font-extrabold mb-2">{item.name}</h1>
          <div className="text-white/50 mb-4 flex items-center gap-1">
            <MapPin size={14} /> {item.area} · {city}
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
            {item.verified ? t('pages.dirDetail.verifiedNote') : t('pages.dirDetail.unverifiedNote')}
          </p>
          <div className="flex gap-2.5 flex-wrap">
            <a
              href={whatsappLink(item.whatsapp)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-dark"
            >
              <MessageCircle size={16} /> {t('common.whatsapp')}
            </a>
            {item.category === 'place' && (
              <a href={mapsUrl} target="_blank" rel="noreferrer" className="btn btn-outline">
                <MapIcon size={16} /> {t('common.maps')}
              </a>
            )}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
