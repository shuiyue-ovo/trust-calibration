"use client";

// ============================================================
// 分类测试页 — 10 个场景，逐页浏览，标注风险与复杂度
// ============================================================

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Send,
  AlertTriangle,
  AlertCircle,
  Info,
  Layers,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { SCENARIOS, type ScenarioDefinition } from "@/data/scenarios";

// ---- 类型 ----

type RiskAnswer = "高" | "中" | "低" | null;
type ComplexityAnswer = "高" | "低" | null;

interface ScenarioAnswer {
  risk: RiskAnswer;
  complexity: ComplexityAnswer;
  startTime: number;
  endTime: number | null;
}

// ---- 常量 ----

const TOTAL_SCENARIOS = SCENARIOS.length;

const RISK_OPTIONS = [
  {
    value: "高" as const,
    label: "高风险",
    icon: <AlertTriangle className="size-4" />,
    desc: "判断失误可能造成较严重的实际损失",
    color: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 data-[selected=true]:border-red-400 data-[selected=true]:ring-2 data-[selected=true]:ring-red-200 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400",
  },
  {
    value: "中" as const,
    label: "中风险",
    icon: <AlertCircle className="size-4" />,
    desc: "判断失误可能造成轻微不便或效率损失",
    color: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 data-[selected=true]:border-amber-400 data-[selected=true]:ring-2 data-[selected=true]:ring-amber-200 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
  },
  {
    value: "低" as const,
    label: "低风险",
    icon: <Info className="size-4" />,
    desc: "判断失误基本不会造成实质影响",
    color: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 data-[selected=true]:border-emerald-400 data-[selected=true]:ring-2 data-[selected=true]:ring-emerald-200 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
];

const COMPLEXITY_OPTIONS = [
  {
    value: "高" as const,
    label: "高复杂度",
    icon: <BarChart3 className="size-4" />,
    desc: "需要多步推理或整合多源信息",
    color: "border-zinc-300 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 data-[selected=true]:border-zinc-500 data-[selected=true]:ring-2 data-[selected=true]:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400",
  },
  {
    value: "低" as const,
    label: "低复杂度",
    icon: <Layers className="size-4" />,
    desc: "单步事实查询或简单生成即可",
    color: "border-zinc-200 bg-zinc-50/50 text-zinc-600 hover:bg-zinc-100 data-[selected=true]:border-zinc-400 data-[selected=true]:ring-2 data-[selected=true]:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-500",
  },
];

// ---- 页面阶段 ----
type Phase = "intro" | "testing" | "submitted";

export default function ClassificationTestPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<ScenarioAnswer[]>(
    SCENARIOS.map(() => ({
      risk: null,
      complexity: null,
      startTime: 0,
      endTime: null,
    }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const startTimeRef = useRef(Date.now());

  const [shuffledScenarios, setShuffledScenarios] = useState<ScenarioDefinition[]>([]);

  // Fisher-Yates 洗牌
  const shuffleArray = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const scenario = shuffledScenarios[currentIndex] || SCENARIOS[currentIndex];
  const currentAnswer = answers[currentIndex];

  // 进入测试：随机排列场景 + 记录开始时间
  const handleStartTest = () => {
    setShuffledScenarios(shuffleArray(SCENARIOS));
    setPhase("testing");
    const now = Date.now();
    startTimeRef.current = now;
    setAnswers((prev) => {
      const next = [...prev];
      next[0] = { ...next[0], startTime: now };
      return next;
    });
  };

  // 选择风险等级
  const selectRisk = useCallback(
    (value: RiskAnswer) => {
      setAnswers((prev) => {
        const next = [...prev];
        next[currentIndex] = {
          ...next[currentIndex],
          risk: value,
          startTime: next[currentIndex].startTime || Date.now(),
        };
        return next;
      });
    },
    [currentIndex]
  );

  // 选择复杂度
  const selectComplexity = useCallback(
    (value: ComplexityAnswer) => {
      setAnswers((prev) => {
        const next = [...prev];
        next[currentIndex] = {
          ...next[currentIndex],
          complexity: value,
          startTime: next[currentIndex].startTime || Date.now(),
        };
        return next;
      });
    },
    [currentIndex]
  );

  // 完成当前题目，记录结束时间
  const finishCurrent = () => {
    const now = Date.now();
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = {
        ...next[currentIndex],
        endTime: now,
        startTime: next[currentIndex].startTime || now,
      };
      return next;
    });
  };

  // 下一题
  const handleNext = () => {
    finishCurrent();
    if (currentIndex < TOTAL_SCENARIOS - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      // 初始化下一题的开始时间
      setAnswers((prev) => {
        const next = [...prev];
        next[nextIdx] = { ...next[nextIdx], startTime: Date.now() };
        return next;
      });
    }
  };

  // 上一题
  const handlePrev = () => {
    if (currentIndex > 0) {
      finishCurrent();
      setCurrentIndex(currentIndex - 1);
    }
  };

  // 是否可以进入下一题
  const canProceed = currentAnswer?.risk && currentAnswer?.complexity;
  const isLastQuestion = currentIndex === TOTAL_SCENARIOS - 1;

  // 全部完成检查
  const allAnswered = answers.every((a) => a.risk && a.complexity);

  // 提交
  const handleSubmit = async () => {
    finishCurrent();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const results = answers.map((a, i) => ({
        scenarioId: shuffledScenarios[i].id,
        riskAnswer: a.risk!,
        complexityAnswer: a.complexity!,
        timeSpentMs: (a.endTime || Date.now()) - (a.startTime || Date.now()),
      }));

      const totalTimeMs = Date.now() - startTimeRef.current;

      const response = await fetch("/api/save-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          results,
          totalTimeMs,
          submittedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `服务器错误 (${response.status})`);
      }

      setPhase("submitted");
    } catch {
      setSubmitError("保存失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 已完成数量
  const answeredCount = answers.filter((a) => a.risk && a.complexity).length;

  // ═══════════════════════════════════════
  // 引导页
  // ═══════════════════════════════════════
  if (phase === "intro") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="w-full max-w-xl rounded-2xl border-border/60 shadow-sm">
          <CardContent className="p-8">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                <ClipboardCheck className="size-7 text-primary" />
              </div>
              <h1 className="text-xl font-bold">分类测试</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                共 {TOTAL_SCENARIOS} 个场景 · 预计 2-3 分钟
              </p>
            </div>

            <Separator className="my-5" />

            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                下面你将看到{" "}
                <strong className="text-foreground">{TOTAL_SCENARIOS} 个</strong>{" "}
                AI 使用场景。请根据你的<strong className="text-foreground">第一直觉</strong>
                判断每个场景的<strong className="text-foreground">&ldquo;风险等级&rdquo;</strong>和
                <strong className="text-foreground">&ldquo;复杂程度&rdquo;</strong>。
              </p>

              <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="size-4 text-destructive mt-0.5 shrink-0" />
                  <p>
                    <strong>风险等级</strong>：指 AI 回答出错可能给你带来的负面影响大小
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <BarChart3 className="size-4 text-primary mt-0.5 shrink-0" />
                  <p>
                    <strong>复杂程度</strong>：指完成任务所需的信息整合和推理难度
                  </p>
                </div>
              </div>

              <p className="text-muted-foreground/70">
                答案没有对错之分，请凭直觉作答，每题控制在 10 秒以内。
                你的判断将帮助我优化实验任务的设计，非常感谢！
              </p>
            </div>

            <Separator className="my-5" />

            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" className="rounded-xl" render={<Link href="/experiment-mode" />}>
                <ArrowLeft className="mr-1.5 size-4" />
                返回
              </Button>
              <Button onClick={handleStartTest} className="rounded-xl" size="lg">
                开始测试
                <ArrowRight className="ml-1.5 size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  // ═══════════════════════════════════════
  // 测试中
  // ═══════════════════════════════════════
  if (phase === "testing") {
    return (
      <main className="flex min-h-screen flex-col bg-background">
        {/* 进度条 */}
        <div className="sticky top-0 z-20 border-b border-border/40 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-2xl items-center gap-4 px-4 py-3">
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {currentIndex + 1} / {TOTAL_SCENARIOS}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                style={{
                  width: `${((currentIndex + 1) / TOTAL_SCENARIOS) * 100}%`,
                }}
              />
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              <span>{answeredCount}/{TOTAL_SCENARIOS} 完成</span>
            </div>
          </div>
        </div>

        {/* 场景卡片 */}
        <div className="flex flex-1 items-center justify-center p-6">
          <Card className="w-full max-w-2xl rounded-2xl border-border/60 shadow-sm animate-scale-in">
            <CardContent className="p-6 sm:p-8">
              {/* 场景编号 */}
              <Badge variant="outline" className="mb-4">
                场景 {scenario.id}
              </Badge>

              {/* 场景描述 */}
              <div className="rounded-xl border border-border/60 bg-muted/30 p-5">
                <p className="text-sm leading-relaxed">{scenario.description}</p>
              </div>

              <Separator className="my-6" />

              {/* ① 风险等级 */}
              <div className="mb-6">
                <p className="mb-3 text-sm font-medium">
                  ① 请判断此场景的<strong>风险等级</strong>：
                </p>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  {RISK_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => selectRisk(opt.value)}
                      data-selected={currentAnswer?.risk === opt.value}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${opt.color}`}
                    >
                      <span className="flex items-center gap-1.5 font-medium text-sm">
                        {opt.icon}
                        {opt.label}
                      </span>
                      <span className="text-[11px] opacity-70 leading-tight text-center">
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ② 复杂程度 */}
              <div>
                <p className="mb-3 text-sm font-medium">
                  ② 请判断此场景的<strong>复杂程度</strong>：
                </p>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {COMPLEXITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => selectComplexity(opt.value)}
                      data-selected={currentAnswer?.complexity === opt.value}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${opt.color}`}
                    >
                      <span className="flex items-center gap-1.5 font-medium text-sm">
                        {opt.icon}
                        {opt.label}
                      </span>
                      <span className="text-[11px] opacity-70 leading-tight text-center">
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 导航按钮 */}
              <Separator className="my-6" />
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="rounded-xl"
                >
                  <ArrowLeft className="mr-1.5 size-4" />
                  上一题
                </Button>

                {isLastQuestion ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={!allAnswered || isSubmitting}
                    className="rounded-xl"
                  >
                    {isSubmitting ? (
                      "保存中…"
                    ) : (
                      <>
                        <Send className="mr-1.5 size-4" />
                        提交 ({answeredCount}/{TOTAL_SCENARIOS})
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed}
                    className="rounded-xl"
                  >
                    下一题
                    <ArrowRight className="ml-1.5 size-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 底部：全部完成时显示提交按钮（移动端备用） */}
        {allAnswered && isLastQuestion && (
          <div className="border-t border-border/40 bg-background/80 backdrop-blur-xl p-4 sm:hidden">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full rounded-xl"
              size="lg"
            >
              <Send className="mr-1.5 size-4" />
              提交全部答案
            </Button>
          </div>
        )}

        {submitError && (
          <div className="text-center pb-4 text-xs text-destructive">
            {submitError}
          </div>
        )}
      </main>
    );
  }

  // ═══════════════════════════════════════
  // 提交成功
  // ═══════════════════════════════════════
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md rounded-2xl border-border/60 shadow-sm">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-emerald-50 ring-4 ring-emerald-100 dark:bg-emerald-950/40 dark:ring-emerald-900/40">
            <CheckCircle2 className="size-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold">提交成功！</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            你的判断已保存。感谢你参与分类测试，
            这些数据将帮助优化实验任务的设计。
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            共完成 {TOTAL_SCENARIOS} 个场景的分类
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <Button className="rounded-xl" render={<Link href="/experiment-mode" />}>
              返回实验模式
            </Button>
            <Button variant="outline" className="rounded-xl" render={<Link href="/" />}>
              返回首页
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

