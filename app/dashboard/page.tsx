import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { JSX } from "react";

import { db } from "@/db";
import { links, type Link } from "@/db/schema";

/**
 * 取得當前登入使用者的連結清單。
 * @param userId - Clerk 使用者 ID
 * @returns 使用者的連結清單
 */
async function getUserLinks(userId: string): Promise<Link[]> {
  return db
    .select()
    .from(links)
    .where(eq(links.userId, userId))
    .orderBy(desc(links.createdAt));
}

/**
 * Dashboard page - 顯示當前登入使用者的連結清單。
 */
export default async function DashboardPage(): Promise<JSX.Element> {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="mx-auto w-full max-w-4xl space-y-6 px-6 py-10">
        <h1 className="text-2xl font-semibold text-yellow-400">Dashboard</h1>
        <p className="text-sm text-yellow-500">請先登入以查看你的連結。</p>
      </main>
    );
  }

  const userLinks = await getUserLinks(userId);

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-6 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-yellow-400">Dashboard</h1>
        <p className="text-sm text-yellow-600">這裡是你的短連結清單。</p>
      </header>

      {userLinks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white px-4 py-8 text-center">
          <p className="text-sm text-slate-600">目前還沒有建立任何連結。</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {userLinks.map((link) => (
            <li
              key={link.id}
              className="rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm"
            >
              <div className="flex flex-col gap-2">
                <div className="text-sm font-medium text-slate-900">
                  /{link.shortCode}
                </div>
                <div className="text-sm text-slate-600 break-all">
                  {link.originalUrl}
                </div>
                <div className="text-xs text-slate-400">
                  建立時間：{link.createdAt.toLocaleString("zh-TW")}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
