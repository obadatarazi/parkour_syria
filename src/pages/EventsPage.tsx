import { MessageCircle } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { events } from '@/data/demo';

export function EventsPage() {
  return (
    <div>
      <div className="page-hero">
        <div className="container-x">
          <h1>الفعاليات القادمة</h1>
          <p>ورشات وتجمعات — المنتهية تختفي تلقائياً</p>
        </div>
      </div>
      <Reveal as="section" className="section">
        <div className="container-x">
          <Reveal type="stagger" className="grid grid-cols-1 gap-6">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="grid grid-cols-[120px_1fr] sm:grid-cols-[200px_1fr] gap-4 border-b border-[#e5e5e5] pb-6 last:border-none group"
              >
                <div className="w-[120px] h-[90px] sm:w-[200px] sm:h-[130px] overflow-hidden">
                  <img
                    src={ev.image}
                    alt={ev.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div>
                  <div className="text-xs text-[#888] mb-1 font-semibold uppercase tracking-wide">
                    {ev.type} · {ev.date}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold mb-1 leading-snug">{ev.title}</h3>
                  <p className="text-sm text-[#555] mb-2">{ev.location}</p>
                  <a
                    href={`https://wa.me/${ev.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-dark btn-sm"
                  >
                    <MessageCircle size={14} /> سجّل
                  </a>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </Reveal>
    </div>
  );
}
