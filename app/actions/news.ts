"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createNewsAction(formData: FormData, content: string) {
  const supabase = await createClient();

  // 1. Ambil data dari FormData
  const title = formData.get("title") as string;
  const status = formData.get("status") as string;
  const rawCategoryId = formData.get("category_id");

  // 2. Perbaikan Tipe Data category_id (Convert String ke Number/Integer)
  // Jika kosong, set jadi null agar tidak melanggar foreign key
  const categoryId = rawCategoryId && rawCategoryId !== "" 
    ? parseInt(rawCategoryId.toString()) 
    : null;

  // 3. Mapping data sesuai skema tabel 'posts'
  const rawFormData = {
    title: title,
    // Generate slug otomatis dari judul
    slug: title
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, ""),
    content: content, 
    excerpt: formData.get("excerpt") || null,
    featured_image: formData.get("featured_image") || null,
    category_id: categoryId, // Sekarang sudah tipe int8 (number)
    status: status || "draft",
    published_at: status === "published" ? new Date().toISOString() : null,
  };

  // 4. Insert ke tabel 'posts'
  const { error } = await supabase
    .from("posts")
    .insert([rawFormData]);

  if (error) {
    console.error("Supabase Error:", error.message);
    // Jika error karena slug duplikat, beri pesan yang jelas
    if (error.code === '23505') {
      return { success: false, error: "Judul/Slug sudah ada, gunakan judul lain." };
    }
    return { success: false, error: error.message };
  }

  // 5. Revalidate cache
  revalidatePath("/admin/dashboard");
  revalidatePath("/news");

  return { success: true };
}