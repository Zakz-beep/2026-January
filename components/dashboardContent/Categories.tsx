"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";
import { Plus, X, Loader2, Edit2 } from "lucide-react";

// Definisikan tipe data Kategori sesuai tabel di database
interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string; // Opsional jika tabel lu ada kolom ini
}

interface CategoryModalProps {
  category?: Category; // Jika ada, berarti mode EDIT
  onSuccess?: () => void; // Callback untuk refresh data di parent
}

export default function CategoryModal({ category, onSuccess }: CategoryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State form dengan tipe data string
  const [name, setName] = useState<string>("");
  const [slug, setSlug] = useState<string>("");

  const supabase = createClient();

  // Sinkronisasi data saat modal dibuka untuk mode EDIT
  useEffect(() => {
    if (category && isOpen) {
      setName(category.name);
      setSlug(category.slug);
    }
  }, [category, isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = { 
      name, 
      slug: slug.toLowerCase().trim().replace(/\s+/g, "-") 
    };

    try {
      if (category?.id) {
        // Mode UPDATE
        const { error } = await supabase
          .from("categories")
          .update(payload)
          .eq("id", category.id);
        if (error) throw error;
      } else {
        // Mode INSERT
        const { error } = await supabase
          .from("categories")
          .insert([payload]);
        if (error) throw error;
      }

      setIsOpen(false);
      if (onSuccess) onSuccess();
      if (!category) { setName(""); setSlug(""); } // Reset jika modal tambah
    } catch (error) {
        const err = error as Error
      alert("Gagal menyimpan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Tombol pemicu: Jika ada props 'category' tampilkan ikon Edit, jika tidak tampilkan tombol New */}
      {category ? (
        <button 
          onClick={() => setIsOpen(true)} 
          className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors group"
          title="Edit Kategori"
        >
          <Edit2 className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
        </button>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> NEW CATEGORY
        </button>
      )}

      {/* Backdrop & Modal Window */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">
                {category ? "Modify Category" : "Create Category"}
              </h3>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Category Name
                </label>
                <input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all dark:text-white"
                  placeholder="e.g. Politik"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  URL Slug
                </label>
                <input 
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all dark:text-white font-mono text-sm"
                  placeholder="e.g. politik"
                  required
                />
                <p className="text-[10px] text-slate-500 ml-1 italic">Spasi akan otomatis diubah menjadi </p>
              </div>

              {/* Action Button */}
              <button 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/30 mt-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  <>SAVE CHANGES</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}