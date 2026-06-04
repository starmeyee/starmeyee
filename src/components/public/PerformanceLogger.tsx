"use client";

import { useEffect } from "react";

export default function PerformanceLogger() {
  useEffect(() => {
    // 1. Measure TTFB
    const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      const ttfb = navigationEntry.responseStart;
      console.log(`%c[PERF] TTFB: ${ttfb.toFixed(2)}ms`, "color: #4D55CC; font-weight: bold;");
    }

    // 2. Measure Hydration Time
    if (window.performance && window.performance.timing) {
      const hydrationTime = performance.now();
      console.log(`%c[PERF] Client Hydration Completed in: ${hydrationTime.toFixed(2)}ms`, "color: #211C84; font-weight: bold;");
    }

    // 3. Measure LCP (Largest Contentful Paint)
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log(`%c[PERF] Largest Contentful Paint (LCP): ${lastEntry.startTime.toFixed(2)}ms`, "color: #7A73D1; font-weight: bold;");
    });

    observer.observe({ type: "largest-contentful-paint", buffered: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
