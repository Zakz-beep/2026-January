"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { 
  Loader2, Send, ArrowLeft, Image as ImageIcon, 
  Tag, FileText, Type, Eye, X, Monitor, Smartphone, 
  Upload
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

// UI Components (Shadcn)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Editor from "@/components/dashboardContent/Editor";

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
}

type ArticleStatus = "draft" | "published" | "archived";

export default function PostArticle() {
  const supabase = createClient();
  const router = useRouter();

  // Common States
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Form States
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [status, setStatus] = useState<ArticleStatus>("draft");
  const featuredFileInputRef = useRef<HTMLInputElement>(null);
const [isUploadingFeatured, setIsUploadingFeatured] = useState(false);
const [uploadMethod, setUploadMethod] = useState<"url" | "upload">("upload");

  // Load Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("name", { ascending: true });

        if (error) throw error;
        if (data) setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Gagal memuat kategori");
      }
    };
    fetchCategories();
  }, [supabase]);

  const generateSlug = (text: string) => {
    return (
      text
        .toLowerCase()
        .replace(/[^\w ]+/g, "")
        .replace(/ +/g, "-") +
      "-" +
      Date.now().toString().slice(-4)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Silahkan login ulang");

      const slug = generateSlug(title);

      const { error } = await supabase.from("articles").insert({
        title,
        slug,
        content,
        excerpt: excerpt || (content ? content.replace(/<[^>]*>/g, '').substring(0, 150) + "..." : ""),
        featured_image: featuredImage,
        category_id: categoryId || null,
        author_id: user.id,
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
      });

      if (error) throw error;

      alert("Artikel Berhasil Dibuat!");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      const err = error as Error;
      setError(err.message || "Gagal membuat artikel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="container max-w-6xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="shrink-0">
              <Link href="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Write Article</h1>
              <p className="text-sm text-muted-foreground mt-1 hidden sm:block">
                Create and publish your news content
              </p>
            </div>
          </div>
          
          <Button 
            type="button"
            variant="outline" 
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" /> Preview
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Type className="w-5 h-5 text-blue-600" />
                    Article Title
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    required
                    placeholder="Enter article title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg font-semibold h-12"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Excerpt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    rows={3}
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Brief summary (optional)..."
                    className="resize-none"
                  />
                </CardContent>
              </Card>

              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0">
                  <CardTitle className="flex items-center gap-2 text-lg font-black uppercase tracking-tight">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Article Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                  <Editor content={content} onChange={setContent} />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Settings */}
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle className="text-lg">Publish Settings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={status} onValueChange={(v: ArticleStatus) => setStatus(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">📁 Draft</SelectItem>
                        <SelectItem value="published">🚀 Published</SelectItem>
                        <SelectItem value="archived">📦 Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Tag className="w-4 h-4" /> Category</Label>
                    <Select required value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
  <CardHeader className="pb-3">
    <CardTitle className="text-lg flex items-center justify-between">
      <div className="flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-blue-600" /> 
        Featured Image
      </div>
      {/* Tab Switcher Kecil */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
        <button 
          type="button"
          onClick={() => setUploadMethod("upload")}
          className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${uploadMethod === "upload" ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-500"}`}
        >
          File
        </button>
        <button 
          type="button"
          onClick={() => setUploadMethod("url")}
          className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${uploadMethod === "url" ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-500"}`}
        >
          URL
        </button>
      </div>
    </CardTitle>
  </CardHeader>
  
  <CardContent className="space-y-4">
    {uploadMethod === "url" ? (
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase text-slate-400">Image URL</Label>
        <Input 
          type="url" 
          value={featuredImage} 
          onChange={(e) => setFeaturedImage(e.target.value)} 
          placeholder="https://..." 
          className="bg-slate-50 dark:bg-slate-900 border-none focus-visible:ring-1 focus-visible:ring-blue-500"
        />
      </div>
    ) : (
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase text-slate-400">Upload dari Perangkat</Label>
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={featuredFileInputRef}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            
            try {
              setIsUploadingFeatured(true);
              const fileExt = file.name.split('.').pop();
              const fileName = `featured-${Date.now()}.${fileExt}`;
              const filePath = `featured/${fileName}`;

              const { error: uploadError } = await supabase.storage
                .from('article-images')
                .upload(filePath, file);

              if (uploadError) throw uploadError;

              const { data: { publicUrl } } = supabase.storage
                .from('article-images')
                .getPublicUrl(filePath);

              setFeaturedImage(publicUrl);
            } catch (err) {
                const error = err as Error
              alert("Gagal upload: " + error.message);
            } finally {
              setIsUploadingFeatured(false);
            }
          }}
        />
        
        {featuredImage ? (
          <div className="group relative aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-800">
            <img src={featuredImage} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button 
                type="button"
                variant="secondary" 
                size="sm" 
                onClick={() => featuredFileInputRef.current?.click()}
              >
                Ganti Gambar
              </Button>
              <Button 
                type="button"
                variant="destructive" 
                size="sm" 
                onClick={() => setFeaturedImage("")}
              >
                Hapus
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={isUploadingFeatured}
            onClick={() => featuredFileInputRef.current?.click()}
            className="w-full aspect-video rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all text-slate-400 hover:text-blue-500"
          >
            {isUploadingFeatured ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold">Pilih Gambar</span>
              </>
            )}
          </button>
        )}
      </div>
    )}

    {featuredImage && uploadMethod === "url" && (
      <div className="aspect-video rounded-xl overflow-hidden border bg-slate-100 dark:bg-slate-900">
        <img src={featuredImage} alt="Preview URL" className="w-full h-full object-cover" />
      </div>
    )}
  </CardContent>
</Card>

              <Button disabled={loading} type="submit" className="w-full h-12 text-base font-bold shadow-lg shadow-blue-500/20" size="lg">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {status === "published" ? "Publish Article" : "Save as " + status}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* MODAL PREVIEW */}
      <AnimatePresence>
        {showPreview && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background overflow-y-auto"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-md">
              <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
                <Button variant={previewDevice === "desktop" ? "secondary" : "ghost"} size="sm" onClick={() => setPreviewDevice("desktop")}><Monitor className="w-4 h-4" /></Button>
                <Button variant={previewDevice === "mobile" ? "secondary" : "ghost"} size="sm" onClick={() => setPreviewDevice("mobile")}><Smartphone className="w-4 h-4" /></Button>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)}><X /></Button>
            </div>

            <div className={`mx-auto py-12 px-6 transition-all ${previewDevice === "mobile" ? "max-w-[375px] border-x min-h-screen shadow-2xl" : "max-w-4xl"}`}>
              <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">{title || "Untitled Article"}</h1>
              {featuredImage && <img src={featuredImage} className="w-full aspect-video object-cover rounded-[32px] mb-8 shadow-xl" alt="" />}
              <div 
                className="prose prose-slate dark:prose-invert prose-lg max-w-none prose-headings:font-black prose-img:rounded-3xl"
                dangerouslySetInnerHTML={{ __html: content }} 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}