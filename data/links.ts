import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { Link, links } from "@/db/schema";

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
    .orderBy(desc(links.createdAt));

  return userLinks;
}
