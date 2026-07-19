"use client";

// ============================================================
// 风险标签 — 展示任务类型、风险等级、复杂度
// ============================================================

import { AlertTriangle, AlertCircle, Info, Layers } from "lucide-react";
import type { RiskLevel, TaskType, ComplexityLevel } from "@/types/trust";
import {
  TASK_TYPE_LABELS,
  RISK_LEVEL_LABELS,
  COMPLEXITY_LABELS,
} from "@/lib/risk-engine";

interface RiskBadgeProps {
  taskType: TaskType;
  riskLevel: RiskLevel;
  complexity: ComplexityLevel;
}

const riskConfig: Record<
  RiskLevel,
  { icon: React.ReactNode; ring: string; bg: string; text: string }
> = {
  high: {
    icon: <AlertTriangle className="size-3" />,
    ring: "ring-red-200 dark:ring-red-800",
    bg: "bg-red-50 dark:bg-red-950/40",
    text: "text-red-700 dark:text-red-400",
  },
  medium: {
    icon: <AlertCircle className="size-3" />,
    ring: "ring-amber-200 dark:ring-amber-800",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-400",
  },
  low: {
    icon: <Info className="size-3" />,
    ring: "ring-emerald-200 dark:ring-emerald-800",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-400",
  },
};

const complexityConfig: Record<ComplexityLevel, string> = {
  high: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 ring-zinc-200 dark:ring-zinc-700",
  low: "bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-500 ring-zinc-200 dark:ring-zinc-800",
};

export function RiskBadge({ taskType, riskLevel, complexity }: RiskBadgeProps) {
  const rc = riskConfig[riskLevel];

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {/* 风险等级 */}
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${rc.ring} ${rc.bg} ${rc.text}`}
      >
        {rc.icon}
        {RISK_LEVEL_LABELS[riskLevel]}
      </span>

      {/* 任务类型 */}
      <span className="inline-flex items-center gap-1 rounded-full bg-muted/80 px-2 py-0.5 text-[11px] text-muted-foreground ring-1 ring-border/50">
        {TASK_TYPE_LABELS[taskType]}
      </span>

      {/* 复杂度 */}
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ring-1 ring-inset ${complexityConfig[complexity]}`}
      >
        <Layers className="size-3" />
        {COMPLEXITY_LABELS[complexity]}
      </span>
    </div>
  );
}
