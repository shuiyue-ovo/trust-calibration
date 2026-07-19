-- ============================================================
-- Supabase 数据库建表 SQL
-- 在 Supabase Dashboard → SQL Editor 中执行此文件
-- ============================================================

-- 分类测试结果表
CREATE TABLE IF NOT EXISTS classification_results (
  id            BIGSERIAL PRIMARY KEY,
  session_id    TEXT NOT NULL,           -- 一次提交的唯一会话 ID
  scenario_id   INTEGER NOT NULL,        -- 场景编号 (1-10)
  risk_answer   TEXT NOT NULL,           -- 被试判断：高/中/低
  complexity_answer TEXT NOT NULL,       -- 被试判断：高/低
  time_spent_ms INTEGER NOT NULL,        -- 该题耗时（毫秒）
  total_time_ms INTEGER NOT NULL,        -- 整场测试总耗时（毫秒）
  submitted_at  TIMESTAMPTZ NOT NULL,    -- 提交时间
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 索引：按会话查询
CREATE INDEX IF NOT EXISTS idx_classification_session ON classification_results(session_id);

-- 索引：按提交时间排序
CREATE INDEX IF NOT EXISTS idx_classification_submitted ON classification_results(submitted_at DESC);

-- 允许匿名写入（RLS 策略）
ALTER TABLE classification_results ENABLE ROW LEVEL SECURITY;

-- 允许所有人插入（因为分类测试不需要登录）
CREATE POLICY "允许匿名提交" ON classification_results
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 仅允许认证用户查看（保护数据隐私）
CREATE POLICY "仅管理员可查看" ON classification_results
  FOR SELECT
  TO authenticated
  USING (true);
