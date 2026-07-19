// ============================================================
// 保存实验结果 API — 写入本地文本文件
// ============================================================

import { NextRequest, NextResponse } from "next/server";
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

    // 保存到 program 文件夹下的实验结果目录
    const dataDir = path.join(process.cwd(), "..", "实验数据");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `分类测试_${timestamp}.json`;

    const output = {
      submittedAt: body.submittedAt,
      totalTimeMs: body.totalTimeMs,
      totalTimeSec: Math.round(body.totalTimeMs / 1000),
      results: body.results.map((r) => ({
        scenarioId: r.scenarioId,
        riskAnswer: r.riskAnswer,
        complexityAnswer: r.complexityAnswer,
        timeSpentSec: (r.timeSpentMs / 1000).toFixed(1),
      })),
    };

    const filePath = path.join(dataDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(output, null, 2), "utf-8");

    console.log(`[实验结果] 已保存到: ${filePath}`);

    return NextResponse.json({
      success: true,
      filename,
      path: filePath,
    });
  } catch (error) {
    console.error("[实验结果] 保存失败:", error);
    return NextResponse.json(
      { error: "保存失败，请重试" },
      { status: 500 }
    );
  }
}
