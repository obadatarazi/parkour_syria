import { Reveal } from '@/components/Reveal';

export function DisclaimerPage() {
  return (
    <div>
      <div className="page-hero">
        <div className="container-x">
          <h1>إخلاء المسؤولية والأمان</h1>
        </div>
      </div>
      <Reveal as="section" className="section section-light">
        <div className="container-x prose">
          <h2>إخلاء المسؤولية</h2>
          <p>
            المحتوى لأغراض تثقيفية فقط. لسنا مسؤولين عن أي إصابة. الممارس يتحمّل المسؤولية الكاملة.
          </p>
          <h2>سياسة الأمان</h2>
          <ul>
            <li>لا نُدرج مباني متضررة أو مناطق خطرة</li>
            <li>كل اقتراح يُراجع قبل النشر</li>
            <li>الإدراج ليس تزكية</li>
          </ul>
          <h2>الارتباط بـ Parkour.com</h2>
          <p>باركور سوريا مرتبط بـ Parkour.com ويعمل كمحتوى محلي للمجتمع السوري.</p>
        </div>
      </Reveal>
    </div>
  );
}
