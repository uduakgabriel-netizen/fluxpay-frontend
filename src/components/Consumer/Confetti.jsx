import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Confetti() {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    const colors = ['#8b5cf6', '#c084fc', '#10b981', '#38bdf8', '#fbbf24', '#f43f5e'];
    const newPieces = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 450,
      y: (Math.random() - 0.5) * 350 - 50,
      rotate: Math.random() * 360,
      scale: Math.random() * 0.8 + 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.3
    }));
    setPieces(newPieces);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-20">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, scale: 0, rotate: 0 }}
          animate={{
            opacity: [1, 1, 0],
            x: p.x,
            y: p.y,
            rotate: p.rotate + 180,
            scale: p.scale
          }}
          transition={{
            duration: 1.6,
            delay: p.delay,
            ease: [0.22, 1, 0.36, 1]
          }}
          style={{
            backgroundColor: p.color,
            width: Math.random() > 0.5 ? '10px' : '6px',
            height: Math.random() > 0.5 ? '12px' : '6px',
            borderRadius: Math.random() > 0.6 ? '50%' : '2px'
          }}
          className="absolute shadow-sm"
        />
      ))}
    </div>
  );
}
