// ============================================================
// AIIRS 情境感知风险引擎
//
// 三维评估框架：
//   1. 后果严重度 — AI 出错对用户的实际危害程度
//   2. 可验证性   — 用户能否自行判断 AI 回答的正确性
//   3. 领域敏感性 — 涉及领域本身的专业性 / 监管程度
//
// 风险等级定义：
//   HIGH   — 错误后果严重，用户无法自行验证（医疗、法律、安全）
//   MEDIUM — 需要外部验证或专业知识才能判断对错（代码、学术、数据分析）
//   LOW    — 错误后果轻微，用户可凭常识判断（闲聊、菜谱、娱乐）
// ============================================================

import type { RiskAssessment, TaskType, RiskLevel, ComplexityLevel } from "@/types/trust";

// ================================================================
// 第一部分：领域定义 — 每个领域有固定风险等级 + 关键词集
// ================================================================

interface DomainDefinition {
  name: string;            // 领域名称（用于核验项匹配）
  riskLevel: RiskLevel;    // 该领域的固定风险等级
  baseScore: number;       // AIIRS 基础分 (0-10)，用于多领域命中时的加权
  keywords: string[];      // 触发关键词
}

/**
 * AIIRS 领域分类体系
 *
 * 高风险领域 (score 7-10)：错误后果严重，用户难以自行验证
 * ─────────────────────────────────────────────────
 * 临床医学：误诊或错误建议可能危及生命
 * 精神心理：错误引导可能加重病情
 * 药学用药：错误剂量或禁忌可能致命
 * 法律：错误法律建议可能导致败诉或违法
 * 金融投资：错误判断可能导致重大财产损失
 * 人身安全：涉及紧急危险情况
 *
 * 中风险领域 (score 4-6)：需要外部验证，但后果一般可控
 * ─────────────────────────────────────────────────
 * 编程开发：代码错误可测试发现，但可能引入安全漏洞
 * 数据分析：结果可通过多方法交叉验证
 * 学术研究：有同行评审机制，但错误引用可能误导
 * 职业学业：人生重要决策，但信息渠道多元
 * 技术架构：方案可在实施前评估
 *
 * 低风险领域 (score 1-3)：错误后果轻微，常识可判断
 * ─────────────────────────────────────────────────
 * 日常闲聊：无实际后果
 * 菜谱饮食：最多不好吃
 * 娱乐创作：主观性强，无对错之分
 * 通用知识：有大量公开来源可验证
 */
