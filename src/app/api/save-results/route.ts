// ============================================================
// 保存实验结果 API → Supabase 数据库
// 服务端使用 Service Role Key（不暴露给前端）
// 同时也保存一份到本地文件作为备份
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

interface ClassificationResult {
  scenarioId: number;
  riskAnswer: string;
  complexityAnswer: string;
  timeSpentMs: number;
}

interface SaveRequest {
  results: ClassificationResult[];
  totalTimeMs: number;
  submittedAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SaveRequest = await request.json();

    if (!body.results || body.results.length === 0) {
      return NextResponse.json({ error: "结果数据为空" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 构建提交数据
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const rows = body.results.map((r) => ({
      session_id: sessionId,
      scenario_id: r.scenarioId,
      risk_answer: r.riskAnswer,
      complexity_answer: r.complexityAnswer,
      time_spent_ms: r.timeSpentMs,
      total_time_ms: body.totalTimeMs,
      submitted_at: body.submittedAt,
    }));

    let savedToSupabase = false;

    // 尝试写入 Supabase
    if (
      supabaseUrl &&
      supabaseServiceKey &&
      supabaseUrl !== "https://your-project-id.supabase.co" &&
      supabaseServiceKey !== "your-service-role-key"
    ) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { error } = await supabase.from("classification_results").insert(rows);

        if (error) {
          console.error("[Supabase] 写入失败:", error.message);
        } else {
          savedToSupabase = true;
          console.log(`[Supabase] 已保存 ${rows.length} 条结果, session: ${sessionId}`);
        }
      } catch (err) {
        console.error("[Supabase] 连接失败:", err);
      }
    }

    // 本地文件备份（始终保存，部署到 Vercel 后会失败但不影响 Supabase）
    try {
      const dataDir = path.join(process.cwd(), "..", "实验数据");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filePath = path.join(dataDir, `分类测试_${timestamp}.json`);
      const output = {
        sessionId,
        submittedAt: body.submittedAt,
        totalTimeSec: Math.round(body.totalTimeMs / 1000),
        results: body.results.map((r) => ({
          scenarioId: r.scenarioId,
          riskAnswer: r.riskAnswer,
          complexityAnswer: r.complexityAnswer,
          timeSpentSec: (r.timeSpentMs / 1000).toFixed(1),
        })),
        savedToSupabase,
      };
      fs.writeFileSync(filePath, JSON.stringify(output, null, 2), "utf-8");
      console.log(`[文件] 备份已保存: ${filePath}`);
    } catch {
      // 文件写入失败静默忽略（Vercel 上会失败）
    }

    if (!savedToSupabase && (!supabaseUrl || supabaseUrl.includes("your-project-id"))) {
      return NextResponse.json({
        success: true,
        savedToSupabase: false,
        message:
          "已本地保存。如需云端同步，请先配置 Supabase（见 README）",
      });
    }

    return NextResponse.json({
      success: true,
      savedToSupabase,
      sessionId,
    });
  } catch (error) {
    console.error("[保存] 失败:", error);
    return NextResponse.json(
      { error: "保存失败，请重试" },
      { status: 500 }
    );
  }
}
