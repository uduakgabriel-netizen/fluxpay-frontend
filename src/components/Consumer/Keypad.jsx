import React from 'react';
import { motion } from 'framer-motion';

export default function Keypad({ onKeyPress, onBackspace, onClear }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'delete'];

  const handleClick = (key) => {
    if (key === 'delete') {
      if (onBackspace) onBackspace();
    } else {
      if (onKeyPress) onKeyPress(key);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-3 max-w-xs mx-auto py-2">
      {keys.map((key) => {
        const isDelete = key === 'delete';
        return (
          <motion.button
            key={key}
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => handleClick(key)}
            className="h-12 sm:h-14 rounded-2xl bg-white dark:bg-gray-800/90 text-gray-900 dark:text-white font-bold text-lg sm:text-xl border border-gray-200/80 dark:border-gray-700/80 shadow-sm hover:border-purple-500/40 dark:hover:border-teal-500/40 hover:shadow-md transition-all flex items-center justify-center select-none active:bg-gray-100 dark:active:bg-gray-700"
          >
            {isDelete ? (
              <i className="ri-delete-back-2-line text-lg sm:text-xl text-gray-500 dark:text-gray-400" />
            ) : (
              <span>{key}</span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
