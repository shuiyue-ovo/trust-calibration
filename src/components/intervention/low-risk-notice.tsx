"use client";

// ============================================================
// 低风险干预 — 轻量小字提示
// ============================================================

import { Info } from "lucide-react";

export function LowRiskNotice() {
  return (
    <div className="flex items-center gap-1.5 pt-1">
      <span className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2.5 py-1 text-[11px] text-muted-foreground/50">
        <Info className="size-3" />
        AI 生成内容仅供参考
      </span>
    </div>
  );
}
