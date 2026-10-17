import { Reveal } from '@/components/Reveal';
import { useNav } from '@/components/nav';

export function AboutPage() {
  const { navigate } = useNav();

  return (
    <div>
      <div className="page-hero">
        <div className="container-x">
          <h1>من نحن</h1>
        </div>
      </div>
      <Reveal as="section" className="section">
        <div className="container-x prose">
          <p>
            <strong>باركور سوريا</strong> منصة سورية مرتبطة بـ Parkour.com تساعد المهتمين بالباركور
            على التعلّم بأمان وإيجاد أماكن التدريب والمدربين في دمشق.
          </p>
          <p className="text-[#888] text-[0.9rem]">مرتبط بـ Parkour.com — محتوى محلي لدمشق وسوريا.</p>
          <button onClick={() => navigate('contact')} className="btn btn-dark mt-4">
            تواصل معنا
          </button>
        </div>
      </Reveal>
    </div>
  );
}
