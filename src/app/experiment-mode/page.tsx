"use client";

// ============================================================
// 实验模式 Hub — 选择分类测试或正式实验
// ============================================================

import { Button } from "@/components/ui/button";
import { ArrowLeft, FlaskConical, ClipboardCheck, Play } from "lucide-react";
import Link from "next/link";

export default function ExperimentModePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 bg-dot-grid" />

      <div className="relative z-10 mx-auto max-w-lg px-6 text-center">
        {/* 返回 */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl"
            render={<Link href="/" />}
          >
            <ArrowLeft className="mr-1.5 size-4" />
            返回首页
          </Button>
        </div>

        {/* 标题 */}
        <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <FlaskConical className="size-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">实验模式</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          请选择要进行的实验任务
        </p>

        {/* 两个选项 */}
        <div className="mt-10 grid gap-4">
          {/* 分类测试 */}
          <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-5 text-left shadow-sm backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-md">
            <div className="absolute -right-4 -top-4 size-20 rounded-full bg-primary/5 transition-all group-hover:scale-150 group-hover:bg-primary/10" />
            <div className="relative flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                <ClipboardCheck className="size-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">分类测试</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  浏览 10 个 AI 使用场景，凭直觉判断每个场景的风险等级与复杂程度。
                  你的判断将帮助优化实验任务设计。预计耗时 2-3 分钟。
                </p>
                <Button
                  className="mt-4 rounded-xl"
                  render={<Link href="/experiment-mode/classification-test" />}
                >
                  开始测试
                  <Play className="ml-1.5 size-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* 正式实验 */}
          <div className="relative overflow-hidden rounded-2xl border border-dashed border-muted-foreground/15 bg-muted/30 p-5 text-left backdrop-blur-sm transition-all hover:border-muted-foreground/30 hover:bg-muted/40">
            <div className="flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted ring-1 ring-border">
                <FlaskConical className="size-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">正式实验</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  标准化的 AI 对话实验任务，系统将自动记录信任行为数据。
                </p>
                <Button className="mt-4 rounded-xl" variant="outline" disabled>
                  即将上线
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
