"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

interface ScriptEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ScriptEditor({
  value,
  onChange,
  placeholder = "This is to inform you about ...",
}: ScriptEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [selectedFormat, setSelectedFormat] = useState("p");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right" | "justify">("left");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  // Sync initial content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
      updateStats(value || "");
    }
  }, [value]);

  const updateStats = (html: string) => {
    if (typeof window === "undefined") return;
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(text.length);
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    onChange(html);
    updateStats(html);
  };

  const exec = useCallback((command: string, val: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, val);
    handleInput();
  }, []);

  const handleFormatBlock = (tag: string) => {
    setSelectedFormat(tag);
    if (tag === "p") {
      exec("formatBlock", "<p>");
    } else if (tag.startsWith("h")) {
      exec("formatBlock", `<${tag}>`);
    } else if (tag === "blockquote") {
      exec("formatBlock", "<blockquote>");
    } else if (tag === "pre") {
      exec("formatBlock", "<pre>");
    }
  };

  const handleAlign = () => {
    const nextAlign =
      textAlign === "left"
        ? "center"
        : textAlign === "center"
        ? "right"
        : textAlign === "right"
        ? "justify"
        : "left";
    setTextAlign(nextAlign);
    if (nextAlign === "left") exec("justifyLeft");
    else if (nextAlign === "center") exec("justifyCenter");
    else if (nextAlign === "right") exec("justifyRight");
    else if (nextAlign === "justify") exec("justifyFull");
  };

  const handleInsertLink = () => {
    const url = prompt("Enter URL:", "https://");
    if (url) exec("createLink", url);
  };

  const handleInsertImage = () => {
    const url = prompt("Enter image URL:", "https://images.unsplash.com/...");
    if (url) exec("insertImage", url);
  };

  const handleInsertVideo = () => {
    const url = prompt("Enter YouTube / Video URL:", "https://www.youtube.com/watch?v=...");
    if (url) {
      const videoCue = `<div style="background:#f1ede6;padding:10px 14px;border-left:4px solid #ff5338;border-radius:6px;margin:8px 0;font-family:monospace;font-size:12px;"><strong>🎬 VIDEO CUE:</strong> <a href="${url}" target="_blank" rel="noreferrer" style="color:#ff5338;text-decoration:underline;">${url}</a></div><p><br></p>`;
      exec("insertHTML", videoCue);
    }
  };

  // Estimate speaking time based on 140 words per minute (creator average)
  const estimatedSeconds = Math.ceil((wordCount / 140) * 60);
  const minutes = Math.floor(estimatedSeconds / 60);
  const seconds = estimatedSeconds % 60;
  const timeFormatted =
    minutes > 0
      ? `${minutes}m ${seconds.toString().padStart(2, "0")}s`
      : `${seconds}s`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-[#1E1A17] dark:text-[#FAF8F5] tracking-tight">
          Content
        </label>
        <div className="flex items-center gap-3 text-[11px] font-medium text-[#58524C] dark:text-[#A89F95]">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{charCount} characters</span>
          <span>•</span>
          <span className="text-[#FF5338] font-bold">~{timeFormatted} speaking time</span>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E3DCD3] dark:border-[#3C3530] bg-white dark:bg-[#1E1A17] shadow-xs overflow-hidden focus-within:ring-2 focus-within:ring-[#FF5338]/30 transition-all">
        {/* Toolbar Header matching attached image */}
        <div className="px-4 py-3 bg-[#FAF8F5] dark:bg-[#221E1A] border-b border-[#E3DCD3] dark:border-[#3C3530] flex flex-wrap items-center gap-x-2.5 gap-y-2 select-none">
          {/* Row 1 Basic Styling: B, I, U, S */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Bold"
              onMouseDown={(e) => {
                e.preventDefault();
                exec("bold");
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-[#4A443E] dark:text-[#D1C9BE] hover:bg-[#EBE5DC] dark:hover:bg-[#2E2823] transition-colors"
            >
              B
            </button>
            <button
              type="button"
              title="Italic"
              onMouseDown={(e) => {
                e.preventDefault();
                exec("italic");
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center italic font-serif text-sm text-[#4A443E] dark:text-[#D1C9BE] hover:bg-[#EBE5DC] dark:hover:bg-[#2E2823] transition-colors"
            >
              I
            </button>
            <button
              type="button"
              title="Underline"
              onMouseDown={(e) => {
                e.preventDefault();
                exec("underline");
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center underline text-sm text-[#4A443E] dark:text-[#D1C9BE] hover:bg-[#EBE5DC] dark:hover:bg-[#2E2823] transition-colors"
            >
              U
            </button>
            <button
              type="button"
              title="Strikethrough"
              onMouseDown={(e) => {
                e.preventDefault();
                exec("strikeThrough");
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center line-through text-sm text-[#4A443E] dark:text-[#D1C9BE] hover:bg-[#EBE5DC] dark:hover:bg-[#2E2823] transition-colors"
            >
              S
            </button>
          </div>

          <div className="h-5 w-px bg-[#E3DCD3] dark:bg-[#3C3530]" />

          {/* Heading / Normal Dropdown matching attached image */}
          <div className="relative inline-flex items-center">
            <select
              aria-label="Text Format"
              value={selectedFormat}
              onChange={(e) => handleFormatBlock(e.target.value)}
              className="h-8 px-2.5 pr-7 rounded-lg border border-[#E3DCD3] dark:border-[#3C3530] bg-white dark:bg-[#1E1A17] text-xs font-semibold text-[#4A443E] dark:text-[#D1C9BE] appearance-none focus:outline-none focus:ring-1 focus:ring-[#FF5338] cursor-pointer"
            >
              <option value="p">Normal</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="blockquote">Quote Block</option>
              <option value="pre">Code / Monospace</option>
            </select>
            <div className="absolute right-2 pointer-events-none flex flex-col items-center justify-center text-[#8C8379]">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </div>
          </div>

          <div className="h-5 w-px bg-[#E3DCD3] dark:bg-[#3C3530]" />

          {/* Lists: Ordered & Unordered */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Numbered List"
              onMouseDown={(e) => {
                e.preventDefault();
                exec("insertOrderedList");
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#4A443E] dark:text-[#D1C9BE] hover:bg-[#EBE5DC] dark:hover:bg-[#2E2823] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 6h13M7 12h13M7 18h13M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
            </button>
            <button
              type="button"
              title="Bullet List"
              onMouseDown={(e) => {
                e.preventDefault();
                exec("insertUnorderedList");
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#4A443E] dark:text-[#D1C9BE] hover:bg-[#EBE5DC] dark:hover:bg-[#2E2823] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6h11M9 12h11M9 18h11M4 6h1.5M4 12h1.5M4 18h1.5" />
              </svg>
            </button>
          </div>

          <div className="h-5 w-px bg-[#E3DCD3] dark:bg-[#3C3530]" />

          {/* Subscript & Superscript: x₂ & x² */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Subscript (x₂)"
              onMouseDown={(e) => {
                e.preventDefault();
                exec("subscript");
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold text-[#4A443E] dark:text-[#D1C9BE] hover:bg-[#EBE5DC] dark:hover:bg-[#2E2823] transition-colors"
            >
              <span>x</span>
              <span className="text-[10px] translate-y-1">₂</span>
            </button>
            <button
              type="button"
              title="Superscript (x²)"
              onMouseDown={(e) => {
                e.preventDefault();
                exec("superscript");
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold text-[#4A443E] dark:text-[#D1C9BE] hover:bg-[#EBE5DC] dark:hover:bg-[#2E2823] transition-colors"
            >
              <span>x</span>
              <span className="text-[10px] -translate-y-1">²</span>
            </button>
          </div>

          <div className="h-5 w-px bg-[#E3DCD3] dark:bg-[#3C3530]" />

          {/* Quote & Code: ” & </> */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Blockquote"
              onMouseDown={(e) => {
                e.preventDefault();
                handleFormatBlock("blockquote");
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-base font-serif font-black text-[#4A443E] dark:text-[#D1C9BE] hover:bg-[#EBE5DC] dark:hover:bg-[#2E2823] transition-colors"
            >
              ”
            </button>
            <button
              type="button"
              title="Code Block"
              onMouseDown={(e) => {
                e.preventDefault();
                handleFormatBlock("pre");
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold text-[#4A443E] dark:text-[#D1C9BE] hover:bg-[#EBE5DC] dark:hover:bg-[#2E2823] transition-colors"
            >
              &lt;/&gt;
            </button>
          </div>

          <div className="h-5 w-px bg-[#E3DCD3] dark:bg-[#3C3530]" />

          {/* Row 2 Tools: Link, Image, Video, Alignment, Clear formatting */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Insert Link"
              onMouseDown={(e) => {
                e.preventDefault();
                handleInsertLink();
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#4A443E] dark:text-[#D1C9BE] hover:bg-[#EBE5DC] dark:hover:bg-[#2E2823] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </button>
            <button
              type="button"
              title="Insert Image"
              onMouseDown={(e) => {
                e.preventDefault();
                handleInsertImage();
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#4A443E] dark:text-[#D1C9BE] hover:bg-[#EBE5DC] dark:hover:bg-[#2E2823] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              type="button"
              title="Insert Video Cue"
              onMouseDown={(e) => {
                e.preventDefault();
                handleInsertVideo();
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#4A443E] dark:text-[#D1C9BE] hover:bg-[#EBE5DC] dark:hover:bg-[#2E2823] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              type="button"
              title={`Align (Current: ${textAlign})`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleAlign();
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#4A443E] dark:text-[#D1C9BE] hover:bg-[#EBE5DC] dark:hover:bg-[#2E2823] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h14" />
              </svg>
            </button>
            <button
              type="button"
              title="Clear Formatting (Tₓ)"
              onMouseDown={(e) => {
                e.preventDefault();
                exec("removeFormat");
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-[#8C8379] hover:bg-[#EBE5DC] dark:hover:bg-[#2E2823] transition-colors"
            >
              <span>T</span>
              <span className="text-[10px] translate-y-1">x</span>
            </button>
          </div>
        </div>

        {/* Content Editable Writing Area */}
        <div className="relative min-h-[440px] p-6 bg-white dark:bg-[#1E1A17]">
          {(!value || value === "<br>" || value === "<p></p>") && (
            <div className="absolute top-6 left-6 text-sm text-[#8C8379]/60 pointer-events-none select-none">
              {placeholder}
            </div>
          )}
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="w-full min-h-[420px] text-sm text-[#1E1A17] dark:text-[#FAF8F5] focus:outline-none leading-relaxed space-y-3 prose dark:prose-invert max-w-none"
            style={{
              outline: "none",
            }}
          />
        </div>

        {/* Script Editor Footer Bar */}
        <div className="px-5 py-2.5 bg-[#FAF8F5] dark:bg-[#221E1A] border-t border-[#E3DCD3]/70 dark:border-[#3C3530]/70 flex items-center justify-between text-xs text-[#8C8379]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#059669]" />
            <span className="font-semibold text-[#58524C] dark:text-[#A89F95]">
              Real-time Script Editor
            </span>
          </div>
          <span className="text-[11px] font-mono">
            Pro-tip: Use ⌘B for Bold, ⌘I for Italic, ⌘U for Underline
          </span>
        </div>
      </div>
    </div>
  );
}
