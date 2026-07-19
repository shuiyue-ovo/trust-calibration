// Supabase Database 类型定义
// 使用 Supabase CLI 生成：supabase gen types typescript --linked > src/types/database.ts
// 不生成时使用通用类型作为后备

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    Tables: {
      // 在此添加你的表定义，示例：
      // profiles: {
      //   Row: {
      //     id: string;
      //     created_at: string;
      //     email: string;
      //   };
      //   Insert: {
      //     id?: string;
      //     created_at?: string;
      //     email: string;
      //   };
      //   Update: {
      //     id?: string;
      //     created_at?: string;
      //     email?: string;
      //   };
      // };
    };
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    Views: Record<string, never>;
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    Functions: Record<string, never>;
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    Enums: Record<string, never>;
  };
}
