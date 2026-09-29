import React, { useState, useRef, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

const FALLBACK =
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80";

/**
 * RoomCarousel
 * Props:
 *   images: string[]       - ordered list of photo URLs
 *   roomNumber: string     - used for aria labels and alt text
 *   className?: string     - extra classes for the outer container (default height is h-56)
 */
export default function RoomCarousel({ images = [], roomNumber = "", className = "h-56" }) {
  const [current, setCurrent] = useState(0);
  const [brokenImages, setBrokenImages] = useState({});
  const containerRef = useRef(null);

  // Swipe tracking
  const pointerStartX = useRef(null);

  const total = images.length;
  const validImages = total > 0 ? images : [FALLBACK];
  const count = validImages.length;

  const prev = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      setCurrent((c) => (c - 1 + count) % count);
    },
    [count]
  );

  const next = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      setCurrent((c) => (c + 1) % count);
    },
    [count]
  );

  const goTo = useCallback((idx, e) => {
    if (e) e.stopPropagation();
    setCurrent(idx);
  }, []);

  // Keyboard support when carousel is focused
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(null); }
      if (e.key === "ArrowRight") { e.preventDefault(); next(null); }
    },
    [prev, next]
  );

  // Pointer swipe support (works on both touch and mouse)
  const handlePointerDown = (e) => {
    pointerStartX.current = e.clientX;
  };
  const handlePointerUp = (e) => {
    if (pointerStartX.current === null) return;
    const delta = e.clientX - pointerStartX.current;
    pointerStartX.current = null;
    if (Math.abs(delta) < 50) return; // threshold
    if (delta < 0) next(e);
    else prev(e);
  };

  // Reset current index if images array changes
  useEffect(() => {
    setCurrent(0);
    setBrokenImages({});
  }, [images]);

  const isBroken = (idx) => brokenImages[idx];

  const imgSrc = (idx) => {
    if (isBroken(idx)) return FALLBACK;
    return validImages[idx];
  };

  // Max visible dots: show at most 7, collapse rest
  const MAX_DOTS = 7;
  const showDots = count > 1;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-slate-100 select-none ${className}`}
      tabIndex={count > 1 ? 0 : -1}
      onKeyDown={count > 1 ? handleKeyDown : undefined}
      onPointerDown={count > 1 ? handlePointerDown : undefined}
      onPointerUp={count > 1 ? handlePointerUp : undefined}
      style={{ touchAction: "pan-y" }}
      aria-label={`Galeria de habitacion ${roomNumber}`}
      aria-roledescription="carousel"
    >
      {/* Slide track */}
      <div
        className="flex h-full transition-transform duration-300 ease-out will-change-transform"
        style={{ width: `${count * 100}%`, transform: `translateX(-${(current * 100) / count}%)` }}
        aria-live="polite"
      >
        {validImages.map((src, idx) => (
          <div
            key={idx}
            className="relative h-full shrink-0"
            style={{ width: `${100 / count}%` }}
            aria-hidden={idx !== current}
          >
            <img
              src={isBroken(idx) ? FALLBACK : src}
              alt={`Habitacion ${roomNumber}, foto ${idx + 1} de ${count}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading={idx === 0 ? "eager" : "lazy"}
              draggable={false}
              onError={() => setBrokenImages((prev) => ({ ...prev, [idx]: true }))}
            />
            {isBroken(idx) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-200 text-slate-400 text-xs gap-1">
                <ImageOff className="w-6 h-6" />
                <span>No se pudo cargar</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Arrows — only when 2+ images */}
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-white/70"
            aria-label={`Foto anterior de habitacion ${roomNumber}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-white/70"
            aria-label={`Foto siguiente de habitacion ${roomNumber}`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots — only when 2+ images */}
      {showDots && (
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {count <= MAX_DOTS ? (
            validImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => goTo(idx, e)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 focus:outline-none ${
                  idx === current
                    ? "bg-white dark:bg-slate-800 scale-125"
                    : "bg-white dark:bg-slate-800/50 hover:bg-white dark:bg-slate-800/80"
                }`}
                aria-label={`Ir a foto ${idx + 1}`}
              />
            ))
          ) : (
            // Condensed dots: show at most MAX_DOTS, with current visible
            (() => {
              const half = Math.floor(MAX_DOTS / 2);
              let start = Math.max(0, current - half);
              let end = Math.min(count - 1, start + MAX_DOTS - 1);
              if (end - start < MAX_DOTS - 1) start = Math.max(0, end - MAX_DOTS + 1);
              const indices = Array.from({ length: end - start + 1 }, (_, i) => start + i);
              return indices.map((idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => goTo(idx, e)}
                  className={`rounded-full transition-all duration-200 focus:outline-none ${
                    idx === current
                      ? "w-2 h-2 bg-white dark:bg-slate-800"
                      : "w-1.5 h-1.5 bg-white dark:bg-slate-800/50 hover:bg-white dark:bg-slate-800/80"
                  }`}
                  aria-label={`Ir a foto ${idx + 1}`}
                />
              ));
            })()
          )}
        </div>
      )}

      {/* Photo counter badge (always visible when multiple) */}
      {count > 1 && (
        <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10 pointer-events-none">
          {current + 1}/{count}
        </div>
      )}
    </div>
  );
}
