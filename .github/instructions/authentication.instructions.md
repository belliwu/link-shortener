---
description: Read this document before implementing authentication in the Link Shortener project.
---

# 身份驗證標準（Authentication Standards）

本文件定義了 Link Shortener 專案中使用 Clerk 進行身份驗證和授權的標準和最佳實踐。

## 🔐 核心原則

### ⚠️ 重要規則

> **唯一的身份驗證提供者**：本專案**僅**使用 Clerk 進行身份驗證。
> 絕對**不要**實作或使用任何其他身份驗證方法（如 NextAuth、Passport、自建 JWT 等）。

## 📋 身份驗證要求

### 1. Clerk 配置

> **注意**：Next.js 16 使用 `proxy.ts` 取代了 `middleware.ts` 慣例。
> 詳見：[Next.js Proxy 文件](https://nextjs.org/docs/messages/middleware-to-proxy)

```typescript
// ✅ 在 proxy.ts 中設定 Clerk (Next.js 16+)
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  // 添加其他受保護的路由
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

### 2. 受保護路由

**規則**：`/dashboard` 及其所有子路由都是受保護的，需要用戶登入才能訪問。

```typescript
// ✅ app/dashboard/layout.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  // 確保只有已登入的用戶可以訪問
  if (!userId) {
    redirect('/');
  }

  return <>{children}</>;
}
```

### 3. 首頁重定向邏輯

**規則**：如果用戶已登入並嘗試訪問首頁 (`/`)，應自動重定向到 `/dashboard`。

```typescript
// ✅ app/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const { userId } = await auth();

  // 已登入的用戶應該在 dashboard
  if (userId) {
    redirect('/dashboard');
  }

  return (
    // 首頁內容（僅顯示給未登入用戶）
    <main>
      <h1>歡迎使用 Link Shortener</h1>
      {/* Landing page 內容 */}
    </main>
  );
}
```

### 4. 登入/註冊 UI 模式

**規則**：所有登入和註冊操作必須以**模態框（Modal）**形式啟動，而不是跳轉到獨立頁面。

```typescript
// ✅ 使用 Clerk 元件觸發模態框
import { SignInButton, SignUpButton } from '@clerk/nextjs';

export function AuthButtons() {
  return (
    <div className="flex gap-4">
      {/* 以模態框形式啟動登入 */}
      <SignInButton mode="modal">
        <button className="btn-primary">登入</button>
      </SignInButton>

      {/* 以模態框形式啟動註冊 */}
      <SignUpButton mode="modal">
        <button className="btn-secondary">註冊</button>
      </SignUpButton>
    </div>
  );
}
```

```typescript
// ❌ 錯誤：不要使用頁面重定向模式
<SignInButton mode="redirect" redirectUrl="/sign-in">
  <button>登入</button>
</SignInButton>
```

## 🎨 常見使用模式

### 顯示用戶資訊

```typescript
// ✅ Server Component 中獲取用戶
import { currentUser } from '@clerk/nextjs/server';

export default async function UserProfile() {
  const user = await currentUser();

  if (!user) return null;

  return (
    <div>
      <p>歡迎，{user.firstName}!</p>
      <p>Email: {user.emailAddresses[0]?.emailAddress}</p>
    </div>
  );
}
```

```typescript
// ✅ Client Component 中使用 Hook
'use client';

import { useUser } from '@clerk/nextjs';

export function UserGreeting() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) return <div>載入中...</div>;
  if (!isSignedIn) return null;

  return <p>你好，{user.firstName}!</p>;
}
```

### 用戶操作按鈕

```typescript
// ✅ 在 Header 或 Navbar 中
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export function Header() {
  return (
    <header>
      <nav>
        <SignedOut>
          {/* 未登入時顯示 */}
          <SignInButton mode="modal">
            <button>登入</button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          {/* 已登入時顯示用戶按鈕 */}
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </nav>
    </header>
  );
}
```

### Server Action 中的身份驗證

```typescript
// ✅ 在 Server Action 中驗證用戶
"use server";

import { auth } from "@clerk/nextjs/server";

