"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { Star } from "lucide-react"; // Import icon bintang

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  items: {
    quote: string;
    name: string;
    title: string;
    rating: number;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);

  useEffect(() => {
    addAnimation();
  }, []);

  const [start, setStart] = useState(false);

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }

  const getDirection = () => {
    if (containerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty("--animation-direction", "forwards");
      } else {
        containerRef.current.style.setProperty("--animation-direction", "reverse");
      }
    }
  };

  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "20s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "40s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "80s");
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap gap-4 py-4",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items.map((item, idx) => (
          <li
            className="relative w-[350px] max-w-full shrink-0 rounded-2xl border border-zinc-200 bg-white px-8 py-6 md:w-[450px] dark:border-zinc-800 dark:bg-zinc-950 shadow-sm"
            key={idx} // Gunakan idx karena data yang diduplikasi logic animasi butuh key unik
          >
            <blockquote className="flex flex-col h-full justify-between">
              <div aria-hidden="true" className="user-select-none pointer-events-none absolute -top-0.5 -left-0.5 -z-1 h-[calc(100%_+_4px)] w-[calc(100%_+_4px)]"></div>
              
              {/* Rating Bintang di Bagian Atas */}
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={cn(
                      "mr-0.5",
                      i < item.rating 
                        ? "fill-yellow-400 text-yellow-400" 
                        : "text-zinc-300 dark:text-zinc-700"
                    )}
                  />
                ))}
              </div>

              {/* Isi Komentar */}
              <span className="relative z-20 text-sm leading-[1.6] font-normal text-zinc-700 dark:text-zinc-300 italic">
                "{item.quote}"
              </span>

              {/* Info Pengirim */}
              <div className="relative z-20 mt-6 flex flex-row items-center border-t border-zinc-100 dark:border-zinc-800 pt-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm leading-[1.2] font-semibold text-zinc-900 dark:text-zinc-100">
                    {item.name}
                  </span>
                  <span className="text-xs leading-[1.2] font-normal text-zinc-500 dark:text-zinc-500">
                    {item.title}
                  </span>
                </div>
              </div>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  );
};