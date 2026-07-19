"use client";

// ============================================================
// 普通模式 — AI 对话 + 情境感知信任干预
// ============================================================

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChatMessageBubble } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { HighRiskDialog } from "@/components/intervention/high-risk-dialog";
import { analyzeRisk } from "@/lib/risk-engine";
import { ArrowLeft, Sparkles, MessageSquare } from "lucide-react";
import Link from "next/link";
import type { ChatMessage, RiskAssessment } from "@/types/trust";

export default function NormalModePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingRisk, setPendingRisk] = useState<{
    assessment: RiskAssessment;
    text: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const genId = () =>
    `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const proceedWithChat = useCallback(
    async (text: string, assessment: RiskAssessment) => {
      const currentMessages = messagesRef.current;

      const userMsg: ChatMessage = {
        id: genId(),
        role: "user",
        content: text,
        timestamp: Date.now(),
        riskAssessment: assessment,
        interventionConfirmed: assessment.riskLevel === "high",
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const apiMessages = [
          ...currentMessages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          { role: "user" as const, content: text },
        ];

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages, riskAssessment: assessment }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "请求失败");
        }

        const data = await response.json();

        const assistantMsg: ChatMessage = {
          id: genId(),
          role: "assistant",
          content: data.content || "（AI 未返回有效内容，请重试）",
          timestamp: Date.now(),
          riskAssessment: assessment,
          interventionConfirmed: assessment.riskLevel === "high",
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (error) {
        const errorMsg: ChatMessage = {
          id: genId(),
          role: "assistant",
          content:
            error instanceof Error
              ? `❌ 请求失败：${error.message}`
              : "❌ 未知错误，请稍后重试",
          timestamp: Date.now(),
          riskAssessment: assessment,
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleSubmit = useCallback(
    (text: string) => {
      const assessment = analyzeRisk(text);
      if (assessment.riskLevel === "high") {
        setPendingRisk({ assessment, text });
        return;
      }
      proceedWithChat(text, assessment);
    },
    [proceedWithChat]
  );

  const handleHighRiskConfirm = useCallback(() => {
    if (!pendingRisk) return;
    const { assessment, text } = pendingRisk;
    setPendingRisk(null);
    proceedWithChat(text, assessment);
  }, [pendingRisk, proceedWithChat]);

  const handleHighRiskCancel = useCallback(() => {
    setPendingRisk(null);
  }, []);

  const pendingHighRisk =
    pendingRisk && pendingRisk.assessment.riskLevel === "high";

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* ── Header ── */}
      <header className="glass-strong sticky top-0 z-20 border-b border-border/40">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
              render={<Link href="/" />}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="size-3.5 text-primary" />
              </div>
              <h1 className="text-sm font-semibold">普通模式</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {messages.length > 0 && (
              <span className="text-xs text-muted-foreground/60">
                {messages.length} 条消息
              </span>
            )}
            <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-card px-3 py-1 text-[11px] text-muted-foreground">
              <div className="flex size-1.5 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30" />
              干预已开启
            </div>
          </div>
        </div>
      </header>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto bg-dot-grid">
        <div className="mx-auto max-w-3xl px-4">
          {messages.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="animate-scale-in mb-6 flex size-16 items-center justify-center rounded-2xl bg-muted/50 ring-1 ring-border/50">
                <MessageSquare className="size-7 text-muted-foreground/40" />
              </div>
              <h2 className="animate-fade-up stagger-1 text-lg font-medium text-foreground/80">
                开始对话
              </h2>
              <p className="animate-fade-up stagger-2 mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground/60">
                输入你的问题，系统将自动分析任务类型、风险等级与复杂度，
                并实时提供差异化的信任提示。
              </p>

              {/* 任务类型标签 */}
              <div className="animate-fade-up stagger-3 mt-8 flex flex-wrap justify-center gap-2">
                {[
                  { emoji: "🔍", label: "知识获取" },
                  { emoji: "💡", label: "生活建议" },
                  { emoji: "✍️", label: "专业创作" },
                  { emoji: "⚖️", label: "决策分析" },
                ].map(({ emoji, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-sm transition-all hover:border-border hover:text-foreground"
                  >
                    {emoji} {label}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessageBubble key={msg.id} message={msg} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Input ── */}
      <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />

      {/* ── High Risk Dialog ── */}
      {pendingHighRisk && (
        <HighRiskDialog
          open={true}
          riskAssessment={pendingRisk.assessment}
          onConfirm={handleHighRiskConfirm}
          onCancel={handleHighRiskCancel}
        />
      )}
    </div>
  );
}