const DOMAINS: DomainDefinition[] = [
  // ==================== 高风险领域 ====================

  // -- 临床医学 / 症状诊断 (score: 10) --
  {
    name: "临床医学",
    riskLevel: "high",
    baseScore: 10,
    keywords: [
      // 常见症状
      "发烧", "发热", "咳嗽", "头疼", "头痛", "头晕", "眩晕",
      "胸闷", "气短", "心慌", "心悸", "呼吸困难",
      "腹痛", "腹泻", "便秘", "恶心", "呕吐",
      "乏力", "水肿", "消瘦", "失眠", "惊醒",
      "出血", "淤青", "肿块", "抽搐", "麻木",
      // 严重症状
      "剧痛", "绞痛", "撕裂", "昏倒", "晕厥", "休克",
      "吐血", "便血", "尿血", "咯血",
      // 疾病名称
      "癌症", "肿瘤", "白血病", "糖尿病", "高血压", "心脏病",
      "中风", "脑梗", "脑出血", "心梗", "冠心",
      "肺炎", "肝炎", "肾炎", "胃炎", "肠炎",
      "哮喘", "癫痫", "帕金森", "艾滋", "结核",
      // 身体部位（仅作为信号，在 contextModifier 中结合语境判断）
      // 不单独列出，避免"我今天去了趟医院"被误判
    ],
  },

  // -- 精神心理 (score: 9) --
  {
    name: "精神心理",
    riskLevel: "high",
    baseScore: 9,
    keywords: [
      "抑郁", "焦虑", "自杀", "自残", "自伤", "轻生",
      "精神分裂", "双相", "创伤后应激", "PTSD",
      "厌食", "暴食", "强迫症", "恐惧症",
      "心理治疗", "心理咨询", "精神科",
      "抗抑郁", "安定", "镇静",
    ],
  },

  // -- 药学 / 用药 (score: 10) --
  {
    name: "用药",
    riskLevel: "high",
    baseScore: 10,
    keywords: [
      "吃药", "服药", "用药", "处方药", "非处方",
      "剂量", "过量", "副作用", "禁忌", "过敏反应",
      "止痛药", "安眠药", "抗生素", "消炎药", "激素",
      "中药", "西药", "偏方", "秘方", "土方",
    ],
  },

  // -- 手术 / 住院 (score: 10) --
  {
    name: "手术",
    riskLevel: "high",
    baseScore: 10,
    keywords: [
      "手术", "开刀", "住院", "麻醉", "术前", "术后",
      "化疗", "放疗", "透析", "支架", "搭桥",
    ],
  },

  // -- 急救 (score: 10) --
  {
    name: "急救",
    riskLevel: "high",
    baseScore: 10,
    keywords: [
      "急救", "急诊", "抢救", "中毒", "窒息", "心脏骤停",
    ],
  },

  // -- 法律 (score: 9) --
  {
    name: "法律",
    riskLevel: "high",
    baseScore: 9,
    keywords: [
      "法律", "诉讼", "起诉", "被告", "原告", "判刑", "量刑",
      "违法", "犯罪", "诈骗", "拘留", "逮捕", "通缉",
      "合同", "违约", "侵权", "赔偿", "仲裁", "调解",
      "遗产", "继承", "公证", "离婚协议",
    ],
  },

  // -- 金融投资 (score: 8) --
  {
    name: "投资",
    riskLevel: "high",
    baseScore: 8,
    keywords: [
      "投资", "股票", "期货", "外汇", "基金定投",
      "加密货币", "比特币", "以太坊", "NFT",
      "贷款", "抵押", "高利贷", "网贷",
      "理财", "保险", "私募", "杠杆", "配资",
    ],
  },

  // -- 人身安全 (score: 10) --
  {
    name: "安全",
    riskLevel: "high",
    baseScore: 10,
    keywords: [
      "火灾", "地震", "洪水", "台风", "触电", "漏电",
      "燃气泄漏", "煤气", "爆炸", "塌方", "塌陷",
      "暴力", "袭击", "绑架", "跟踪",
    ],
  },

  // ==================== 中风险领域 ====================

  // -- 编程开发 (score: 5) --
  {
    name: "编程开发",
    riskLevel: "medium",
    baseScore: 5,
    keywords: [
      "代码", "编程", "bug", "debug", "部署", "上线",
      "API", "接口", "数据库", "SQL", "NoSQL",
      "前端", "后端", "全栈", "框架", "React", "Vue", "Next",
      "Python", "Java", "Go", "Rust", "TypeScript",
      "算法", "数据结构", "时间复杂度",
      "Git", "Docker", "Kubernetes", "CI/CD",
      "重构", "设计模式", "架构", "微服务",
    ],
  },

  // -- 数据分析 (score: 4) --
  {
    name: "数据分析",
    riskLevel: "medium",
    baseScore: 4,
    keywords: [
      "数据分析", "数据挖掘", "机器学习", "深度学习",
      "统计", "回归", "分类", "聚类", "预测",
      "可视化", "图表", "报表", "指标",
      "Excel", "SQL", "Python", "pandas", "numpy",
      "A/B测试", "假设检验", "显著性",
    ],
  },

  // -- 学术研究 (score: 4) --
  {
    name: "学术研究",
    riskLevel: "medium",
    baseScore: 4,
    keywords: [
      "论文", "文献", "引用", "参考文献", "综述",
      "学术", "研究", "实验", "假设", "方法论",
      "博士", "硕士", "学术写作", "发表",
      "知网", "Google Scholar", "PubMed",
      "影响因子", "同行评审", "预印本",
    ],
  },

  // -- 技术架构决策 (score: 5) --
  {
    name: "技术架构",
    riskLevel: "medium",
    baseScore: 5,
    keywords: [
      "架构", "技术选型", "方案设计", "系统设计",
      "高可用", "高并发", "分布式", "容灾", "灾备",
      "安全审计", "渗透测试", "合规",
    ],
  },

  // -- 职业学业 (score: 5) --
  {
    name: "职业学业",
    riskLevel: "medium",
    baseScore: 5,
    keywords: [
      "职业", "跳槽", "转行", "薪资", "offer",
      "面试", "简历", "求职", "招聘",
      "考研", "留学", "申请", "志愿填报",
      "专业选择", "职业规划",
    ],
  },

  // -- 重要消费决策 (score: 4) --
  {
    name: "消费决策",
    riskLevel: "medium",
    baseScore: 4,
    keywords: [
      "买房", "购房", "房产", "装修", "租房",
      "买车", "购车", "二手车",
    ],
  },

  // -- 人际关系 (score: 5) --
  {
    name: "人际关系",
    riskLevel: "medium",
    baseScore: 5,
    keywords: [
      "感情", "分手", "离婚", "婚姻", "出轨",
      "家庭矛盾", "育儿", "亲子", "婆媳",
    ],
  },

  // ==================== 低风险领域 ====================

  // -- 菜谱饮食 (score: 2) --
  {
    name: "菜谱饮食",
    riskLevel: "low",
    baseScore: 2,
    keywords: [
      "菜谱", "食谱", "做菜", "烹饪", "做饭",
      "烘焙", "甜点", "面包", "蛋糕",
      "食材", "调料", "配方",
    ],
  },

  // -- 日常闲聊 (score: 1) --
  {
    name: "日常闲聊",
    riskLevel: "low",
    baseScore: 1,
    keywords: [
      "你好", "谢谢", "再见", "晚安", "早安",
      "天气", "今天", "周末", "假期",
      "笑话", "段子", "故事", "脑筋急转弯",
      "明星", "八卦", "娱乐", "追剧",
    ],
  },

  // -- 娱乐创作 (score: 2) --
  {
    name: "娱乐创作",
    riskLevel: "low",
    baseScore: 2,
    keywords: [
      "写诗", "写歌", "歌词", "小说", "故事",
      "画画", "画图", "设计", "创意",
      "游戏", "攻略", "角色", "装备",
    ],
  },

  // -- 通用知识 (score: 2) --
  {
    name: "通用知识",
    riskLevel: "low",
    baseScore: 2,
    keywords: [
      "什么是", "定义", "概念", "原理", "为什么",
      "历史", "起源", "发明", "发现",
      "百科", "解释", "含义", "区别",
    ],
  },
];

