"use client";

import { Editor } from "@tiptap/react";
import { Bold, Italic, List, Heading2, Quote } from "lucide-react";

export default function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <div className="flex gap-2 p-2 border-b bg-gray-50">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded ${editor.isActive("bold") ? "bg-blue-100 text-blue-600" : ""}`}
      >
        <Bold size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded ${editor.isActive("heading") ? "bg-blue-100 text-blue-600" : ""}`}
      >
        <Heading2 size={18} />
      </button>
      {/* Tambahkan tombol lain sesuai kebutuhan */}
    </div>
  );
}