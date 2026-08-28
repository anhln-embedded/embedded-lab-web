"use client";

import React from "react";
import dynamic from "next/dynamic";
import { MDXEditorComponentProps } from "./MDXEditorComponent";

const DynamicMDXEditor = dynamic(() => import("./MDXEditorComponent"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-border/80 bg-bg-panel shadow-xl p-8 min-h-[480px] flex flex-col items-center justify-center text-center space-y-3">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-semibold text-text-muted">Đang tải trình soạn thảo MDXEditor...</p>
    </div>
  ),
});

export function LabMDXEditor(props: MDXEditorComponentProps) {
  return <DynamicMDXEditor {...props} />;
}
