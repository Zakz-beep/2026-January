"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from '@tiptap/extension-link'; // Link Extension
import Image from '@tiptap/extension-image'; // Image Extension
import YouTube from '@tiptap/extension-youtube'; // YouTube Extension
import Placeholder from '@tiptap/extension-placeholder'; // Placeholder Extension

import { 
  Bold, Italic, List, ListOrdered, Quote, 
  Heading1, Heading2, Code, Undo, Redo, 
  ImageIcon, LinkIcon, Youtube, Eraser, AlignLeft, AlignCenter, AlignRight,
  Loader2,
  Upload
} from "lucide-react";
import { ReactNode, useCallback, useRef, useState } from "react"; // Tambah useCallback
import { createClient } from "@/utils/supabase/client";

interface MenuButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: ReactNode;
}

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

const MenuButton = ({ onClick, isActive, disabled, children }: MenuButtonProps) => (
   
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`p-2 rounded-lg transition-all active:scale-95 disabled:opacity-30 ${
      isActive 
        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
        : "bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
    }`}
  >
    {children}
  </button>
);


const Editor = ({ content, onChange }: EditorProps) => {
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Kita mau atur link dan image secara custom, jadi disable bawaannya StarterKit
        // link: false, 
        // image: false,
      }),
      Link.configure({
        openOnClick: false, // Biar gak langsung buka link pas diedit
        autolink: true, // Otomatis jadi link kalau ngetik URL
      }),
      Image.configure({
        inline: true, // Gambar bisa diatur di antara teks
        allowBase64: true, // Untuk paste gambar langsung (meskipun bukan best practice)
      }),
      YouTube.configure({
        controls: false, // Nonaktifkan controls YouTube
        nocookie: true, // Privasi lebih baik
      }),
      Placeholder.configure({
        placeholder: 'Mulai menulis artikel Anda...',
        emptyNodeClass: 'first:before:text-slate-400 first:before:float-left first:before:content-[attr(data-placeholder)] first:before:pointer-events-none first:before:h-0',
      }),
    ],
    content: content,
    immediatelyRender: false, // Solusi untuk error SSR Tiptap
    editorProps: {
      attributes: {
        class: "prose prose-slate dark:prose-invert focus:outline-none min-h-[450px] max-w-none p-6 text-slate-800 dark:text-slate-200",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Fungsi untuk menambahkan gambar
  const addImage = useCallback(() => {
    const url = window.prompt('URL Gambar:');
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  // Fungsi untuk menambahkan YouTube
  const addYoutubeVideo = useCallback(() => {
    const url = window.prompt('URL YouTube:');
    if (url) {
      editor?.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  }, [editor]);

  // Fungsi untuk menambahkan/mengubah link
  const setLink = useCallback(() => {
    if (!editor) return; // Tambahkan ini untuk handle jika editor null
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL Link:', previousUrl);

    // Dibatalkan
    if (url === null) {
      return;
    }

    // Hapus link
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // Set link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);
// FUNGSI UPLOAD KE SUPABASE
const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    try {
      setIsUploading(true);

      // 1. Buat nama file unik
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      // 2. Upload ke bucket 'article-images'
      const { data, error } = await supabase.storage
        .from('article-images')
        .upload(filePath, file);

      if (error) throw error;

      // 3. Ambil Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(filePath);

      // 4. Masukkan ke Editor Tiptap
      editor.chain().focus().setImage({ src: publicUrl }).run();

    } catch (error) {
        const err = error as Error
      alert("Gagal upload: " + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!editor) return null;

  return (
    <div className="w-full border border-slate-200 dark:border-slate-800 rounded-[24px] overflow-hidden bg-white dark:bg-slate-950 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
      {/* Toolbar Modern */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
        
        <MenuButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
          isActive={editor.isActive('heading', { level: 1 })}
        >
          <Heading1 size={19} />
        </MenuButton>

        <MenuButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
          isActive={editor.isActive('heading', { level: 2 })}
        >
          <Heading2 size={19} />
        </MenuButton>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

        <MenuButton 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          isActive={editor.isActive('bold')}
        >
          <Bold size={19} />
        </MenuButton>

        <MenuButton 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          isActive={editor.isActive('italic')}
        >
          <Italic size={19} />
        </MenuButton>

        <MenuButton 
          onClick={() => editor.chain().focus().toggleCode().run()} 
          isActive={editor.isActive('code')}
        >
          <Code size={19} />
        </MenuButton>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

        <MenuButton 
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          isActive={editor.isActive('bulletList')}
        >
          <List size={19} />
        </MenuButton>

        <MenuButton 
          onClick={() => editor.chain().focus().toggleOrderedList().run()} 
          isActive={editor.isActive('orderedList')}
        >
          <ListOrdered size={19} />
        </MenuButton>

        <MenuButton 
          onClick={() => editor.chain().focus().toggleBlockquote().run()} 
          isActive={editor.isActive('blockquote')}
        >
          <Quote size={19} />
        </MenuButton>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* --- TOMBOL MEDIA BARU --- */}
        {/* TOMBOL UPLOAD GAMBAR BARU */}
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
        />
        
        <MenuButton 
          onClick={() => fileInputRef.current?.click()} 
          disabled={isUploading}
        >
          {isUploading ? <Loader2 className="animate-spin" size={19} /> : <Upload size={19} />}
        </MenuButton>

        {/* Tombol URL tetap ada buat jaga-jaga */}
        <MenuButton onClick={() => {
          const url = window.prompt('URL Gambar:');
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }}>
          <ImageIcon size={19} />
        </MenuButton>
        <MenuButton onClick={setLink} isActive={editor.isActive('link')}>
          <LinkIcon size={19} />
        </MenuButton>
        <MenuButton onClick={addYoutubeVideo}>
          <Youtube size={19} />
        </MenuButton>
        
        <div className="grow" />

        <MenuButton 
          onClick={() => editor.chain().focus().undo().run()} 
          disabled={!editor.can().undo()}
        >
          <Undo size={19} />
        </MenuButton>

        <MenuButton 
          onClick={() => editor.chain().focus().redo().run()} 
          disabled={!editor.can().redo()}
        >
          <Redo size={19} />
        </MenuButton>
      </div>

      {/* Editor Content */}
      <div className="bg-white dark:bg-slate-950">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default Editor;