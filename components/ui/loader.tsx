"use client";

import { motion, Transition } from "framer-motion";
import React from "react";

// Helper untuk transisi bouncing (Loader 1 & 2)
const getBounceTransition = (delay: number): Transition => ({
  duration: 0.6,
  repeat: Infinity,
  repeatType: "reverse",
  delay: delay * 0.1,
  ease: "easeInOut",
});

export const LoaderOne = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`} aria-label="Loading">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          animate={{ y: [0, -10, 0] }}
          transition={getBounceTransition(index)}
          className="h-3 w-3 rounded-full bg-gradient-to-b from-blue-500 to-blue-400 border border-blue-600 shadow-sm"
        />
      ))}
    </div>
  );
};

export const LoaderTwo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-1 ${className}`} aria-label="Loading">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          animate={{ x: [0, 15, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "easeInOut",
          }}
          className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-600 shadow-sm"
        />
      ))}
    </div>
  );
};

export const LoaderThree = ({ className = "" }: { className?: string }) => {
  return (
    <div className={className}>
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-yellow-500"
      >
        <motion.path
          initial={{ pathLength: 0, fill: "rgba(234, 179, 8, 0)" }}
          animate={{ pathLength: 1, fill: "rgba(234, 179, 8, 0.2)" }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear",
          }}
          d="M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11"
        />
      </motion.svg>
    </div>
  );
};

export const LoaderFour = ({ text = "LOADING", className = "" }: { text?: string; className?: string }) => {
  return (
    <div className={`relative font-black text-2xl tracking-tighter ${className} [perspective:1000px]`}>
      {/* Layer Utama */}
      <motion.span
        animate={{
          // GANTI 'skew' MENJADI 'skewX'
          skewX: [0, -20, 0], 
          scaleX: [1, 1.2, 1],
        }}
        transition={{
          duration: 0.1,
          repeat: Infinity,
          repeatType: "reverse",
          repeatDelay: 1,
        }}
        className="relative z-20 inline-block text-slate-900 dark:text-white"
      >
        {text}
      </motion.span>
      
      {/* Glitch Green */}
      <motion.span
        className="absolute inset-0 text-green-500/70 blur-[0.4px]"
        animate={{
          x: [-1, 2, -1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 0.2, repeat: Infinity }}
      >
        {text}
      </motion.span>

      {/* Glitch Purple */}
      <motion.span
        className="absolute inset-0 text-purple-500/70"
        animate={{
          x: [1, -2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 0.3, repeat: Infinity }}
      >
        {text}
      </motion.span>
    </div>
  );
};

export const LoaderFive = ({ text = "Please wait", className = "" }: { text?: string; className?: string }) => {
  return (
    <div className={`flex flex-wrap gap-[2px] font-bold uppercase tracking-widest text-sm ${className}`}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0.3 }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.2, 1],
            color: ["#64748b", "#3b82f6", "#64748b"]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </div>
  );
}