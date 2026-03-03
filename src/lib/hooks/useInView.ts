"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Lightweight alternative to framer-motion's useInView.
 * Returns a ref to attach and whether the element is in view.
 * Triggers once by default (once: true) — perfect for entry animations.
 */
export function useInView(options: IntersectionObserverInit & { once?: boolean } = {}) {
  const { once = true, threshold = 0.15, rootMargin = "0px 0px -60px 0px" } = options;
  const ref = useRef<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold, rootMargin]);

  return { ref, isInView };
}
