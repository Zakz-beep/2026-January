"use server";
import { createClient } from "@/utils/supabase/server"; // Sesuaikan path utils supabase Anda
import { revalidatePath } from "next/cache";

export async function submitComment(formData: FormData, rating: number) {
  const supabase = await createClient();

  const rawFormData = {
    fullname: formData.get("fullname"),
    position: formData.get("position"),
    comment: formData.get("comment"),
    rating: rating,
  };

  const { data, error } = await supabase
    .from("comments")
    .insert([rawFormData])
    .select();

  if (error) {
    throw new Error(error.message);
  }

  // Refresh halaman agar data terbaru muncul (jika ada list comment di bawahnya)
  revalidatePath("/");
  
  return { success: true };
}