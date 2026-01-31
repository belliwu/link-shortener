"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

import { createLinkInDb } from "@/data/links";
import { Link } from "@/db/schema";

/**
 * Zod schema for validating create link input
 */
const createLinkSchema = z.object({
  url: z.string().url("必須是有效的 URL"),
  customCode: z
    .string()
    .min(3, "自訂短碼至少需要 3 個字元")
    .max(20, "自訂短碼最多 20 個字元")
    .regex(/^[a-zA-Z0-9_-]+$/, "自訂短碼只能包含英文字母、數字、底線和連字號")
    .optional()
    .or(z.literal("")),
});

/**
 * TypeScript type inferred from Zod schema
 */
type CreateLinkInput = z.infer<typeof createLinkSchema>;

/**
 * Standard response format for server actions
 */
interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 建立新的縮短連結
 * @param input - 包含原始 URL 和可選自訂短碼的物件
 * @returns ActionResponse 包含建立的連結或錯誤訊息
 * @example
 * const result = await createLink({ url: "https://example.com", customCode: "my-link" });
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.error);
 * }
 */
export async function createLink(
  input: CreateLinkInput,
): Promise<ActionResponse<Link>> {
  // 1️⃣ 檢查使用者身份驗證
  const { userId } = await auth();

  if (!userId) {
    return {
      success: false,
      error: "未授權：請先登入",
    };
  }

  // 2️⃣ 驗證輸入資料（使用 safeParse，不會拋出錯誤）
  const validation = createLinkSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      error: `驗證失敗：${validation.error.issues[0].message}`,
    };
  }

  // 3️⃣ 執行資料庫操作
  try {
    const link = await createLinkInDb({
      originalUrl: validation.data.url,
      customCode:
        validation.data.customCode && validation.data.customCode.length > 0
          ? validation.data.customCode
          : undefined,
      userId,
    });

    // 重新驗證 dashboard 頁面以顯示新連結
    revalidatePath("/dashboard");

    return {
      success: true,
      data: link,
    };
  } catch (error) {
    // 捕獲任何資料庫錯誤並轉換為回應物件
    console.error("建立連結失敗:", error);

    // 檢查是否為重複的短碼錯誤
    if (error instanceof Error && error.message.includes("unique")) {
      return {
        success: false,
        error: "此自訂短碼已被使用，請選擇其他短碼",
      };
    }

    return {
      success: false,
      error: "建立連結時發生錯誤，請稍後再試",
    };
  }
}
