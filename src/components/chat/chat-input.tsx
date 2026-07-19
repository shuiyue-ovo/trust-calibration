"use client";

// ============================================================
// 聊天输入框 — 悬浮式输入区域
// ============================================================

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Send, Loader2, CornerDownLeft } from "lucide-react";

interface ChatInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSubmit, isLoading, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 160) + "px";
    }
  }, [text]);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading || disabled) return;
    onSubmit(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-3xl px-4 py-4">
        <div className="relative flex items-end gap-2.5 rounded-2xl border border-border/60 bg-card p-2 shadow-sm transition-all focus-within:border-primary/30 focus-within:shadow-md">
          {/* 输入区 */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的问题…"
            disabled={isLoading || disabled}
            className="min-h-[40px] max-h-[160px] flex-1 resize-none border-0 bg-transparent px-2 py-1.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none disabled:opacity-50"
            rows={1}
          />

          {/* 发送按钮 */}
          <div className="flex shrink-0 items-center gap-1.5">
            {text.trim() && (
              <span className="hidden text-[10px] text-muted-foreground/40 sm:flex items-center gap-1">
                <CornerDownLeft className="size-3" />
                Enter
              </span>
            )}
            <Button
              onClick={handleSubmit}
              disabled={!text.trim() || isLoading || disabled}
              size="icon"
              className="size-9 shrink-0 rounded-xl shadow-sm transition-all hover:shadow-md disabled:shadow-none"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
            </Button>
          </div>
        </div>

        <p className="mt-2 text-center text-[10px] text-muted-foreground/35">
          系统自动分析风险等级并推送干预提示
        </p>
      </div>
    </div>
  );
}
