// ============================================================
// AI 信任校准实验平台 — 核心类型定义
// ============================================================

/** 任务类型 */
export type TaskType =
  | "knowledge"    // 知识获取型
  | "life_advice"  // 生活建议型
  | "professional" // 专业创作型
  | "decision";    // 决策分析型

/** 风险等级 */
export type RiskLevel = "high" | "medium" | "low";

/** 复杂度等级 — 二元分类 */
export type ComplexityLevel = "low" | "high";

/** 平台模式 */
export type PlatformMode = "normal" | "experiment";

/** 风险分析结果 */
export interface RiskAssessment {
  taskType: TaskType;
  riskLevel: RiskLevel;
  complexity: ComplexityLevel;
  complexityScore: number;        // 0-10 分，四维加权
  hasDeadline: boolean;
  deadlineText: string | null;    // 提取的截止日期表述
  matchedKeywords: string[];      // 匹配到的风险关键词
  suggestedVerification: string[]; // 建议核验项（高风险时）
  sourcesSuggestion: string[];    // 建议查询的来源（中风险时）
}

/** 单条聊天消息 */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  riskAssessment?: RiskAssessment; // 用户消息附带的评估
  interventionConfirmed?: boolean; // 高风险：用户是否已确认核查
}

/** DeepSeek API 请求体 */
export interface DeepSeekRequest {
  messages: { role: string; content: string }[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

/** DeepSeek API 响应 */
export interface DeepSeekResponse {
  id: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
