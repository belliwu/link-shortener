import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { JSX } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<JSX.Element> {
  const { userId } = await auth();

  // 確保只有已登入的用戶可以訪問
  if (!userId) {
    redirect("/");
  }

  return <>{children}</>;
}
