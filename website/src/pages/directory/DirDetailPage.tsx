import { ChevronLeft, MapPin, MessageCircle, Map as MapIcon } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import { useNav } from '@/components/nav';
import { BackButton, Container, Tag } from '@/components/ui';
import { tagVariant } from '@/components/ui/variants';
import { cn } from '@/lib/cn';
import { whatsappLink } from '@/config/site';
import { useDirectoryItem } from '@/hooks/useDirectory';
import { useSiteMeta } from '@/hooks/useSiteMeta';
import { useI18n } from '@/i18n/useI18n';
import { photo, photoSet } from '@/lib/photo';

export function DirDetailPage() {
  const { navigate, id } = useNav();
  const { t } = useI18n();
  const { data: item } = useDirectoryItem(id);
  const { data: meta } = useSiteMeta();
  const { dirCategoryLabels, city } = meta;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.name} ${item.area} ${city}`)}`;

  return (
    <div>
      <Reveal as="section" className="section">
        <Container className="max-w-[720px]">
          <BackButton type="button" onClick={() => navigate('directory')}>
            <ChevronLeft size={16} className="flip-rtl" />
            {t('pages.dirDetail.back')}
          </BackButton>
          <div className="flex gap-2 mb-3">
            <Tag>{dirCategoryLabels[item.category]}</Tag>
            {item.verified && <Tag variant={tagVariant.verified}>{t('common.verified')}</Tag>}
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
              className={cn('btn', 'btn-dark')}
            >
              <MessageCircle size={16} /> {t('common.whatsapp')}
            </a>
            {item.category === 'place' && (
              <a href={mapsUrl} target="_blank" rel="noreferrer" className={cn('btn', 'btn-outline')}>
                <MapIcon size={16} /> {t('common.maps')}
              </a>
            )}
          </div>
        </Container>
      </Reveal>
    </div>
  );
}
