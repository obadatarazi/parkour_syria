export const site = {
  whatsappMain: '963999000000',
  whatsappDisplay: '+963 999 000 000',
  email: 'info@parkoursyria.com',
  facebookHandle: 'ParkourSyria',
  facebookUrl: '#',
  instagramHandle: '@parkoursyria',
  instagramUrl: '#',
  domain: 'parkoursyria.com',
} as const;

export function whatsappLink(number: string, message?: string) {
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
