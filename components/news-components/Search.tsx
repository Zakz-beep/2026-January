"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Search, Loader2, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Types
interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Article {
  title: string;
  slug: string;
  featured_image: string | null;
  created_at: string;
  category: {
    name: string;
  } | null;
}



// Constants
const SEARCH_DEBOUNCE_MS = 500;
const SEARCH_RESULTS_LIMIT = 5;
const SUGGESTED_TAGS = ["Teknologi", "Bisnis", "Politik", "Olahraga", "Ekonomi"];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Focus input otomatis saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Handle tombol ESC untuk menutup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Logic Search dengan Debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length === 0) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("articles")
          .select("title, slug, featured_image, created_at, category:categories(name)")
          .eq("status", "published")
          .ilike("title", `%${query}%`)
          .limit(SEARCH_RESULTS_LIMIT);

        if (error) throw error;
        setResults((data as unknown as Article[]) || []);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(delayDebounceFn);
  }, [query, supabase]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-9999 flex items-start justify-center pt-[10vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[70vh]"
          >
            {/* Header / Input Area */}
            <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari berita, topik, atau artikel..."
                className="flex-1 bg-transparent text-lg outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
              />
              <button
                onClick={onClose}
                className="p-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-bold text-slate-500 border border-slate-200 dark:border-slate-700 px-2"
              >
                ESC
              </button>
            </div>

            {/* Results Area */}
            <div className="overflow-y-auto p-2">
              {loading ? (
                <div className="py-10 text-center flex flex-col items-center text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin mb-2 text-blue-600" />
                  <span className="text-sm">Sedang mencari...</span>
                </div>
              ) : query && results.length > 0 ? (
                <div className="space-y-1">
                  <p className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Hasil Pencarian
                  </p>
                  {results.map((article) => (
                    <Link
                      key={article.slug}
                      href={`/blog/${article.slug}`}
                      onClick={onClose}
                      className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="relative h-14 w-14 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          {article.featured_image ? (
                            <Image
                              src={article.featured_image}
                              alt={article.title}
                              fill
                              sizes="56px"
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full w-full text-blue-600 bg-blue-50 dark:bg-blue-900/20">
                              <FileText className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="truncate">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 transition-colors">
                            {article.title}
                          </h4>
                          <p className="text-xs text-slate-500 flex items-center gap-2">
                            <span className="uppercase font-bold text-blue-500 text-[10px]">
                              {article.category?.name}
                            </span>
                            <span>•</span>
                            <span>
                              {new Date(article.created_at).toLocaleDateString('id-ID', { 
                                day: 'numeric', 
                                month: 'short' 
                              })}
                            </span>
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </Link>
                  ))}
                </div>
              ) : query && results.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-slate-900 dark:text-white font-medium">
                    Tidak ada hasil ditemukan.
                  </p>
                  <p className="text-slate-500 text-sm mt-1">Coba kata kunci lain.</p>
                </div>
              ) : (
                <div className="p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                    Saran Pencarian
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setQuery(tag)}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-sm text-slate-600 dark:text-slate-400 hover:border-blue-500 hover:text-blue-600 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 text-center">
              Tekan <kbd className="font-sans font-bold text-slate-500">Enter</kbd> untuk memilih,{" "}
              <kbd className="font-sans font-bold text-slate-500">Esc</kbd> untuk keluar
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}