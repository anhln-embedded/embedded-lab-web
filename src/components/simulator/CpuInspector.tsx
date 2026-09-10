"use client";

import React from "react";
import { CpuState } from "@/lib/emulator/arm-cortex-m3";
import { Activity, Clock } from "lucide-react";

interface CpuInspectorProps {
  cpuState: CpuState | null;
}

export const CpuInspector: React.FC<CpuInspectorProps> = ({ cpuState }) => {
  if (!cpuState) {
    return (
      <div className="bg-bg-panel border border-border rounded-2xl p-4 text-xs text-text-muted flex items-center justify-center min-h-[140px] shadow-sm">
        Chưa khởi động CPU ARM Cortex-M3
      </div>
    );
  }

  const formatHex = (val: number, digits: number = 8) => {
    return "0x" + (val >>> 0).toString(16).toUpperCase().padStart(digits, "0");
  };

  return (
    <div className="bg-bg-panel border border-border rounded-2xl p-4 font-mono text-xs shadow-sm transition-colors duration-200">
      <div className="flex items-center justify-between border-b border-border pb-2.5 mb-3">
        <div className="flex items-center gap-2 font-semibold text-text-primary">
          <Activity className="w-4 h-4 text-accent" />
          <span>ARM Cortex-M3 Registers</span>
        </div>
        <div className="flex items-center gap-3.5 text-[11px] text-text-muted">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-accent-amber" />
            Cycles: <strong className="text-text-primary">{cpuState.cycles.toLocaleString()}</strong>
          </span>
          <span>
            Instructions: <strong className="text-accent">{cpuState.instructionsExecuted.toLocaleString()}</strong>
          </span>
        </div>
      </div>

      {/* Special Registers & Flags */}
      <div className="grid grid-cols-4 gap-2 mb-3 bg-bg-code p-2.5 rounded-xl border border-border text-[11px]">
        <div>
          <span className="text-accent font-bold">PC (R15): </span>
          <span className="text-text-primary font-bold">{formatHex(cpuState.pc)}</span>
        </div>
        <div>
          <span className="text-success font-bold">SP (R13): </span>
          <span className="text-text-primary">{formatHex(cpuState.sp)}</span>
        </div>
        <div>
          <span className="text-accent-cyan font-bold">LR (R14): </span>
          <span className="text-text-primary">{formatHex(cpuState.lr)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-accent-amber font-bold">Flags: </span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${cpuState.flags.n ? "bg-error/20 text-error" : "text-text-muted"}`}>N</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${cpuState.flags.z ? "bg-success/20 text-success" : "text-text-muted"}`}>Z</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${cpuState.flags.c ? "bg-blue-500/20 text-blue-400" : "text-text-muted"}`}>C</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${cpuState.flags.v ? "bg-accent-amber/20 text-accent-amber" : "text-text-muted"}`}>V</span>
        </div>
      </div>

      {/* General Purpose Registers R0 - R12 */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-1.5 text-[10px]">
        {cpuState.r.map((val, idx) => (
          <div key={idx} className="bg-bg-elevated px-2 py-1.5 rounded-lg border border-border flex justify-between">
            <span className="text-text-muted font-bold">R{idx}:</span>
            <span className={val !== 0 ? "text-accent font-semibold" : "text-text-secondary"}>
              {val.toString(16).toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
