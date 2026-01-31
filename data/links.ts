import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { Link, links } from "@/db/schema";

/**
 * 生成隨機短碼
 * @returns 8 個字元的隨機字串
 */
function generateShortCode(): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 取得目前登入使用者的連結清單
 * @returns 屬於目前使用者的連結列表
 * @throws {Error} 未登入時拋出錯誤
 */
export async function getCurrentUserLinks(): Promise<Link[]> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const userLinks = await db
    .select()
    .from(links)
    .where(eq(links.userId, userId))
    .orderBy(desc(links.updatedAt));

  return userLinks;
}

/**
 * 在資料庫中建立新的連結
 * @param data - 包含連結資訊的物件
 * @returns 建立的連結
 * @throws {Error} 資料庫操作失敗時拋出錯誤
 */
export async function createLinkInDb(data: {
  originalUrl: string;
  customCode?: string;
  userId: string;
}): Promise<Link> {
  const [link] = await db
    .insert(links)
    .values({
      originalUrl: data.originalUrl,
      shortCode: data.customCode || generateShortCode(),
      userId: data.userId,
    })
    .returning();

  return link;
}