export async function createLink(url: string) {
  const { userId } = await auth();

  // 檢查用戶是否已登入
  if (!userId) {
    throw new Error("Unauthorized: Please sign in to create links");
  }

  // 繼續處理已驗證的請求
  // ...
}
```

### API Route 中的身份驗證

```typescript
// ✅ app/api/links/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 處理已驗證的請求
    const body = await req.json();
    // ...

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

## 🛡️ 安全最佳實踐

### 1. 永遠在伺服器端驗證

```typescript
// ✅ 正確：在 Server Component/Action 中驗證
export async function ServerComponent() {
  const { userId } = await auth();
  if (!userId) redirect("/");
  // ...
}

// ❌ 錯誤：僅依賴客戶端檢查
("use client");
export function ClientComponent() {
  const { isSignedIn } = useUser();
  if (!isSignedIn) return null; // 這不夠安全！
}
```

### 2. 保護資料庫操作

```typescript
// ✅ 確保資料庫查詢包含用戶 ID 過濾
import { db } from "@/db";
import { links } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";

export async function getUserLinks() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // 只查詢屬於當前用戶的連結
  return await db.select().from(links).where(eq(links.userId, userId));
}
```

### 3. 環境變數配置

確保在 `.env` 中設定必要的 Clerk 環境變數：

```bash
# 必須的 Clerk 環境變數
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_***
CLERK_SECRET_KEY=sk_test_***

# Clerk URL 配置
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## 🚫 禁止事項

### ❌ 不要自己實作身份驗證

```typescript
// ❌ 絕對不要這樣做
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// 不要建立自己的 JWT tokens
const token = jwt.sign({ userId: "123" }, "secret");

// 不要自己處理密碼雜湊
const hashedPassword = await bcrypt.hash(password, 10);
```

### ❌ 不要混用其他身份驗證庫

```typescript
// ❌ 不要使用這些
import NextAuth from "next-auth";
import passport from "passport";
import { getSession } from "next-auth/react";
```

### ❌ 不要使用 Redirect 模式

```typescript
// ❌ 不要使用獨立的登入頁面
<SignInButton mode="redirect" />

// ✅ 永遠使用模態框模式
<SignInButton mode="modal" />
```

## 📝 資料庫 Schema 整合

當建立與用戶相關的表格時，使用 Clerk 的 `userId`：

```typescript
// ✅ db/schema.ts
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const links = pgTable("links", {
  id: varchar("id", { length: 191 }).primaryKey(),
  userId: varchar("user_id", { length: 191 }).notNull(), // Clerk user ID
  originalUrl: text("original_url").notNull(),
  shortCode: varchar("short_code", { length: 20 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 可選：添加索引以提升查詢效能
// 在 userId 上建立索引以加速用戶特定查詢
```

## 🧪 測試身份驗證

在測試中使用 Clerk 的測試工具：

```typescript
// ✅ 使用 Clerk 測試助手
import { clerkClient } from "@clerk/nextjs/server";

// 測試中建立測試用戶
const testUser = await clerkClient.users.createUser({
  emailAddress: ["test@example.com"],
  password: "testpassword",
});
```

## 🔄 常見場景檢查清單

實作功能時，確保：

- [ ] 所有受保護的路由都在 proxy.ts 中定義（Next.js 16+）
- [ ] Dashboard 路由需要身份驗證
- [ ] 已登入用戶從首頁重定向到 dashboard
- [ ] 登入/註冊使用模態框模式
- [ ] Server Actions 驗證 `userId`
- [ ] API Routes 返回 401 給未授權請求
- [ ] 資料庫查詢按 `userId` 過濾
- [ ] 沒有使用其他身份驗證方法
- [ ] 環境變數正確配置

## 📚 相關文件

- [Clerk Next.js 官方文件](https://clerk.com/docs/nextjs)
- [API 標準](./API_STANDARDS.md) - API 路由中的身份驗證
- [資料庫模式](./DATABASE_PATTERNS.md) - 用戶資料關聯

---

**更新日期**：2026-01-18
**狀態**：活躍
**負責人**：Belli Wu
