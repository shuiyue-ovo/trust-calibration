"use client";

// ============================================================
// 高风险干预弹窗
// ============================================================

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import type { RiskAssessment } from "@/types/trust";

interface HighRiskDialogProps {
  open: boolean;
  riskAssessment: RiskAssessment;
  onConfirm: () => void;
  onCancel: () => void;
}

export function HighRiskDialog({
  open,
  riskAssessment,
  onConfirm,
  onCancel,
}: HighRiskDialogProps) {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  // 每次弹出时重置勾选状态
  useEffect(() => {
    if (open) setCheckedItems(new Set());
  }, [open]);

  const toggleItem = (index: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const allChecked =
    checkedItems.size === riskAssessment.suggestedVerification.length;
  const progress =
    riskAssessment.suggestedVerification.length > 0
      ? Math.round(
          (checkedItems.size /
            riskAssessment.suggestedVerification.length) *
            100
        )
      : 0;

  return (
    <Dialog open={open} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-lg overflow-hidden rounded-2xl border-destructive/20 p-0">
        {/* 顶部警告条 */}
        <div className="flex items-center gap-3 border-b border-destructive/10 bg-destructive/5 px-6 py-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 ring-1 ring-destructive/20">
            <ShieldAlert className="size-5 text-destructive" />
          </div>
          <div>
            <DialogTitle className="text-base text-destructive">
              高风险内容警告
            </DialogTitle>
            <DialogDescription className="text-xs">
              匹配关键词：{riskAssessment.matchedKeywords.join("、")}
            </DialogDescription>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mx-6 mt-5 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 说明 */}
        <div className="px-6 pt-3">
          <p className="text-sm leading-relaxed text-muted-foreground">
            AI 生成的回答可能存在偏差或错误。请逐项确认以下核查事项后，方可继续查看回答：
          </p>
        </div>

        {/* 核查清单 */}
        <div className="max-h-64 space-y-2 overflow-y-auto px-6 py-3">
          {riskAssessment.suggestedVerification.map((item, index) => {
            const checked = checkedItems.has(index);
            return (
              <button
                key={index}
                onClick={() => toggleItem(index)}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all duration-200 ${
                  checked
                    ? "border-primary/30 bg-primary/5 shadow-sm"
                    : "border-border/50 bg-card hover:border-border hover:bg-muted/30"
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {checked ? (
                    <CheckCircle2 className="size-5 text-primary" />
                  ) : (
                    <div className="size-5 rounded-full border-2 border-muted-foreground/20" />
                  )}
                </div>
                <span className="text-sm leading-relaxed">{item}</span>
              </button>
            );
          })}
        </div>

        {/* 底部按钮 */}
        <DialogFooter className="gap-2 border-t border-border/40 px-6 py-4">
          <Button
            onClick={onConfirm}
            disabled={!allChecked}
            className="flex-1 rounded-xl shadow-sm transition-all"
            variant={allChecked ? "default" : "secondary"}
          >
            {allChecked ? (
              <>
                <CheckCircle2 className="mr-1.5 size-4" />
                已逐项核查，继续查看
              </>
            ) : (
              <>
                还需确认{" "}
                {riskAssessment.suggestedVerification.length -
                  checkedItems.size}{" "}
                项
              </>
            )}
          </Button>
          <Button
            onClick={onCancel}
            variant="ghost"
            className="rounded-xl"
          >
            取消提问
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
