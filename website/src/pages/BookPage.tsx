import { BookOpen } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { site, whatsappLink } from '@/config/site';
import { useI18n } from '@/i18n/useI18n';

export function BookPage() {
  const { t, tm } = useI18n();
  const forWhomList = tm<string[]>('pages.book.forWhomList');
  const bookWa = whatsappLink(site.whatsappMain, t('book.whatsappMessage'));

  return (
    <div>
      <div className="page-hero">
        <div className="container-x">
          <h1>{t('pages.book.heroTitle')}</h1>
          <p>{t('pages.book.heroSub')}</p>
        </div>
      </div>
      <Reveal as="section" className="section">
        <div className="container-x max-w-[640px]">
          <Reveal
            type="reveal-jump"
            className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-8 items-center bg-[#121212] border border-white/10 text-white p-10 sm:px-7 mb-8 text-center sm:text-start"
          >
            <div className="w-[140px] h-[190px] bg-[#333] flex items-center justify-center mx-auto sm:mx-0">
              <BookOpen size={40} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold mb-3">{t('pages.book.cardTitle')}</h2>
              <p className="opacity-80 text-[0.95rem]">{t('pages.book.cardDesc')}</p>
            </div>
          </Reveal>
          <div className="prose">
            <h2>{t('pages.book.forWhomTitle')}</h2>
            <ul>
              {forWhomList.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="text-white/50 text-[0.9rem]">{t('pages.book.formatNote')}</p>
            <a
              href={bookWa}
              target="_blank"
              rel="noreferrer"
              className="btn btn-accent btn-lg btn-block mt-5"
            >
              {t('pages.book.cta')}
            </a>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
