// ============================================================
// 保存实验结果 API → Supabase 数据库
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

    // 检查环境变量是否正确配置
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[保存] 缺少环境变量:", {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey,
      });
      return NextResponse.json(
        {
          error: "服务器配置缺失：环境变量未设置",
          detail: {
            hasUrl: !!supabaseUrl,
            hasServiceKey: !!supabaseServiceKey,
          },
        },
        { status: 500 }
      );
    }

    if (
      supabaseUrl.includes("your-project-id") ||
      supabaseServiceKey.includes("your-service-role-key")
    ) {
      return NextResponse.json(
        { error: "服务器配置缺失：Supabase 密钥为占位值，请替换为真实密钥后重新部署" },
        { status: 500 }
      );
    }

    // 构建数据
    const sessionId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const rows = body.results.map((r) => ({
      session_id: sessionId,
      scenario_id: r.scenarioId,
      risk_answer: r.riskAnswer,
      complexity_answer: r.complexityAnswer,
      time_spent_ms: r.timeSpentMs,
      total_time_ms: body.totalTimeMs,
      submitted_at: body.submittedAt,
    }));

    // 写入 Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { error: insertError } = await supabase
      .from("classification_results")
      .insert(rows);

    if (insertError) {
      console.error("[保存] Supabase 写入失败:", JSON.stringify(insertError));
      return NextResponse.json(
        {
          error: `数据库写入失败 [${insertError.code}]: ${insertError.message}`,
          details: insertError.details || "",
          hint: insertError.hint || "",
        },
        { status: 500 }
      );
    }

    console.log(`[保存] 成功: session=${sessionId}, rows=${rows.length}`);

    return NextResponse.json({
      success: true,
      sessionId,
      rowCount: rows.length,
    });
  } catch (error) {
    console.error("[保存] 未知错误:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "服务器内部错误",
      },
      { status: 500 }
    );
  }
}
