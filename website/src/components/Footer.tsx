import { useLink } from '@/components/nav';
import type { NavPageId } from '@/data/demo';
import { site, whatsappLink } from '@/config/site';
import { useI18n } from '@/i18n/useI18n';

const exploreLinks: NavPageId[] = ['what', 'path', 'directory', 'events'];
const moreLinks: NavPageId[] = ['book', 'about', 'contact', 'disclaimer'];

export function Footer() {
  const link = useLink();
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-white/5 pt-20 pb-10">
      <div className="container-x">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <div className="font-extrabold text-xl text-white flex items-center gap-2.5 mb-4">
              <span className="bg-white text-black w-8 h-8 flex items-center justify-center font-extrabold text-sm">
                {t('brand.logoLetter')}
              </span>
              {t('brand.name')}
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>

          <div>
            <h4 className="text-white/30 text-xs font-bold mb-5 uppercase tracking-[0.15em] rtl:tracking-normal">
              {t('footer.explore')}
            </h4>
            <ul className="space-y-3">
              {exploreLinks.map((p) => (
                <li key={p}>
                  <a
                    {...link(p)}
                    className="text-white/60 hover:text-white transition-colors text-sm"
                  >
                    {t(`nav.${p}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white/30 text-xs font-bold mb-5 uppercase tracking-[0.15em] rtl:tracking-normal">
              {t('footer.more')}
            </h4>
            <ul className="space-y-3">
              {moreLinks.map((p) => (
                <li key={p}>
                  <a
                    {...link(p)}
                    className="text-white/60 hover:text-white transition-colors text-sm"
                  >
                    {p === 'contact' ? t('footer.links.contact') : t(`nav.${p}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white/30 text-xs font-bold mb-5 uppercase tracking-[0.15em] rtl:tracking-normal">
              {t('footer.connect')}
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={whatsappLink(site.whatsappMain)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  {t('common.whatsapp')}
                </a>
              </li>
              <li>
                <a
                  href={site.facebookUrl}
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  {t('common.facebook')}
                </a>
              </li>
              <li>
                <a
                  href={site.instagramUrl}
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  {t('common.instagram')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-xs">
            {t('footer.copyright', { year })}
          </p>
          <p className="text-white/20 text-xs uppercase tracking-widest rtl:tracking-normal">
            {t('footer.slogan')}
          </p>
        </div>
      </div>
    </footer>
  );
}
