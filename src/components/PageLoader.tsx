export function PageLoader() {
  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-white/80 backdrop-blur-sm pointer-events-none">
      <div className="flex flex-col items-center">
        <div className="flex gap-1.5 mb-3">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-[#c8102e]"
              style={{
                animation: `bounceLoader 0.6s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </div>
        <div className="w-32 h-[2px] bg-[#e5e5e5] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#111] rounded-full"
            style={{ animation: 'barFill 0.5s ease-out forwards' }}
          />
        </div>
      </div>
    </div>
  );
}
