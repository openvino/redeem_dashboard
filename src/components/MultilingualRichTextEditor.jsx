import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Controller } from "react-hook-form";
import { useState, useEffect, useRef, useCallback } from "react";

const LANGS = [
  { code: "es", label: "ES" },
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
  { code: "ca", label: "CA" },
  { code: "pt", label: "PT" },
];

function ToolbarBtn({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`px-2 py-1 text-sm rounded border transition-colors ${
        active
          ? "bg-[#840C4A] text-white border-[#840C4A]"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

function LangEditor({ initialContent, onChange, disabled, visible }) {
  const [showLink, setShowLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const contentSet = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
    ],
    content: "",
    editable: !disabled,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Set content when it arrives from DB (only once per mount)
  useEffect(() => {
    if (editor && initialContent && !contentSet.current) {
      editor.commands.setContent(initialContent, false);
      contentSet.current = true;
    }
  }, [editor, initialContent]);

  const applyLink = useCallback(() => {
    if (linkUrl && linkUrl !== "https://") {
      editor?.chain().focus().setLink({ href: linkUrl }).run();
    }
    setShowLink(false);
    setLinkUrl("https://");
  }, [editor, linkUrl]);

  if (!editor) return null;

  return (
    <div style={{ display: visible ? undefined : "none" }}>
      {!disabled && (
        <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-200">
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Negrita"
          >
            <b>B</b>
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Cursiva"
          >
            <i>I</i>
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => {
              if (editor.isActive("link")) {
                editor.chain().focus().unsetLink().run();
              } else {
                setShowLink(true);
              }
            }}
            active={editor.isActive("link")}
            title={editor.isActive("link") ? "Quitar enlace" : "Agregar enlace"}
          >
            🔗
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Lista"
          >
            ☰
          </ToolbarBtn>
        </div>
      )}
      {showLink && (
        <div className="flex items-center gap-2 p-2 bg-amber-50 border-b border-gray-200">
          <input
            autoFocus
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyLink();
              if (e.key === "Escape") setShowLink(false);
            }}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#840C4A]"
            placeholder="https://..."
          />
          <button
            type="button"
            onClick={applyLink}
            className="px-3 py-1 text-sm bg-[#840C4A] text-white rounded"
          >
            OK
          </button>
          <button
            type="button"
            onClick={() => setShowLink(false)}
            className="px-3 py-1 text-sm bg-gray-200 rounded"
          >
            ✕
          </button>
        </div>
      )}
      <EditorContent
        editor={editor}
        className="min-h-[160px] px-3 py-2 prose-editor"
      />
    </div>
  );
}

export function MultilingualRichTextEditor({ control, name, disabled }) {
  const [activeLang, setActiveLang] = useState("es");

  return (
    <>
      <style>{`
        .prose-editor .ProseMirror { outline: none; min-height: 140px; }
        .prose-editor .ProseMirror p { margin: 0 0 0.5em; }
        .prose-editor .ProseMirror a { color: #840C4A; text-decoration: underline; cursor: pointer; }
        .prose-editor .ProseMirror ul { list-style: disc; padding-left: 1.25em; margin: 0 0 0.5em; }
        .prose-editor .ProseMirror strong { font-weight: 700; }
        .prose-editor .ProseMirror em { font-style: italic; }
      `}</style>
      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange } }) => {
          let parsed = {};
          try {
            if (value) parsed = JSON.parse(value);
          } catch {}

          const handleChange = (lang, html) => {
            onChange(JSON.stringify({ ...parsed, [lang]: html }));
          };

          return (
            <div className="border border-gray-300 rounded-md overflow-hidden">
              {/* Language tabs */}
              <div className="flex border-b border-gray-200 bg-gray-50">
                {LANGS.map(({ code, label }) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setActiveLang(code)}
                    className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                      activeLang === code
                        ? "bg-white text-[#840C4A] border-b-2 border-[#840C4A] -mb-px"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {/* All editors mounted; only active one is visible */}
              {LANGS.map(({ code }) => (
                <LangEditor
                  key={code}
                  initialContent={parsed[code] || ""}
                  onChange={(html) => handleChange(code, html)}
                  disabled={disabled}
                  visible={code === activeLang}
                />
              ))}
            </div>
          );
        }}
      />
    </>
  );
}
