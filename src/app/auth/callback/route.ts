import { NextResponse } from "next/server";
// Supabase Auth 回调 —— OAuth / Magic Link 登录后会跳转至此
// 实际应用中由 Supabase 自动处理，此路由作为占位

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    // 实际的 code exchange 在 middleware 中通过 cookie 完成
    // 此处仅做重定向
    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