// ================================================================
// 第二部分：严重度调节器 — 可以升级风险等级的语言信号
// ================================================================

interface SeverityModifier {
  pattern: RegExp | string;   // 匹配模式
  scoreBoost: number;         // 加分（加到 baseScore 上）
  description: string;        // 调节原因
}

/**
 * 严重度调节规则
 *
 * 即使基础领域是低/中风险，如果用户表达中出现了以下模式，
 * 说明用户可能将该信息用于重要决策，需提升风险等级。
 */
const SEVERITY_MODIFIERS: SeverityModifier[] = [
  // -- 紧急/时间压力（+3）--
  // 用户面临时间压力时，更可能跳过外部验证，风险显著上升
  { pattern: /紧急|急救|救命|危重/, scoreBoost: 3, description: "紧急情况" },
  { pattern: /马上|立即|赶快|赶紧|速度/, scoreBoost: 2, description: "时间压力" },

  // -- 个人风险承担（+2）--
  // 用户以自己的健康/安全/财产为赌注时，风险上升
  { pattern: /我.*(疼|痛|难受|不舒服|出血|肿)/, scoreBoost: 2, description: "个人症状描述" },
  { pattern: /我家|我孩子|我父母|我老公|我老婆/, scoreBoost: 1, description: "家人涉及" },

  // -- 严重后果语言（+3）--
  // 用户自己在担心严重后果，说明信息准确性至关重要
  { pattern: /会不会死|会不会瘫痪|会不会瞎/, scoreBoost: 3, description: "严重后果担忧" },
  { pattern: /有没有危险|危险吗|安全吗/, scoreBoost: 2, description: "安全担忧" },
  { pattern: /严重吗|严不严重|恶化/, scoreBoost: 2, description: "严重性询问" },

  // -- 决策依赖（+1）--
  // 用户明确表示要依据 AI 回答做决定
  { pattern: /该不该|要不要|能不能.*做|可以.*做吗/, scoreBoost: 1, description: "决策依赖" },
  { pattern: /帮我决定|帮我选|听你的/, scoreBoost: 2, description: "强决策依赖" },

  // -- 专业身份（+1）--
  // 用户以专业身份提问，错误回答可能传播给更多人
  { pattern: /公司|企业|团队|客户|病人|学生/, scoreBoost: 1, description: "涉及第三方" },
];

// ================================================================
// 第三部分：语境信号 — 非关键词的语义判断
// ================================================================

/**
 * 检查文本中是否存在"求助诊断"语境
 * 即用户在描述症状后询问病因/治疗方法
 */
const DIAGNOSIS_PATTERNS = [
  /是.*病[吗呢]?[？?]?$/,
  /是不是.*病/,
  /会不会.*癌|瘤/,
  /需.*去.*医院/,
  /要看.*医生/,
  /挂.*科/,
  /吃.*药/,
  /用.*药/,
  /打.*针/,
  /做.*手术/,
  /怎么治|如何治|治.*好/,
  /能.*好.*吗/,
  /会.*传染/,
  /有.*后遗症/,
];

/**
 * 检查文本是否在描述身体不适 + 求助
 */
function hasDiagnosisContext(text: string): boolean {
  return DIAGNOSIS_PATTERNS.some((p) => p.test(text));
}

// ================================================================
// 第四部分：任务类型分类（保持不变）
// ================================================================

