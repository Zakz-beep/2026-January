"use client";
import { LayoutTextFlip } from "@/components/ui/layout-text-flip";
import { motion } from "motion/react";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";

export function LayoutTextFlipDemo() {
  const words = [
    { text: "Building" },
    { text: "secure", className: "text-emerald-500" },
    { text: "and" },
    { text: "reliable", className: "text-emerald-500" },
    { text: "fintech" },
    { text: "solutions.", className: "text-blue-500 dark:text-blue-400" },
  ];

  return (
    /* Container Utama: Membuat konten ke tengah layar secara penuh (full screen) */
    <section className="flex min-h-[90vh] flex-col items-center justify-center px-4 py-20 text-center">
      
      {/* Bagian Atas: Welcome Text Flip */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-2 flex flex-col items-center justify-center gap-2 md:flex-row md:gap-4"
      >
        <LayoutTextFlip
          text="Welcome to "
          words={["My Website", "My Project", "My Ecosystem"]}
        />
      </motion.div>

      {/* Bagian Tengah: Typewriter (Hero Title) */}
      {/* Kita bungkus agar lebar terkontrol dan tidak overflow di mobile */}
      <div className="flex justify-center w-full max-w-fit mx-auto">
        <TypewriterEffectSmooth words={words} cursorClassName="bg-blue-500" />
      </div>

      {/* Sub-text Deskripsi (Opsional agar lebih profesional) */}
      <p className="mt-2 max-w-lg text-sm text-gray-600 dark:text-neutral-400 md:text-base">
        Helping businesses build secure payment gateways and scalable financial architectures.
      </p>

      {/* Bagian Bawah: Tombol Aksi (CTA) */}
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <button className="h-12 w-48 rounded-xl bg-black text-sm font-semibold text-white border border-transparent dark:bg-white dark:text-black transition-all hover:opacity-80">
          View Projects
        </button>
        <button className="h-12 w-48 rounded-xl bg-white text-sm font-semibold text-black border border-black transition-all hover:bg-gray-50 dark:bg-transparent dark:border-white dark:text-white">
         Join My Community
        </button>
      </div>
      
    </section>
  );
}