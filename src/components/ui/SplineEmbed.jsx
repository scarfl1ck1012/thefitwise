import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function SplineEmbed({
  url,
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
    if (typeof window === "undefined") return;
    const existing = document.querySelector(
      'script[data-spline-viewer="true"]',
    );
    if (existing) return;
    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://unpkg.com/@splinetool/viewer@1.12.81/build/spline-viewer.js";
    script.dataset.splineViewer = "true";
    document.head.appendChild(script);
  }, []);

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
        <spline-viewer
          url={url}
          loading-anim-type="none"
          style={{ width: "100%", height: "100%" }}
          aria-label={title}
        />
      ) : (
        fallback
      )}
    </div>
  );
}
