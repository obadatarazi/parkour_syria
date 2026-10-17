import { MessageCircle, Facebook, Instagram, Mail } from 'lucide-react';
import { Reveal } from '@/components/Reveal';

const contacts = [
  { icon: MessageCircle, label: 'واتساب', value: '+963 999 000 000', href: 'https://wa.me/963999000000' },
  { icon: Facebook, label: 'فيسبوك', value: 'ParkourSyria', href: '#' },
  { icon: Instagram, label: 'إنستغرام', value: '@parkoursyria', href: '#' },
  { icon: Mail, label: 'البريد', value: 'info@parkoursyria.com', href: 'mailto:info@parkoursyria.com' },
];

export function ContactPage() {
  return (
    <div>
      <div className="page-hero">
        <div className="container-x">
          <h1>تواصل معنا</h1>
        </div>
      </div>
      <Reveal as="section" className="section">
        <div className="container-x max-w-[560px]">
          <Reveal type="stagger" className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#e5e5e5]">
            {contacts.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className="bg-white flex items-center gap-4 p-[18px] hover:bg-[#f5f5f5] transition-colors"
              >
                <c.icon size={22} className="text-[#555]" />
                <div>
                  <strong className="block text-[0.95rem]">{c.label}</strong>
                  <span className="text-xs text-[#888]">{c.value}</span>
                </div>
              </a>
            ))}
          </Reveal>
        </div>
      </Reveal>
    </div>
  );
}
