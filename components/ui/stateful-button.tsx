"use client";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { HTMLMotionProps, motion, useAnimate } from "motion/react";
import { XCircle } from "lucide-react"; // Tambahkan icon error

interface ButtonProps extends HTMLMotionProps<"button"> {
  className?: string;
  children: React.ReactNode;
}

export const Button = ({ className, children, ...props }: ButtonProps) => {
  const [scope, animate] = useAnimate();
  const [isPending, setIsPending] = useState(false);

  const animateLoading = async () => {
    await animate(
      ".loader",
      { width: "20px", scale: 1, display: "block" },
      { duration: 0.2 }
    );
  };

  const animateSuccess = async () => {
    // Sembunyikan loader
    await animate(".loader", { width: "0px", scale: 0, display: "none" }, { duration: 0.2 });
    // Tampilkan centang
    await animate(".check", { width: "20px", scale: 1, display: "block" }, { duration: 0.2 });
    // Tunggu sebentar lalu reset ke teks awal
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await animate(".check", { width: "0px", scale: 0, display: "none" }, { duration: 0.2 });
  };

  const animateError = async () => {
    // Sembunyikan loader
    await animate(".loader", { width: "0px", scale: 0, display: "none" }, { duration: 0.2 });
    // Tampilkan icon X/Error
    await animate(".error-icon", { width: "20px", scale: 1, display: "block" }, { duration: 0.2 });
    // Tunggu sebentar lalu reset
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await animate(".error-icon", { width: "0px", scale: 0, display: "none" }, { duration: 0.2 });
  };

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isPending) return; // Cegah double click saat proses

    setIsPending(true);
    await animateLoading();

    try {
      // Menunggu fungsi onClick (submit ke Supabase) selesai
      await props.onClick?.(event);
      await animateSuccess();
    } catch (error) {
      console.error("Button Action Failed:", error);
      await animateError();
    } finally {
      setIsPending(false);
    }
  };

  // Destructure props agar tidak terjadi duplikasi onClick di motion.button
  const { onClick, ...buttonProps } = props;

  return (
    <motion.button
      layout
      disabled={isPending}
      ref={scope}
      className={cn(
        "flex min-w-[140px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 font-medium text-white transition duration-200 disabled:cursor-not-allowed disabled:opacity-70",
        className
      )}
      {...buttonProps}
      onClick={handleClick}
    >
      <motion.div layout className="flex items-center gap-2">
        <Loader />
        <CheckIcon />
        <ErrorIcon />
        <motion.span layout className="text-sm">{children}</motion.span>
      </motion.div>
    </motion.button>
  );
};

// --- Sub-Components (Loader, Check, Error) ---

const Loader = () => (
  <motion.svg
    animate={{ rotate: 360 }}
    initial={{ scale: 0, width: 0, display: "none" }}
    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
    className="loader text-white"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    width="20"
    height="20"
  >
    <path d="M12 3a9 9 0 1 0 9 9" />
  </motion.svg>
);

const CheckIcon = () => (
  <motion.svg
    initial={{ scale: 0, width: 0, display: "none" }}
    className="check text-green-400"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    width="20"
    height="20"
  >
    <polyline points="20 6 9 17 4 12" />
  </motion.svg>
);

const ErrorIcon = () => (
  <div className="error-icon hidden scale-0 text-red-400">
    <XCircle size={20} />
  </div>
);