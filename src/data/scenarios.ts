// ============================================================
// 分类测试场景数据 — 10 个 AI 使用场景
// 仅向被试展示：编号 + 描述
// 预设答案不展示在界面上
// ============================================================

export interface ScenarioDefinition {
  id: number;
  description: string;
  // 预设答案（不展示给被试）
  presetTaskType: string;
  presetComplexity: "低" | "高";
  presetRisk: "低" | "中" | "高";
  presetTimePressure: "有" | "无";
}

export const SCENARIOS: ScenarioDefinition[] = [
  {
    id: 1,
    description:
      '你计划在一个月后的假期出游，正在使用AI助手询问："去韩国旅游一周，首尔和釜山的经典行程怎么安排？"你打算参考AI的回答来规划行程。',
    presetTaskType: "生活建议型",
    presetComplexity: "低",
    presetRisk: "低",
    presetTimePressure: "无",
  },
  {
    id: 2,
    description:
      '你刷手机时看到一篇科普文章说亚洲人普遍有乳糖不耐受，你觉得挺有意思，但不确定这个说法是不是真的，你想询问AI："为什么亚洲人普遍有乳糖不耐受？"',
    presetTaskType: "知识获取型",
    presetComplexity: "低",
    presetRisk: "低",
    presetTimePressure: "无",
  },
  {
    id: 3,
    description:
      '你正在使用AI助手咨询："我的团队里一位同学（或同事）总是不回复协作消息，我应该怎么在不伤和气的情况下提醒他？"你准备参考AI的话术去实际沟通。',
    presetTaskType: "生活建议型",
    presetComplexity: "低",
    presetRisk: "低",
    presetTimePressure: "无",
  },
  {
    id: 4,
    description:
      '明天早上就要考线性代数了，你发现你对伴随矩阵的概念一直很模糊不清楚。你想快速用AI查清楚。"明天就要考线性代数了，伴随矩阵是什么意思，怎么求？"',
    presetTaskType: "知识获取型",
    presetComplexity: "低",
    presetRisk: "低",
    presetTimePressure: "有",
  },
  {
    id: 5,
    description:
      '你在上完今天的专业课后，发现自己对老师今天讲的知识点有点没听懂，正在询问AI："算法的归并排序是什么意思？"',
    presetTaskType: "知识获取型",
    presetComplexity: "低",
    presetRisk: "低",
    presetTimePressure: "无",
  },
  {
    id: 6,
    description:
      '学校的一场考试安排在明天，你今天突然生病需要申请补考，正在询问AI助手怎么给教务写一封邮件说明情况："我因为生病明天没法参加考试，我要给教务写一封邮件说明情况，申请补考，我想知道要包含哪些要素。"你打算稍作修改后直接发送。',
    presetTaskType: "知识获取型",
    presetComplexity: "低",
    presetRisk: "中",
    presetTimePressure: "有",
  },
  {
    id: 7,
    description:
      '你今天有一篇课程作业论文即将截止，而你还有几个部分没有完成，你在让AI帮助你完成："我的作业论文今晚截止！研究主题是运用舌机接口帮助渐冻症病人输出行为意图，我想知道目前的现有研究、这种方法的应用和可行性分析。"',
    presetTaskType: "知识获取型",
    presetComplexity: "高",
    presetRisk: "中",
    presetTimePressure: "有",
  },
  {
    id: 8,
    description:
      '你正在使用AI助手描述你的实验数据，并提问："我想知道我的实验数据应该用什么统计检验方法来比较差异是否显著？请告诉我具体的检验方法名称和适用条件。"你计划直接采用AI推荐的方法进行数据分析。',
    presetTaskType: "知识获取型",
    presetComplexity: "高",
    presetRisk: "中",
    presetTimePressure: "无",
  },
  {
    id: 9,
    description:
      '你的室友突然高烧不退，你正在使用AI助手咨询："室友发烧39度一直不退，校医院已经关门了，你建议我先给她吃退烧药，还是立刻带她去医院？"你需要根据AI的建议做出即时判断。',
    presetTaskType: "生活建议型",
    presetComplexity: "低",
    presetRisk: "高",
    presetTimePressure: "有",
  },
  {
    id: 10,
    description:
      '你最近总觉得头晕失眠，想问问AI应该吃什么药缓解："我这几天一直头晕，睡不好，你建议我吃什么药缓解症状？"',
    presetTaskType: "生活建议型",
    presetComplexity: "低",
    presetRisk: "高",
    presetTimePressure: "无",
  },
];
