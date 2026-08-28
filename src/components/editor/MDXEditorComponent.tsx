"use client";

import React, { useRef } from "react";
import {
  MDXEditor,
  MDXEditorMethods,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  tablePlugin,
  imagePlugin,
  linkPlugin,
  linkDialogPlugin,
  diffSourcePlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CodeToggle,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertCodeBlock,
  InsertThematicBreak,
  ListsToggle,
  ConditionalContents,
  ChangeCodeMirrorLanguage,
  DiffSourceToggleWrapper,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

export interface MDXEditorComponentProps {
  markdown: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export default function MDXEditorComponent({
  markdown,
  onChange,
  placeholder = "Bắt đầu soạn thảo nội dung bài viết với MDXEditor...",
  className = "",
  minHeight = "480px",
}: MDXEditorComponentProps) {
  const editorRef = useRef<MDXEditorMethods>(null);

  // Upload handler tự động kết nối với API upload của Lab
  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.url) {
        return json.url;
      }
      throw new Error(json.error || "Lỗi khi tải ảnh lên server");
    } catch (e: any) {
      alert(`Lỗi upload ảnh: ${e.message}`);
      return "";
    }
  };

  return (
    <div
      className={`rounded-2xl border border-border/80 bg-bg-panel shadow-xl overflow-hidden lab-mdxeditor-wrapper ${className}`}
      style={{ minHeight }}
    >
      <MDXEditor
        ref={editorRef}
        markdown={markdown || ""}
        onChange={onChange}
        placeholder={placeholder}
        contentEditableClassName="prose prose-slate dark:prose-invert max-w-none p-5 sm:p-7 text-xs sm:text-sm leading-relaxed outline-none min-h-[400px] text-text-primary"
        plugins={[
          headingsPlugin({ allowedHeadingLevels: [1, 2, 3, 4] }),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          markdownShortcutPlugin(),
          tablePlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          imagePlugin({
            imageUploadHandler: handleImageUpload,
          }),
          codeBlockPlugin({ defaultCodeBlockLanguage: "c" }),
          codeMirrorPlugin({
            codeBlockLanguages: {
              c: "C (Embedded)",
              cpp: "C++ (Embedded/RTOS)",
              python: "Python (TinyML)",
              rust: "Rust",
              bash: "Bash / Shell",
              makefile: "Makefile",
              json: "JSON",
              yaml: "YAML",
              text: "Plain Text",
            },
          }),
          diffSourcePlugin({
            viewMode: "rich-text",
            diffMarkdown: "",
          }),
          toolbarPlugin({
            toolbarContents: () => (
              <DiffSourceToggleWrapper options={["rich-text", "source"]}>
                <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-bg-elevated/70 text-xs">
                  <UndoRedo />
                  <div className="h-4 w-px bg-border mx-1" />
                  <BlockTypeSelect />
                  <div className="h-4 w-px bg-border mx-1" />
                  <BoldItalicUnderlineToggles />
                  <CodeToggle />
                  <CreateLink />
                  <div className="h-4 w-px bg-border mx-1" />
                  <ListsToggle />
                  <div className="h-4 w-px bg-border mx-1" />
                  <InsertTable />
                  <InsertImage />
                  <InsertCodeBlock />
                  <InsertThematicBreak />

                  <ConditionalContents
                    options={[
                      {
                        when: (editor) => editor?.editorType === "codeblock",
                        contents: () => (
                          <div className="ml-auto flex items-center gap-2">
                            <span className="text-[10px] text-accent font-bold uppercase">Ngôn ngữ:</span>
                            <ChangeCodeMirrorLanguage />
                          </div>
                        ),
                      },
                    ]}
                  />
                </div>
              </DiffSourceToggleWrapper>
            ),
          }),
        ]}
      />
    </div>
  );
}