const TASK_TYPE_KEYWORDS: Record<TaskType, string[]> = {
  knowledge: [
    "什么是", "如何定义", "解释", "原理", "为什么", "历史", "概念",
    "含义", "定义", "了解", "知道", "查询", "查找", "搜索", "百科",
    "是谁", "什么时候", "哪里", "多少", "介绍", "背景", "起源",
    "概述", "总结", "概括",
  ],
  life_advice: [
    "应该", "怎么办", "建议", "推荐", "如何做", "怎么处理", "日常",
    "生活", "饮食", "运动", "睡眠", "减肥", "护肤", "养生", "健身",
    "做饭", "菜谱", "旅游", "旅行", "穿搭", "化妆", "美容",
    "怎么跟", "如何处理", "应对", "缓解", "改善",
  ],
  professional: [
    "写", "创作", "代码", "设计", "翻译", "改写", "生成", "编程",
    "开发", "制作", "构建", "撰写", "编写", "画", "作曲", "文案",
    "脚本", "演讲稿", "方案", "报告", "PPT", "简历",
    "帮我写", "帮我做", "帮我画", "帮我生成", "帮我翻译",
  ],
  decision: [
    "选择", "比较", "哪个好", "分析", "评估", "权衡", "优劣",
    "优缺点", "区别", "对比", "决定", "应该选", "选哪个",
    "还是", "或者", "二者", "方案", "哪一个", "哪种", "哪款",
    "是否应该", "该不该", "要不要",
  ],
};

// ================================================================
// 第五部分：AIIRS 复杂度四维评分
//
// 四个可独立评分的维度，每题 0-N 分，总分 0-10：
//
//   D1. 步骤数        (0-3) — 单步查询 → 多步推理
//   D2. 规划与分析    (0-3) — 简单回忆 → 结构化分析/方案设计
//   D3. 跨领域/外部信息 (0-2) — 单领域自包含 → 多领域整合
//   D4. 目标明确度    (0-2) — 目标清晰具体 → 目标模糊需推断
//
// 判定阈值：0-4 = 低复杂度, 5-10 = 高复杂度
// ================================================================

const DEADLINE_PATTERNS = [
  "今天", "明天", "后天", "下周", "本月", "月底", "年底",
  "这周", "今年", "下个月", "明年", "周末", "今晚", "明晚",
  "紧急", "尽快", "马上", "急", "赶快", "赶紧", "速度",
  "截止", "deadline", "到期", "过期", "ddl",
  /\d{1,2}月\d{1,2}[日号]/,
  /\d{1,2}\/\d{1,2}/,
  /\d{4}-\d{1,2}-\d{1,2}/,
];

/** 复杂度评估结果，包含每维度得分（调试/解释用） */
interface ComplexityResult {
  level: ComplexityLevel;
  score: number;          // 0-10 总分
  dimensions: {
    steps: number;        // D1: 步骤数 (0-3)
    planning: number;     // D2: 规划与分析 (0-3)
    crossDomain: number;  // D3: 跨领域/外部信息 (0-2)
    goalClarity: number;  // D4: 目标明确度 (0-2)
  };
}

/**
 * 复杂度分类函数（AIIRS 四维加权）
 *
 * 设计原则：
 * - 低复杂度（0-4分）：单步查询、目标明确、无需规划、信息自包含
 *   例: "什么是机器学习？"、"今天天气怎么样"
 * - 高复杂度（5-10分）：多步推理、需要规划分析、跨领域知识整合、
 *   涉及学术/统计/工程方法论、目标模糊需推断
 *   例: "比较两组实验数据该用哪种统计检验及适用条件"
 *       "帮我规划上海三日游行程含交通住宿景点"
 *       "分析我们公司该不该上微服务并给出迁移方案"
 */
