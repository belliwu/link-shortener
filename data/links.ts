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

/**
 * 在資料庫中更新連結
 * @param linkId - 連結 ID
 * @param data - 要更新的資料
 * @param userId - 使用者 ID（用於權限檢查）
 * @returns 更新後的連結，如果找不到或無權限則返回 null
 */
export async function updateLinkInDb(
  linkId: number,
  data: { originalUrl?: string; shortCode?: string },
  userId: string,
): Promise<Link | null> {
  const [updated] = await db
    .update(links)
    .set(data)
    .where(eq(links.id, linkId))
    .returning();

  // 檢查是否屬於該使用者
  if (updated && updated.userId !== userId) {
    return null;
  }

  return updated || null;
}

/**
 * 從資料庫中刪除連結
 * @param linkId - 要刪除的連結 ID
 * @param userId - 使用者 ID（用於權限檢查）
 * @returns 刪除成功返回 true，找不到或無權限返回 false
 */
export async function deleteLinkInDb(
  linkId: number,
  userId: string,
): Promise<boolean> {
  // 先檢查連結是否存在且屬於該使用者
  const [existingLink] = await db
    .select()
    .from(links)
    .where(eq(links.id, linkId));

  if (!existingLink || existingLink.userId !== userId) {
    return false;
  }

  await db.delete(links).where(eq(links.id, linkId));

  return true;
}
