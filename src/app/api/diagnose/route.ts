// 诊断端点：测试 Supabase 连接是否正常
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const results: Record<string, unknown> = {};

  // 1. 环境变量检查
  results.env = {
    hasUrl: !!supabaseUrl,
    hasServiceKey: !!supabaseServiceKey,
    urlPrefix: supabaseUrl ? supabaseUrl.slice(0, 30) + "..." : "MISSING",
    serviceKeyPrefix: supabaseServiceKey
      ? supabaseServiceKey.slice(0, 10) + "..."
      : "MISSING",
  };

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ ...results, status: "环境变量缺失" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // 2. 表是否存在
  const { error: countError, count } = await supabase
    .from("classification_results")
    .select("*", { count: "exact", head: true });

  results.tableCheck = {
    exists: !countError,
    error: countError ? countError.message : null,
    existingRows: count ?? 0,
  };

  // 3. 测试写入一条再删除
  const testRow = {
    session_id: "diagnostic_test",
    scenario_id: 99,
    risk_answer: "测试",
    complexity_answer: "测试",
    time_spent_ms: 0,
    total_time_ms: 0,
    submitted_at: new Date().toISOString(),
  };

  const { error: insertError } = await supabase
    .from("classification_results")
    .insert(testRow);

  results.writeTest = {
    success: !insertError,
    error: insertError
      ? { code: insertError.code, message: insertError.message, details: insertError.details, hint: insertError.hint }
      : null,
  };

  // 清理测试数据
  if (!insertError) {
    await supabase
      .from("classification_results")
      .delete()
      .eq("session_id", "diagnostic_test");
  }

  return NextResponse.json(results);
}
