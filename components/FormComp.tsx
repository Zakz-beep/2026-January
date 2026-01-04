"use client";
import React, { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { submitComment } from "@/app/actions/comment"; // Import action
import { Button } from "./ui/stateful-button";

export function CommentFormDemo() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  async function handleFormSubmit(formData: FormData) {
    setLoading(true);
    try {
      // 1. Validasi rating sebelum kirim
      if (rating === 0) {
        alert("Mohon berikan rating bintang terlebih dahulu!");
        throw new Error("Rating is required");
      }
  
      // 2. Panggil Server Action
      const result = await submitComment(formData, rating);
  
      // 3. Cek hasil dari result (karena server action biasanya me-return object, bukan throw)
      if (!result?.success) {
        // Jika database gagal, lempar error agar animasi centang di tombol tidak jalan
        throw new Error(result?.error || "Gagal menyimpan ke database");
      }
  
      // 4. Jika berhasil
      setRating(0); 
      if (formRef.current) formRef.current.reset(); // Reset form fisik
      
      // Opsional: Anda bisa hapus alert ini jika ingin 
      // sepenuhnya mengandalkan animasi centang pada tombol
      console.log("Komentar berhasil dikirim!");
  
    } catch (error: any) {
      // Tampilkan pesan error ke user
      alert(error.message || "Gagal mengirim komentar");
      
      // 5. Lempar kembali error-nya agar Button menjalankan 'animateError'
      throw error; 
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-input md:p-10 dark:bg-black border border-neutral-100 dark:border-white/[0.1]">
      <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
        Leave a Comment
      </h2>
      
      {/* Gunakan action prop di form */}
      <form ref={formRef} className="my-8" action={handleFormSubmit}>
        <div className="mb-4 flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <LabelInputContainer>
            <Label htmlFor="fullname">Fullname</Label>
            {/* Pastikan ada prop 'name' untuk FormData */}
            <Input id="fullname" name="fullname" placeholder="You Name" type="text" required />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="position">Call</Label>
            <Input id="position" name="position" placeholder="You Call" type="text" required />
          </LabelInputContainer>
        </div>

        <LabelInputContainer className="mb-6">
          <Label>You Rating</Label>
          <div className="flex space-x-1 pt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={28}
                  className={cn(
                    "transition-colors duration-200",
                    (hover || rating) >= star
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-neutral-300 dark:text-neutral-700"
                  )}
                />
              </button>
            ))}
          </div>
        </LabelInputContainer>

        <LabelInputContainer className="mb-8">
          <Label htmlFor="comment">Comment</Label>
          <Textarea 
            id="comment" 
            name="comment" 
            placeholder="Tulis pendapat Anda..." 
            className="min-h-[120px]"
            required
          />
        </LabelInputContainer>

        <Button
  type="button" // Gunakan type button agar tidak memicu reload halaman otomatis
  disabled={loading || rating === 0}
  className="w-full h-12 bg-black dark:bg-zinc-800"
  onClick={async () => {
    // 1. Ambil data dari form secara manual menggunakan FormData
    if (formRef.current) {
      const formData = new FormData(formRef.current);
      
      // 2. Jalankan fungsi submit dan tunggu hingga selesai (await)
      // Ini penting agar animasi sukses/centang pada Button muncul tepat waktu
      await handleFormSubmit(formData);
    }
  }}
>
  Send Comments
  <BottomGradient />
</Button>
      </form>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};