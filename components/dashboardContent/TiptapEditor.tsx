"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Toolbar from "./Toolbar";

// Mendefinisikan interface untuk Props
interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const TiptapEditor = ({ content, onChange }: TiptapEditorProps) => {
    const editor = useEditor({
        extensions: [StarterKit],
        content: content,
        // Tambahkan baris ini untuk mengatasi error SSR
        immediatelyRender: false, 
        onUpdate: ({ editor }) => {
          onChange(editor.getHTML());
        },
        editorProps: {
          attributes: {
            class: "prose focus:outline-none min-h-[400px] p-4",
          },
        },
      });

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;