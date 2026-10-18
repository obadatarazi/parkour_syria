import { useEffect, useState } from 'react';

const SEEN_KEY = 'ps-preloader-seen';

function seenThisSession() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

export function Preloader() {
  const [skip] = useState(seenThisSession);
  const [hidden, setHidden] = useState(false);
  const [removed, setRemoved] = useState(skip);

  useEffect(() => {
    if (skip) return;
    try {
      sessionStorage.setItem(SEEN_KEY, '1');
    } catch {
      // storage blocked: the preloader just shows again next time
    }

    // Close once fonts are ready — at least 400ms so it doesn't flash, never more than 900ms.
    let done = false;
    const timers: number[] = [];
    const close = () => {
      if (done) return;
      done = true;
      setHidden(true);
      timers.push(window.setTimeout(() => setRemoved(true), 500));
    };
    const minWait = new Promise((r) => timers.push(window.setTimeout(r, 400)));
    Promise.all([document.fonts.ready, minWait]).then(close);
    timers.push(window.setTimeout(close, 900));
    return () => timers.forEach(clearTimeout);
  }, [skip]);

  if (removed) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#111] transition-opacity duration-500 ${
        hidden ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative flex items-center justify-center mb-8">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute rounded-full border-2 border-[#c8102e]"
            style={{
              width: '48px',
              height: '48px',
              animation: `pulseRing 1.5s ease-out ${i * 0.5}s infinite`,
            }}
          />
        ))}
        <svg
          width="56"
          height="56"
          viewBox="0 0 56 56"
          fill="none"
          className="relative z-10"
        >
          <circle cx="28" cy="28" r="26" stroke="#333" strokeWidth="2" />
          <path
            d="M16 40 L28 12 L40 40"
            stroke="#c8102e"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 100,
              animation: 'runnerDash 1.5s ease-in-out infinite',
            }}
          />
          <circle cx="28" cy="28" r="4" fill="#fff" />
        </svg>
      </div>

      <div className="text-white font-extrabold text-xl tracking-tight mb-6 flex items-center gap-2">
        <span className="bg-white text-black w-7 h-7 flex items-center justify-center text-base font-extrabold">
          ب
        </span>
        باركور سوريا
      </div>

      <div className="w-48 h-[3px] bg-[#333] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#c8102e] rounded-full"
          style={{ animation: 'barFill 0.9s ease-out forwards' }}
        />
      </div>

      <p className="text-[#666] text-xs mt-4">جاري التحميل...</p>
    </div>
  );
}
