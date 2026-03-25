import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  duration?: number;
  prefix?: string;
  decimals?: number;
}

export function AnimatedCounter({
  value,
  duration = 800,
  prefix = "",
  decimals = 2,
}: Props) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    const start = prev.current;
    const end = value;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - 2 ** (-10 * progress);
      setDisplay(start + (end - start) * eased);
      if (progress < 1) {
        raf.current = requestAnimationFrame(tick);
      } else {
        prev.current = end;
      }
    };

    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {display.toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  );
}
