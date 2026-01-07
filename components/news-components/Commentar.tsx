"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";

// 1. Interfaces
interface Discussion {
  id: string;
  article_id: string;
  user_id: string;
  message: string;
  created_at: string;
  user: { display_name: string } | null;
}

export default function Commentar({ articleId }: { articleId: string }) {
  const supabase = createClient();
  
  // 2. States
  const [comments, setComments] = useState<Discussion[]>([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // 3. Fungsi Fetch (Gunakan useCallback biar stabil)
  const fetchComments = useCallback(async () => {
    if (!articleId) return;
    
    console.log("Fetching comments for ID:", articleId);
    
   // Pas bagian select, ganti email jadi display_name
const { data, error } = await supabase
.from("article_discussions")
.select(`
  id,
  article_id,
  user_id,
  message,
  created_at,
  user:user_accounts (display_name) -- AMBIL DISPLAY NAME
`)
.eq("article_id", articleId)
.order("created_at", { ascending: false });

// ... (mapping data tetep sama)

    if (error) {
      console.error("Fetch Error:", error.message);
    } else {
      console.log("Data dari Supabase:", data);
      
      // Mapping untuk handle join yang mungkin berbentuk array
      const formatted: Discussion[] = (data || []).map((item: any) => ({
        ...item,
        user: Array.isArray(item.user) ? item.user[0] : item.user
      }));
      
      setComments(formatted);
    }
    setIsFetching(false);
  }, [articleId, supabase]);

  // 4. Effect untuk Inisialisasi
  useEffect(() => {
    const init = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
      await fetchComments();
    };

    init();
  }, [fetchComments, supabase.auth]);

  // 5. Handle Post
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setLoading(true);
    const { error } = await supabase
      .from("article_discussions")
      .insert([
        {
          article_id: articleId,
          user_id: user.id,
          message: newComment,
        },
      ]);

    if (!error) {
      setNewComment("");
      console.log("Komentar terkirim, merefresh...");
      await fetchComments(); // Tarik data terbaru
    } else {
      console.error("Insert Error:", error.message);
      alert("Gagal kirim komentar");
    }
    setLoading(false);
  };

  // 6. UI Render
  if (isFetching) return <div className="py-10 text-center text-slate-500">Memuat diskusi...</div>;

  return (
    <div className="mt-12 border-t pt-10 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-8 text-2xl font-bold">
        <MessageSquare className="text-blue-600" />
        <h3>Diskusi ({comments.length})</h3>
      </div>

      {/* Form Input */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-10">
          <textarea
            className="w-full p-4 rounded-xl border dark:bg-slate-900 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 dark:text-slate-200"
            placeholder="Tulis pendapat lu..."
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Mengirim..." : "Kirim Pesan"}
          </button>
        </form>
      ) : (
        <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl mb-10 text-center">
          Login untuk ikut berdiskusi.
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border dark:border-slate-800">
              <div className="flex justify-between mb-2">
              <span className="text-sm font-bold text-blue-500">
  {comment.user?.display_name || "Pembaca Anonim"}
</span>
                <span className="text-[10px] text-slate-400">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: localeId })}
                </span>
              </div>
              <p className="text-sm dark:text-slate-300">{comment.message}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-10 border-2 border-dashed rounded-xl border-slate-200 dark:border-slate-800">
            <p className="text-slate-400">Belum ada komentar di sini.</p>
          </div>
        )}
      </div>
    </div>
  );
}