import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function SparklineChart({ timeframe = '1M' }) {
  const [activeTf, setActiveTf] = useState('1M');

  const timeframes = ['D', 'W', 'M', '6M', '1Y', 'All'];

  // Data points per timeframe
  const chartData = {
    'D': [120, 128, 124, 135, 142, 138, 150],
    'W': [110, 115, 130, 125, 140, 145, 150],
    'M': [95, 105, 118, 112, 134, 142, 150],
    '6M': [70, 85, 110, 100, 130, 140, 150],
    '1Y': [45, 60, 90, 110, 125, 138, 150],
    'All': [30, 50, 75, 95, 120, 135, 150]
  };

  const points = chartData[activeTf] || chartData['M'];
  const min = Math.min(...points);
  const max = Math.max(...points);

  // Normalize points to SVG coordinates (width: 320, height: 100)
  const width = 320;
  const height = 90;
  const padding = 10;

  const coords = points.map((val, idx) => {
    const x = padding + (idx / (points.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((val - min) / (max - min || 1)) * (height - 2 * padding);
    return { x, y };
  });

  const pathD = coords.reduce((acc, pt, idx) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`;
    const prev = coords[idx - 1];
    const midX = (prev.x + pt.x) / 2;
    return `${acc} C ${midX} ${prev.y}, ${midX} ${pt.y}, ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`;

  return (
    <div className="w-full space-y-3">
      {/* SVG Sparkline */}
      <div className="relative w-full h-[100px] overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path d={areaD} fill="url(#chartGradient)" />

          {/* Line stroke */}
          <motion.path
            key={activeTf}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            d={pathD}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Current price marker dot */}
          <circle
            cx={coords[coords.length - 1].x}
            cy={coords[coords.length - 1].y}
            r="4.5"
            fill="#14b8a6"
            stroke="#ffffff"
            strokeWidth="2"
            className="animate-pulse"
          />
        </svg>

        {/* Floating pill badge */}
        <div className="absolute top-1 left-2 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 text-[11px] font-bold border border-teal-500/30 flex items-center gap-1 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping" />
          <span>+14.2%</span>
        </div>
      </div>

      {/* Timeframe pill tabs */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-800">
        {timeframes.map((tf) => (
          <button
            key={tf}
            type="button"
            onClick={() => setActiveTf(tf)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTf === tf
                ? 'bg-gradient-to-r from-purple-600 to-teal-500 text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>
    </div>
  );
}
