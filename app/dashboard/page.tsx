import { JSX } from "react";

import { getCurrentUserLinks } from "@/data/links";

export default async function DashboardPage(): Promise<JSX.Element> {
  const userLinks = await getCurrentUserLinks();

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-4 sm:px-8 lg:px-12">
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold text-yellow-600">Dashboard</h1>
        <p className="text-sm text-muted-foreground">你的連結</p>
      </header>

      {userLinks.length === 0 ? (
        <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
          尚未建立任何連結。
        </div>
      ) : (
        <ul className="space-y-3">
          {userLinks.map((link) => (
            <li key={link.id} className="rounded-md border p-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">
                  短碼：{link.shortCode}
                </span>
                <span className="break-all text-sm text-muted-foreground">
                  {link.originalUrl}
                </span>
                <span className="text-xs text-muted-foreground">
                  建立時間：{link.createdAt.toLocaleString("zh-TW")}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
