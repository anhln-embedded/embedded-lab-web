"use client";

import React, { useRef, useEffect } from "react";
import { Terminal, Trash2 } from "lucide-react";

interface SerialTerminalProps {
  logs: string;
  onClear: () => void;
}

export const SerialTerminal: React.FC<SerialTerminalProps> = ({ logs, onClear }) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="bg-[#0b101b] dark:bg-[#070b14] border border-border rounded-2xl overflow-hidden font-mono text-xs flex flex-col h-[180px] shadow-sm transition-colors duration-200">
      <div className="bg-[#131b2e] dark:bg-[#0f172a] px-3.5 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
          <Terminal className="w-4 h-4" />
          <span>USART1 Serial Monitor (115200 Baud)</span>
        </div>
        <button
          onClick={onClear}
          title="Xóa màn hình terminal"
          className="text-text-muted hover:text-error p-1 rounded-md hover:bg-white/5 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 p-3.5 overflow-y-auto text-emerald-400 dark:text-emerald-300 leading-relaxed whitespace-pre-wrap select-text selection:bg-emerald-500/30">
        {logs ? (
          <>
            {logs}
            <div ref={terminalEndRef} />
          </>
        ) : (
          <span className="text-slate-500 italic">
            Chưa có dữ liệu từ USART1... (Đang chờ chương trình gửi qua UART1-DR)
          </span>
        )}
      </div>
    </div>
  );
};
