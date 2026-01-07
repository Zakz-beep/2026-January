import React from 'react';
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from 'next/link';
import { Eye } from 'lucide-react';

// Import komponen global lu
import Header from '@/components/news-components/Header';
import Image from 'next/image';

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const supabase = await createClient();
  const { slug } = await params;

  // 1. Ambil data kategori
  const { data: category } = await supabase
    .from("categories")
    .select("id, name")
    .eq("slug", slug)
    .single();

  if (!category) return notFound();

  // 2. Ambil artikel sesuai kategori (Struktur data disamakan dengan Content lu)
  const { data: articles } = await supabase
    .from("articles")
    .select(`
      id, title, slug, featured_image, created_at, excerpt, view_count,
      categories (name)
    `)
    .eq("category_id", category.id)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-50">
      
      {/* Header tetap di paling atas */}
      <Header />

      {/* Main Content dengan padding sesuai NewsHomepage lu */}
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 pt-24">
        
        {/* Judul Kategori (Pengganti Headline) */}
        <section className="max-w-7xl mx-auto">
          <h3 className="mb-8 text-2xl font-black border-l-4 border-blue-600 pl-4 uppercase tracking-tight">
            Kategori: {category.name}
          </h3>
          
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {articles && articles.length > 0 ? (
              articles.map((article) => (
                <Link 
                  href={`/blog/${article.slug}`} 
                  key={article.id} 
                  className="group cursor-pointer flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl dark:bg-slate-900 border dark:border-slate-800"
                >
                  {/* Gambar Thumbnail */}
                  <div className="relative h-52 w-full overflow-hidden bg-black">
                    {article.featured_image ? (
                      <div className="relative h-full w-full overflow-hidden">
                      <Image
                        src={article.featured_image}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-widest italic">No Image</span>
                      </div>
                    )}

                    {/* Badge Kategori */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1 rounded-md uppercase">
                        {category.name}
                      </span>
                    </div>

                    {/* View Count */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg text-white border border-white/10 shadow-lg">
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-xs font-bold tabular-nums">
                        {article.view_count?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                  
                  {/* Body Card */}
                  <div className="flex flex-col flex-1 p-6">
                    <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <span>{format(new Date(article.created_at), 'dd MMM yyyy')}</span>
                    </div>
                    
                    <h4 className="mb-3 text-xl font-bold leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {article.title}
                    </h4>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {article.excerpt || "Klik untuk membaca selengkapnya mengenai berita ini..."}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <p className="text-slate-500 italic">Belum ada berita di kategori ini.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      
    </div>
  );
}