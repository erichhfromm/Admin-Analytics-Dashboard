import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const Card = ({ children, className, delay = 0, hover = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={hover ? { scale: 1.02, y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" } : {}}
      transition={{ duration: 0.4, delay, type: "spring", bounce: 0.4 }}
      className={clsx(
        "bg-[var(--surface-color)] rounded-xl shadow border border-[var(--border-color)] overflow-hidden transition-all duration-300",
        "p-6",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export default Card;