function calculateComplexity(text: string): ComplexityResult {
  const len = text.length;

  // ═══════════════════════════════════════════════════════
  // D1: 步骤数 (0-3)
  // 判断：单步查询 vs 需要多步操作/多子任务
  // ═══════════════════════════════════════════════════════
  let steps = 0;

  // —— 单步信号（0分）——
  const singleStepPatterns = [
    /^(什么是|定义|解释|查询|查找|搜索|翻译|在哪|多少|是谁|什么时候)/,
    /^[^，,。.!！?？]{0,35}[？?]$/,
  ];
  const isSingleStep = singleStepPatterns.some((p) => p.test(text.trim()));

  // —— 显式多步信号（每个+1，上限3）——
  const multiStepExplicit = [
    "步骤", "第一步", "第二步", "第三步",
    "先", "再", "然后", "最后", "接着",
    "流程", "环节", "阶段",
  ];
  let multiStepScore = multiStepExplicit.filter((kw) => text.includes(kw)).length;

  // —— 用户提供了结构化数据（N=, 均值=, 标准差= 等）→ 数据→分析→结论，天然多步 ——
  const hasProvidedData = /[Nn]\s*[=＝]\s*\d+|均值|平均|标准差|方差|中位数|样本[量数]|实验组|对照组|控制组|[Pp]\s*[<≤>]\s*0\.\d+|置信区间/.test(text);
  if (hasProvidedData) multiStepScore += 2;

  // —— 多子问题：同时要求多个不同产出 → 天然多步 ——
  const subQuestionCount = (text.match(/[和及与并且还].*?(?:方法|条件|原因|步骤|原理|优劣|区别|名称)/g) || []).length;
  // 也用 "告诉我...和..." 等模式检测
  const hasMultiAsk = /(?:告诉|解释|说明|列出).*(?:和|以及|并).*(?:方法|条件|原因|步骤|名称|类型)/.test(text);
  if (subQuestionCount >= 2 || hasMultiAsk) multiStepScore += 1;

  // —— 隐含多步（过程型任务）——
  const multiStepImplicit = [
    "如何实现", "怎么做", "怎么搭建", "如何构建",
    "部署", "配置", "安装", "搭建", "开发",
    "如何选择", "该用哪种", "选用哪个",
  ];
  const hasImplicitMulti = multiStepImplicit.some((kw) => text.includes(kw));

  if (multiStepScore >= 3) {
    steps = 3;
  } else if (multiStepScore >= 2) {
    steps = 2;
  } else if (multiStepScore >= 1 || hasImplicitMulti) {
    steps = 1;
  } else if (isSingleStep && len < 50) {
    steps = 0;
  } else {
    steps = 1;
  }

  // ═══════════════════════════════════════════════════════
  // D2: 规划与分析需求 (0-3)
  // 判断：简单回忆 vs 需要结构化分析或方法论推演
  // ═══════════════════════════════════════════════════════
  let planning = 0;

  const noAnalysisNeeded = [
    "什么是", "定义", "翻译", "在哪", "多少", "是谁",
    "你好", "谢谢", "再见",
  ];
  const isTrivialQuery =
    noAnalysisNeeded.some((kw) => text.startsWith(kw)) && len < 30;

  if (isTrivialQuery) {
    planning = 0;
  } else {
    // 轻量分析（1分）
    const lightAnalysis = ["为什么", "原因", "影响", "导致", "后果", "如何"];
    const hasLight = lightAnalysis.some((kw) => text.includes(kw));

    // 结构化分析（2分）
    const structuredAnalysis = [
      "比较", "对比", "区别", "异同", "优劣", "优缺点",
      "分析", "评估", "评测", "评价",
    ];
    const hasStructured = structuredAnalysis.some((kw) => text.includes(kw));

    // ⭐ 学术/统计/工程方法论（2分，可与 structured 叠加到 3）
    const academicAnalysis = [
      "检验", "显著性", "假设检验", "方差分析",
      "回归分析", "相关分析", "因子分析",
      "适用条件", "前提假设", "前提条件",
      "推论", "推断", "归纳", "演绎",
      "方法论", "研究设计", "实验设计",
      "优化", "改进", "验证", "复现",
    ];
    const hasAcademic = academicAnalysis.some((kw) => text.includes(kw));

    // 规划/方案设计（3分）
    const planningKeywords = [
      "规划", "计划", "方案", "设计", "架构", "策略",
      "制定", "拟定", "策划", "布局",
    ];
    const hasPlanning = planningKeywords.some((kw) => text.includes(kw));

    // 条件推理
    const conditionalPatterns = [
      /如果.*[会该则].*/,
      /假如|假设|若是|倘若/,
      /该不该|要不要|是否应该/,
    ];
    const hasConditional = conditionalPatterns.some((p) => p.test(text));

    if (hasPlanning) {
      planning = 3;
    } else if (
      (hasStructured && hasAcademic) ||
      (hasStructured && hasConditional) ||
      (hasAcademic && hasProvidedData)
    ) {
      // 结构化+学术 = 复合分析需求 → 3分
      planning = 3;
    } else if (hasStructured || hasAcademic) {
      planning = 2;
    } else if (hasLight && hasConditional) {
      planning = 2;
    } else if (hasLight) {
      planning = 1;
    } else if (len > 120) {
      planning = 1;
    }
  }

  // ═══════════════════════════════════════════════════════
  // D3: 跨领域 / 外部信息需求 (0-2)
  // 判断：自包含 vs 需要跨领域知识或外部参考
  // ═══════════════════════════════════════════════════════
  let crossDomain = 0;

  const domainSignals = [
    { name: "技术工程", words: ["代码", "编程", "API", "算法", "架构", "服务器", "数据库", "微服务", "容器"] },
    { name: "商业管理", words: ["市场", "营销", "销售", "收入", "成本", "盈利", "融资", "商业模式"] },
    { name: "设计创意", words: ["UI", "UX", "配色", "排版", "视觉", "品牌", "海报"] },
    { name: "数据统计", words: ["数据", "统计", "指标", "报表", "可视化", "回归", "概率", "分布"] },
    { name: "法律合规", words: ["法律", "合同", "诉讼", "权利", "法规", "合规", "侵权"] },
    { name: "医疗健康", words: ["疾病", "治疗", "药物", "诊断", "症状", "临床"] },
    { name: "教育教学", words: ["学习", "教育", "课程", "考试", "教学", "论文", "学术"] },
    { name: "金融投资", words: ["投资", "理财", "股票", "基金", "贷款", "保险"] },
    { name: "实验研究", words: ["实验", "研究", "假设", "变量", "对照组", "实验组", "样本", "测量", "量表"] },
  ];

  const hitDomains = domainSignals.filter((d) =>
    d.words.some((w) => text.includes(w))
  );
  const domainCount = hitDomains.length;

  const crossDomainKeywords = ["结合", "综合", "整合", "融合", "跨领域", "跨界"];
  const hasCrossExplicit = crossDomainKeywords.some((kw) => text.includes(kw));

  const needsExternalRef = [
    "引用", "参考", "来源", "文献",
    "根据", "依据", "按照", "最新",
    "数据", "资料", "查阅", "调研",
  ].some((kw) => text.includes(kw));

  if (domainCount >= 3 || hasCrossExplicit) {
    crossDomain = 2;
  } else if (domainCount >= 2 || (needsExternalRef && domainCount >= 1)) {
    crossDomain = 2;
  } else if (needsExternalRef || domainCount >= 1) {
    crossDomain = 1;
  }

  // ═══════════════════════════════════════════════════════
  // D4: 目标明确度 (0-2，分越高越模糊)
  // ═══════════════════════════════════════════════════════
  let goalClarity = 0;

  const vagueSignals = [
    "随便", "都行", "帮忙看看", "帮我看下", "给点建议",
    "怎么样", "好不好", "行不行",
  ];
  const vagueCount = vagueSignals.filter((kw) => text.includes(kw)).length;

  const hasNoSpecificTarget = len < 30 && !text.includes("是") && !text.includes("做");

  const overlyBroad = [
    "怎么学习", "如何提升", "怎么赚钱", "如何成功",
    "做什么工作", "学什么专业",
  ].some((kw) => text.includes(kw));

  if (vagueCount >= 2 || overlyBroad) {
    goalClarity = 2;
  } else if (vagueCount >= 1 || hasNoSpecificTarget) {
    goalClarity = 1;
  }

  // ═══════════════════════════════════════════════════════
  // 综合评分（含协同加成）
  // ═══════════════════════════════════════════════════════

  // 协同加成：当多维度同时触发时，说明任务是复合型的
  // 例如"分析+数据+跨领域"比各维度简单相加更复杂
  let synergyBonus = 0;
  if (steps >= 2 && planning >= 2) synergyBonus += 0.5;
  if (planning >= 2 && crossDomain >= 1) synergyBonus += 0.5;

  const totalScore = Math.min(
    steps + planning + crossDomain + goalClarity + synergyBonus,
    10
  );
  const level: ComplexityLevel = totalScore >= 5 ? "high" : "low";

  return {
    level,
    score: totalScore,
    dimensions: { steps, planning, crossDomain, goalClarity },
  };
}

