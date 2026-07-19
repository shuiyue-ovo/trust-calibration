"use client";

// ============================================================
// 聊天消息气泡 — 用户消息 / AI 回复
// ============================================================

import { cn } from "@/lib/utils";
import { RiskBadge } from "@/components/chat/risk-badge";
import { MediumRiskSources } from "@/components/intervention/medium-risk-sources";
import { LowRiskNotice } from "@/components/intervention/low-risk-notice";
import { Bot, User, AlertTriangle, Copy, Check } from "lucide-react";
import { useState } from "react";
import type { ChatMessage } from "@/types/trust";

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const risk = message.riskAssessment;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "animate-message-in flex gap-3 py-5",
        isUser && "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full ring-1 ring-border/50",
          isUser
            ? "bg-primary text-primary-foreground ring-primary/20"
            : "bg-card text-muted-foreground"
        )}
      >
        {isUser ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex-1 space-y-2",
          isUser && "flex flex-col items-end"
        )}
      >
        {/* ── 用户消息 ── */}
        {isUser && (
          <div className="space-y-2">
            <div className="inline-block max-w-[80%] rounded-2xl rounded-tr-md bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground shadow-sm">
              {message.content}
            </div>
            {risk && (
              <RiskBadge
                taskType={risk.taskType}
                riskLevel={risk.riskLevel}
                complexity={risk.complexity}
              />
            )}
          </div>
        )}

        {/* ── AI 回复 ── */}
        {isAssistant && (
          <div className="max-w-[90%] space-y-3">
            {/* 气泡 */}
            <div className="group relative rounded-2xl rounded-tl-md border border-border/60 bg-card px-4 py-3 text-sm leading-relaxed shadow-sm">
              <div className="prose-sm dark:prose-invert whitespace-pre-wrap break-words text-foreground/90">
                {message.content}
              </div>

              {/* 复制按钮 */}
              <button
                onClick={handleCopy}
                className="absolute right-2 top-2 rounded-md p-1.5 text-muted-foreground/30 opacity-0 transition-all hover:bg-muted hover:text-muted-foreground group-hover:opacity-100"
                title="复制回答"
              >
                {copied ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
            </div>

            {/* 高风险确认横幅 */}
            {risk && risk.riskLevel === "high" && message.interventionConfirmed && (
              <div className="flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-2.5 text-xs text-destructive/80">
                <AlertTriangle className="size-3.5 shrink-0" />
                <span>
                  您已确认核查事项。以下 AI 回答仅供参考，请谨慎采纳。
                </span>
              </div>
            )}

            {/* 中风险来源 */}
            {risk && risk.riskLevel === "medium" && (
              <MediumRiskSources
                riskAssessment={risk}
                userQuestion={message.content}
              />
            )}

            {/* 低风险提示 */}
            {risk && risk.riskLevel === "low" && <LowRiskNotice />}
          </div>
        )}

        {/* 时间戳 */}
        <span className="px-1 text-[10px] text-muted-foreground/40">
          {new Date(message.timestamp).toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
