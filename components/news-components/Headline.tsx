"use client";

import React, { useState, useEffect} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

// 1. Define the Article interface
interface Article {
  id: string | number;
  title: string;
  slug: string;
  featured_image: string | null;
  categories: {
    name: string;
  } | null;
}

const Headline = () => {
  const supabase = createClient();
  
  // 2. Apply the Article type to the state
  const [articles, setArticles] = useState<Article[]>([]);
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDailyArticles = async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(`
          id, 
          title, 
          slug, 
          featured_image, 
          categories (name)
        `)
        .eq("status", "published");

      if (error) {
        console.error("Error fetching articles:", error.message);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        // Use today's date to seed the shuffle
        const today = new Date().toISOString().slice(0, 10);
        const seed = today.split('-').reduce((a, b) => a + parseInt(b), 0);
        
        // Seeded shuffle logic
        const shuffled = [...(data as unknown as Article[])].sort(() => {
          const x = Math.sin(seed) * 10000;
          return (x - Math.floor(x)) - 0.5;
        });

        setArticles(shuffled.slice(0, 4));
      }
      setLoading(false);
    };

    fetchDailyArticles();
  }, [supabase]);

  // Timer Auto-slide
  useEffect(() => {
    if (isHovered || articles.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrent((prev) => (prev === articles.length - 1 ? 0 : prev + 1));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isHovered, articles.length]);

  if (loading) {
    return <div className="h-[400px] w-full animate-pulse rounded-2xl bg-gray-200 dark:bg-slate-800" />;
  }

  if (articles.length === 0) return null;

  return (
    <section className="mb-12 w-full px-4 md:px-0">
      <div 
        className="relative h-[400px] w-full overflow-hidden rounded-2xl bg-gray-200 shadow-xl dark:bg-slate-800"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {articles.map((article, index) => (
          <div
            key={article.id}
            className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ease-in-out ${
              index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="relative h-full w-full">
               <Image
                src={article.featured_image || "/placeholder-news.jpg"}
                alt={article.title}
                fill
                priority={index === 0}
                className={`object-cover transition-transform duration-700 ease-out ${
                    isHovered && index === current ? 'scale-110' : 'scale-100'
                }`}
                sizes="(max-width: 768px) 100vw, 1200px"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />
            </div>

            <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
              <span className={`mb-3 inline-block rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white transition-all duration-500 transform ${
                  index === current ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}>
                {article.categories?.name || "News"}
              </span>
              
              <h2 className={`mb-4 text-2xl font-bold text-white md:text-5xl lg:max-w-3xl transition-all duration-500 delay-100 transform ${
                    index === current ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}>
                {article.title}
              </h2>

              <Link 
                href={`/blog/${article.slug}`}
                className={`inline-block rounded-lg border border-white/30 bg-white/10 px-6 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white hover:text-black duration-500 delay-200 transform ${
                  index === current ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
              >
                Baca Selengkapnya
              </Link>
            </div>
          </div>
        ))}

        {/* Indicator Dots */}
        <div className="absolute bottom-6 right-8 z-20 flex gap-2">
          {articles.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                current === idx ? 'w-8 bg-blue-500' : 'w-2 bg-white/50 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Headline;