// ================================================================
// 第六部分：主分类函数（AIIRS 三维评分）
// ================================================================

/**
 * AIIRS 风险分类
 *
 * 流程：
 *   1. 领域匹配 → 确定基础风险等级 + 基础分
 *   2. 严重度调节 → 检查语言信号，可能提升风险等级
 *   3. 诊断语境 → 额外的医疗求助检测
 *   4. 多领域冲突 → 取最高风险等级
 *
 * 阈值：
 *   总分 >= 7 → HIGH
 *   总分 >= 4 → MEDIUM
 *   总分 <  4 → LOW
 */
export function analyzeRisk(text: string): RiskAssessment {
  // ---- 步骤 1: 领域匹配 ----
  const hits: { domain: DomainDefinition; count: number }[] = [];

  for (const domain of DOMAINS) {
    let count = 0;
    for (const kw of domain.keywords) {
      if (text.includes(kw)) count++;
    }
    if (count > 0) {
      hits.push({ domain, count });
    }
  }

  // 收集所有命中关键词
  const allMatchedKeywords: string[] = [];
  for (const hit of hits) {
    for (const kw of hit.domain.keywords) {
      if (text.includes(kw) && !allMatchedKeywords.includes(kw)) {
        allMatchedKeywords.push(kw);
      }
    }
  }

  // ---- 步骤 2: 计算 AIIRS 总分 ----
  // 取最高基础分 + 去重后的额外领域加分 + 严重度调节
  let maxBaseScore = 0;
  let maxRiskLevel: RiskLevel = "low";
  const hitDomains: string[] = [];

  for (const hit of hits) {
    hitDomains.push(hit.domain.name);
    if (hit.domain.baseScore > maxBaseScore) {
      maxBaseScore = hit.domain.baseScore;
    }
    // 风险等级取最高
    const rlOrder: Record<RiskLevel, number> = { high: 3, medium: 2, low: 1 };
    if (rlOrder[hit.domain.riskLevel] > rlOrder[maxRiskLevel]) {
      maxRiskLevel = hit.domain.riskLevel;
    }
  }

  // 额外领域加分：每多命中一个不同领域 +0.5（上限 2）
  const domainBonus = Math.min((hits.length - 1) * 0.5, 2);
  let totalScore = maxBaseScore + domainBonus;

  // ---- 步骤 3: 严重度调节 ----
  const triggeredModifiers: string[] = [];
  for (const mod of SEVERITY_MODIFIERS) {
    const matched =
      typeof mod.pattern === "string"
        ? text.includes(mod.pattern)
        : mod.pattern.test(text);
    if (matched) {
      totalScore = Math.min(totalScore + mod.scoreBoost, 10);
      triggeredModifiers.push(mod.description);
    }
  }

  // ---- 步骤 4: 诊断语境检测 ----
  if (hasDiagnosisContext(text) && maxRiskLevel !== "high") {
    // 诊断语境 + 任何身体症状描述 → 至少中风险
    totalScore = Math.max(totalScore, 4);
    triggeredModifiers.push("诊断求助语境");
  }

  // ---- 步骤 4.5: 纯定义类问题降级 ----
  // 如果问题是 "什么是X / X是什么意思 / X的定义" 这种纯知识查询，
  // 且仅命中中风险领域的单个关键词、无严重度调节触发，
  // 则不应因领域关键词而升级风险（问"算法是什么"≠在写代码）
  const isPureDefinition =
    /^什么是|啥是|什么叫|.*是什么意思|.*的定义|.*的概念|.*怎样理解|.*如何理解/.test(
      text.trim()
    ) ||
    /什么是|是什么意思|的定义|的概念/.test(text);
  const onlySingleMediumHit =
    hits.length === 1 &&
    hits[0].domain.riskLevel === "medium" &&
    hits[0].count <= 2; // 1-2 个关键词命中，非深度匹配
  const noSeverityBoost = triggeredModifiers.length === 0;

  if (isPureDefinition && onlySingleMediumHit && noSeverityBoost && maxRiskLevel !== "high") {
    totalScore = Math.min(totalScore, 3); // 强制低于 4 分（medium 阈值）
  }

  // ---- 步骤 5: 最终判定 ----
  let finalRiskLevel: RiskLevel;
  if (totalScore >= 7) {
    finalRiskLevel = "high";
  } else if (totalScore >= 4) {
    finalRiskLevel = "medium";
  } else {
    finalRiskLevel = "low";
  }

  // 如果领域分类已经是 high，即使总分因调节而降级也保持 high
  // （医疗/法律/安全领域不降级）
  if (maxRiskLevel === "high" && finalRiskLevel !== "high") {
    finalRiskLevel = "medium"; // 最低降级到 medium
  }

  // ---- 步骤 6: 并行计算其他维度 ----
  const taskType = classifyTaskType(text);
  const { level: complexity, score: complexityScore } = calculateComplexity(text);
  const { hasDeadline, deadlineText } = detectDeadline(text);
  const suggestedVerification = generateVerificationItems(finalRiskLevel, hitDomains);
  const sourcesSuggestion =
    finalRiskLevel === "medium" ? generateSourcesSuggestion(taskType) : [];

  return {
    taskType,
    riskLevel: finalRiskLevel,
    complexity,
    complexityScore,
    hasDeadline,
    deadlineText,
    matchedKeywords: allMatchedKeywords,
    suggestedVerification,
    sourcesSuggestion,
  };
}

