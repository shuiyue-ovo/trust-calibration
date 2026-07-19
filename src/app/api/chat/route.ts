// ============================================================
// DeepSeek API 代理路由 — 避免前端暴露 API Key
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import type { DeepSeekRequest, DeepSeekResponse, RiskAssessment } from "@/types/trust";

const DEEPSEEK_BASE_URL = "https://api.deepseek.com";
const DEEPSEEK_MODEL = "deepseek-chat";

/** 根据风险等级构建系统提示词 */
function buildSystemPrompt(risk: RiskAssessment): string {
  const { taskType, riskLevel, complexity, hasDeadline, deadlineText } = risk;

  const taskTypeInstructions: Record<string, string> = {
    knowledge: "用户正在寻求客观知识。请提供准确、全面的事实信息，并标注信息来源。",
    life_advice: "用户正在寻求生活建议。请提供实用、安全的建议，并提醒专业咨询的重要性。",
    professional: "用户需要专业创作帮助。请提供高质量、可操作的输出，注明使用的领域知识。",
    decision: "用户正在做决策分析。请客观呈现各选项的利弊，不做替代性决策。",
  };

  const riskInstructions: Record<string, string> = {
    high: "⚠️ 此问题涉及高风险领域。请在回答开头明确声明信息的局限性，建议用户咨询专业人士。不要给出确定性的诊断、法律意见或投资建议。",
    medium: "⚡ 此问题涉及中等风险。请在回答中标注关键信息的可靠程度，鼓励用户多方验证。",
    low: "此问题风险较低。保持回答流畅自然，在结尾标注「AI 生成内容仅供参考」。",
  };

  const complexityInstructions: Record<string, string> = {
    low: "",
    high: "此问题复杂度较高，可能需要多步骤推理、跨领域知识整合或结构化规划。请逐步拆解每一步的推理过程，标注关键假设与信息来源。如涉及多个子问题，请分别处理并编号。",
  };

  let prompt = `你是一个有帮助的 AI 助手。\n\n`;
  prompt += taskTypeInstructions[taskType] + "\n\n";
  prompt += riskInstructions[riskLevel] + "\n";
  prompt += complexityInstructions[complexity];

  if (hasDeadline && deadlineText) {
    prompt += `\n用户提到了时间要求：${deadlineText}。请在回答中注意时效性。`;
  }

  return prompt;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, riskAssessment } = body as {
      messages: { role: string; content: string }[];
      riskAssessment?: RiskAssessment;
    };

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "消息不能为空" },
        { status: 400 }
      );
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "DeepSeek API Key 未配置，请在 .env.local 中设置 DEEPSEEK_API_KEY" },
        { status: 500 }
      );
    }

    const systemPrompt = riskAssessment
      ? buildSystemPrompt(riskAssessment)
      : "你是一个有帮助的 AI 助手。";

    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.filter((m) => m.role !== "system"),
    ];

    console.log("[DeepSeek] 发起请求，风险等级:", riskAssessment?.riskLevel ?? "未评估");

    const response = await fetch(`${DEEPSEEK_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 4096,
      } satisfies DeepSeekRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[DeepSeek] API 错误:", response.status, errorText);
      return NextResponse.json(
        { error: `DeepSeek API 错误 (${response.status}): ${errorText}` },
        { status: response.status }
      );
    }

    const data: DeepSeekResponse = await response.json();

    return NextResponse.json({
      content: data.choices[0]?.message?.content ?? "",
      usage: data.usage,
    });
  } catch (error) {
    console.error("[DeepSeek] 请求异常:", error);
    return NextResponse.json(
      { error: "AI 服务暂时不可用，请稍后重试" },
      { status: 500 }
    );
  }
}
