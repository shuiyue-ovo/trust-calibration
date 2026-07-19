// ============================================================
// 保存实验结果 API → Supabase（原生 fetch，绕过 supabase-js）
// ============================================================

import { NextRequest, NextResponse } from "next/server";

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

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: `环境变量缺失: URL=${!!supabaseUrl}, Key=${!!supabaseServiceKey}` },
        { status: 500 }
      );
    }

    const sessionId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    // 逐条插入（避免数组格式兼容问题）
    const errors: string[] = [];
    for (const r of body.results) {
      const row = {
        session_id: sessionId,
        scenario_id: Number(r.scenarioId),
        risk_answer: String(r.riskAnswer),
        complexity_answer: String(r.complexityAnswer),
        time_spent_ms: Number(Math.round(r.timeSpentMs)),
        total_time_ms: Number(Math.round(body.totalTimeMs)),
      };

      const res = await fetch(
        `${supabaseUrl}/rest/v1/classification_results`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseServiceKey}`,
            apikey: supabaseServiceKey,
            Prefer: "return=minimal",
          },
          body: JSON.stringify(row),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        errors.push(`场景${r.scenarioId}: ${res.status} ${errText}`);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors.join(" | ") },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId,
      count: body.results.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "服务器错误" },
      { status: 500 }
    );
  }
}