// ================================================================
// 第七部分：辅助函数
// ================================================================

function classifyTaskType(text: string): TaskType {
  const scores: Record<TaskType, number> = {
    knowledge: 0,
    life_advice: 0,
    professional: 0,
    decision: 0,
  };

  for (const [type, keywords] of Object.entries(TASK_TYPE_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) {
        scores[type as TaskType] += 1;
      }
    }
  }

  let maxType: TaskType = "knowledge";
  let maxScore = 0;
  for (const [type, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      maxType = type as TaskType;
    }
  }

  if (maxScore === 0) {
    if (text.includes("?") || text.includes("？")) return "knowledge";
    if (text.length > 100) return "decision";
    return "knowledge";
  }

  return maxType;
}

function detectDeadline(text: string): {
  hasDeadline: boolean;
  deadlineText: string | null;
} {
  for (const pattern of DEADLINE_PATTERNS) {
    if (typeof pattern === "string") {
      if (text.includes(pattern)) {
        return { hasDeadline: true, deadlineText: pattern };
      }
    } else {
      const match = text.match(pattern);
      if (match) {
        return { hasDeadline: true, deadlineText: match[0] };
      }
    }
  }
  return { hasDeadline: false, deadlineText: null };
}

// ================================================================
// 第八部分：核验项生成
// ================================================================

