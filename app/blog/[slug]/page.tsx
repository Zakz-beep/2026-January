"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";
import { Eye, Calendar, ChevronLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // 1. Import Image dari Next.js
import CommentSection from "@/components/news-components/Commentar";
import { LoaderOne } from "@/components/ui/loader";

// Types
interface Category {
  name: string;
}

interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  featured_image: string | null;
  view_count: number;
  created_at: string;
  categories: Category | null;
}

interface BlogDetailProps {
  params: Promise<{ slug: string }>;
}

// Custom Hook untuk logic artikel + Rekomendasi
function useArticleData(slug: string) {
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]); // State untuk rekomendasi
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchArticleAndRelated = async () => {
      try {
        // 1. Fetch Artikel Utama
        const { data: articleData, error: fetchError } = await supabase
          .from("articles")
          .select("*, categories(name)")
          .eq("slug", slug)
          .single();

        if (fetchError) throw fetchError;
        
        // Simpan data artikel sementara
        const currentArticle = articleData as Article;
        setArticle(currentArticle);

        // 2. Fetch Artikel Rekomendasi (Berdasarkan Kategori yang sama)
        if (currentArticle.categories?.name) {
          const { data: relatedData } = await supabase
            .from("articles")
            .select("title, slug, featured_image, created_at, categories!inner(name)")
            .eq("categories.name", currentArticle.categories.name) // Filter kategori sama
            .neq("id", currentArticle.id) // Jangan ambil artikel yang sedang dibaca
            .eq("status", "published") // Pastikan status published (opsional)
            .limit(3); // Ambil 3 saja

          setRelatedArticles((relatedData as unknown as Article[]) || []);
        }

        // 3. Increment View Count (Logic tetap sama)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("article_views")
            .insert([{ article_id: currentArticle.id, user_id: user.id }])
            .then(async ({ error }) => {
                if(!error) {
                    const newCount = (currentArticle.view_count || 0) + 1;
                    await supabase
                        .from("articles")
                        .update({ view_count: newCount })
                        .eq("id", currentArticle.id);
                    setArticle(prev => prev ? { ...prev, view_count: newCount } : null);
                }
            });
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticleAndRelated();
    }
  }, [slug]);

  return { article, relatedArticles, loading };
}

// Component untuk Header Artikel
function ArticleHeader({ article }: { article: Article }) {
  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center gap-3">
        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
          {article.categories?.name || "Uncategorized"}
        </span>
      </div>
      
      <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] text-slate-900 dark:text-white">
        {article.title}
      </h1>
      
      <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 border-y py-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          {format(new Date(article.created_at), 'dd MMMM yyyy')}
        </div>
        <div className="flex items-center gap-2">
          <Eye size={16} />
          {article.view_count} Views
        </div>
      </div>
    </div>
  );
}

// 2. Component Featured Image menggunakan Next/Image
function FeaturedImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative w-full aspect-video rounded-3xl overflow-hidden mb-12 shadow-2xl bg-slate-100 dark:bg-slate-900">
      <Image 
        src={src} 
        alt={alt} 
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
        className="object-cover hover:scale-105 transition-transform duration-700"
        priority // Priority true karena ini gambar utama (LCP)
      />
    </div>
  );
}

// Component untuk Article Content
function ArticleContent({ content }: { content: string }) {
  return (
    <div 
      className="prose prose-lg dark:prose-invert prose-blue max-w-none 
      prose-img:rounded-2xl prose-headings:font-black prose-a:text-blue-600 mb-20"
      dangerouslySetInnerHTML={{ __html: content }} 
    />
  );
}

// 3. Component Baru: Rekomendasi Berita
function RecommendedNews({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;

  return (
    <div className="border-t border-slate-200 dark:border-slate-800 pt-10 mt-10">
      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        Baca Juga <ArrowRight className="w-5 h-5 text-blue-600" />
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((item) => (
          <Link 
            href={`/blog/${item.slug}`} 
            key={item.id}
            className="group block"
          >
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-900">
              {item.featured_image ? (
                <Image
                  src={item.featured_image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400">
                    No Image
                </div>
              )}
            </div>
            <div className="space-y-2">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                    {item.categories?.name}
                </span>
                <h4 className="font-bold text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                {item.title}
                </h4>
                <p className="text-xs text-slate-500">
                {format(new Date(item.created_at), 'dd MMM yyyy')}
                </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Component untuk Back Button
function BackButton() {
  return (
    <Link 
      href="/news" 
      className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-8"
    >
      <ChevronLeft size={16} /> Kembali ke Beranda
    </Link>
  );
}

// Main Component
export default function BlogDetail({ params }: BlogDetailProps) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  // Ambil relatedArticles dari hook
  const { article, relatedArticles, loading } = useArticleData(slug);

  if (loading) {
    return <LoaderOne />;
  }

  if (!article) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-500">
        Artikel tidak ditemukan.
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-white dark:bg-slate-950 pb-20">
      <div className="max-w-3xl mx-auto px-4 pt-10">
        <BackButton />
        <ArticleHeader article={article} />
        
        {article.featured_image && (
          <FeaturedImage src={article.featured_image} alt={article.title} />
        )}
        
        <ArticleContent content={article.content} />

        {/* 4. Render Komponen Rekomendasi */}
        <RecommendedNews articles={relatedArticles} />
        
        <div className="pt-10">
            <CommentSection articleId={article.id} />
        </div>
      </div>
    </article>
  );
}