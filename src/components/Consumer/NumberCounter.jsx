import React, { useEffect, useState } from 'react';
import { animate } from 'framer-motion';

export default function NumberCounter({
  value = 0,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1.0,
  className = ''
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, '')) || 0;
    const controls = animate(displayValue, numericValue, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        setDisplayValue(latest);
      }
    });

    return () => controls.stop();
  }, [value, duration]);

  const formatted = displayValue.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