const HIGH_RISK_VERIFICATION: Record<string, string[]> = {
  "临床医学": [
    "AI 不能替代执业医师的诊断，请务必就医确认",
    "症状可能有多种病因，需专业检查才能确诊",
    "是否已在正规医疗机构进行检查？",
    "不同个体情况差异大，请勿自行套用 AI 建议",
  ],
  "精神心理": [
    "心理健康问题需专业心理医生/精神科医生介入",
    "AI 不能替代心理治疗和药物干预",
    "如处于危机状态，请立即拨打心理援助热线",
  ],
  "用药": [
    "药物是否为正规处方药或 OTC 药品？",
    "是否了解药物的禁忌症和可能的副作用？",
    "切勿自行更改剂量或混用药物",
  ],
  "手术": [
    "手术方案是否经主治医生详细解说？",
    "是否已充分了解手术风险和术后恢复周期？",
    "建议获取第二医疗意见后再做决策",
  ],
  "急救": [
    "如情况紧急请立即拨打 120",
    "请勿依赖 AI 建议处理紧急医疗状况",
    "等待救援时应保持冷静，听从调度员指导",
  ],
  "法律": [
    "信息是否来自官方法律法规或执业律师？",
    "是否适用于你所在地区的法律体系？",
    "法律规定有时效性，请确认是否为最新版本",
    "是否涉及多部法律的交叉适用？",
  ],
  "投资": [
    "信息来源是否具有合法资质（证监会备案等）？",
    "是否充分了解该投资的风险等级和可能的亏损？",
    "历史收益不代表未来表现",
    "建议咨询持牌金融顾问后再做决策",
  ],
  "安全": [
    "是否已联系相关紧急服务？",
    "信息来源是否为官方机构？",
    "建议寻求专业人员现场处理",
    "人身安全优先于财产物品",
  ],
};

const DEFAULT_HIGH_VERIFICATION = [
  "该信息是否来自权威可信的来源？",
  "是否有官方机构或专业组织支持该观点？",
  "建议在多个独立来源间交叉验证",
  "如有疑虑，请咨询相关领域专业人士",
];

function generateVerificationItems(
  riskLevel: RiskLevel,
  hitDomains: string[],
): string[] {
  if (riskLevel !== "high") return [];

  const items = new Set<string>();

  // 按命中的领域匹配核验项
  for (const domainName of hitDomains) {
    const category = Object.keys(HIGH_RISK_VERIFICATION).find(
      (cat) => domainName.includes(cat) || cat.includes(domainName)
    );
    if (category) {
      HIGH_RISK_VERIFICATION[category].forEach((item) => items.add(item));
    }
  }

  // 回退：默认核验项
  if (items.size === 0) {
    DEFAULT_HIGH_VERIFICATION.forEach((item) => items.add(item));
  }

  return Array.from(items).slice(0, 8);
}

function generateSourcesSuggestion(taskType: TaskType): string[] {
  const baseMap: Record<TaskType, string[]> = {
    knowledge: [
      "维基百科 / 百度百科",
      "Google Scholar / 知网",
      "权威教科书或学术出版物",
    ],
    life_advice: [
      "知名健康网站（如丁香医生、WebMD）",
      "政府卫生机构官网（如卫健委、CDC）",
      "有资质的专业人士建议",
    ],
    professional: [
      "官方技术文档",
      "行业标准或规范",
      "同领域专家或社区的实践反馈",
    ],
    decision: [
      "多方独立评测（避免单一广告来源）",
      "真实用户评价与使用反馈",
      "官方数据与第三方数据的交叉比对",
    ],
  };

  return baseMap[taskType] || baseMap.knowledge;
}

// ================================================================
// 第九部分：导出常量
// ================================================================

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  knowledge: "知识获取型",
  life_advice: "生活建议型",
  professional: "专业创作型",
  decision: "决策分析型",
};

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  high: "高风险",
  medium: "中风险",
  low: "低风险",
};

export const COMPLEXITY_LABELS: Record<ComplexityLevel, string> = {
  low: "低复杂度",
  high: "高复杂度",
};
