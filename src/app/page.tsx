"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CodeDialog } from "@/components/experiment/code-dialog";
import Link from "next/link";
import { ArrowRight, FlaskConical, Shield, Sparkles, User, Zap } from "lucide-react";

export default function Home() {
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-dot-grid" />
      <div className="glow-orb glow-orb-top" />
      <div className="glow-orb glow-orb-bottom" />

      {/* Hero */}
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        {/* Badge */}
        <div className="animate-fade-up mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-4 py-1.5 text-sm font-medium shadow-sm backdrop-blur-sm">
          <div className="flex size-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30" />
          <span className="text-muted-foreground">情境感知 · 信任干预 · 行为数据</span>
        </div>

        {/* Title */}
        <h1 className="animate-fade-up stagger-1 text-5xl font-bold tracking-tight sm:text-6xl">
          Trust{" "}
          <span className="gradient-text">Calibration</span>
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-up stagger-2 mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
          输入问题，AI 实时评估风险等级与复杂度，<br className="hidden sm:block" />
          在最佳时机提供最恰当的信任提示与核验辅助。
        </p>

        {/* Quick CTA */}
        <div className="animate-fade-up stagger-3 mt-8">
          <Button
            size="lg"
            className="rounded-full px-8 shadow-lg shadow-primary/20"
            render={<Link href="/normal-mode" />}
          >
            <Zap className="mr-2 size-4" />
            立即体验
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </div>

      {/* Mode Cards */}
      <div className="relative z-10 mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-5 px-6 sm:grid-cols-2">
        {/* Normal Mode */}
        <div className="animate-fade-up stagger-4 group relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md">
          {/* 装饰 */}
          <div className="absolute -right-6 -top-6 size-24 rounded-full bg-primary/5 transition-all duration-500 group-hover:scale-150 group-hover:bg-primary/10" />

          <div className="relative">
            <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <User className="size-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">普通模式</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              自由对话，自动识别任务类型、风险等级与复杂度，实时推送差异化干预提示。
            </p>

            <ul className="mt-4 space-y-2">
              {[
                { icon: Shield, text: "自动风险检测与分级" },
                { icon: Zap, text: "高/中/低三级差异干预" },
                { icon: Sparkles, text: "DeepSeek 实时生成回答" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon className="size-3.5 text-primary/70 shrink-0" />
                  {text}
                </li>
              ))}
            </ul>

            <Button
              className="mt-5 w-full rounded-xl"
              render={<Link href="/normal-mode" />}
            >
              进入普通模式
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>

        {/* Experiment Mode */}
        <div className="animate-fade-up stagger-5 group relative overflow-hidden rounded-2xl border border-dashed border-muted-foreground/15 bg-muted/30 p-6 backdrop-blur-sm transition-all duration-300 hover:border-muted-foreground/30 hover:bg-muted/40">
          <div className="absolute -left-6 -bottom-6 size-24 rounded-full bg-muted-foreground/3 transition-all duration-500 group-hover:scale-150 group-hover:bg-muted-foreground/5" />

          <div className="relative">
            <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-muted ring-1 ring-border">
              <FlaskConical className="size-5 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold">实验模式</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              标准化任务流程，自动采集被试信任行为数据，支持实验组/对照组随机分配。
            </p>

            <ul className="mt-4 space-y-2">
              {[
                { icon: FlaskConical, text: "受控实验任务与量表" },
                { icon: Shield, text: "AIIRS 信任度量自动采集" },
                { icon: Zap, text: "随机分组与条件控制" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon className="size-3.5 text-muted-foreground/70 shrink-0" />
                  {text}
                </li>
              ))}
            </ul>

            <Button
              className="mt-5 w-full rounded-xl"
              variant="outline"
              onClick={() => setCodeDialogOpen(true)}
            >
              进入实验模式
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-20 pb-8 text-center">
        <p className="text-xs text-muted-foreground/40">
          Next.js 14 · TypeScript · shadcn/ui · Supabase · DeepSeek
        </p>
      </div>

      {/* 实验模式密码弹窗 */}
      <CodeDialog open={codeDialogOpen} onOpenChange={setCodeDialogOpen} />
    </main>
  );
}
