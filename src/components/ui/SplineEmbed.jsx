import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function SplineEmbed({
  src,
  title = "Spline scene",
  className,
  fallback = null,
  minWidth = 768,
}) {
  const containerRef = useRef(null);
  const [canRender, setCanRender] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia(`(min-width: ${minWidth}px)`);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setCanRender(media.matches && !reducedMotion.matches);
    update();
    media.addEventListener("change", update);
    reducedMotion.addEventListener("change", update);
    return () => {
      media.removeEventListener("change", update);
      reducedMotion.removeEventListener("change", update);
    };
  }, [minWidth]);

  useEffect(() => {
    if (!canRender || !containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [canRender]);

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      {canRender && inView ? (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          className="h-full w-full border-0"
          allow="autoplay; fullscreen"
        />
      ) : (
        fallback
      )}
    </div>
  );
}
