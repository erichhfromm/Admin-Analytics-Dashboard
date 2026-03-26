import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const Card = ({ children, className, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={clsx(
        "bg-[var(--surface-color)] rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden",
        "p-6",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export default Card;
