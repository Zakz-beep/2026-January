"use client";

import React, { useEffect, useState } from "react";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { createClient } from "@/utils/supabase/client";
import { MessageSquare } from "lucide-react"; // Import icon pesan

interface Testimonial {
  quote: string;
  name: string;
  title: string;
  rating: number;
}

export function InfiniteMovingCardsDemo() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching:", error.message);
      } else if (data) {
        const formattedData = data.map((item) => ({
          quote: item.comment,
          name: item.fullname,
          title: item.position,
          rating: item.rating,
        }));
        setTestimonials(formattedData);
      }
      setIsLoading(false);
    };

    fetchComments();
  }, []);

  if (isLoading) return <div className="text-white text-center p-10">Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-black antialiased relative overflow-hidden">
      
      {/* BAGIAN JUMLAH COMMENT */}
      <div className="mb-10 flex flex-col items-center">
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 mb-4 shadow-sm">
          <MessageSquare size={16} className="text-cyan-500" />
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {testimonials.length} Komentar Masuk
          </span>
        </div>
        
        <h2 className="text-3xl md:text-5xl font-bold text-center text-zinc-800 dark:text-zinc-200">
          Apa Kata Mereka?
        </h2>
      </div>

      {/* INFINITE SCROLL */}
      <div className="h-[30rem] flex flex-col items-center justify-center relative overflow-hidden w-full">
        {testimonials.length > 0 ? (
          <>
            <InfiniteMovingCards
              items={testimonials}
              direction="right"
              speed="slow"
            />
            {/* Tampilkan baris kedua hanya jika data cukup banyak */}
            {testimonials.length > 2 && (
              <InfiniteMovingCards
                items={testimonials}
                direction="left"
                speed="normal"
                className="mt-4"
              />
            )}
          </>
        ) : (
          <p className="text-zinc-500 italic">Belum ada komentar.</p>
        )}
      </div>

      {/* Efek Background Grid (Opsional) */}
      <div className="absolute inset-0 dark:bg-grid-white/[0.05] bg-grid-black/[0.02] pointer-events-none -z-10" />
    </div>
  );
}