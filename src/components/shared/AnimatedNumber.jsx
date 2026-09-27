import React, { useEffect, useState } from 'react';

export default function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 400,
  className = '',
}) {
  const numericTarget = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, '')) || 0;
  const [displayValue, setDisplayValue] = useState(numericTarget);

  useEffect(() => {
    let startTimestamp = null;
    const startValue = displayValue;
    const change = numericTarget - startValue;

    if (change === 0) return;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = startValue + change * easeProgress;
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(numericTarget);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [numericTarget, duration]);

  const formatted = displayValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={`tabular-nums font-mono ${className}`}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
