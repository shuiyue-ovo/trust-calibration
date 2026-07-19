"use client";

// ============================================================
// 中风险干预 — 可展开的"查看信息来源"面板
// ============================================================

import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Search,
  AlertCircle,
} from "lucide-react";
import type { RiskAssessment } from "@/types/trust";

interface MediumRiskSourcesProps {
  riskAssessment: RiskAssessment;
  userQuestion: string;
}

export function MediumRiskSources({
  riskAssessment,
  userQuestion,
}: MediumRiskSourcesProps) {
  const [expanded, setExpanded] = useState(false);

  const searchQuery = encodeURIComponent(userQuestion.slice(0, 100));
  const scholarQuery = encodeURIComponent(
    userQuestion.replace(/[？?！!。，,、]/g, " ").slice(0, 80)
  );

  const searchLinks = [
    { label: "Bing 搜索", url: `https://www.bing.com/search?q=${searchQuery}` },
    {
      label: "Wikipedia",
      url: `https://en.wikipedia.org/w/index.php?search=${searchQuery}`,
    },
  ];

  if (
    riskAssessment.taskType === "knowledge" ||
    riskAssessment.taskType === "professional"
  ) {
    searchLinks.push({
      label: "Google Scholar",
      url: `https://scholar.google.com/scholar?q=${scholarQuery}`,
    });
  }

  return (
    <div className="animate-scale-in overflow-hidden rounded-xl border border-amber-200/60 bg-gradient-to-b from-amber-50/80 to-amber-50/30 dark:border-amber-800/40 dark:from-amber-950/30 dark:to-amber-950/10">
      {/* 折叠按钮 */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-amber-100/50 dark:hover:bg-amber-950/50"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-300">
          <BookOpen className="size-4" />
          查看信息来源与验证建议
          <span className="ml-1 rounded-full bg-amber-200/60 px-1.5 py-0.5 text-[10px] text-amber-700 dark:bg-amber-800/40 dark:text-amber-400">
            建议
          </span>
        </span>
        {expanded ? (
          <ChevronUp className="size-4 text-amber-600 dark:text-amber-400" />
        ) : (
          <ChevronDown className="size-4 text-amber-600 dark:text-amber-400" />
        )}
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-amber-200/40 px-4 py-4 dark:border-amber-800/30">
          {/* 建议来源 */}
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-amber-800/80 dark:text-amber-400/80">
              <AlertCircle className="size-3" />
              建议验证以下来源
            </p>
            <ul className="space-y-1.5">
              {riskAssessment.sourcesSuggestion.map((src, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-muted-foreground"
                >
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-amber-200/60 text-[10px] font-medium text-amber-700 dark:bg-amber-800/40 dark:text-amber-400">
                    {i + 1}
                  </span>
                  {src}
                </li>
              ))}
            </ul>
          </div>

          {/* 快速搜索 */}
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-amber-800/80 dark:text-amber-400/80">
              <Search className="size-3" />
              快速搜索验证
            </p>
            <div className="flex flex-wrap gap-2">
              {searchLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200/60 bg-white/80 px-2.5 py-1.5 text-[11px] text-amber-800 transition-all hover:bg-white hover:shadow-sm dark:border-amber-800/40 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/60"
                >
                  {link.label}
                  <ExternalLink className="size-3 opacity-50" />
                </a>
              ))}
            </div>
          </div>

          {/* 额外提示 */}
          {(riskAssessment.complexity === "high" ||
            riskAssessment.hasDeadline) && (
            <div className="space-y-1 rounded-lg border border-amber-200/40 bg-white/50 px-3 py-2 dark:border-amber-800/30 dark:bg-amber-950/30">
              {riskAssessment.complexity === "high" && (
                <p className="flex items-center gap-1.5 text-[11px] text-amber-700/80 dark:text-amber-400/80">
                  <AlertCircle className="size-3" />
                  此问题复杂度较高，AI 回答可能无法覆盖所有细节
                </p>
              )}
              {riskAssessment.hasDeadline && riskAssessment.deadlineText && (
                <p className="flex items-center gap-1.5 text-[11px] text-amber-700/80 dark:text-amber-400/80">
                  ⏰ 检测到时间诉求（{riskAssessment.deadlineText}
                  ），建议预留充分的验证时间
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
