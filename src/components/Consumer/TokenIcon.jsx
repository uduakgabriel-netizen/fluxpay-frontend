import React from 'react';

export default function TokenIcon({ symbol, size = 'md', className = '' }) {
  const sizeMap = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl'
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  switch (symbol?.toUpperCase()) {
    case 'SOL':
      return (
        <div className={`${currentSize} rounded-full bg-gradient-to-tr from-[#9945FF] to-[#14F195] p-1.5 flex items-center justify-center shadow-lg shadow-purple-500/20 ${className}`}>
          <svg viewBox="0 0 397 311" fill="none" className="w-full h-full">
            <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" fill="#000" />
            <path d="M64.6 3.8C67 1.4 70.3 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" fill="#000" />
            <path d="M333.4 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.8c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" fill="#000" />
          </svg>
        </div>
      );
    case 'USDC':
      return (
        <div className={`${currentSize} rounded-full bg-[#2775CA] p-1 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 ${className}`}>
          <span className="font-extrabold tracking-tighter text-white select-none">$</span>
        </div>
      );
    case 'USDT':
      return (
        <div className={`${currentSize} rounded-full bg-[#26A17B] p-1 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20 ${className}`}>
          <span className="font-extrabold tracking-tighter text-white select-none">₮</span>
        </div>
      );
    case 'JUP':
      return (
        <div className={`${currentSize} rounded-full bg-gradient-to-br from-[#19E4A9] via-[#C98028] to-[#E84393] p-1 flex items-center justify-center font-bold text-white shadow-lg shadow-amber-500/20 ${className}`}>
          <span className="font-black text-xs select-none">JUP</span>
        </div>
      );
    case 'BONK':
      return (
        <div className={`${currentSize} rounded-full bg-gradient-to-br from-[#F18E38] to-[#D4501D] p-1 flex items-center justify-center font-black text-white shadow-lg shadow-orange-500/25 ${className}`}>
          <span className="text-base select-none">🐕</span>
        </div>
      );
    case 'PYTH':
      return (
        <div className={`${currentSize} rounded-full bg-gradient-to-br from-[#7954D8] to-[#49279E] p-1 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-600/20 ${className}`}>
          <span className="font-black text-xs select-none">PYTH</span>
        </div>
      );
    case 'JTO':
      return (
        <div className={`${currentSize} rounded-full bg-gradient-to-br from-[#38D39F] to-[#0E6C47] p-1 flex items-center justify-center font-bold text-white shadow-lg shadow-teal-500/20 ${className}`}>
          <span className="font-black text-xs select-none">JTO</span>
        </div>
      );
    default:
      return (
        <div className={`${currentSize} rounded-full bg-purple-600 p-1 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/20 ${className}`}>
          <span className="font-bold select-none">{symbol?.slice(0, 3) || 'SPL'}</span>
        </div>
      );
  }
}
